"""
freya_gpu_stats.py

Publishes host/GPU telemetry to Home Assistant state entities.

Required packages:
    pip install -r requirements-freya-telemetry.txt

Configuration:
    MQTT_HOST defaults to localhost.
    MQTT_PORT defaults to 1883.
    HA_TOKEN is optional. When present, REST state pushes are also sent.
    HA_URL defaults to http://localhost:8123.
    FREYA_GPU_INTERVAL defaults to 2 seconds.
"""

import logging
import os
import time

import psutil
import pynvml

try:
    import paho.mqtt.client as mqtt
except ImportError:
    mqtt = None

try:
    import requests
except ImportError:
    requests = None

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("freya-gpu")

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DOTENV_PATH = os.path.join(ROOT_DIR, ".env")


def load_local_env(path):
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_local_env(DOTENV_PATH)

HA_URL = os.environ.get("HA_URL", "http://localhost:8123").rstrip("/")
HA_TOKEN = os.environ.get("HA_TOKEN", "")
INTERVAL = int(os.environ.get("FREYA_GPU_INTERVAL", "2"))
MQTT_HOST = os.environ.get("MQTT_HOST", "localhost")
MQTT_PORT = int(os.environ.get("MQTT_PORT", "1883"))
MQTT_USERNAME = os.environ.get("MQTT_USERNAME", "")
MQTT_PASSWORD = os.environ.get("MQTT_PASSWORD", "")

SENSORS = {
    "sensor.gpu_utilization": ("gpu_utilization", "%", "GPU Utilization", "mdi:expansion-card"),
    "sensor.gpu_temperature": ("gpu_temperature", "°C", "GPU Temperature", "mdi:thermometer"),
    "sensor.gpu_vram_used": ("gpu_vram_used", "GB", "GPU VRAM Used", "mdi:memory"),
    "sensor.gpu_vram_total": ("gpu_vram_total", "GB", "GPU VRAM Total", "mdi:memory"),
    "sensor.gpu_vram_percent": ("gpu_vram_percent", "%", "GPU VRAM Percent", "mdi:memory"),
    "sensor.host_cpu_percent": ("host_cpu_percent", "%", "Host CPU Percent", "mdi:cpu-64-bit"),
    "sensor.host_ram_used": ("host_ram_used", "GB", "Host RAM Used", "mdi:chip"),
    "sensor.host_ram_percent": ("host_ram_percent", "%", "Host RAM Percent", "mdi:chip"),
}

HEADERS = {
    "Authorization": f"Bearer {HA_TOKEN}",
    "Content-Type": "application/json",
}


def connect_mqtt():
    if mqtt is None:
        log.warning("paho-mqtt is not installed; MQTT publishing disabled.")
        return None

    if hasattr(mqtt, "CallbackAPIVersion"):
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    else:
        client = mqtt.Client()
    if MQTT_USERNAME:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    client.connect(MQTT_HOST, MQTT_PORT, keepalive=30)
    client.loop_start()
    log.info("Connected to MQTT at %s:%s", MQTT_HOST, MQTT_PORT)
    return client


def push_mqtt_sensor(client, entity_id, state):
    if client is None:
        return
    slug = SENSORS[entity_id][0]
    client.publish(f"freya/system/{slug}/state", str(state), retain=True)


def push_rest_sensor(entity_id, state):
    if not HA_TOKEN or requests is None:
        return
    slug, unit, friendly_name, icon = SENSORS[entity_id]
    try:
        response = requests.post(
            f"{HA_URL}/api/states/{entity_id}",
            headers=HEADERS,
            json={
                "state": str(state),
                "attributes": {
                    "unit_of_measurement": unit,
                    "friendly_name": friendly_name,
                    "icon": icon,
                    "state_class": "measurement",
                    "source": f"freya/system/{slug}/state",
                },
            },
            timeout=3,
        )
        response.raise_for_status()
    except Exception as exc:
        log.warning("Failed to REST push %s: %s", entity_id, exc)


def push_sensor(client, entity_id, state):
    push_mqtt_sensor(client, entity_id, state)
    push_rest_sensor(entity_id, state)


def main():
    log.info("Initializing NVIDIA ML...")
    pynvml.nvmlInit()
    handle = pynvml.nvmlDeviceGetHandleByIndex(0)
    gpu_name = pynvml.nvmlDeviceGetName(handle)
    if isinstance(gpu_name, bytes):
        gpu_name = gpu_name.decode("utf-8", errors="replace")

    log.info("GPU: %s", gpu_name)
    log.info("Pushing stats to HA every %s seconds...", INTERVAL)
    mqtt_client = connect_mqtt()

    while True:
        try:
            util = pynvml.nvmlDeviceGetUtilizationRates(handle)
            temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
            mem_info = pynvml.nvmlDeviceGetMemoryInfo(handle)

            gpu_util = util.gpu
            gpu_temp = temp
            vram_used = round(mem_info.used / 1024**3, 1)
            vram_total = round(mem_info.total / 1024**3, 1)
            vram_pct = round((mem_info.used / mem_info.total) * 100, 1)

            cpu_pct = psutil.cpu_percent(interval=None)
            ram = psutil.virtual_memory()
            ram_used = round(ram.used / 1024**3, 1)
            ram_total = round(ram.total / 1024**3, 1)
            ram_pct = ram.percent

            push_sensor(mqtt_client, "sensor.gpu_utilization", gpu_util)
            push_sensor(mqtt_client, "sensor.gpu_temperature", gpu_temp)
            push_sensor(mqtt_client, "sensor.gpu_vram_used", vram_used)
            push_sensor(mqtt_client, "sensor.gpu_vram_total", vram_total)
            push_sensor(mqtt_client, "sensor.gpu_vram_percent", vram_pct)
            push_sensor(mqtt_client, "sensor.host_cpu_percent", cpu_pct)
            push_sensor(mqtt_client, "sensor.host_ram_used", ram_used)
            push_sensor(mqtt_client, "sensor.host_ram_percent", ram_pct)

            log.info(
                "GPU %s%% %sC | VRAM %.1f/%.1fGB | CPU %.1f%% | RAM %.1f/%.1fGB",
                gpu_util,
                gpu_temp,
                vram_used,
                vram_total,
                cpu_pct,
                ram_used,
                ram_total,
            )

        except Exception as exc:
            log.error("Error reading stats: %s", exc)

        time.sleep(INTERVAL)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        log.info("Stopped.")
    finally:
        try:
            pynvml.nvmlShutdown()
        except Exception:
            pass
