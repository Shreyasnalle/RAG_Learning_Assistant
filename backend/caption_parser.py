import json
import re
from typing import List, Dict, Union


class CaptionParser:
    def parse_raw_text(self, raw_text: Union[str, dict]) -> List[Dict]:
        try:
            if isinstance(raw_text, str):
                data = json.loads(raw_text)
            else:
                data = raw_text
        except Exception:
            return []

        segments = []
        for event in data.get("events", []):
            if "segs" not in event:
                continue
            start_ms = event.get("tStartMs", 0)
            duration_ms = event.get("dDurationMs", 0)
            end_ms = start_ms + duration_ms
            start_seconds = start_ms / 1000.0
            end_seconds = end_ms / 1000.0
            text_parts = [seg["utf8"] for seg in event.get("segs", []) if "utf8" in seg]
            full_text = "".join(text_parts).strip()
            clean_text = self.clean_text(full_text)
            if not clean_text:
                continue
            segments.append({
                "start_time": start_seconds,
                "end_time": end_seconds,
                "text": clean_text,
                "start_ms": start_ms,
                "end_ms": end_ms
            })
        return segments

    def parse_raw_captions(self, file_path: str) -> List[Dict]:
        with open(file_path, "r", encoding="utf-8") as f:
            return self.parse_raw_text(f.read())

    def clean_text(self, text: str) -> str:
        if not text:
            return ""
        text = re.sub(r'\[.*?\]', '', text)
        text = re.sub(r'\(.*?\)', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()