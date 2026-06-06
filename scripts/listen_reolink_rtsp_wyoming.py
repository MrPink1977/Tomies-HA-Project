"""Continuous Reolink RTSP listener with a Whisper wake gate."""

from __future__ import annotations

import argparse
import asyncio
import subprocess
import sys
import time
from pathlib import Path
from types import SimpleNamespace

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from transcribe_reolink_rtsp_wyoming import (  # noqa: E402
    build_rtsp_url,
    extract_after_wake_phrase,
    has_meaningful_text,
    read_env,
    read_reolink_entry,
    send_to_home_assistant,
    send_to_strict_home_assistant,
    split_csv,
    start_ffmpeg,
    summarize_conversation_response,
    transcribe_pcm_bytes,
)
from urllib.request import Request, urlopen

SAMPLE_RATE = 16000
SAMPLE_WIDTH = 2
CHANNELS = 1
BYTES_PER_SECOND = SAMPLE_RATE * SAMPLE_WIDTH * CHANNELS


def read_exact(stream, byte_count: int) -> bytes:
    chunks: list[bytes] = []
    remaining = byte_count
    while remaining > 0:
        chunk = stream.read(remaining)
        if not chunk:
            break
        chunks.append(chunk)
        remaining -= len(chunk)
    return b"".join(chunks)


def start_reolink_audio(args: argparse.Namespace) -> subprocess.Popen[bytes]:
    entry = read_reolink_entry(args.config_entries)
    url = build_rtsp_url(entry, args.stream)
    process = start_ffmpeg(url, seconds=None)
    if process.stdout is None:
        raise RuntimeError("ffmpeg stdout was not captured")
    return process


def home_assistant_state(args: argparse.Namespace, entity_id: str) -> str:
    env = read_env(args.env_file)
    token = args.ha_token or env.get("HA_TOKEN", "")
    if not token:
        raise RuntimeError("No HA token found. Set HA_TOKEN in .env or pass --ha-token.")

    request = Request(
        f"{args.ha_url.rstrip('/')}/api/states/{entity_id}",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
        },
    )
    with urlopen(request, timeout=8) as response:
        payload = response.read().decode("utf-8")
    import json

    return str(json.loads(payload).get("state", "unknown")).lower()


def gate_is_active(args: argparse.Namespace) -> bool:
    if not args.gate_entity:
        return True

    try:
        state = home_assistant_state(args, args.gate_entity)
    except Exception as exc:  # noqa: BLE001 - diagnostic listener.
        print(f"[gate] {args.gate_entity} unavailable: {exc}", flush=True)
        return args.gate_fail_open

    active_states = {item.strip().lower() for item in args.gate_active_states.split(",") if item.strip()}
    is_active = state in active_states
    if args.print_gate:
        print(f"[gate] {args.gate_entity}={state} -> {'active' if is_active else 'idle'}", flush=True)
    return is_active


async def handle_transcript(args: argparse.Namespace, transcript: str) -> None:
    if not transcript or not has_meaningful_text(transcript):
        return

    print(f"[heard] {transcript}", flush=True)
    command_text = extract_after_wake_phrase(
        transcript,
        args.require_wake,
        split_csv(args.wake_aliases),
    )
    if not command_text:
        return

    if not has_meaningful_text(command_text):
        print("[wake] Heard wake phrase but no command text followed.", flush=True)
        return

    print(f"[command] {command_text}", flush=True)

    shared_args = SimpleNamespace(
        env_file=args.env_file,
        ha_token=args.ha_token,
        ha_url=args.ha_url,
        language=args.language,
        agent_id=args.agent_id,
        entity_aliases=args.entity_aliases,
        command_groups=args.command_groups,
        dry_run=not args.execute,
    )

    if args.ha_mode == "conversation":
        response = send_to_home_assistant(shared_args, command_text)
        print(f"[ha conversation] {summarize_conversation_response(response)}", flush=True)
    else:
        response_text = send_to_strict_home_assistant(shared_args, command_text)
        print(f"[ha strict] {response_text}", flush=True)


async def listen(args: argparse.Namespace) -> int:
    process = start_reolink_audio(args)
    chunk_bytes = max(1, args.chunk_seconds) * BYTES_PER_SECOND
    chunk_index = 0

    print(
        "Listening to Reolink RTSP audio. "
        f"chunk_seconds={args.chunk_seconds}, mode={args.ha_mode}, "
        f"{'EXECUTE' if args.execute else 'DRY-RUN'}. Press Ctrl+C to stop.",
        flush=True,
    )

    try:
        while args.max_chunks <= 0 or chunk_index < args.max_chunks:
            chunk_index += 1
            started_at = time.strftime("%H:%M:%S")
            pcm_audio = await asyncio.to_thread(read_exact, process.stdout, chunk_bytes)
            if len(pcm_audio) < chunk_bytes:
                raise RuntimeError("ffmpeg audio stream ended unexpectedly")

            if not gate_is_active(args):
                if args.print_all:
                    print(f"[chunk {chunk_index} {started_at}] skipped: gate idle", flush=True)
                continue

            transcript = await transcribe_pcm_bytes(
                pcm_audio,
                wyoming_host=args.wyoming_host,
                wyoming_port=args.wyoming_port,
                language=args.language,
            )
            if args.print_all or transcript:
                print(f"[chunk {chunk_index} {started_at}] {transcript or '(no transcript)'}", flush=True)
            await handle_transcript(args, transcript)

            if args.cooldown_seconds > 0:
                await asyncio.sleep(args.cooldown_seconds)
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)

    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--chunk-seconds", type=int, default=8)
    parser.add_argument("--max-chunks", type=int, default=0)
    parser.add_argument("--stream", choices=["sub", "main"], default="sub")
    parser.add_argument("--language", default="en")
    parser.add_argument("--wyoming-host", default="127.0.0.1")
    parser.add_argument("--wyoming-port", type=int, default=10300)
    parser.add_argument("--ha-mode", choices=["strict", "conversation"], default="strict")
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--ha-url", default="http://localhost:8123")
    parser.add_argument("--ha-token", default="")
    parser.add_argument("--env-file", type=Path, default=Path(".env"))
    parser.add_argument("--agent-id", default="")
    parser.add_argument("--entity-aliases", type=Path, default=Path("config/freya_entity_aliases.yaml"))
    parser.add_argument("--command-groups", type=Path, default=Path("config/freya_command_groups.yaml"))
    parser.add_argument("--require-wake", default="hey freya")
    parser.add_argument("--wake-aliases", default="")
    parser.add_argument("--cooldown-seconds", type=float, default=0.5)
    parser.add_argument("--print-all", action="store_true")
    parser.add_argument("--gate-entity", default="")
    parser.add_argument("--gate-active-states", default="on")
    parser.add_argument("--gate-fail-open", action="store_true")
    parser.add_argument("--print-gate", action="store_true")
    parser.add_argument(
        "--config-entries",
        type=Path,
        default=Path("config/.storage/core.config_entries"),
    )
    args = parser.parse_args()
    return asyncio.run(listen(args))


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("\nStopped.", flush=True)
        raise SystemExit(130)
    except Exception as exc:  # noqa: BLE001 - command-line diagnostic.
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
