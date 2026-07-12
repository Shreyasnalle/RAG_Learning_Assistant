from file_utils import get_latest_caption_file
from caption_parser import CaptionParser
from chunk_merger import ChunkMerger
from typing import List, Dict

class SummaryChunking :
    def single_chunk_for_summary(self, segments : List[Dict]) -> str :
        total_number_of_chunks = len(segments)
        final_chunk = ""
        for i in range(total_number_of_chunks) :
            final_chunk.join(segments[i]["text"])
        return final_chunk

if __name__ == "__main__" :
    caption_file_path = get_latest_caption_file("raw_captions")
    print(f"got the recent caption file path {caption_file_path}")
    parser = CaptionParser()
    segments = parser.parse_raw_captions(caption_file_path)
    print(f"captions parsing done")
    merger = ChunkMerger()
    chunks = 
