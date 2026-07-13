import os 
from openai import OpenAI
from typing import List, Dict
from dotenv import load_dotenv
from file_utils import get_latest_caption_file
from caption_parser import CaptionParser
from chunk_merger import ChunkMerger 
load_dotenv("groq_api.env")
class SummaryPipeline :
    def __init__(self) :
        self.client = OpenAI(
            api_key = os.getenv("GROQ_API_KEY"),
            base_url = "https://api.groq.com/openai/v1"
        )
    def group_chunks(self, chunks : List[Dict], group_size : int = 10) -> List[str] :
        groups = []
        for i in range(0, len(chunks), group_size) :
            batch = chunks[i : i + group_size]
            batch_text = " ".join(seg["text"] for seg in batch)
            groups.append(batch_text)
        return groups
