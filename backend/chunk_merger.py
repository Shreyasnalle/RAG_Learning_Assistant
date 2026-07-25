from typing import List, Dict


class ChunkMerger:
    def merge_segments(self, segments: List[Dict], target_duration: float = 45.0) -> List[Dict]:
        if not segments:
            return []
        merged_chunks = []
        current_texts = []
        current_start = segments[0]["start_time"]
        current_end = segments[0]["end_time"]
        for seg in segments:
            chunk_duration_so_far = current_end - current_start
            if chunk_duration_so_far < target_duration or not current_texts:
                current_texts.append(seg["text"])
                current_end = seg["end_time"]
            else:
                merged_chunks.append({
                    "text": " ".join(current_texts),
                    "start_time": current_start,
                    "end_time": current_end
                })
                current_texts = [seg["text"]]
                current_start = seg["start_time"]
                current_end = seg["end_time"]
        if current_texts:
            merged_chunks.append({
                "text": " ".join(current_texts),
                "start_time": current_start,
                "end_time": current_end
            })
        return merged_chunks