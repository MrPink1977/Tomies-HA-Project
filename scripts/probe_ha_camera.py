"""Probe Home Assistant camera endpoints without printing secrets."""

from __future__ import annotations

import argparse
import json
import urllib.error
import urllib.request
from pathlib import Path


def read_env(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key] = value
    return values


def request_json(url: str, token: str) -> dict:
    request = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(request, timeout=8) as response:
        return json.loads(response.read().decode("utf-8"))


def redact(url: str) -> str:
    if "token=" not in url:
        return url
    return url.split("token=", 1)[0] + "token=<redacted>"


def probe_endpoint(url: str, token: str) -> dict:
    request = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {token}"},
    )
    try:
        with urllib.request.urlopen(request, timeout=8) as response:
            return {
                "endpoint": redact(url),
                "status": response.status,
                "content_type": response.headers.get("Content-Type"),
                "content_length": response.headers.get("Content-Length"),
                "final_url": redact(response.geturl()),
            }
    except urllib.error.HTTPError as exc:
        return {
            "endpoint": redact(url),
            "status": exc.code,
            "error": str(exc),
            "content_type": exc.headers.get("Content-Type"),
            "location": redact(exc.headers.get("Location", "")),
        }
    except Exception as exc:  # noqa: BLE001 - this is a diagnostic script.
        return {
            "endpoint": redact(url),
            "status": None,
            "error": str(exc),
        }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--entity", default="camera.reolink_fluent")
    parser.add_argument("--ha-url", default="http://localhost:8123")
    args = parser.parse_args()

    env = read_env(Path(".env"))
    token = env.get("HA_TOKEN", "")
    if not token:
        print(json.dumps({"error": "HA_TOKEN not found in .env"}))
        return 1

    state = request_json(f"{args.ha_url}/api/states/{args.entity}", token)
    attributes = state.get("attributes", {})
    camera_token = attributes.get("access_token", "")
    print(
        json.dumps(
            {
                "entity_id": args.entity,
                "state": state.get("state"),
                "friendly_name": attributes.get("friendly_name"),
                "supported_features": attributes.get("supported_features"),
                "frontend_stream_type": attributes.get("frontend_stream_type"),
                "has_access_token": bool(camera_token),
                "attribute_keys": sorted(attributes.keys()),
            }
        )
    )

    if not camera_token:
        return 0

    endpoints = [
        f"{args.ha_url}/api/camera_proxy/{args.entity}?token={camera_token}",
        f"{args.ha_url}/api/camera_proxy_stream/{args.entity}?token={camera_token}",
    ]
    for endpoint in endpoints:
        print(json.dumps(probe_endpoint(endpoint, token)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
