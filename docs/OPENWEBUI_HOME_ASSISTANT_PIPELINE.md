# Open WebUI Home Assistant Pipeline

The `openwebui_pipelines/home_assistant_pipeline.py` file turns Open WebUI into a safer smart-home control surface for Freya. ESP32 camera work remains separate; this pipeline focuses on Home Assistant context, direct control, and robust guardrails.

## What it does

- Injects live Home Assistant entity states into Open WebUI chats so the model can answer smart-home questions without guessing.
- Provides a direct `pipe()` path for explicit commands such as `turn on the kitchen light` or `is the front door locked?`.
- Uses Home Assistant's REST API only; no extra broker or MQTT service is required.
- Limits control to configured domains and asks for confirmation before sensitive actions such as unlocking locks, opening covers, changing climate controls, or starting vacuums.
- Caches `/api/states` briefly to keep chats responsive while avoiding stale context for too long.
- Supports `DRY_RUN` mode for testing command routing before allowing real device control.

## Install in Open WebUI Pipelines

This repo's Docker Compose stack includes a `pipelines` service and mounts `./openwebui_pipelines` to `/app/pipelines`, so these pipeline files are available to the Pipelines server when the container starts:

- `home_assistant_pipeline.py`: filter pipeline for injecting Home Assistant context into normal chats.
- `home_assistant_control_pipe.py`: pipe pipeline/model for direct Home Assistant state lookups and dry-run service calls.

`Freya Home Assistant Control` appears in Open WebUI's model selector, but it is a deterministic Python control pipe rather than a normal LLM-backed chat model. Use it for direct Home Assistant checks and commands. Use regular LiteLLM/Open WebUI models such as `freya-main` or `freya-reasoning` for open-ended conversation.

1. Start or recreate the Pipelines container:
   ```powershell
   docker compose up -d pipelines
   ```
2. In Open WebUI, go to Admin Panel > Settings > Connections.
3. Add an OpenAI-compatible connection:
   - API URL: `http://pipelines:9099`
   - API key: `0p3n-w3bu!` unless `PIPELINES_API_KEY` is set in `.env`.
4. After the connection works, go to Admin Panel > Settings > Pipelines.
5. Select `home_assistant_pipeline` / `Freya Home Assistant` for context injection.
6. Select `home_assistant_control` / `Freya Home Assistant Control` as a model when testing direct state lookups and smart-home commands.
7. Start with `DRY_RUN=true` if you want to verify matching before live control.
8. Disable `DRY_RUN` only after the pipeline matches your entity names correctly.

The Compose service sets:

- `HOME_ASSISTANT_URL=http://homeassistant:8123`
- `HOME_ASSISTANT_TOKEN=${HA_TOKEN}`
- `ENTITY_ALIASES_PATH=/app/freya_entity_aliases.yaml`
- `DRY_RUN=true`

If you are not using this Docker Compose stack, copy `openwebui_pipelines/home_assistant_pipeline.py` into your Open WebUI Pipelines workspace and set equivalent environment variables there.

## Entity aliases

Common spoken names are configured in `config/freya_entity_aliases.yaml` and mounted into the Pipelines container. Alias matches are checked before fuzzy matching, so phrases like `big lamp 1`, `lamp one`, `awesome table`, and `standing desk` resolve predictably.

## Recommended valve settings

| Valve | Default | Purpose |
| --- | --- | --- |
| `ALLOWED_DOMAINS` | lights, switches, fans, covers, locks, climate, scenes, scripts, input booleans, media players, vacuums | Restricts which entity domains are visible/controllable. |
| `REQUIRE_CONFIRMATION_DOMAINS` | locks, covers, climate, vacuums | Domains requiring explicit confirmation before service calls. |
| `REQUIRE_CONFIRMATION_ACTIONS` | unlock, open, set_temperature, start, return_to_base | High-impact service names requiring confirmation. |
| `MAX_CONTEXT_ENTITIES` | 80 | Prompt-size limit for injected HA context. |
| `CACHE_TTL_SECONDS` | 45 | Entity-state cache lifetime. |
| `ENABLE_DIRECT_ACTIONS` | true | Enables `pipe()` command execution. |
| `ENABLE_CONTEXT_INJECTION` | true | Enables `inlet()` prompt augmentation. |
| `DRY_RUN` | false | Reports intended service calls without changing devices. |

## Safety workflow

For sensitive actions, the first request returns a confirmation challenge:

```text
User: unlock the front door
Freya: Confirmation required before I unlock Front Door (lock.front_door)...
User: confirm unlock front door
Freya: Done: called lock.unlock for Front Door (lock.front_door).
```

Keep locks, covers, climate, and vacuums in `REQUIRE_CONFIRMATION_DOMAINS` unless you have a separate physical or Home Assistant automation-level safety layer.

## Example prompts

- `What lights are currently on?`
- `Is the garage door open?`
- `Is cover.awesome_table open?`
- `How many lights are on in the bedroom?`
- `Turn off the office fan.`
- `Turn on movie scene.`
- `Confirm close garage door.`

## Local tests

Install the local test dependencies with:

```powershell
.\venv\Scripts\python.exe -m pip install -r requirements-openwebui-pipelines.txt
```

Run the pipeline tests with:

```powershell
.\venv\Scripts\python.exe -m pytest tests\openwebui_pipelines\test_home_assistant_pipeline.py
```

## Troubleshooting

- **Pipeline says credentials are missing**: confirm the environment variables are set inside the Pipelines container, not only on the host.
- **Entity is not matched**: use the exact friendly name or entity ID from Home Assistant, or increase `MIN_MATCH_SCORE` only after testing.
- **Commands report unsupported service**: verify the entity domain supports the requested Home Assistant service.
- **Model invents device states**: ensure `ENABLE_CONTEXT_INJECTION=true` and keep `MAX_CONTEXT_ENTITIES` high enough to include your target devices.
- **Service call fails with 401/403**: regenerate a Home Assistant long-lived access token for a user with permissions to control the target entities.
