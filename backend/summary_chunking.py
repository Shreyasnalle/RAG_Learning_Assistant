from typing import List, Dict


class SummaryChunking:
    def single_chunk_for_summary(self, segments: List[Dict]) -> str:
        all_texts = [seg["text"] for seg in segments]
        return " ".join(all_texts)