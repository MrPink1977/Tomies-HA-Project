# System Reference

Current working reference for the local FBIVAN / Freya Home Assistant stack.

## Services

The local stack is defined in `docker-compose.yml`.

- `homeassistant` - Home Assistant Core on port `8123`
- `freya-visualizer` - local visualizer bridge
- `mosquitto` - MQTT broker
- `wyoming-whisper` - speech-to-text
- `wyoming-piper` - text-to-speech
- `ollama` - local LLM runtime with GPU access
- `chromadb` - vector database
- `esphome` - ESPHome builder/dashboard
- `aircon` - AC Infinity bridge
- `searxng` - local search backend
- `local-deep-research` - research/report service
- `research-bridge` - Home Assistant bridge for research jobs
- `litellm` - model routing proxy
- `open-webui` - AI chat UI

OpenWakeWord and the old custom wake-word training files were removed. Voice and wake behavior should be rebuilt from a clean design later.

## Home Assistant

Important files:

- `config/configuration.yaml`
- `config/automations.yaml`
- `config/scenes.yaml`
- `config/packages/`
- `config/dashboards/`
- `config/custom_components/`

Local secrets stay outside Git:

- `.env`
- `config/secrets.yaml`
- `esphome/secrets.yaml`

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

## Cleanup Notes

Ignored/generated data includes Home Assistant logs, database files, TTS cache, ESPHome build cache, exported entity dumps, Python caches, and local Docker data volumes.
