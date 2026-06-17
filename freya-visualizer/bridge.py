"""
Freya Visualizer Bridge - Relay Mode
FFT data comes from freya_mic_fft.py on Windows host.
This bridge relays state signals and FFT data to dashboard clients.
"""

import asyncio
import json
import logging
import websockets
import os

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("freya-bridge")

HA_URL       = os.environ.get("HA_URL", "http://homeassistant:8123")
HA_TOKEN     = os.environ.get("HA_TOKEN", "")
MEDIA_PLAYER = os.environ.get("MEDIA_PLAYER_ENTITY", "media_player.home_assistant_voice_0a52fa_media_player")
ASSIST_SAT   = "assist_satellite.home_assistant_voice_0a52fa_assist_satellite"
WS_HOST      = "0.0.0.0"
WS_PORT      = 8765

clients  = set()
speaking = False

async def broadcast(data: dict):
    if not clients:
        return
    msg = json.dumps(data)
    await asyncio.gather(*[c.send(msg) for c in list(clients)], return_exceptions=True)

async def visualizer_server(websocket):
    clients.add(websocket)
    log.info(f"Client connected. Total: {len(clients)}")
    await websocket.send(json.dumps({"type": "speaking_start" if speaking else "idle"}))
    try:
        async for raw in websocket:
            try:
                msg = json.loads(raw)
                if msg.get("type") in ("fft", "speaking_start", "speaking_end", "idle"):
                    targets = [c for c in clients if c != websocket]
                    if targets:
                        await asyncio.gather(*[c.send(raw) for c in targets], return_exceptions=True)
            except Exception as e:
                log.warning(f"Relay error: {e}")
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        clients.discard(websocket)
        log.info(f"Client disconnected. Total: {len(clients)}")

async def watch_ha():
    global speaking
    ws_url = HA_URL.replace("http://", "ws://").replace("https://", "wss://") + "/api/websocket"

    while True:
        try:
            log.info(f"Connecting to HA: {ws_url}")
            async with websockets.connect(ws_url) as ws:
                msg = json.loads(await ws.recv())
                assert msg["type"] == "auth_required"
                await ws.send(json.dumps({"type": "auth", "access_token": HA_TOKEN}))
                msg = json.loads(await ws.recv())
                if msg["type"] != "auth_ok":
                    log.error("HA auth failed!")
                    return
                log.info("HA authenticated")

                await ws.send(json.dumps({"id": 1, "type": "subscribe_events", "event_type": "state_changed"}))
                await ws.recv()
                log.info("Watching HA events")

                async for raw in ws:
                    try:
                        event = json.loads(raw)
                        if event.get("type") != "event":
                            continue
                        data      = event.get("event", {}).get("data", {})
                        entity    = data.get("entity_id", "")
                        new_state = data.get("new_state", {}).get("state", "")

                        if entity == ASSIST_SAT and new_state == "responding":
                            speaking = True
                            log.info("Freya responding")
                            await broadcast({"type": "speaking_start"})

                        elif entity == MEDIA_PLAYER and new_state == "idle" and speaking:
                            speaking = False
                            log.info("Freya done")
                            await broadcast({"type": "speaking_end"})

                    except Exception as e:
                        log.warning(f"Event error: {e}")

        except Exception as e:
            log.error(f"HA WS error: {e}. Reconnecting in 5s...")
            await asyncio.sleep(5)

async def main():
    log.info(f"Starting Freya Bridge on ws://0.0.0.0:{WS_PORT}")
    async with websockets.serve(visualizer_server, WS_HOST, WS_PORT):
        await watch_ha()

if __name__ == "__main__":
    asyncio.run(main())
