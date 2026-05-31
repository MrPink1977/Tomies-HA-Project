# Dashboard Entity Audit

Last checked: 2026-05-31

## Summary

- `config/www/solar-mini.html`: all referenced Home Assistant entities exist.
- `config/www/power-center-mini.html`: all referenced Home Assistant entities exist.
- `config/www/greenhouse-dashboard.html`: all referenced Home Assistant entities exist.
- `config/www/weather-dashboard.html`: no Home Assistant entity dependencies; it uses Open-Meteo.
- `config/www/ha-grid/config.js`: status dots now use real signals only.

## Notes

- The command grid MQTT dot uses `sensor.sem_b_active_power` as the real MQTT-backed signal. There is no `binary_sensor.mqtt_status` entity in the current Home Assistant entity registry.
- The Freya panel has generic system sensor names first and FBIVAN fallbacks second where available:
  - GPU load: `sensor.gpu_utilization`, fallback `sensor.fbivan_gpuload`
  - GPU temperature: `sensor.gpu_temperature`, fallback `sensor.fbivan_gputemperature`
  - CPU load: `sensor.host_cpu_percent`, fallback `sensor.fbivan_cpuload`
  - RAM percent: `sensor.host_ram_percent`, fallback `sensor.fbivan_memoryusage`
- Freya also references VRAM and RAM detail sensors that may be runtime-created or MQTT-created outside the registry snapshot:
  - `sensor.gpu_vram_used`
  - `sensor.gpu_vram_total`
  - `sensor.gpu_vram_percent`
  - `sensor.host_ram_used`

## Next Cleanup Targets

- Decide whether to formalize the Freya system telemetry sensors in Home Assistant YAML/MQTT discovery so they appear cleanly in the registry.
- Keep the dashboard pages pointed at entity constants instead of scattering entity IDs through rendering code.
