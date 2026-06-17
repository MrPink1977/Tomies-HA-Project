# FBIVAN Home Assistant

Local Home Assistant stack and command-grid dashboard for FBIVAN / Freya.

This repo is the working Home Assistant project, not a wake-word training lab. The old OpenWakeWord and custom wake-word experiment files were removed so voice work can be rebuilt cleanly later.

## Current Stack

- Home Assistant Core
- Mosquitto
- ESPHome
- Wyoming Whisper for speech-to-text
- Wyoming Piper for text-to-speech
- Ollama for local models
- LiteLLM for model routing
- Open WebUI
- ChromaDB
- SearXNG
- Local Deep Research and research bridge
- Freya visualizer bridge
- Aircon bridge

## Main Files

- `docker-compose.yml` - local service stack
- `config/configuration.yaml` - Home Assistant configuration
- `config/automations.yaml` - automations
- `config/packages/` - package-based sensors and helpers
- `config/www/ha-grid.html` - command-grid entry point
- `config/www/ha-grid/` - modular command-grid assets
- `config/www/freya-panel.html` - Freya / AI system panel
- `config/www/solar-mini.html` - power and solar panel
- `config/www/power-center-mini.html` - expanded power view
- `config/www/greenhouse-dashboard.html` - greenhouse panel
- `config/www/weather-dashboard.html` - weather panel
- `esphome/myvoiceassistant.yaml` - current ESPHome voice device config

## Local Secrets

Secrets are intentionally kept out of Git:

- `.env`
- `config/secrets.yaml`
- `esphome/secrets.yaml`

## Run

```powershell
docker compose up -d
```

Home Assistant:

```text
http://localhost:8123
```

Command grid:

```text
http://localhost:8123/local/ha-grid.html
```

## Validate

```powershell
docker compose config --quiet
```

For a full Home Assistant config check, run the Home Assistant check-config flow against `config/` before a larger push.
