# Meshtastic field network

Last updated: 2026-06-11

## Current layout

- `WarRoom-Base` / `BASE`
  - Inside/easy-access emergency grab radio kept near the PC until needed.
  - Hardware: Heltec V4.
  - Role: `CLIENT`.
  - WiFi is disabled for field/battery use; manage it by USB serial or Bluetooth.
  - Bluetooth remains enabled with no PIN for field access.
  - MQTT is disabled.
  - MQTT map reporting is disabled.
  - LoRa TX is enabled with hop limit 3.
  - Private primary channel uplink/downlink is enabled.
  - Public `LongFast` uplink/downlink is enabled for normal public mesh messages.
  - Range test is disabled.

- `TripleSixRanch` / `TSR1`
  - Main Home Assistant Meshtastic UI radio target because it is the roof/high node and has the better RF position.
  - Hardware: Heltec V3.
  - WiFi IP: `192.168.0.96`.
  - Meshtastic TCP API: `192.168.0.96:4403`.
  - Role: `CLIENT_BASE`.
  - MQTT is enabled to the local Home Assistant broker.
  - MQTT map reporting is disabled so private sensor node locations are not published as map data.
  - Private primary channel uplink/downlink is enabled.
  - Public `LongFast` uplink/downlink is enabled.

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

- Meshtastic UI points directly to `192.168.0.96:4403` and should be the only Home Assistant client connected directly to that radio.
- The separate `meshtastic` Home Assistant integration is disabled to avoid stealing the radio connection from Meshtastic UI. Meshtastic devices allow only one direct client session at a time.
- MQTT gateway traffic uses root topic `msh/US`.
- The driveway automation subscribes with a wildcard gateway topic:
  - `msh/US/2/json/LongFast/+`
- The automation condition filters to the driveway node id and exact text:
  - node id `4134185060`
  - text `Driveway detected`

## Operational notes

- Meshtastic export/config backups are stored locally under `meshtastic_backups/` and intentionally ignored by git because they may contain WiFi, MQTT, channel, or key material.
- If the roof/high gateway is replaced again, update the Meshtastic UI config entry to the new node's IP and keep the automation topic wildcarded.
- Keep gateway MQTT map reporting disabled unless every node with shared map data is safe to publish.
- Public MQTT-origin traffic should not be counted on to hop through the local LoRa mesh; the public MQTT service applies zero-hop restrictions. Prefer direct LoRa reception from the high node for public channel monitoring.
- If driveway alerts become noisy, tune the PIR hardware sensitivity first, then adjust node placement or debounce/minimum broadcast timing.
