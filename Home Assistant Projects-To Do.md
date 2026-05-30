# Home Assistant Projects - To Do List

## Active Projects

### Command Grid Dashboard

- Keep the four-panel visual style consistent across camera, power, greenhouse/weather, and Freya panels.
- Continue tightening the Freya panel after watching live data for a while.
- Keep the tablet layout locked to the target display so everything fits without scrolling.

### Freya / Assistant

- Rebuild the voice and wake flow cleanly later.
- Keep text-to-speech and assistant transcript ideas separate from the old wake-word experiment.
- Improve live assistant status with real data from Home Assistant, Ollama, and system telemetry.

### Solar / Power

- Keep validating real inverter, grid, battery, and load entities.
- Make positive grid draw visually obvious as red.
- Keep expanded power view useful without crowding the main grid.

### Greenhouse / Weather

- Keep weather and greenhouse styling as the reference for clear section bars and meaningful accent color.
- Review sensor names and remove any dead entities from the dashboards.

### Meshtastic / Driveway

- Finish SenseCAP Solar Node P1-Pro outdoor mount.
- Set up Heltec WiFi LoRa 32 V3 as MQTT gateway node.
- Configure Meshtastic MQTT bridge into Home Assistant.
- Build final driveway motion automation after MQTT data is stable.

### Project Hygiene

- Keep `SYSTEM_REFERENCE.md` updated when services, dashboards, or entity names change.
- Keep secrets in `.env`, `config/secrets.yaml`, or `esphome/secrets.yaml`, never in committed files.
- Before big changes, validate with `docker compose config --quiet`.
