# Front Door Face Recognition

The active face-recognition path uses the standard open-source stack:

- Frigate detects people from the Reolink front-door RTSP stream and publishes snapshots/events to MQTT.
- Double Take subscribes to Frigate MQTT/API events and coordinates face matching.
- CompreFace stores known people and performs the recognition model work.
- Home Assistant subscribes to Double Take MQTT results for sensors, notifications, and voice alerts.

The older custom OpenCV service in `front-door-face/` is kept in the repo as a fallback, but it is no longer started by `docker-compose.yml`.

## Services

| Service | Local URL | Internal URL |
| --- | --- | --- |
| Frigate UI | `https://localhost:8971` | `http://frigate:5000` |
| Frigate API | `http://localhost:5001` | `http://frigate:5000` |
| Double Take | `http://localhost:3030` | `http://double-take:3000` |
| CompreFace | `http://localhost:8001` | `http://compreface-ui:80` |
| Mosquitto | `localhost:1883` | `mosquitto:1883` |

Main config files:

- `frigate/config/config.yml`
- `double-take/config/config.yml`
- `double-take/config/secrets.yml`
- `config/packages/front_door_face_review.yaml`
- `config/dashboards/front_door_faces.yaml`

## First-Time Setup

1. Start the stack:

```powershell
docker compose up -d mosquitto frigate compreface-postgres-db compreface-api compreface-admin compreface-core compreface-ui double-take
```

2. Open CompreFace at `http://localhost:8001`.
3. Create a CompreFace account, application, and recognition service.
4. Copy the recognition service API key.
5. Copy `double-take/config/secrets.example.yml` to `double-take/config/secrets.yml`.
6. Paste the key into `compreface_key`.
7. Restart Double Take:

```powershell
docker compose restart double-take
```

8. Open Double Take at `http://localhost:3030` and confirm MQTT, Frigate, and CompreFace are connected.

## Training People

Use CompreFace or Double Take to add known people and upload clear face images. Start with 5 to 10 images per person across normal front-door lighting and angles.

Good training images matter more than model tuning. Avoid heavy glare, tiny faces, hats covering the face, and strong backlighting.

Useful local image folders:

- Frigate event snapshots: `frigate/media/clips/`
- Double Take latest face/event image: `double-take/latest/`
- Double Take saved recognition images: `double-take/matches/`

Current first trained subject:

- `tommy`

Observed result on June 6, 2026:

- CompreFace returned `tommy` at about `92.61%` confidence.
- Double Take saved `double-take/latest/tommy.jpg`.
- Double Take may report high-confidence named results in `misses[]` with `match: false`; Home Assistant treats named results at or above 70% as alert-worthy.

## Home Assistant

Home Assistant creates these entities from Double Take MQTT:

- `sensor.front_door_face_match`
- `sensor.front_door_face_confidence`
- `sensor.front_door_face_summary`
- `input_text.front_door_face_last_alert_id`

The dashboard remains available at:

```text
/front-door-faces/review
```

The old `Front Door AI Snapshot - Reolink Trigger` automation was removed from the active config. The active automation is `Front Door - Double Take Face Match`, which listens on:

```text
double-take/cameras/front_door
```

Named results with confidence at or above 70% are announced by Piper and sent to the phone. Unknown faces with confidence at or above 40% are announced as unknown. The automation stores the latest Double Take event id in `input_text.front_door_face_last_alert_id` to avoid duplicate alerts for the same event.

The alert path was verified with a synthetic MQTT payload on June 6, 2026:

```text
sensor.front_door_face_match = tommy
sensor.front_door_face_confidence = 92.61
sensor.front_door_face_summary = tommy at the front door (92.6%)
```

## RTSP Camera

Frigate reads the Reolink substream from:

```text
rtsp://{FRIGATE_RTSP_USER}:{FRIGATE_RTSP_PASSWORD}@192.168.0.94:554/h264Preview_01_sub
```

The active credentials are read from `.env` as `FRIGATE_RTSP_USER` and `FRIGATE_RTSP_PASSWORD`. These were populated from Home Assistant's working Reolink integration because the old compose defaults no longer authenticated with the camera.

## Notes

- Frigate's Home Assistant integration can be installed from HACS after MQTT is working.
- Double Take can write recognized names back to Frigate sub-labels because `update_sub_labels` is enabled.
- The CompreFace database lives under `compreface/postgres-data/` and is ignored by Git.
- Double Take's real `secrets.yml`, matches, and training data are ignored by Git.
- Frigate's UI uses local HTTPS on `https://localhost:8971`; the browser may show a self-signed certificate warning.
- Host port `8554` is already used by `freya-go2rtc`, so Frigate's host RTSP/WebRTC ports are mapped to `8556` and `8557`.
- Frigate may re-add `version: 0.17-0` to `frigate/config/config.yml` during its own config migration. It is noisy but harmless.
