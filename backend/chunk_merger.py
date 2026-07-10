from scipy.spatial import ConvexHull
from traceback import print_tb
from typing import List, Dict
class ChunkMerger :
    def merge_segments(self, segments : List[Dict], target_duration : float = 45.0) -> List[Dict] :
        if not segments :
            return []
        merged_chunks = []
        current_texts = []
        current_start = segments[0]["start_time"]
        current_end = segments[0]["end_time"]
        for seg in segments :
            chunk_duration_so_far = current_end - current_start
            if chunk_duration_so_far < target_duration or not current_texts :
                current_texts.append(seg["text"])
                current_end = seg["end_time"]
            else :
                merged_chunks.append({
                    "text" : " ".join(current_texts),
                    "start_time" : current_start,
                    "end_time" : current_end
                })
                current_texts = [seg["text"]]
                current_start = seg["start_time"]
                current_end = seg["end_time"]
        if current_texts :
            merged_chunks.append({
                "text" : " ".join(current_texts),
                "start_time" : current_start,
                "end_time" : current_end
            })
        return merged_chunks
if __name__ == "__main__" :
    from caption_parser import CaptionParser
    caption_file = "/home/shreyas-nalle/Desktop/RAG_teaching_assistant/backend/raw_captions/e01010fd-134e-4b89-8634-629fba4da689.txt"
    parser = CaptionParser()
    segments = parser.parse_raw_captions(caption_file)
    print(f"orginal segments : {len(segments)}")
    merger = ChunkMerger()
    chunks = merger.merge_segments(segments, target_duration = 45.0)
    print(f"merged chunks :{len(chunks)}")
    for chunk in chunks[:2] :
        print(f"[{chunk['start_time']:.1f}s - {chunk['end_time']:.1f}s] {chunk['text']}")