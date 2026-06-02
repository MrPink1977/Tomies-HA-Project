# Home Assistant Projects - To Do List

## Active Projects

### Command Grid Dashboard

- Keep the four-panel visual style consistent across camera, power, greenhouse/weather, and Freya panels.
- Continue tightening the Freya panel after watching live data for a while.
- Keep the tablet layout locked to the target display so everything fits without scrolling.

### Freya / Assistant

- Rebuild the voice and wake flow cleanly later.
- Evaluate Semantic Router inside Open WebUI Pipelines as Freya's capability router after the current Home Assistant control pipeline stabilizes.
- Keep Routerly as a later option for smarter model-gateway routing between `freya-fast`, `freya-main`, and `freya-reasoning`.
- Build an entity alias/index plan for Home Assistant commands so names like "big lamp one", "bedroom lamp", and exact entity IDs resolve predictably.
- Revisit "Hey Freya" wake-word training with a clean OpenWakeWord/Wyoming path instead of the old experiment.
- Keep text-to-speech and assistant transcript ideas separate from the old wake-word experiment.
- Improve live assistant status with real data from Home Assistant, Ollama, and system telemetry. GPU/CPU/RAM telemetry is now defined in `config/packages/freya_system_telemetry.yaml`; keep refining the assistant/activity signals.

### Solar / Power

- Keep validating real inverter, grid, battery, and load entities. Current dashboard references are checked in `DASHBOARD_ENTITY_AUDIT.md`.
- Make positive grid draw visually obvious as red. Done in the current mini dashboard; keep watching live data.
- Keep expanded power view useful without crowding the main grid.

### Greenhouse / Weather

- Keep weather and greenhouse styling as the reference for clear section bars and meaningful accent color.
- Review sensor names and remove any dead entities from the dashboards. Current greenhouse and weather references are checked in `DASHBOARD_ENTITY_AUDIT.md`.
- Use `AC_INFINITY_USEFUL_ENTITIES.md` as the filter for AC Infinity controls: main panel gets live status, expanded/settings view gets cycle on/off and temperature trigger controls.

### Meshtastic / Driveway

- Finish SenseCAP Solar Node P1-Pro outdoor mount.
- Set up Heltec WiFi LoRa 32 V3 as MQTT gateway node.
- Configure Meshtastic MQTT bridge into Home Assistant.
- Build final driveway motion automation after MQTT data is stable.

### Project Hygiene

- Keep `SYSTEM_REFERENCE.md` updated when services, dashboards, or entity names change.
- Keep `DASHBOARD_ENTITY_AUDIT.md` updated when dashboard entity wiring changes.
- Keep `requirements-freya-telemetry.txt` aligned with `freya_gpu_stats.py`.
- Keep secrets in `.env`, `config/secrets.yaml`, or `esphome/secrets.yaml`, never in committed files.
- Before big changes, validate with `docker compose config --quiet`.
