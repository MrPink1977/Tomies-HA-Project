# Meshtastic field network

Last updated: 2026-06-07

## Current layout

- `TripleSixRanch` / `TSR1`
  - Main Home Assistant and MQTT gateway.
  - Hardware: Heltec V3.
  - WiFi static IP: `192.168.0.96`.
  - Meshtastic TCP API: `192.168.0.96:4403`.
  - Role: `CLIENT_BASE`.
  - Bluetooth remains enabled with no PIN for field access.
  - MQTT is enabled to the local Home Assistant broker.
  - Private primary channel uplink/downlink is enabled.
  - Public `LongFast` uplink is enabled and downlink is disabled.
  - The radio may still show a leftover `testing` channel slot at index 3; it is not used and has uplink/downlink disabled.

- `TSR2`
  - Field relay halfway down the driveway.
  - Role: `ROUTER`.
  - Rebroadcast mode: `ALL`.
  - MQTT disabled.
  - Bluetooth remains enabled with no PIN for field access.

- `Driveway-PIR`
  - Driveway detection node.
  - PIR signal connected to GPIO5.
  - Detection sensor broadcasts `Driveway detected`.
  - Home Assistant alerting is handled by the `Driveway Vehicle Alert` automation.
  - PIR sensitivity and placement may still need field tuning over several days.

- `WarRoom-Base`
  - Former base node, now intended for handheld or alternate use.
  - MQTT disabled so `TSR1` is the single active Home Assistant/MQTT gateway.

## Home Assistant integration

- Main Meshtastic integration points to `192.168.0.96:4403`.
- Meshtastic UI points to `192.168.0.96:4403`.
- MQTT gateway traffic uses root topic `msh/US`.
- The driveway automation subscribes with a wildcard gateway topic:
  - `msh/US/2/json/LongFast/+`
- The automation condition filters to the driveway node id and exact text:
  - node id `4134185060`
  - text `Driveway detected`

## Operational notes

- Meshtastic export/config backups are stored locally under `meshtastic_backups/` and intentionally ignored by git because they may contain WiFi, MQTT, channel, or key material.
- If TSR1 is replaced again, update both Home Assistant Meshtastic config entries to the new node's IP and keep the automation topic wildcarded.
- If driveway alerts become noisy, tune the PIR hardware sensitivity first, then adjust node placement or debounce/minimum broadcast timing.
