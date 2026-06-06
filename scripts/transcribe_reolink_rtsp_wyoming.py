"""Capture Reolink RTSP audio and transcribe it with Wyoming Whisper."""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from wyoming.asr import Transcribe, Transcript
from wyoming.audio import AudioChunk, AudioStart, AudioStop
from wyoming.client import AsyncTcpClient

from openwebui_pipelines.home_assistant_pipeline import Pipeline

DEFAULT_WAKE_ALIASES = {
    "hey freya": [
        "hey freya",
        "hey fria",
        "hey frea",
        "hey free ya",
        "hey three ya",
        "hey three in a",
    ],
}


def read_reolink_entry(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    entries = data.get("data", {}).get("entries", [])
    for entry in entries:
        if entry.get("domain") == "reolink":
            return entry
    raise RuntimeError(f"No Reolink config entry found in {path}")


def read_env(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key] = value

    return values


def build_rtsp_url(entry: dict, stream: str) -> str:
    settings = entry["data"]
    username = quote(settings["username"], safe="")
    password = quote(settings["password"], safe="")
    host = settings["host"]
    path = "h264Preview_01_main" if stream == "main" else "h264Preview_01_sub"
    return f"rtsp://{username}:{password}@{host}:554/{path}"


def start_ffmpeg(url: str, seconds: int | None = None) -> subprocess.Popen[bytes]:
    command = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-rtsp_transport",
        "tcp",
        "-i",
        url,
        "-map",
        "0:a:0",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-f",
        "s16le",
        "-c:a",
        "pcm_s16le",
        "pipe:1",
    ]
    if seconds and seconds > 0:
        command[command.index("-ac") : command.index("-ac")] = ["-t", str(seconds)]
    return subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def has_meaningful_text(text: str) -> bool:
    return bool(re.search(r"[A-Za-z0-9]", text))


def wake_phrase_patterns(wake_phrase: str, wake_aliases: list[str]) -> list[re.Pattern[str]]:
    phrases = [wake_phrase, *wake_aliases]
    if wake_phrase.lower().strip() in DEFAULT_WAKE_ALIASES:
        phrases.extend(DEFAULT_WAKE_ALIASES[wake_phrase.lower().strip()])

    patterns = []
    seen = set()
    for phrase in phrases:
        normalized = " ".join(phrase.lower().split())
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        wake_words = [re.escape(word) for word in normalized.split()]
        wake_pattern = r"[\s,.:;!?-]+".join(wake_words)
        patterns.append(re.compile(rf"\b{wake_pattern}\b[\s,.:;!?-]*", re.IGNORECASE))
    return patterns


def extract_after_wake_phrase(text: str, wake_phrase: str, wake_aliases: list[str] | None = None) -> str:
    if not wake_phrase:
        return text.strip()

    patterns = wake_phrase_patterns(wake_phrase, wake_aliases or [])
    matches = [(match.start(), match.end(), pattern) for pattern in patterns for match in pattern.finditer(text)]
    if not matches:
        return ""

    _, end, matched_pattern = sorted(matches, key=lambda item: item[0])[-1]
    command = text[end:].strip()
    for pattern in patterns:
        command = pattern.sub("", command).strip()
    return matched_pattern.sub("", command).strip()


def split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]



def summarize_conversation_response(data: dict) -> str:
    response = data.get("response", {})
    speech = response.get("speech", {})
    plain = speech.get("plain", {})
    if isinstance(plain, dict) and plain.get("speech"):
        return str(plain["speech"]).strip()

    if response.get("response_type"):
        return str(response["response_type"]).strip()

    return json.dumps(data, indent=2)


def send_to_home_assistant(args: argparse.Namespace, text: str) -> dict:
    env = read_env(args.env_file)
    token = args.ha_token or env.get("HA_TOKEN", "")
    if not token:
        raise RuntimeError("No HA token found. Set HA_TOKEN in .env or pass --ha-token.")

    payload: dict[str, object] = {
        "text": text,
        "language": args.language,
    }
    if args.agent_id:
        payload["agent_id"] = args.agent_id

    request = Request(
        f"{args.ha_url.rstrip('/')}/api/conversation/process",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    with urlopen(request, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def send_to_strict_home_assistant(args: argparse.Namespace, text: str) -> str:
    env = read_env(args.env_file)
    token = args.ha_token or env.get("HA_TOKEN", "")
    if not token:
        raise RuntimeError("No HA token found. Set HA_TOKEN in .env or pass --ha-token.")

    pipeline = Pipeline()
    pipeline.valves.HOME_ASSISTANT_URL = args.ha_url
    pipeline.valves.HOME_ASSISTANT_TOKEN = token
    pipeline.valves.ENTITY_ALIASES_PATH = str(args.entity_aliases)
    pipeline.valves.COMMAND_GROUPS_PATH = str(args.command_groups)
    pipeline.valves.DRY_RUN = args.dry_run
    pipeline.valves.ENABLE_DIRECT_ACTIONS = True
    pipeline.valves.ENABLE_CONTEXT_INJECTION = False
    return pipeline.pipe(text)


async def transcribe_audio(args: argparse.Namespace) -> str:
    entry = read_reolink_entry(args.config_entries)
    url = build_rtsp_url(entry, args.stream)
    process = start_ffmpeg(url, args.seconds)

    if process.stdout is None:
        raise RuntimeError("ffmpeg stdout was not captured")

    pcm_audio = process.stdout.read()
    stderr = process.stderr.read().decode("utf-8", errors="replace") if process.stderr else ""
    exit_code = process.wait(timeout=5)
    if exit_code != 0:
        raise RuntimeError(f"ffmpeg exited with {exit_code}: {stderr.strip()}")

    return await transcribe_pcm_bytes(
        pcm_audio,
        wyoming_host=args.wyoming_host,
        wyoming_port=args.wyoming_port,
        language=args.language,
    )


async def transcribe_pcm_bytes(
    pcm_audio: bytes,
    wyoming_host: str = "127.0.0.1",
    wyoming_port: int = 10300,
    language: str = "en",
) -> str:
    client = AsyncTcpClient(wyoming_host, wyoming_port)
    await client.connect()

    try:
        await client.write_event(Transcribe(language=language).event())
        await client.write_event(AudioStart(rate=16000, width=2, channels=1).event())

        chunk_size = 3200
        for start in range(0, len(pcm_audio), chunk_size):
            chunk = pcm_audio[start : start + chunk_size]
            await client.write_event(
                AudioChunk(rate=16000, width=2, channels=1, audio=chunk).event()
            )

        await client.write_event(AudioStop().event())

        while True:
            event = await client.read_event()
            if event is None:
                break

            if Transcript.is_type(event.type):
                transcript = Transcript.from_event(event)
                return transcript.text.strip()

            if event.type == "error":
                raise RuntimeError(str(event.data))

        return ""
    finally:
        await client.disconnect()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seconds", type=int, default=5)
    parser.add_argument("--stream", choices=["sub", "main"], default="sub")
    parser.add_argument("--language", default="en")
    parser.add_argument("--wyoming-host", default="127.0.0.1")
    parser.add_argument("--wyoming-port", type=int, default=10300)
    parser.add_argument("--send-to-ha", action="store_true")
    parser.add_argument(
        "--ha-mode",
        choices=["strict", "conversation"],
        default="strict",
        help="strict uses Freya's exact entity resolver; conversation uses HA's broader NLU.",
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--ha-url", default="http://localhost:8123")
    parser.add_argument("--ha-token", default="")
    parser.add_argument("--env-file", type=Path, default=Path(".env"))
    parser.add_argument("--agent-id", default="")
    parser.add_argument(
        "--entity-aliases",
        type=Path,
        default=Path("config/freya_entity_aliases.yaml"),
    )
    parser.add_argument(
        "--command-groups",
        type=Path,
        default=Path("config/freya_command_groups.yaml"),
    )
    parser.add_argument(
        "--require-wake",
        default="",
        help="Only send to HA when this phrase is present; sends text after the phrase.",
    )
    parser.add_argument(
        "--wake-aliases",
        default="",
        help="Comma-separated alternate wake transcriptions, for example: hey fria,hey three in a",
    )
    parser.add_argument(
        "--text",
        default="",
        help="Skip audio capture and send/transcribe this text path instead.",
    )
    parser.add_argument(
        "--config-entries",
        type=Path,
        default=Path("config/.storage/core.config_entries"),
    )
    args = parser.parse_args()

    transcript = args.text.strip() or asyncio.run(transcribe_audio(args))
    print(transcript or "(no transcript)")

    if args.send_to_ha:
        command_text = extract_after_wake_phrase(transcript, args.require_wake, split_csv(args.wake_aliases))
        if args.require_wake and not command_text:
            print(f"Skipped Home Assistant: wake phrase not found: {args.require_wake!r}")
            return 0

        if not has_meaningful_text(command_text):
            print("Skipped Home Assistant: transcript had no meaningful text.")
            return 0

        if command_text != transcript:
            print(f"Command: {command_text}")

        print()
        print()
        if args.ha_mode == "conversation":
            response = send_to_home_assistant(args, command_text)
            print("Home Assistant Conversation:")
            print(summarize_conversation_response(response))
        else:
            response_text = send_to_strict_home_assistant(args, command_text)
            print("Home Assistant Strict Control:")
            print(response_text)

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001 - command-line diagnostic.
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
