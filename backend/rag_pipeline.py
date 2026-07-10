import os
from openai import OpenAI 
from typing import List, Dict
from retriever import VideoRetriever
import json
from dotenv import load_dotenv
load_dotenv("groq_api.env")
class RAGPipeline :
    def __init__(self) :
        self.client = OpenAI(
            api_key = os.getenv("GROQ_API_KEY"),
            base_url = "https://api.groq.com/openai/v1"
        )
    def generate_answer(self, question : str, retrieved : list) -> str :
        if not retrieved :
            return "I don't have relevant information from this video to answer this question"
        context = []
        for chunk in retrieved :
            context.append(f"{chunk['start_time']:.1f}s : {chunk['text']}")
        system_prompt = "You are a helpful and knowledgeable teaching assistant. Answer the student's question using only the video content provided below. If the video content does not contain enough information to answer, say so clearly before giving a brief general expression. When relevant, mention the approximate timepstamp where the topic was covered. Be clear, educational and encouraging in tone."
        user_prompt = f"Video content {context} Student Question : {question}"
        response = self.client.chat.completions.create(
            model = "llama-3.3-70b-versatile",
            messages = [
                {"role" : "system", "content" : system_prompt},
                {"role" : "user", "content" : user_prompt}
            ],
            temperature = 0.7
        )
        return response.choices[0].message.content or ""
def load_video_url(caption_file_path : str) -> str :
    meta_path = caption_file_path.replace(".txt", "_meta.json")
    with open(meta_path, "r", encoding = "utf-8") as f :
        meta = json.load(f)
    return meta["video_url"]
if __name__ == "__main__" :
    caption_file = "/home/shreyas-nalle/Desktop/RAG_teaching_assistant/backend/raw_captions/3738ac0e-de84-425a-8e92-5df7db97dc68.txt"
    video_url = load_video_url(caption_file)
    question = "what will the winners get?"
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
