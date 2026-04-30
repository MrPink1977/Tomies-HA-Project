"""
freya_gpu_stats.py

Reads GPU stats (utilization, temp, VRAM) from NVIDIA RTX 5060 Ti
and pushes them to Home Assistant as sensor entities every 2 seconds.

Requirements:
    pip install pynvml psutil

Usage:
    python freya_gpu_stats.py

Registers as Windows Task Scheduler task for auto-start.
"""

import time
import requests
import psutil
import pynvml
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("freya-gpu")

HA_URL   = "http://localhost:8123"
HA_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI4MjcxYzMzM2Q1NTk0ODA1YjQ1YTQxM2U1ZjEwOTJlNSIsImlhdCI6MTc3MjQzMzUwMywiZXhwIjoyMDg3NzkzNTAzfQ.cxWfPAjDx2d9D_GNO_RjDtqjir2giySVPydz6Miwj0Q"
INTERVAL = 2  # seconds

HEADERS = {
    "Authorization": f"Bearer {HA_TOKEN}",
    "Content-Type": "application/json"
}

def push_sensor(entity_id, state, unit, friendly_name, icon="mdi:chip"):
    try:
        requests.post(
            f"{HA_URL}/api/states/{entity_id}",
            headers=HEADERS,
            json={
                "state": str(state),
                "attributes": {
                    "unit_of_measurement": unit,
                    "friendly_name": friendly_name,
                    "icon": icon
                }
            },
            timeout=3
        )
    except Exception as e:
        log.warning(f"Failed to push {entity_id}: {e}")

def main():
    log.info("Initializing NVIDIA ML...")
    pynvml.nvmlInit()
    handle = pynvml.nvmlDeviceGetHandleByIndex(0)
    gpu_name = pynvml.nvmlDeviceGetName(handle)
    log.info(f"GPU: {gpu_name}")
    log.info(f"Pushing stats to HA every {INTERVAL}s...")

    while True:
        try:
            # GPU stats
            util       = pynvml.nvmlDeviceGetUtilizationRates(handle)
            temp       = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
            mem_info   = pynvml.nvmlDeviceGetMemoryInfo(handle)
            gpu_util   = util.gpu
            gpu_temp   = temp
            vram_used  = round(mem_info.used / 1024**3, 1)
            vram_total = round(mem_info.total / 1024**3, 1)
            vram_pct   = round((mem_info.used / mem_info.total) * 100, 1)

            # CPU & RAM via psutil
            cpu_pct    = psutil.cpu_percent(interval=None)
            ram        = psutil.virtual_memory()
            ram_used   = round(ram.used / 1024**3, 1)
            ram_total  = round(ram.total / 1024**3, 1)
            ram_pct    = ram.percent

            # Push to HA
            push_sensor("sensor.gpu_utilization",  gpu_util,  "%",  "GPU Utilization",  "mdi:expansion-card")
            push_sensor("sensor.gpu_temperature",  gpu_temp,  "°F" if False else "°C", "GPU Temperature", "mdi:thermometer")
            push_sensor("sensor.gpu_vram_used",    vram_used, "GB", "GPU VRAM Used",    "mdi:memory")
            push_sensor("sensor.gpu_vram_total",   vram_total,"GB", "GPU VRAM Total",   "mdi:memory")
            push_sensor("sensor.gpu_vram_percent", vram_pct,  "%",  "GPU VRAM %",       "mdi:memory")
            push_sensor("sensor.host_cpu_percent", cpu_pct,   "%",  "Host CPU %",       "mdi:cpu-64-bit")
            push_sensor("sensor.host_ram_used",    ram_used,  "GB", "Host RAM Used",    "mdi:chip")
            push_sensor("sensor.host_ram_percent", ram_pct,   "%",  "Host RAM %",       "mdi:chip")

            log.info(f"GPU {gpu_util}% {gpu_temp}°C | VRAM {vram_used}/{vram_total}GB | CPU {cpu_pct}% | RAM {ram_used}/{ram_total}GB")

        except Exception as e:
            log.error(f"Error reading stats: {e}")

        time.sleep(INTERVAL)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        log.info("Stopped.")
    finally:
        pynvml.nvmlShutdown()