from file_utils import get_latest_caption_file
from caption_parser import CaptionParser
from chunk_merger import ChunkMerger
from typing import List, Dict

class SummaryChunking :
    def single_chunk_for_summary(self, segments : List[Dict]) -> str :
        all_texts = [seg["text"] for seg in segments]    
        final_chunk = " ".join(all_texts)
        return final_chunk       

if __name__ == "__main__" :
    caption_file_path = get_latest_caption_file("raw_captions")
    print(f"got the recent caption file path {caption_file_path}")
    parser = CaptionParser()
    segments = parser.parse_raw_captions(caption_file_path)
    print(f"captions parsing done")
    merger = ChunkMerger()
    chunks = merger.merge_segments(segments, target_duration = 45.0)
    print(f"merged into {len(chunks)} chunks")
    summary_chunker = SummaryChunking()
    full_text = summary_chunker.single_chunk_for_summary(chunks)
    print(f"combined transcript length: {len(full_text)} characters")