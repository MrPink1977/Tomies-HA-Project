# Reolink Voice Experiment

Goal: test whether the Reolink camera can act as an extra Freya audio input.

## Current Findings

- Device: Reolink Duo Floodlight WiFi v2, integrated through Home Assistant's native Reolink integration.
- Home Assistant camera entities expose JPEG/MJPEG camera proxy endpoints.
- Those HA camera proxy endpoints are useful for snapshots/video preview, but not as a clean Assist microphone source.
- Direct RTSP from the camera works.
- Both tested RTSP streams include audio:
  - `sub`: H.264 video plus mono AAC audio at 16 kHz.
  - `main`: HEVC video plus mono AAC audio at 16 kHz.
- A 5-second audio-only extraction to 16 kHz mono PCM WAV succeeded with ffmpeg.

## Probe Command

```powershell
.\scripts\probe_reolink_rtsp_audio.ps1
```

Capture a short WAV sample:

```powershell
.\scripts\probe_reolink_rtsp_audio.ps1 -CaptureSeconds 5
```

Use the main stream instead of the lower-bandwidth sub stream:

```powershell
.\scripts\probe_reolink_rtsp_audio.ps1 -Stream main -CaptureSeconds 5
```

The script reads the existing Home Assistant Reolink config entry from `config/.storage/core.config_entries`; it does not store credentials.

## Wyoming Whisper Transcription Probe

Install the local test dependency:

```powershell
python -m pip install -r requirements-openwebui-pipelines.txt
```

Capture from the Reolink microphone and send the audio to the existing Wyoming Whisper container:

```powershell
python .\scripts\transcribe_reolink_rtsp_wyoming.py --seconds 5
```

For a real test, stand near the Reolink and say a short phrase during the capture window.

Test the Home Assistant Conversation path without using the camera:

```powershell
python .\scripts\transcribe_reolink_rtsp_wyoming.py --text "what time is it" --send-to-ha
```

Manual camera-to-Home-Assistant test:

```powershell
python .\scripts\transcribe_reolink_rtsp_wyoming.py --seconds 8 --send-to-ha
```

Safer manual wake-gated test:

```powershell
python .\scripts\transcribe_reolink_rtsp_wyoming.py --seconds 8 --send-to-ha --require-wake "hey freya"
```

For that test, say a phrase like "Hey Freya, what time is it?" during the capture window. The script only sends the text after "Hey Freya" to Home Assistant.

This is still a manual probe. Do not run it as a continuous unattended listener until a wake-word gate and false-positive controls are in place.

## Continuous Listener Prototype

PowerShell launcher, dry-run mode:

```powershell
.\scripts\start_reolink_freya_listener.ps1 -PrintAll
```

By default, the launcher only transcribes while `binary_sensor.reolink_person` is `on`. The RTSP audio tap remains open, but Whisper is skipped while the person gate is idle.

Show the person gate state each chunk:

```powershell
.\scripts\start_reolink_freya_listener.ps1 -PrintAll -PrintGate
```

Disable the person gate for troubleshooting:

```powershell
.\scripts\start_reolink_freya_listener.ps1 -PrintAll -NoPersonGate
```

PowerShell launcher, real execution mode:

```powershell
.\scripts\start_reolink_freya_listener.ps1 -Execute
```

The launcher wraps the Python listener and always uses `--require-wake "hey freya"`.

Dry-run listener:

```powershell
python .\scripts\listen_reolink_rtsp_wyoming.py --print-all
```

The continuous listener keeps the RTSP audio stream open and transcribes fixed-size chunks. It only sends a command onward when the transcript includes the wake phrase or a configured wake alias. By default it uses strict Home Assistant control and dry-runs service calls.

Execute real strict Home Assistant calls:

```powershell
python .\scripts\listen_reolink_rtsp_wyoming.py --execute
```

Stop it with `Ctrl+C`.

Recommended test-day flow:

1. Start with `.\scripts\start_reolink_freya_listener.ps1 -PrintAll`.
2. Watch whether normal background speech is ignored.
3. Say "Hey Freya" commands and confirm the dry-run entity target is exact.
4. Switch to `.\scripts\start_reolink_freya_listener.ps1 -Execute` only after the dry-runs look right.
5. Stop with `Ctrl+C` when unattended.

## Practical Next Step

Build a listen-only prototype:

1. Run ffmpeg against the Reolink RTSP sub stream.
2. Extract audio as 16 kHz mono PCM.
3. Pipe that audio into a wake-word detector.
4. If "Hey Freya" is detected, send the following speech segment to the existing Home Assistant/Wyoming STT path or a local Whisper process.

Using the Reolink speaker for responses is a separate problem. It likely needs ONVIF talkback, Reolink API support, or go2rtc-style two-way audio support. Treat microphone input as phase one and speaker output as phase two.

## Reolink Speaker / Talkback Experiment

Home Assistant's official Reolink integration does not expose arbitrary two-way audio or TTS playback. It exposes siren/chime-style features, but not a normal `media_player` speaker for the camera.

The experimental path is go2rtc over ONVIF talkback:

```powershell
.\scripts\start_reolink_go2rtc.ps1
```

Then try a test phrase:

```powershell
.\scripts\say_reolink_go2rtc.ps1 -Message "Freya speaker test."
```

If that fails, try the other common talkback codecs:

```powershell
.\scripts\say_reolink_go2rtc.ps1 -Message "Freya speaker test." -Codec pcmu
.\scripts\say_reolink_go2rtc.ps1 -Message "Freya speaker test." -Codec aac
```

Stop the temporary go2rtc container:

```powershell
.\scripts\stop_reolink_go2rtc.ps1
```

The go2rtc config is generated under the Windows temp folder so Reolink credentials are not stored in the repository.
