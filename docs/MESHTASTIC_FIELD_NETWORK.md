# Meshtastic field network

Last updated: 2026-06-07

## Current layout

- `WarRoom-Base` / `BASE`
  - Main inside Home Assistant and MQTT gateway.
  - Hardware: Heltec V4.
  - WiFi IP: `192.168.0.95`.
  - Meshtastic TCP API: `192.168.0.95:4403`.
  - Role: `CLIENT_BASE`.
  - Bluetooth remains enabled with no PIN for field access.
  - MQTT is enabled to the local Home Assistant broker.
  - MQTT map reporting is disabled so private sensor node locations are not published as map data.
  - Private primary channel uplink/downlink is enabled.
  - Public `LongFast` uplink is enabled and downlink is disabled.
  - Range test is disabled.

- `TripleSixRanch` / `TSR1`
  - No longer the main gateway after WiFi stability concerns.
  - If used as a roof/high node, keep the same channels, LoRa TX enabled, and MQTT disabled so `WarRoom-Base` remains the single MQTT gateway.

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
  - Should remain private-only: no public channel, no MQTT, and no fixed/manual position.
  - Home Assistant alerting is handled by the `Driveway Vehicle Alert` automation.
  - PIR sensitivity and placement may still need field tuning over several days.

## Home Assistant integration

- Main Meshtastic integration points to `192.168.0.95:4403`.
- Meshtastic UI points to `192.168.0.95:4403`.
- MQTT gateway traffic uses root topic `msh/US`.
- The driveway automation subscribes with a wildcard gateway topic:
  - `msh/US/2/json/LongFast/+`
- The automation condition filters to the driveway node id and exact text:
  - node id `4134185060`
  - text `Driveway detected`

## Operational notes

- Meshtastic export/config backups are stored locally under `meshtastic_backups/` and intentionally ignored by git because they may contain WiFi, MQTT, channel, or key material.
- If the inside base is replaced again, update both Home Assistant Meshtastic config entries to the new node's IP and keep the automation topic wildcarded.
- Keep gateway MQTT map reporting disabled unless every node with shared map data is safe to publish.
- If driveway alerts become noisy, tune the PIR hardware sensitivity first, then adjust node placement or debounce/minimum broadcast timing.
