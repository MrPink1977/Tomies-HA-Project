"""
freya_gpu_stats.py

Publishes host/GPU telemetry to Home Assistant state entities.

Required packages:
    pip install pynvml psutil requests

Configuration:
    HA_TOKEN is required. Put it in .env or set it as an environment variable.
    HA_URL defaults to http://localhost:8123.
    FREYA_GPU_INTERVAL defaults to 2 seconds.
"""

import logging
import os
import time

import psutil
import pynvml
import requests

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

if not HA_TOKEN:
    raise SystemExit("HA_TOKEN is required. Put it in .env or set it in the environment.")

HEADERS = {
    "Authorization": f"Bearer {HA_TOKEN}",
    "Content-Type": "application/json",
}


def push_sensor(entity_id, state, unit, friendly_name, icon="mdi:chip"):
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
                },
            },
            timeout=3,
        )
        response.raise_for_status()
    except Exception as exc:
        log.warning("Failed to push %s: %s", entity_id, exc)


def main():
    log.info("Initializing NVIDIA ML...")
    pynvml.nvmlInit()
    handle = pynvml.nvmlDeviceGetHandleByIndex(0)
    gpu_name = pynvml.nvmlDeviceGetName(handle)
    if isinstance(gpu_name, bytes):
        gpu_name = gpu_name.decode("utf-8", errors="replace")

    log.info("GPU: %s", gpu_name)
    log.info("Pushing stats to HA every %s seconds...", INTERVAL)

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

            push_sensor("sensor.gpu_utilization", gpu_util, "%", "GPU Utilization", "mdi:expansion-card")
            push_sensor("sensor.gpu_temperature", gpu_temp, "C", "GPU Temperature", "mdi:thermometer")
            push_sensor("sensor.gpu_vram_used", vram_used, "GB", "GPU VRAM Used", "mdi:memory")
            push_sensor("sensor.gpu_vram_total", vram_total, "GB", "GPU VRAM Total", "mdi:memory")
            push_sensor("sensor.gpu_vram_percent", vram_pct, "%", "GPU VRAM Percent", "mdi:memory")
            push_sensor("sensor.host_cpu_percent", cpu_pct, "%", "Host CPU Percent", "mdi:cpu-64-bit")
            push_sensor("sensor.host_ram_used", ram_used, "GB", "Host RAM Used", "mdi:chip")
            push_sensor("sensor.host_ram_percent", ram_pct, "%", "Host RAM Percent", "mdi:chip")

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
