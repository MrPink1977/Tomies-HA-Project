# System Reference

Current working reference for the local FBIVAN / Freya Home Assistant stack.

## Services

The local stack is defined in `docker-compose.yml`.

| Service | Purpose | Published Port |
| --- | --- | --- |
| `homeassistant` | Home Assistant Core | `8123` |
| `freya-visualizer` | Local visualizer bridge | `8765` |
| `mosquitto` | MQTT broker | `1883` |
| `wyoming-whisper` | Speech-to-text | `10300` |
| `wyoming-piper` | Text-to-speech | `10200` |
| `ollama` | Local LLM runtime with GPU access | `11434` |
| `chromadb` | Vector database | `8000` |
| `esphome` | ESPHome builder/dashboard | `6052` |
| `aircon` | AC Infinity / aircon bridge | `8080` |
| `searxng` | Local search backend | `8088` |
| `local-deep-research` | Research/report service | `5000` |
| `research-bridge` | Home Assistant bridge for research jobs | `8099` |
| `litellm` | Model routing proxy | `4000` |
| `open-webui` | AI chat UI | `3000` |
| `pipelines` | Open WebUI Pipelines plugin server | `9099` |

OpenWakeWord and the old custom wake-word training files were removed. Voice and wake behavior should be rebuilt from a clean design later.

Voice rebuild planning is tracked in:

- `FREYA_VOICE_PLAN.md`

## Open WebUI Home Assistant Pipeline

The Open WebUI pipeline source is:

- `openwebui_pipelines/home_assistant_pipeline.py`
- `openwebui_pipelines/home_assistant_control_pipe.py`

Usage notes are documented in:

- `docs/OPENWEBUI_HOME_ASSISTANT_PIPELINE.md`
- `requirements-openwebui-pipelines.txt`

The filter pipeline can inject live Home Assistant entity context into Open WebUI chats. The control pipe appears as `Freya Home Assistant Control` and can handle direct smart-home commands through Home Assistant's REST API. Configure the Pipelines environment with `HOME_ASSISTANT_URL` and `HOME_ASSISTANT_TOKEN`. Start with `DRY_RUN=true` when validating entity matching, then disable dry-run after commands target the expected entities.

Sensitive domains/actions should keep confirmation enabled. Defaults require confirmation for locks, covers, climate, vacuums, and high-impact actions such as unlock, open, set temperature, start, and return to base.

The local Docker Compose stack includes the `pipelines` service and mounts `./openwebui_pipelines` to `/app/pipelines`. In Open WebUI, add a connection under Admin Panel > Settings > Connections with API URL `http://pipelines:9099` and API key `0p3n-w3bu!` unless `PIPELINES_API_KEY` is set in `.env`. After the connection works, the Pipelines settings tab should appear.

## Home Assistant

Important files:

- `config/configuration.yaml`
- `config/freya_entity_aliases.yaml`
- `config/automations.yaml`
- `config/scenes.yaml`
- `config/packages/`
- `config/dashboards/`
- `config/custom_components/`
- `config/custom_components/stt_corrector/`
- `AC_INFINITY_USEFUL_ENTITIES.md`
- `DASHBOARD_ENTITY_AUDIT.md`
- `FREYA_VOICE_PLAN.md`
- `requirements-freya-telemetry.txt`

Local secrets stay outside Git:

- `.env`
- `config/secrets.yaml`
- `esphome/secrets.yaml`
- `config/www/ha-grid/local-camera.js`

Docker Compose reads service tokens and passwords from `.env`. Home Assistant YAML reads local values from `config/secrets.yaml`, and ESPHome reads device secrets from `esphome/secrets.yaml`.

## STT Corrector

The custom Home Assistant integration lives at:

- `config/custom_components/stt_corrector/`

It registers the `stt_corrector` integration and wraps Home Assistant speech-to-text correction behavior with configurable phrase, replacement, fuzzy matching, punctuation, and Mandarin language correction support. It includes a config flow, diagnostics, sensors, services, translations, and brand assets.

After changing this integration, restart Home Assistant, then add or adjust it from Home Assistant's integration UI. The integration declares Python requirements in its `manifest.json`; Home Assistant should install them when the integration is loaded.

## Dashboards

Command grid entry point:

- `config/www/ha-grid.html`

Command grid module files:

- `config/www/ha-grid/config.js`
- `config/www/ha-grid/ha-client.js`
- `config/www/ha-grid/app.js`
- `config/www/ha-grid/styles.css`
- `config/www/ha-grid/panels/`

Mini and expanded dashboard pages:

- `config/www/freya-panel.html`
- `config/www/solar-mini.html`
- `config/www/power-center-mini.html`
- `config/www/greenhouse-dashboard.html`
- `config/www/weather-dashboard.html`

## Freya System Telemetry

Freya's GPU/CPU/RAM panel reads these Home Assistant entities:

- `sensor.gpu_utilization`
- `sensor.gpu_temperature`
- `sensor.gpu_vram_used`
- `sensor.gpu_vram_total`
- `sensor.gpu_vram_percent`
- `sensor.host_cpu_percent`
- `sensor.host_ram_used`
- `sensor.host_ram_percent`

The Home Assistant MQTT sensors are defined in:

- `config/packages/freya_system_telemetry.yaml`

The local publisher is:

- `freya_gpu_stats.py`

Install/update its local Python dependencies with:

```powershell
pip install -r requirements-freya-telemetry.txt
```

The publisher reads `.env` when present. MQTT defaults to `localhost:1883`; set `MQTT_HOST`, `MQTT_PORT`, `MQTT_USERNAME`, and `MQTT_PASSWORD` only when needed. `HA_TOKEN` is optional and only enables the legacy REST state push fallback.

## ESPHome

Current primary ESPHome voice/device config:

- `esphome/myvoiceassistant.yaml`

Generated ESPHome build output is ignored:

- `esphome/.esphome/`

## Validation

Compose validation:

```powershell
docker compose config --quiet
```

Dashboard sanity checks:

- Open `http://localhost:8123/local/ha-grid.html`
- Open `http://localhost:8123/local/freya-panel.html`
- Check browser console for module or runtime errors
- Check `DASHBOARD_ENTITY_AUDIT.md` when dashboard entity wiring changes

## Cleanup Notes

Ignored/generated data includes Home Assistant logs, database files, TTS cache, ESPHome build cache, exported entity dumps, Python caches, and local Docker data volumes.
