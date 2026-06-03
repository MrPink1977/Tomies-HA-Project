from openwebui_pipelines.home_assistant_pipeline import (
    Pipeline,
    best_entity_match,
    build_context_prompt,
    extract_home_assistant_request,
    load_entity_aliases,
    merge_system_context,
    parse_count_query,
    parse_direct_action,
    parse_state_query,
    service_for,
)


STATES = [
    {
        "entity_id": "light.kitchen_counter",
        "state": "off",
        "attributes": {"friendly_name": "Kitchen Counter"},
    },
    {
        "entity_id": "lock.front_door",
        "state": "locked",
        "attributes": {"friendly_name": "Front Door"},
    },
    {
        "entity_id": "cover.garage_door",
        "state": "closed",
        "attributes": {"friendly_name": "Garage Door"},
    },
    {
        "entity_id": "light.big_lamp_one",
        "state": "off",
        "attributes": {"friendly_name": "BigLamp one"},
    },
    {
        "entity_id": "light.ceilingfanlight",
        "state": "unavailable",
        "attributes": {"friendly_name": "Ceiling Fan Light"},
    },
]


def test_parse_direct_action_turns_natural_language_into_service_target() -> None:
    assert parse_direct_action("turn on the kitchen counter") == ("turn_on", "kitchen counter")
    assert parse_direct_action("confirm unlock front door") == ("unlock", "front door")
    assert parse_direct_action("Turn off Big Lamp 1. Turn off Big Lamp 1.") == ("turn_off", "Big Lamp 1")


def test_parse_state_query_extracts_target() -> None:
    assert parse_state_query("is the front door locked?") == "front door"
    assert parse_state_query("what is the state of garage door?") == "garage door"
    assert parse_state_query("is cover.awesome_table open?") == "cover.awesome_table"
    assert parse_state_query("is awesome table open?") == "awesome table"
    assert parse_state_query("is standing desk open?") == "standing desk"
    assert parse_state_query("with high-level domains") is None
    assert parse_state_query("source") is None
    assert parse_state_query("get source") is None
    assert parse_state_query("show sources") is None
    assert parse_state_query("how many lights are on in the bedroom?") is None


def test_parse_count_query_extracts_domain_state_and_area() -> None:
    assert parse_count_query("how many lights are on in the bedroom?") == ("light", "on", "bedroom")
    assert parse_count_query("count switches off") == ("switch", "off", None)


def test_best_entity_match_uses_friendly_names_and_entity_ids() -> None:
    match = best_entity_match("kitchen counter", STATES)
    assert match is not None
    assert match.entity_id == "light.kitchen_counter"

    exact = best_entity_match("cover.garage_door", STATES)
    assert exact is not None
    assert exact.name == "Garage Door"


def test_best_entity_match_uses_configured_aliases_first() -> None:
    aliases = {"light.big_lamp_one": ["big lamp 1", "lamp one"]}
    match = best_entity_match("big lamp 1", STATES, aliases=aliases)
    assert match is not None
    assert match.entity_id == "light.big_lamp_one"
    assert match.score == 100


def test_load_entity_aliases_reads_simple_yaml(tmp_path) -> None:
    alias_file = tmp_path / "aliases.yaml"
    alias_file.write_text(
        """
light.big_lamp_one:
  - big lamp one
  - big lamp 1

cover.awesome_table:
  - awesome table
""".strip(),
        encoding="utf-8",
    )
    assert load_entity_aliases(str(alias_file)) == {
        "light.big_lamp_one": ["big lamp one", "big lamp 1"],
        "cover.awesome_table": ["awesome table"],
    }


def test_valves_read_dry_run_from_environment(monkeypatch) -> None:
    monkeypatch.setenv("DRY_RUN", "true")
    assert Pipeline.Valves().DRY_RUN is True


def test_service_mapping_prevents_unsupported_domain_actions() -> None:
    assert service_for("light", "turn_on") == ("light", "turn_on")
    assert service_for("cover", "open") == ("cover", "open_cover")
    assert service_for("lock", "unlock") == ("lock", "unlock")
    assert service_for("light", "unlock") == ("light", None)


def test_context_prompt_groups_states_and_mentions_omissions() -> None:
    context = build_context_prompt(STATES, max_entities=2)
    assert "light.kitchen_counter" in context
    assert "lock.front_door" in context
    assert "additional allowed entities omitted" in context


def test_merge_system_context_preserves_existing_system_message() -> None:
    messages = [{"role": "system", "content": "Original"}, {"role": "user", "content": "Hi"}]
    merged = merge_system_context(messages, {"role": "system", "content": "Home Assistant"})
    assert len(merged) == 2
    assert merged[0]["content"] == "Original\n\nHome Assistant"


def test_pipe_fallback_does_not_dump_full_context_for_vague_messages() -> None:
    pipeline = Pipeline()
    result = pipeline.pipe("with high-level domains")
    assert "Ask for a state check or command" in result
    assert "Live Home Assistant context" not in result


def test_pipe_ignores_open_webui_source_helper_requests() -> None:
    pipeline = Pipeline()
    assert pipeline.pipe("source") == ""
    assert pipeline.pipe("get source") == ""


def test_service_call_reports_unavailable_entity() -> None:
    pipeline = Pipeline()
    pipeline._states_cache = STATES
    pipeline._states_cache_at = 9999999999
    result = pipeline._handle_service("turn_on", "ceiling fan light", "turn on ceiling fan light")
    assert "currently unavailable" in result


def test_extract_request_prefers_exact_entity_line_from_wrapped_context() -> None:
    wrapped = """
    Retrieved 5 sources
    User: is cover.awesome_table open?

    Answer right away. If you don't know, say so.
    """
    assert extract_home_assistant_request(wrapped) == "is cover.awesome_table open?"


def test_extract_request_uses_original_user_message_from_body() -> None:
    body = {
        "messages": [
            {"role": "user", "content": "is cover.awesome_table open?"},
            {"role": "user", "content": "Answer right away. If you don't know, say so."},
        ]
    }
    assert extract_home_assistant_request("right away. If you don't", body=body) == "is cover.awesome_table open?"


def test_extract_request_prefers_latest_direct_command_over_history() -> None:
    body = {
        "messages": [
            {"role": "user", "content": "Turn off Big Lamp 1. Turn off Big Lamp 1."},
            {"role": "assistant", "content": "I could not match 'Big Lamp 1. ASSISTANT'."},
            {"role": "user", "content": "turn off big lamp one"},
        ]
    }
    assert extract_home_assistant_request("Big Lamp 1. ASSISTANT", body=body) == "turn off big lamp one"
