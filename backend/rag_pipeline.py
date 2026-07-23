import os
from openai import OpenAI 
from typing import List, Dict
from retriever import VideoRetriever
import json
from dotenv import load_dotenv
from file_utils import get_latest_caption_file
load_dotenv("groq_api.env")
class RAGPipeline :
    def __init__(self) :
        self.client = OpenAI(
            api_key = os.getenv("GROQ_API_KEY"),
            base_url = "https://api.groq.com/openai/v1"
        )
    def generate_answer(self, question : str, retrieved : list) -> str :
        context = []
        if retrieved:
            for chunk in retrieved:
                sec = float(chunk['start_time'])
                mins = int(sec // 60)
                secs = int(sec % 60)
                timestamp_str = f"[{mins:02d}:{secs:02d}]"
                context.append(f"{timestamp_str} : {chunk['text']}")

        system_prompt = (
            "You are a helpful, knowledgeable, and highly structured AI teaching assistant (like Gemini).\n"
            "Your task is to answer the student's question accurately, directly, and comprehensively without ambiguity.\n\n"
            "Guidelines:\n"
            "1. Primary Source: Use the provided video content snippet if it contains relevant information. Whenever referencing video content, include the exact timestamp in MM:SS format (e.g. `[01:31]`).\n"
            "2. Supplementary Knowledge: If the video content does not fully answer the question, seamlessly answer using your own extensive knowledge base on the topic.\n"
            "3. No Disclaimers: DO NOT include disclaimers, apologies, or meta-statements like 'The video does not contain enough information' or 'According to the video'. Simply provide the direct, correct, and structured answer.\n\n"
            "Formatting & Visual Style Guidelines:\n"
            "- Structure your response cleanly with well-spaced paragraphs (separate each paragraph with a blank line).\n"
            "- Use bold text (`**term**`) VERY SPARINGLY — only for key technical words or crucial terms. Do NOT bold whole sub-topic headers or full sentences.\n"
            "- Use bullet points (`- `) for lists, steps, or multiple items.\n"
            "- Put code snippets, shell commands, or technical syntax inside code blocks (e.g. ```pip install fastapi```) or inline code (`code`).\n"
            "- Keep the tone concise, encouraging, educational, and confident."
        )

        user_prompt = f"Video content: {context if context else 'None'}\nStudent Question: {question}"
        response = self.client.chat.completions.create(
            model = "llama-3.3-70b-versatile",
            messages = [
                {"role" : "system", "content" : system_prompt},
                {"role" : "user", "content" : user_prompt}
            ],
            temperature = 0.5
        )
        return response.choices[0].message.content or ""
def load_video_url(caption_file_path : str) -> str :
    meta_path = caption_file_path.replace(".txt", "_meta.json")
    with open(meta_path, "r", encoding = "utf-8") as f :
        meta = json.load(f)
    return meta["video_url"]
if __name__ == "__main__" :
    caption_file = get_latest_caption_file("raw_captions")
    print(f"using latest caption file : {caption_file}")

    video_url = load_video_url(caption_file)
    question = input("Ask any question : ")

    retriever = VideoRetriever()
    retriever.connect()
    retrieved_chunks = retriever.retrieve(query = question, video_url = video_url, top_k = 5)
    retriever.close()

    if not retrieved_chunks :
        print(f"no chunks found for this {video_url}, check that it matches what was stored")
    else :
        rag = RAGPipeline()
        answer = rag.generate_answer(question, retrieved_chunks)
        print("Question:", question)
        print("\nRetrieved chunks used :")
        for chunk in retrieved_chunks :
            print(f"[{chunk['start_time']:.1f}s] {chunk['text']}")
        print("\nAnswer", answer)