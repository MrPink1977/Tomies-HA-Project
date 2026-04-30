"""
freya_mic_fft.py

Runs on Windows directly (not in Docker).
Captures audio from DRELANMIC, runs FFT, sends to dashboard via WebSocket.
Triggered by HA state changes - only captures during Freya's responses.

Requirements:
    pip install sounddevice numpy scipy websockets aiohttp

Usage:
    python freya_mic_fft.py

Leave this running in the background. It will auto-start/stop FFT
capture when Freya speaks based on HA events.
"""

import asyncio
import json
import logging
import numpy as np
import sounddevice as sd
import websockets
import aiohttp
from scipy.fft import rfft, rfftfreq
from collections import deque
import threading

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("freya-mic")

# ── CONFIG ────────────────────────────────────────────────────────────────────
HA_URL       = "http://localhost:8123"
HA_TOKEN     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI4MjcxYzMzM2Q1NTk0ODA1YjQ1YTQxM2U1ZjEwOTJlNSIsImlhdCI6MTc3MjQzMzUwMywiZXhwIjoyMDg3NzkzNTAzfQ.cxWfPAjDx2d9D_GNO_RjDtqjir2giySVPydz6Miwj0Q"
BRIDGE_WS    = "ws://localhost:8765"          # freya-visualizer bridge
MIC_NAME     = "DRELANMIC"                    # partial match is fine
SAMPLE_RATE  = 48000
FRAME_SIZE   = 2048
HOP_SIZE     = int(SAMPLE_RATE / 30)          # 30fps
NOISE_GATE   = 0.002                          # ignore below this amplitude
ASSIST_SAT   = "assist_satellite.home_assistant_voice_0a52fa_assist_satellite"
MEDIA_PLAYER = "media_player.home_assistant_voice_0a52fa_media_player"

# ── State ─────────────────────────────────────────────────────────────────────
speaking     = False
audio_buffer = deque(maxlen=FRAME_SIZE * 4)
bridge_ws    = None

def find_mic():
    """Find DRELANMIC device index."""
    devices = sd.query_devices()
    for i, d in enumerate(devices):
        if MIC_NAME.lower() in d['name'].lower() and d['max_input_channels'] > 0:
            log.info(f"Found mic: [{i}] {d['name']} ({d['max_input_channels']}ch, {int(d['default_samplerate'])}Hz)")
            return i
    log.warning(f"'{MIC_NAME}' not found. Available input devices:")
    for i, d in enumerate(devices):
        if d['max_input_channels'] > 0:
            log.warning(f"  [{i}] {d['name']}")
    return None

def audio_callback(indata, frames, time, status):
    """Called by sounddevice for each audio chunk."""
    if status:
        log.warning(f"Audio status: {status}")
    audio_buffer.extend(indata[:, 0].tolist())

async def fft_loop():
    """Pull audio from buffer, compute FFT, send to bridge."""
    global speaking, bridge_ws

    log.info("FFT loop started")
    window    = np.hanning(FRAME_SIZE)
    n_bins    = 256
    log_freqs = np.logspace(np.log10(20), np.log10(8000), n_bins)
    nyquist   = SAMPLE_RATE / 2

    smoothed  = np.full(n_bins, -100.0)

    while True:
        if not speaking or bridge_ws is None:
            await asyncio.sleep(0.03)
            smoothed = np.full(n_bins, -100.0)
            continue

        if len(audio_buffer) < FRAME_SIZE:
            await asyncio.sleep(0.01)
            continue

        # Grab frame
        frame = np.array(list(audio_buffer)[-FRAME_SIZE:], dtype=np.float32)

        # Noise gate
        if np.abs(frame).max() < NOISE_GATE:
            await asyncio.sleep(1/30)
            continue

        # FFT
        windowed  = frame * window
        spectrum  = np.abs(rfft(windowed))
        fft_freqs = rfftfreq(FRAME_SIZE, 1.0 / SAMPLE_RATE)

        # Interpolate to log-spaced bins
        bins = np.interp(log_freqs, fft_freqs, spectrum)

        # dB conversion
        with np.errstate(divide='ignore'):
            db = 20 * np.log10(bins + 1e-10)
        db = np.clip(db, -100, 0)

        # Smooth
        smoothed = smoothed * 0.6 + db * 0.4

        try:
            await bridge_ws.send(json.dumps({
                "type": "fft",
                "bins": smoothed.tolist(),
                "freqs": log_freqs.tolist()
            }))
        except Exception as e:
            log.warning(f"Bridge send failed: {e}")
            bridge_ws = None

        await asyncio.sleep(1/30)

async def connect_bridge():
    """Maintain WebSocket connection to the bridge."""
    global bridge_ws
    while True:
        try:
            log.info(f"Connecting to bridge: {BRIDGE_WS}")
            async with websockets.connect(BRIDGE_WS) as ws:
                bridge_ws = ws
                log.info("Bridge connected")
                # Keep alive
                async for msg in ws:
                    pass
        except Exception as e:
            log.warning(f"Bridge disconnected: {e}. Retrying in 3s...")
            bridge_ws = None
            await asyncio.sleep(3)

async def watch_ha():
    """Watch HA WebSocket for assist_satellite state changes."""
    global speaking
    ws_url = HA_URL.replace("http://", "ws://") + "/api/websocket"

    while True:
        try:
            log.info(f"Connecting to HA: {ws_url}")
            async with websockets.connect(ws_url) as ws:
                msg = json.loads(await ws.recv())
                assert msg["type"] == "auth_required"
                await ws.send(json.dumps({"type": "auth", "access_token": HA_TOKEN}))
                msg = json.loads(await ws.recv())
                if msg["type"] != "auth_ok":
                    log.error("HA auth failed")
                    return
                log.info("HA authenticated")

                await ws.send(json.dumps({
                    "id": 1,
                    "type": "subscribe_events",
                    "event_type": "state_changed"
                }))
                await ws.recv()
                log.info("Watching for Freya's voice...")

                async for raw in ws:
                    event = json.loads(raw)
                    if event.get("type") != "event":
                        continue
                    data      = event.get("event", {}).get("data", {})
                    entity    = data.get("entity_id", "")
                    new_state = data.get("new_state", {}).get("state", "")

                    if entity == ASSIST_SAT and new_state == "responding":
                        speaking = True
                        log.info("🎙 Freya speaking — mic capture ON")
                        if bridge_ws:
                            await bridge_ws.send(json.dumps({"type": "speaking_start"}))

                    elif entity == MEDIA_PLAYER and new_state == "idle" and speaking:
                        speaking = False
                        log.info("⏹ Freya done — mic capture OFF")
                        if bridge_ws:
                            await bridge_ws.send(json.dumps({"type": "speaking_end"}))

        except Exception as e:
            log.error(f"HA WS error: {e}. Reconnecting in 5s...")
            await asyncio.sleep(5)

async def main():
    mic_idx = find_mic()
    if mic_idx is None:
        log.error("DRELANMIC not found. Check USB connection and try again.")
        return

    log.info(f"Starting mic capture on device {mic_idx}")
    stream = sd.InputStream(
        device=mic_idx,
        channels=1,
        samplerate=SAMPLE_RATE,
        blocksize=HOP_SIZE,
        dtype='float32',
        callback=audio_callback
    )

    with stream:
        log.info("Mic stream open. Waiting for Freya to speak...")
        await asyncio.gather(
            connect_bridge(),
            watch_ha(),
            fft_loop(),
        )

if __name__ == "__main__":
    asyncio.run(main())
