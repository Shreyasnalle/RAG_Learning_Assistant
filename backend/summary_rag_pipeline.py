import os
from openai import OpenAI
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv("groq_api.env")


class SummaryPipeline:
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("GROQ_API_KEY"),
            base_url="https://api.groq.com/openai/v1",
            timeout=15.0
        )

    def _create_completion(self, messages: list, temperature: float = 0.5) -> str:
        models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"]
        last_error = None
        for m in models:
            try:
                response = self.client.chat.completions.create(
                    model=m,
                    messages=messages,
                    temperature=temperature
                )
                if response.choices and response.choices[0].message.content:
                    return response.choices[0].message.content
            except Exception as e:
                last_error = e
                if "rate_limit" in str(e).lower() or "429" in str(e) or "400" in str(e):
                    continue
                break
        return f"I apologize, but I encountered an issue or rate limit: {str(last_error)}"

    def group_chunks(self, chunks: List[Dict], group_size: int = 10) -> List[str]:
        groups = []
        for i in range(0, len(chunks), group_size):
            batch = chunks[i: i + group_size]
            batch_text = " ".join(seg["text"] for seg in batch)
            groups.append(batch_text)
        return groups

    def summarize_text(self, text: str) -> str:
        system_prompt = "You are a helpful teaching assistant. Summarize the following video transcript section clearly and concisely, keeping the key points a student would need to remmber"
        return self._create_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            temperature=0.5
        )

    def generate_video_summary(self, chunks: List[Dict], max_chars_per_prompt: int = 50000) -> str:
        if not chunks:
            return "No content available to summarize"

        formatted_lines = []
        for seg in chunks:
            text = seg.get("text", "").strip()
            if not text:
                continue
            start_sec = float(seg.get("start_time", 0))
            mins = int(start_sec // 60)
            secs = int(start_sec % 60)
            timestamp_str = f"[{mins:02d}:{secs:02d}]"
            formatted_lines.append(f"{timestamp_str} {text}")

        full_text = "\n".join(formatted_lines)

        system_prompt = (
            "You are a helpful, knowledgeable educational AI teaching assistant.\n"
            "Provide a comprehensive, well-structured, clear summary of this video transcript.\n\n"
            "Formatting Rules:\n"
            "- Start with a high-level 2-3 sentence overview of the entire video.\n"
            "- Use bold section headings (e.g. **### 1. Key Topic**) to organize the main chapters or topics discussed.\n"
            "- Use clean bullet points (`- `) for key points, takeaways, or steps.\n"
            "- Include timestamps in `[MM:SS]` format for major sections when helpful.\n"
            "- Keep the tone engaging, clear, and easy for students to understand."
        )

        try:
            if len(full_text) <= max_chars_per_prompt:
                return self._create_completion(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Video Transcript:\n\n{full_text}"}
                    ],
                    temperature=0.5
                )

            # For very long transcripts, split into 3-4 section blocks
            num_sections = min(4, max(2, len(full_text) // max_chars_per_prompt + 1))
            step = len(chunks) // num_sections
            section_summaries = []

            for i in range(num_sections):
                sub_chunks = chunks[i * step : (i + 1) * step] if i < num_sections - 1 else chunks[i * step :]
                sub_text = "\n".join(
                    f"[{int(float(c.get('start_time', 0))//60):02d}:{int(float(c.get('start_time', 0))%60):02d}] {c.get('text', '')}"
                    for c in sub_chunks
                )
                part_summary = self._create_completion(
                    messages=[
                        {"role": "system", "content": "Summarize this part of the video transcript concisely, focusing on key concepts and timestamps."},
                        {"role": "user", "content": sub_text}
                    ],
                    temperature=0.5
                )
                section_summaries.append(f"Section {i+1} Summary:\n{part_summary}")

            combined_summary = "\n\n".join(section_summaries)
            return self._create_completion(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Combine these section summaries into one cohesive, beautifully structured final video summary:\n\n{combined_summary}"}
                ],
                temperature=0.5
            )
        except Exception as e:
            return f"I encountered an error while generating the summary: {str(e)}"