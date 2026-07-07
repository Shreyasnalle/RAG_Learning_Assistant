import json
from typing import List, Dict
import re 
class CaptionParser :
    def parse_raw_captions(self, file_path : str) -> List[Dict] :
        with open(file_path, "r", encoding = "utf-8") as f :
            data = json.load(f)
            segments = []
            previous_text = ""
            for event in data.get("events", []) :
                if "segs" not in event :
                    continue
                start_ms = event.get("tStartMs", 0)
                duration_ms = event.get("dDurationMs", 0)
                end_ms = start_ms + duration_ms
                start_seconds = start_ms / 1000.0
                end_seconds = end_ms / 1000.0
                text_parts = []
                for seg in event.get("segs", []) :
                    if "utf8" in seg :
                        text_parts.append(seg["utf8"])
                full_text = "".join(text_parts).strip()
                clean_text = self.clean_text(full_text)
                if not clean_text :
                    continue
                segments.append({
                    "start_time" : start_seconds,
                    "end_time" : end_seconds,
                    "text" : clean_text,
                    "start_ms" : start_ms,
                    "end_ms" : end_ms
                })
                previous_text = clean_text
            return segments
    
    def clean_text(self, text : str) -> str :
        if not text :
            return ""
        text = re.sub(r'\[.*?\]', '', text)
        text = re.sub(r'\(.*?\)', '', text) 
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def print_segments(self, segments : List[Dict], limit = 10) :
        for seg in segments[:limit] :
            start_minutes = int(seg["start_time"] // 60)
            start_seconds = int(seg["start_time"] % 60)
            end_minutes = int(seg["end_time"] // 60)
            end_seconds = int(seg["end_time"] % 60)
            print(f"{start_minutes : 02d}:{start_seconds :02d} --> "f"{end_minutes : 02d}:{end_seconds :02d} | {seg['text']}")
if __name__ == "__main__" :
    parser = CaptionParser()
    segments = parser.parse_raw_captions("/home/shreyas-nalle/Desktop/RAG_teaching_assistant/backend/raw_captions/b117ad4f-6ef5-4165-9c18-f59ae2d75e47.txt")
    print(f"Total segments parsed : {len(segments)}")
    parser.print_segments(segments, limit = 15)
    