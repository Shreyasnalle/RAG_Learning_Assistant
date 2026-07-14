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
    def summarize_text(self, text : str) -> str :
        system_prompt = "You are a helpful teaching assistant. Summarize the following video transcript section clearly and concisely, keeping the key points a student would need to remmber"
        response = self.client.chat.completions.create(
            model = "llama-3.3-70b-versatile",
            messages = [
                {"role" : "system", "content" : system_prompt},
                {"role" : "user", "content" : text}
            ],
            temperature = 0.5
        )
        content = response.choices[0].message.content
        if content is None :
            return ""
        return content
    def generate_video_summary(self, chunks : List[Dict], group_size : int = 10) -> str :
        if not chunks :
            return "No content available to summarize"
        groups = self.group_chunks(chunks, group_size = group_size)
        print(f"Split video into {len(groups)} groups for summarizing")
        group_summaries = []
        for i, group_text in enumerate(groups) :
            print(f"Summarizing group {i+1} of {len(groups)}")
            summary = self.summarize_text(group_text)
            group_summaries.append(summary)
        combined_summaries = " ".join(group_summaries)
        final_system_prompt = "You are a helpful teaching assistant. Combine the following section summaries from a video into one clear, well organised final summary of the enitre video"
        response = self.client.chat.completions.create(
            model = "llama-3.3-70b-versatile",
            messages = [
                {"role" : "system", "content" : final_system_prompt},
                {"role" : "user", "content" : combined_summaries}
            ],
            temperature = 0.5
        )
        final_content = response.choices[0].message.content
        if final_content is None :
            return ""
        return final_content

if __name__ == "__main__" :
    caption_file_path = get_latest_caption_file("raw_captions")
    print(f"got the recent caption file path{caption_file_path}")

    parser = CaptionParser()
    segements = parser.parse_raw_captions(caption_file_path)
    print(f"caption parsing done")

    merger = ChunkMerger()
    chunks = merger.merge_segments(segements, target_duration = 45.0)
    print(f"merged into {len(chunks)} chunks")

    summarizer = SummaryPipeline()
    final_summary = summarizer.generate_video_summary(chunks, group_size = 10)

    print(f"Final video summary : {final_summary}")
        