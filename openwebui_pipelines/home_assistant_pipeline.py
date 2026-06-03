"""
title: Freya Home Assistant Pipeline
author: Freya Project
version: 0.1.0
license: MIT
requirements:

Open WebUI pipeline/filter for safely exposing Home Assistant context and direct
smart-home actions to a local model. Configure with HOME_ASSISTANT_URL and
HOME_ASSISTANT_TOKEN in the Open WebUI Pipelines environment.
"""

import json
import os
import re
import time
from dataclasses import dataclass
from typing import Any, Iterable
from urllib.error import HTTPError
from urllib.parse import urljoin
from urllib.request import Request, urlopen

from pydantic import BaseModel, Field


DEFAULT_ALLOWED_DOMAINS = (
    "light",
    "switch",
    "fan",
    "cover",
    "lock",
    "climate",
    "scene",
    "script",
    "input_boolean",
    "media_player",
    "vacuum",
)

DEFAULT_SENSITIVE_DOMAINS = ("lock", "cover", "climate", "vacuum")
DEFAULT_SENSITIVE_ACTIONS = ("unlock", "open", "set_temperature", "start", "return_to_base")
STATE_QUERY_HINTS = (
    "light",
    "lamp",
    "switch",
    "fan",
    "cover",
    "table",
    "desk",
    "door",
    "lock",
    "climate",
    "temperature",
    "thermostat",
    "scene",
    "script",
    "media",
    "vacuum",
    "sensor",
    "entity",
)
DIRECT_ACTION_RE = re.compile(
    r"\b(?P<action>turn on|turn off|toggle|open|close|lock|unlock|start|stop|pause|return to base)\b\s+"
    r"(?:the\s+)?(?P<target>[a-z0-9_ .'-]+)",
    re.IGNORECASE,
)
STATE_QUERY_RE = re.compile(
    r"\b(?:what(?:'s| is)|is|are|show|check|get)\b.*\b(?P<target>[a-z0-9_ .'-]+)\??$",
    re.IGNORECASE,
)
COUNT_QUERY_RE = re.compile(
    r"\b(?:how many|count)\b\s+(?P<domain>lights?|switches?|fans?|covers?|locks?)\b.*\b(?:on|open|locked|unlocked|off|closed)\b",
    re.IGNORECASE,
)


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class EntityMatch:
    """A Home Assistant entity selected from a fuzzy user target."""

    entity_id: str
    name: str
    state: str
    domain: str
    score: int


class HomeAssistantError(RuntimeError):
    """Raised when Home Assistant cannot complete a pipeline request."""


class HomeAssistantClient:
    """Small REST wrapper for the Home Assistant API used by the pipeline."""

    def __init__(self, base_url: str, token: str, timeout: float = 8.0) -> None:
        self.base_url = base_url.rstrip("/") + "/"
        self.timeout = timeout
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _request(self, method: str, path: str, **kwargs: Any) -> Any:
        url = urljoin(self.base_url, path.lstrip("/"))
        body = kwargs.get("json")
        data = json.dumps(body).encode("utf-8") if body is not None else None
        request = Request(url, data=data, headers=self.headers, method=method)
        try:
            with urlopen(request, timeout=self.timeout) as response:
                payload = response.read()
                if not payload:
                    return None
                return json.loads(payload.decode("utf-8"))
        except HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")[:300]
            raise HomeAssistantError(f"Home Assistant {method} {path} failed: {exc.code} {detail}") from exc

    def states(self) -> list[dict[str, Any]]:
        return list(self._request("GET", "/api/states"))

    def state(self, entity_id: str) -> dict[str, Any]:
        return dict(self._request("GET", f"/api/states/{entity_id}"))

    def call_service(self, domain: str, service: str, payload: dict[str, Any]) -> Any:
        return self._request("POST", f"/api/services/{domain}/{service}", json=payload)


class Pipeline:
    """Open WebUI entry point.

    The same file can be installed as a filter pipeline (uses ``inlet`` to add
    context to regular chats) or as a pipe pipeline (uses ``pipe`` for direct HA
    commands and state lookups).
    """

    class Valves(BaseModel):
        HOME_ASSISTANT_URL: str = Field(default_factory=lambda: os.getenv("HOME_ASSISTANT_URL", ""))
        HOME_ASSISTANT_TOKEN: str = Field(default_factory=lambda: os.getenv("HOME_ASSISTANT_TOKEN", ""))
        REQUEST_TIMEOUT_SECONDS: float = 8.0
        CACHE_TTL_SECONDS: int = 45
        MAX_CONTEXT_ENTITIES: int = 80
        ALLOWED_DOMAINS: str = ",".join(DEFAULT_ALLOWED_DOMAINS)
        REQUIRE_CONFIRMATION_DOMAINS: str = ",".join(DEFAULT_SENSITIVE_DOMAINS)
        REQUIRE_CONFIRMATION_ACTIONS: str = ",".join(DEFAULT_SENSITIVE_ACTIONS)
        DRY_RUN: bool = Field(default_factory=lambda: env_bool("DRY_RUN", False))
        ENABLE_DIRECT_ACTIONS: bool = Field(default_factory=lambda: env_bool("ENABLE_DIRECT_ACTIONS", True))
        ENABLE_CONTEXT_INJECTION: bool = Field(default_factory=lambda: env_bool("ENABLE_CONTEXT_INJECTION", True))
        MIN_MATCH_SCORE: int = 45
        ENTITY_ALIASES_PATH: str = Field(default_factory=lambda: os.getenv("ENTITY_ALIASES_PATH", ""))
        pipelines: list[str] = []
        priority: int = 0

    def __init__(self) -> None:
        self.type = "filter"
        self.name = "Freya Home Assistant"
        self.valves = self.Valves()
        self._states_cache: list[dict[str, Any]] | None = None
        self._states_cache_at = 0.0
        self._aliases_cache: dict[str, list[str]] | None = None

    def _client(self) -> HomeAssistantClient:
        if not self.valves.HOME_ASSISTANT_URL or not self.valves.HOME_ASSISTANT_TOKEN:
            raise HomeAssistantError(
                "Set HOME_ASSISTANT_URL and HOME_ASSISTANT_TOKEN in the Open WebUI Pipelines environment."
            )
        return HomeAssistantClient(
            self.valves.HOME_ASSISTANT_URL,
            self.valves.HOME_ASSISTANT_TOKEN,
            timeout=self.valves.REQUEST_TIMEOUT_SECONDS,
        )

    def _csv(self, value: str) -> set[str]:
        return {item.strip().lower() for item in value.split(",") if item.strip()}

    def _states(self) -> list[dict[str, Any]]:
        now = time.time()
        if self._states_cache is not None and now - self._states_cache_at < self.valves.CACHE_TTL_SECONDS:
            return self._states_cache
        states = self._client().states()
        allowed = self._csv(self.valves.ALLOWED_DOMAINS)
        self._states_cache = [state for state in states if entity_domain(state.get("entity_id", "")) in allowed]
        self._states_cache_at = now
        return self._states_cache

    async def inlet(self, body: dict[str, Any], user: dict[str, Any] | None = None) -> dict[str, Any]:
        """Inject current Home Assistant context into normal Open WebUI chats."""
        if not self.valves.ENABLE_CONTEXT_INJECTION:
            return body

        messages = body.get("messages")
        if not isinstance(messages, list):
            return body

        try:
            states = self._states()
            context = build_context_prompt(states, self.valves.MAX_CONTEXT_ENTITIES)
        except Exception as exc:
            context = f"Home Assistant context is currently unavailable: {exc}"

        system_message = {
            "role": "system",
            "content": (
                "You are Freya with Home Assistant awareness via an Open WebUI pipeline. "
                "Use the live entity context below for smart-home answers. Do not invent entity states. "
                "For risky actions such as unlocking doors, opening covers, changing climate setpoints, "
                "or starting vacuums, ask for explicit confirmation before proceeding.\n\n"
                f"{context}"
            ),
        }
        body["messages"] = merge_system_context(messages, system_message)
        return body

    async def outlet(self, body: dict[str, Any], user: dict[str, Any] | None = None) -> dict[str, Any]:
        """Open WebUI-compatible no-op outlet for filter installs."""
        return body

    def pipe(
        self,
        user_message: str,
        model_id: str | None = None,
        messages: list[dict[str, Any]] | None = None,
        body: dict[str, Any] | None = None,
    ) -> str:
        """Handle direct Home Assistant requests when installed as a pipe."""
        if not self.valves.ENABLE_DIRECT_ACTIONS:
            return "Direct Home Assistant actions are disabled for this pipeline."

        message = extract_home_assistant_request(user_message, messages, body)
        if not message:
            return "Ask me to check or control a Home Assistant entity."
        if is_auxiliary_source_request(message):
            return ""

        try:
            action = parse_direct_action(message)
            if action:
                service, target_text = action
                return self._handle_service(service, target_text, message)

            count_query = parse_count_query(message)
            if count_query:
                domain, state, area = count_query
                return self._handle_count_query(domain, state, area)

            target_text = parse_state_query(message)
            if target_text:
                return self._handle_state_query(target_text)

            return (
                "I did not find a direct Home Assistant command in that message. "
                "Ask for a state check or command with an exact Home Assistant entity name when possible."
            )
        except HomeAssistantError as exc:
            return f"Home Assistant error: {exc}"
        except Exception as exc:
            return f"Pipeline error while handling Home Assistant request: {exc}"

    def _handle_state_query(self, target_text: str) -> str:
        match = best_entity_match(target_text, self._states(), self.valves.MIN_MATCH_SCORE, self._aliases())
        if not match:
            return f"I could not match '{target_text}' to a Home Assistant entity. Try the exact entity name."
        state = self._client().state(match.entity_id)
        friendly = friendly_name(state)
        attrs = state.get("attributes", {}) or {}
        extra = summarize_attributes(attrs)
        return f"{friendly} ({match.entity_id}) is {state.get('state', 'unknown')}.{extra}"

    def _handle_count_query(self, domain: str, desired_state: str, area: str | None = None) -> str:
        states = self._states()
        matches = []
        for state in states:
            entity_id = str(state.get("entity_id", ""))
            if entity_domain(entity_id) != domain:
                continue
            if str(state.get("state", "")).lower() != desired_state:
                continue
            if area and area.lower() not in searchable_text(state):
                continue
            matches.append(state)

        area_text = f" in {area}" if area else ""
        names = ", ".join(f"{friendly_name(state)} ({state.get('entity_id')})" for state in matches[:8])
        if not names:
            return f"No {domain} entities are {desired_state}{area_text}."
        extra = f": {names}" if len(matches) <= 8 else f": {names}, and {len(matches) - 8} more"
        return f"{len(matches)} {domain} entity/entities are {desired_state}{area_text}{extra}."

    def _handle_service(self, service: str, target_text: str, original_message: str) -> str:
        match = best_entity_match(target_text, self._states(), self.valves.MIN_MATCH_SCORE, self._aliases())
        if not match:
            return f"I could not match '{target_text}' to a Home Assistant entity. Try the exact entity name."

        domain, ha_service = service_for(match.domain, service)
        if not ha_service:
            return f"I matched {match.name} ({match.entity_id}), but {service!r} is not supported for {match.domain}."

        if self._needs_confirmation(match.domain, ha_service, original_message):
            return (
                f"Confirmation required before I {ha_service.replace('_', ' ')} {match.name} "
                f"({match.entity_id}). Reply with an explicit confirmation such as "
                f"'confirm {ha_service.replace('_', ' ')} {match.name}'."
            )

        payload = {"entity_id": match.entity_id}
        if self.valves.DRY_RUN:
            return f"DRY RUN: would call {domain}.{ha_service} with {payload}."

        self._client().call_service(domain, ha_service, payload)
        self._states_cache = None
        return f"Done: called {domain}.{ha_service} for {match.name} ({match.entity_id})."

    def _needs_confirmation(self, domain: str, service: str, message: str) -> bool:
        if re.search(r"\b(confirm|confirmed|yes do it|go ahead)\b", message, re.IGNORECASE):
            return False
        return domain in self._csv(self.valves.REQUIRE_CONFIRMATION_DOMAINS) or service in self._csv(
            self.valves.REQUIRE_CONFIRMATION_ACTIONS
        )

    def _aliases(self) -> dict[str, list[str]]:
        if self._aliases_cache is None:
            self._aliases_cache = load_entity_aliases(self.valves.ENTITY_ALIASES_PATH)
        return self._aliases_cache


def entity_domain(entity_id: str) -> str:
    return entity_id.split(".", 1)[0] if "." in entity_id else ""


def friendly_name(state: dict[str, Any]) -> str:
    attrs = state.get("attributes", {}) or {}
    return str(attrs.get("friendly_name") or state.get("entity_id") or "unknown")


def searchable_text(state: dict[str, Any], aliases: dict[str, list[str]] | None = None) -> str:
    entity_id = str(state.get("entity_id", ""))
    attrs = state.get("attributes", {}) or {}
    ha_aliases = attrs.get("aliases") or attrs.get("alternate_names") or []
    if isinstance(ha_aliases, str):
        ha_aliases = [ha_aliases]
    configured_aliases = aliases.get(entity_id, []) if aliases else []
    return " ".join(
        [entity_id.replace(".", " ").replace("_", " "), friendly_name(state), *map(str, ha_aliases), *configured_aliases]
    ).lower()


def best_entity_match(
    target: str,
    states: Iterable[dict[str, Any]],
    min_score: int = 45,
    aliases: dict[str, list[str]] | None = None,
) -> EntityMatch | None:
    needle = normalize(target)
    if not needle:
        return None

    state_list = list(states)
    alias_match = alias_entity_match(needle, state_list, aliases or {})
    if alias_match:
        return alias_match

    best: EntityMatch | None = None
    for state in state_list:
        entity_id = str(state.get("entity_id", ""))
        haystack = normalize(searchable_text(state, aliases))
        score = match_score(needle, haystack, entity_id)
        if score >= min_score and (best is None or score > best.score):
            best = EntityMatch(
                entity_id=entity_id,
                name=friendly_name(state),
                state=str(state.get("state", "unknown")),
                domain=entity_domain(entity_id),
                score=score,
            )
    return best


def alias_entity_match(
    normalized_target: str,
    states: Iterable[dict[str, Any]],
    aliases: dict[str, list[str]],
) -> EntityMatch | None:
    state_by_entity = {str(state.get("entity_id", "")): state for state in states}
    for entity_id, names in aliases.items():
        normalized_names = {normalize(entity_id), *(normalize(name) for name in names)}
        if normalized_target not in normalized_names:
            continue
        state = state_by_entity.get(entity_id)
        if not state:
            continue
        return EntityMatch(
            entity_id=entity_id,
            name=friendly_name(state),
            state=str(state.get("state", "unknown")),
            domain=entity_domain(entity_id),
            score=100,
        )
    return None


def load_entity_aliases(path: str = "") -> dict[str, list[str]]:
    alias_path = first_existing_path(
        [
            path,
            os.getenv("ENTITY_ALIASES_PATH", ""),
            "/app/freya_entity_aliases.yaml",
            os.path.join(os.getcwd(), "config", "freya_entity_aliases.yaml"),
        ]
    )
    if not alias_path:
        return {}

    aliases: dict[str, list[str]] = {}
    current_entity = ""
    try:
        with open(alias_path, "r", encoding="utf-8") as handle:
            for raw_line in handle:
                line = raw_line.split("#", 1)[0].rstrip()
                if not line.strip():
                    continue
                if not line.startswith((" ", "\t")) and line.endswith(":"):
                    current_entity = line[:-1].strip()
                    aliases.setdefault(current_entity, [])
                    continue
                if current_entity and line.strip().startswith("- "):
                    aliases[current_entity].append(line.strip()[2:].strip().strip("\"'"))
    except OSError:
        return {}
    return {entity_id: names for entity_id, names in aliases.items() if entity_id and names}


def first_existing_path(paths: Iterable[str]) -> str:
    for path in paths:
        if path and os.path.exists(path):
            return path
    return ""


def normalize(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9_ .-]", " ", value.lower())).strip()


def match_score(needle: str, haystack: str, entity_id: str) -> int:
    if needle == entity_id.lower() or needle == haystack:
        return 100
    if needle in haystack:
        return 90
    needle_words = {word for word in needle.replace("_", " ").split() if len(word) > 1}
    haystack_words = {word for word in haystack.replace("_", " ").split() if len(word) > 1}
    if not needle_words:
        return 0
    overlap = len(needle_words & haystack_words)
    return int((overlap / len(needle_words)) * 80)


def parse_direct_action(message: str) -> tuple[str, str] | None:
    message = first_command_sentence(normalize_request_text(message))
    match = DIRECT_ACTION_RE.search(message)
    if not match:
        confirm_match = re.search(
            r"\bconfirm\b\s+(?P<action>turn on|turn off|toggle|open|close|lock|unlock|start|stop|pause|return to base)\s+"
            r"(?:the\s+)?(?P<target>[a-z0-9_ .'-]+)",
            message,
            re.IGNORECASE,
        )
        match = confirm_match
    if not match:
        return None
    return normalize_action(match.group("action")), match.group("target").strip(" .")


def parse_count_query(message: str) -> tuple[str, str, str | None] | None:
    message = normalize_request_text(message)
    lowered = message.lower()
    if not re.search(r"\b(how many|count)\b", lowered):
        return None
    domain_match = re.search(r"\b(?P<domain>lights?|switches?|fans?|covers?|locks?)\b", lowered)
    state_match = re.search(r"\b(?P<state>on|off|open|closed|locked|unlocked)\b", lowered)
    if not domain_match or not state_match:
        return None
    domain = singular_domain(domain_match.group("domain"))
    state = state_match.group("state")
    area_match = re.search(r"\b(?:in|inside|for)\s+(?:the\s+)?(?P<area>[a-z0-9_ .'-]+?)\??$", message, re.IGNORECASE)
    area = area_match.group("area").strip(" .?") if area_match else None
    return domain, state, area


def parse_state_query(message: str) -> str | None:
    message = normalize_request_text(message)
    lowered = message.lower()
    if re.search(r"^\s*(turn on|turn off|toggle|open|close|lock|unlock)\b", lowered):
        return None
    if re.search(r"\b(how many|count)\b", lowered):
        return None

    of_match = re.search(
        r"\b(?:state|status|temperature)\s+(?:of|for|in)\s+(?:the\s+)?(?P<target>.+?)\??\s*$",
        message,
        re.IGNORECASE,
    )
    if of_match:
        target = of_match.group("target").strip(" .?")
        return target if is_plausible_state_target(target) else None

    direct = re.search(r"^\s*(?:is|are)\s+(?:the\s+)?(?P<target>.+?)\??\s*$", message, re.IGNORECASE)
    if direct:
        target = direct.group("target").strip(" .?")
        if not is_plausible_state_target(target):
            return None
        target = re.sub(
            r"\b(on|off|open|closed|locked|unlocked|running|stopped|paused|available|unavailable)\b$",
            "",
            target,
            flags=re.IGNORECASE,
        ).strip()
        return target or None

    match = STATE_QUERY_RE.search(message)
    if not match:
        return None
    target = match.group("target").strip(" .?")
    stopwords = ("the state of ", "status of ", "temperature in ", "temperature of ", "state for ")
    for stopword in stopwords:
        target = re.sub(rf"^.*\b{re.escape(stopword)}", "", target, flags=re.IGNORECASE)
    target = target.strip()
    return target if is_plausible_state_target(target) else None


def is_plausible_state_target(target: str) -> bool:
    normalized = normalize_request_text(target).lower().strip(" .?")
    if not normalized or is_auxiliary_source_request(normalized):
        return False
    return "." in normalized or any(hint in normalized for hint in STATE_QUERY_HINTS)


def is_auxiliary_source_request(message: str) -> bool:
    normalized = normalize_request_text(message).lower().strip(" .?!")
    return normalized in {
        "source",
        "sources",
        "get source",
        "get sources",
        "show source",
        "show sources",
        "retrieved source",
        "retrieved sources",
    }


def normalize_request_text(message: str) -> str:
    return " ".join(str(message or "").strip().split())


def first_command_sentence(message: str) -> str:
    split = re.split(
        r"(?<=[.!?])\s+(?=(?:confirm\s+)?(?:turn on|turn off|toggle|open|close|lock|unlock|start|stop|pause|return to base)\b)",
        message,
        maxsplit=1,
        flags=re.IGNORECASE,
    )
    return split[0].strip()


def singular_domain(domain: str) -> str:
    normalized = domain.lower().rstrip("s")
    return {"light": "light", "switche": "switch", "switch": "switch", "fan": "fan", "cover": "cover", "lock": "lock"}[
        normalized
    ]


def message_text(message: dict[str, Any]) -> str:
    content = message.get("content", "")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                parts.append(str(item.get("text", "")))
        return "\n".join(parts)
    return str(content)


def candidate_request_lines(text: str) -> list[str]:
    lines = []
    for raw_line in str(text or "").replace("\r", "\n").split("\n"):
        line = raw_line.strip(" \t>:-\"'")
        if not line:
            continue
        line = re.sub(r"^(user|human|prompt|question|query)\s*:\s*", "", line, flags=re.IGNORECASE).strip()
        if line:
            lines.append(line)
    normalized = normalize_request_text(text)
    if normalized and normalized not in lines:
        lines.append(normalized)
    return lines


def is_home_assistant_request(text: str) -> bool:
    return parse_direct_action(text) is not None or parse_state_query(text) is not None


def extract_home_assistant_request(
    user_message: str,
    messages: list[dict[str, Any]] | None = None,
    body: dict[str, Any] | None = None,
) -> str:
    texts: list[str] = []
    if messages:
        texts.extend(message_text(message) for message in reversed(messages) if message.get("role") == "user")
    body_messages = body.get("messages") if isinstance(body, dict) else None
    if isinstance(body_messages, list):
        texts.extend(message_text(message) for message in reversed(body_messages) if message.get("role") == "user")
    texts.append(user_message or "")

    candidates = [line for text in texts for line in candidate_request_lines(text)]
    for candidate in candidates:
        if re.search(r"\b[a-z_]+\.[a-z0-9_]+\b", candidate, re.IGNORECASE) and is_home_assistant_request(candidate):
            return normalize_request_text(candidate)
    for candidate in candidates:
        if is_home_assistant_request(candidate):
            return normalize_request_text(candidate)
    return normalize_request_text(user_message)


def normalize_action(action: str) -> str:
    return action.lower().replace(" ", "_")


def service_for(domain: str, action: str) -> tuple[str, str | None]:
    service = normalize_action(action)
    if service in {"turn_on", "turn_off", "toggle"} and domain in {"light", "switch", "fan", "input_boolean"}:
        return domain, service
    if service in {"open", "close"} and domain == "cover":
        return domain, f"{service}_cover"
    if service in {"lock", "unlock"} and domain == "lock":
        return domain, service
    if service in {"start", "stop", "pause", "return_to_base"} and domain == "vacuum":
        return domain, service
    if service == "turn_on" and domain in {"scene", "script"}:
        return domain, "turn_on"
    if service in {"turn_on", "turn_off", "toggle"} and domain == "media_player":
        return domain, service
    return domain, None


def summarize_attributes(attrs: dict[str, Any]) -> str:
    interesting_keys = ["temperature", "current_temperature", "humidity", "battery_level", "brightness", "unit_of_measurement"]
    parts = []
    for key in interesting_keys:
        if key in attrs:
            parts.append(f"{key}={attrs[key]}")
    return f" Details: {', '.join(parts)}." if parts else ""


def build_context_prompt(states: list[dict[str, Any]], max_entities: int = 80) -> str:
    visible = states[: max(0, max_entities)]
    grouped: dict[str, list[str]] = {}
    for state in visible:
        entity_id = str(state.get("entity_id", ""))
        domain = entity_domain(entity_id) or "other"
        grouped.setdefault(domain, []).append(f"- {entity_id}: {friendly_name(state)} = {state.get('state', 'unknown')}")

    lines = ["Live Home Assistant context:"]
    for domain in sorted(grouped):
        lines.append(f"{domain}:")
        lines.extend(grouped[domain])
    if len(states) > len(visible):
        lines.append(f"... {len(states) - len(visible)} additional allowed entities omitted from prompt context.")
    lines.append(
        "Action format for direct control: use exact Home Assistant entity names when possible; "
        "supported actions include turn on/off, toggle, open/close covers, lock/unlock locks, and vacuum start/stop/pause."
    )
    return "\n".join(lines)


def merge_system_context(messages: list[dict[str, Any]], system_message: dict[str, str]) -> list[dict[str, Any]]:
    if messages and messages[0].get("role") == "system":
        merged = dict(messages[0])
        merged["content"] = f"{messages[0].get('content', '')}\n\n{system_message['content']}".strip()
        return [merged, *messages[1:]]
    return [system_message, *messages]


if __name__ == "__main__":
    pipeline = Pipeline()
    print(json.dumps(pipeline.valves.model_dump(), indent=2))
