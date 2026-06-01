from openwebui_pipelines.home_assistant_pipeline import (
    best_entity_match,
    build_context_prompt,
    merge_system_context,
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
]


def test_parse_direct_action_turns_natural_language_into_service_target() -> None:
    assert parse_direct_action("turn on the kitchen counter") == ("turn_on", "kitchen counter")
    assert parse_direct_action("confirm unlock front door") == ("unlock", "front door")


def test_parse_state_query_extracts_target() -> None:
    assert parse_state_query("is the front door locked?") == "front door"
    assert parse_state_query("what is the state of garage door?") == "garage door"


def test_best_entity_match_uses_friendly_names_and_entity_ids() -> None:
    match = best_entity_match("kitchen counter", STATES)
    assert match is not None
    assert match.entity_id == "light.kitchen_counter"

    exact = best_entity_match("cover.garage_door", STATES)
    assert exact is not None
    assert exact.name == "Garage Door"


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
