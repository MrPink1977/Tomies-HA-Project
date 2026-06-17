# DFRobot AI Camera Voice Plan

Target hardware: DFRobot ESP32-S3 AI Camera V1.1 / DFR1154.

## Verified Hardware Notes

DFRobot documentation identifies the board as ESP32-S3R8 with 16 MB flash, 8 MB PSRAM, OV3660 camera, I2S PDM microphone, MAX98357 I2S amplifier, speaker connector, IR LED on GPIO47, and status LED on GPIO3.

Audio pins from the DFRobot recording/playback example:

- PDM microphone clock: GPIO38
- PDM microphone data: GPIO39
- MAX98357 BCLK: GPIO45
- MAX98357 LRCLK: GPIO46
- MAX98357 DOUT: GPIO42

Camera pins from the DFRobot/Home Assistant ESPHome example:

- XCLK: GPIO5
- SIOD/SDA: GPIO8
- SIOC/SCL: GPIO9
- Data pins: GPIO16, GPIO18, GPIO21, GPIO17, GPIO14, GPIO7, GPIO6, GPIO4
- VSYNC: GPIO1
- HREF: GPIO2
- PCLK: GPIO15

## Current ESPHome Config

Current file:

```powershell
esphome\dfrobot_ai_camera_voice.yaml
```

This device has been moved away from wake-word duty. It is now a front-door AI snapshot device: camera + speaker, triggered by Reolink person/vehicle detection from Home Assistant.

Validation status:

- `docker compose run --rm esphome config /config/dfrobot_ai_camera_voice.yaml` passes on ESPHome 2025.12.6.
- Full firmware compile was attempted inside Docker. ESPHome completed schema validation and generated/build setup, then spent a long time in first-time PlatformIO/ESP-IDF compilation. No firmware binary was produced before the compile was stopped.
- Local ESPHome compile found a generated C++ name collision when the camera ID was `camera_sensor`; the config now uses `dfrobot_camera`.
- Local ESPHome compile passes on ESPHome 2025.12.7.
- The board was flashed over USB serial on COM19. It came online as `dfrobot-ai-camera-voice.local` / `192.168.0.97`.
- Reachability checks passed for the ESPHome web UI on port 80, native API on port 6053, camera stream on port 8080, and snapshot endpoint on port 8081.
- The firmware was switched from Arduino to ESP-IDF so the onboard speaker can be exposed through ESPHome's `speaker` media player platform.
- Earlier Assist-satellite firmware exposed `assist_satellite.dfrobot_ai_camera_voice_assist_satellite` with supported features `3`, and `assist_satellite.announce` returned HTTP 200, but this role is no longer active on the DFRobot board.
- Speaker debugging: serial logs show the device downloads the HA TTS FLAC URL, decodes 16 kHz mono audio, starts/stops the I2S speaker, and returns to idle. Firmware exposes `switch.dfrobot_ai_camera_voice_speaker_mode_enable` and `switch.dfrobot_ai_camera_voice_speaker_gain_pin` so GPIO40/GPIO41 amp-control combinations can be tested from Home Assistant.
- Microphone test: `assist_satellite.ask_question` with `?return_response` succeeded through the DFRobot satellite and returned `{"sentence": " Yes, I can hear you."}`, confirming the onboard mic path reaches Home Assistant Assist.
- On-device wake-word support was tested with ESPHome `micro_wake_word` and the built-in `hey_jarvis` model, but runtime logs repeatedly showed `Failed to allocate tensors for the streaming model`.
- Snapshot-only camera and voice-only wake-word tests still produced the same tensor allocation failure, so wake-word/Assist/microphone support is no longer part of this device's active role.
- Current flashed firmware removes `micro_wake_word`, `voice_assistant`, and the microphone path. It keeps the OV3660 camera, ESPHome web UI, camera stream endpoint, snapshot endpoint, MAX98357 speaker media player, IR LED, status LED, and speaker mode/gain controls.
- Current reachability checks pass for `dfrobot-ai-camera-voice.local` ports 80, 6053, 8080, and 8081.
- Direct snapshot test from `http://dfrobot-ai-camera-voice.local:8081/` returned a JPEG.
- Home Assistant `camera.snapshot` successfully wrote `/config/www/front_door_ai_latest.jpg` from `camera.dfrobot_ai_camera_voice_camera`.
- Superseded: the old `Front Door AI Snapshot - Reolink Trigger` burst automation has been replaced by the Frigate + Double Take + CompreFace stack documented in `docs/FRONT_DOOR_FACE_RECOGNITION.md`.

## Intended Role

Build this device as the triggered front-door AI camera:

1. Reolink detects person or vehicle.
2. Home Assistant captures four DFRobot stills and four Reolink stills.
3. The image burst can be sent to LLM Vision for person/vehicle/package description.
4. Face recognition can be added after the snapshot trigger is reliable.
5. License plate recognition can be added for vehicle triggers. Start with LLM Vision reading the plate if visible; move to a dedicated ALPR service if accuracy is not good enough.
6. The DFRobot speaker can remain available for Home Assistant announcements.

## Caution

The current firmware is intentionally not a Home Assistant Assist satellite. Old Assist/wake entities may remain unavailable in Home Assistant until the ESPHome device entry is cleaned up.
