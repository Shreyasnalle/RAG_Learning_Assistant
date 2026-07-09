import os
from openai import OpenAI 
from typing import List, Dict
class RAGPipeline :
    def __init__(self) :
        self.client = OpenAI(
            api_key = os.getenv(""),
            base_url = ""
        )
    def generate_anaswer(self, question : str, retrieved : list) -> str :
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
        return response.choices[0].message.content