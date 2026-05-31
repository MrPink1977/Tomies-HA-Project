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
- The Freya panel uses clean system telemetry entities defined in `config/packages/freya_system_telemetry.yaml` and fed by `freya_gpu_stats.py`:
  - `sensor.gpu_utilization`
  - `sensor.gpu_temperature`
  - `sensor.gpu_vram_used`
  - `sensor.gpu_vram_total`
  - `sensor.gpu_vram_percent`
  - `sensor.host_cpu_percent`
  - `sensor.host_ram_used`
  - `sensor.host_ram_percent`
- Freya keeps old FBIVAN fallbacks where they already exist:
  - GPU load fallback: `sensor.fbivan_gpuload`
  - GPU temperature fallback: `sensor.fbivan_gputemperature`
  - CPU load fallback: `sensor.fbivan_cpuload`
  - RAM percent fallback: `sensor.fbivan_memoryusage`

## Next Cleanup Targets

- Restart Home Assistant after telemetry package changes so the MQTT package sensors are registered.
- Run `freya_gpu_stats.py` with MQTT access so the telemetry topics update with retained values.
- Keep the dashboard pages pointed at entity constants instead of scattering entity IDs through rendering code.
