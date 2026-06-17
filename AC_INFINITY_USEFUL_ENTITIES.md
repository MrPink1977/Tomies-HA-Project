# AC Infinity Useful Entity Set

Working notes for keeping AC Infinity dashboards focused. The integration exposes a lot of entities; most should stay off the main dashboard.

## Main Dashboard Entities

Use these for normal live operation:

- Controller temperature
- Controller humidity
- Controller VPD
- Controller online/status
- Port online/status
- Port on/off state
- Port current power
- Port active mode
- Port next state change

## Control Entities To Keep

These are worth exposing in an expanded/settings view:

- Cycle on minutes
- Cycle off minutes
- Active mode
- Temperature high trigger
- Temperature low trigger
- Temperature high trigger enabled
- Temperature low trigger enabled

For trigger enable switches, only keep the cycle-related and temperature-sensor-related controls. Hide the rest unless a real workflow needs them later.

## Currently Exposed Port Map

These are the currently available AC Infinity port/device groups in Home Assistant.

### GreenHouse Mains GH Exhaust

- `binary_sensor.daniels_controller_ceiling_fan_status`
- `binary_sensor.daniels_controller_ceiling_fan_state`
- `sensor.daniels_controller_ceiling_fan_current_power`
- `sensor.daniels_controller_ceiling_fan_next_state_change`
- `select.greenhouse_mains_gh_exhaust_active_mode`
- `number.greenhouse_mains_gh_exhaust_cycle_minutes_on`
- `number.greenhouse_mains_gh_exhaust_cycle_minutes_off`
- `number.greenhouse_mains_gh_exhaust_temperature_high_trigger`
- `number.greenhouse_mains_gh_exhaust_temperature_low_trigger`
- `switch.greenhouse_mains_gh_exhaust_temperature_high_trigger_enabled`
- `switch.greenhouse_mains_gh_exhaust_temperature_low_trigger_enabled`

### GreenHouse Mains GH Cooler

- `binary_sensor.greenhouse_mains_gh_cooler_status`
- `binary_sensor.greenhouse_mains_gh_cooler_state`
- `sensor.greenhouse_mains_gh_cooler_current_power`
- `sensor.greenhouse_mains_gh_cooler_next_state_change`
- `select.greenhouse_mains_gh_cooler_active_mode`
- `number.greenhouse_mains_gh_cooler_cycle_minutes_on`
- `number.greenhouse_mains_gh_cooler_cycle_minutes_off`
- `number.greenhouse_mains_gh_cooler_temperature_high_trigger`
- `number.greenhouse_mains_gh_cooler_temperature_low_trigger`
- `switch.greenhouse_mains_gh_cooler_temperature_high_trigger_enabled`
- `switch.greenhouse_mains_gh_cooler_temperature_low_trigger_enabled`

### Tent1&2 Heater

- `binary_sensor.tent1_2_heater_status`
- `binary_sensor.tent1_2_heater_state`
- `sensor.tent1_2_heater_current_power`
- `sensor.tent1_2_heater_next_state_change`
- `select.tent1_2_heater_active_mode`
- `number.tent1_2_heater_cycle_minutes_on`
- `number.tent1_2_heater_cycle_minutes_off`
- `number.tent1_2_heater_temperature_high_trigger`
- `number.tent1_2_heater_temperature_low_trigger`
- `switch.tent1_2_heater_temperature_high_trigger_enabled`
- `switch.tent1_2_heater_temperature_low_trigger_enabled`

### Tent1&2 Vent Fan

- `binary_sensor.tent1_2_vent_fan_status`
- `binary_sensor.tent1_2_vent_fan_state`
- `sensor.tent1_2_vent_fan_current_power`
- `sensor.tent1_2_vent_fan_next_state_change`
- `select.tent1_2_vent_fan_active_mode`
- `number.tent1_2_vent_fan_cycle_minutes_on`
- `number.tent1_2_vent_fan_cycle_minutes_off`
- `number.tent1_2_vent_fan_temperature_high_trigger`
- `number.tent1_2_vent_fan_temperature_low_trigger`
- `switch.tent1_2_vent_fan_temperature_high_trigger_enabled`
- `switch.tent1_2_vent_fan_temperature_low_trigger_enabled`

## Notes

If ports 1-4 are needed for either controller, enable those ports in the AC Infinity integration options first. Home Assistant will only expose entities for ports the integration is configured to include.
