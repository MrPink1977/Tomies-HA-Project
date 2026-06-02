# Freya Voice Plan

Working target: Home Assistant Voice PE satellite currently using the built-in "Hey Jarvis" wake word.

## Current Baseline

- Voice target: `assist_satellite.home_assistant_voice_0a52fa_assist_satellite`
- Speaker target: `media_player.home_assistant_voice_0a52fa_media_player`
- Current wake behavior: "Hey Jarvis" works well enough to keep as the rollback baseline.
- STT/TTS services in Docker Compose:
  - `wyoming-whisper` on port `10300`
  - `wyoming-piper` on port `10200`
- Freya conversation helpers:
  - `input_boolean.freya_convo_active`
  - `input_number.freya_follow_up_count`
  - `Freya - Conversation Mode Engine`
  - `Freya - Conversation Mode Close`
  - `Freya - Conversation Mode Force Reset`

## Wake-Word Reality Check

Home Assistant's normal custom OpenWakeWord flow creates `.tflite` models for streaming wake-word detection. Voice PE's built-in wake words use on-device microWakeWord. That means a custom "Hey Freya" on Voice PE is not just "drop an OpenWakeWord file in place."

The safe paths are:

1. Keep Voice PE on built-in "Hey Jarvis" and improve everything after wake detection.
2. Take control of the Voice PE ESPHome config and use a custom microWakeWord model.
3. Add a second streaming satellite, such as ATOM Echo or another supported mic device, and use OpenWakeWord there.

## Recommended Path

### Phase 1: Preserve the Working Baseline

- Do not remove "Hey Jarvis" until a rollback path is documented.
- Export or screenshot the current Voice PE device settings, selected assistant, wake word, STT, TTS, and conversation agent.
- Confirm manual Assist and "Hey Jarvis" both reach the same assistant.

### Phase 2: Improve Reliability Before Custom Wake

- Keep the Voice PE satellite as the first target.
- Tune command reliability through Home Assistant conversation automations and the Open WebUI Home Assistant Control pipeline.
- Add a Home Assistant entity alias/index file for common spoken names.
- Disable Knowledge/RAG on the Open WebUI control model/chat where possible.

### Phase 3: Train "Hey Freya"

- Decide whether the target is microWakeWord on Voice PE or OpenWakeWord on a streaming satellite.
- If Voice PE remains the target, train or obtain a microWakeWord-compatible model, not an OpenWakeWord `.tflite`.
- If using a streaming satellite, use the Home Assistant OpenWakeWord training flow and place the generated model in `/share/openwakeword`.
- Test in parallel with "Hey Jarvis" still available.

### Phase 4: Cutover

- Run a false-positive and missed-wake test in the actual room.
- Test quiet speech, normal speech, TV/background noise, and several command types.
- Switch daily use only after "Hey Freya" matches or beats the current "Hey Jarvis" reliability.

## Next Concrete Tasks

1. Document current Voice PE settings from Home Assistant UI.
2. Build `config/freya_entity_aliases.yaml` for common spoken names.
3. Wire alias lookup into `openwebui_pipelines/home_assistant_pipeline.py`.
4. Research microWakeWord training for Voice PE specifically.
5. Decide whether to use Voice PE takeover or add a second streaming wake-word test satellite.
