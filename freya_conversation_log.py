"""
freya_conversation_log.py

Reads home_agent.history and writes a clean, human-readable
conversation log. Run manually or add to Task Scheduler.

Usage:
    python freya_conversation_log.py

Output:
    C:\AI_Projects\homeassistant\freya_conversation_log.txt
"""

import json
import os
from datetime import datetime, timezone, timedelta

HISTORY_FILE = r"C:\AI_Projects\homeassistant\config\.storage\home_agent.history"
LOG_FILE     = r"C:\AI_Projects\homeassistant\freya_conversation_log.txt"
DAYS_TO_KEEP = 7

def load_history():
    with open(HISTORY_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["data"]["conversations"]

def format_log(conversations):
    cutoff = datetime.now(timezone.utc) - timedelta(days=DAYS_TO_KEEP)
    lines = []
    lines.append("=" * 70)
    lines.append("  FREYA // CONVERSATION LOG")
    lines.append(f"  Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"  Showing last {DAYS_TO_KEEP} days")
    lines.append("=" * 70)
    lines.append("")

    # Flatten all messages across all conversations, sorted by timestamp
    all_messages = []
    for conv_id, messages in conversations.items():
        for msg in messages:
            all_messages.append((conv_id, msg))

    all_messages.sort(key=lambda x: x[1]["timestamp"])

    # Group by day
    current_day = None
    current_conv = None
    skipped = 0

    for conv_id, msg in all_messages:
        ts = datetime.fromtimestamp(msg["timestamp"] / 1000 if msg["timestamp"] > 9999999999 else msg["timestamp"])
        ts_utc = ts.replace(tzinfo=timezone.utc) if ts.tzinfo is None else ts

        # Skip messages older than cutoff
        if ts_utc < cutoff:
            skipped += 1
            continue

        day_str = ts.strftime("%A, %B %d %Y")
        if day_str != current_day:
            if current_day is not None:
                lines.append("")
            lines.append(f"── {day_str} {'─' * (50 - len(day_str))}")
            lines.append("")
            current_day = day_str
            current_conv = None

        # Mark conversation breaks
        if conv_id != current_conv:
            if current_conv is not None:
                lines.append("  · · ·")
                lines.append("")
            current_conv = conv_id

        time_str = ts.strftime("%I:%M:%S %p")
        role = msg["role"]
        content = msg["content"].strip()

        if role == "user":
            lines.append(f"  [{time_str}] TOMIE:")
            lines.append(f"    {content}")
        else:
            lines.append(f"  [{time_str}] FREYA:")
            # Wrap long lines
            words = content.split()
            line = "    "
            for word in words:
                if len(line) + len(word) > 72:
                    lines.append(line)
                    line = "    " + word + " "
                else:
                    line += word + " "
            if line.strip():
                lines.append(line)

        lines.append("")

    if skipped:
        lines.append(f"  [ {skipped} older messages not shown ]")

    lines.append("")
    lines.append("=" * 70)
    return "\n".join(lines)

def main():
    print(f"Reading: {HISTORY_FILE}")
    conversations = load_history()
    total = sum(len(v) for v in conversations.values())
    print(f"Found {len(conversations)} conversation(s), {total} messages total")

    log = format_log(conversations)

    with open(LOG_FILE, "w", encoding="utf-8") as f:
        f.write(log)

    print(f"Log written to: {LOG_FILE}")
    print(f"Open it with: notepad \"{LOG_FILE}\"")

if __name__ == "__main__":
    main()