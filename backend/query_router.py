from typing import Optional, List, Dict
from rag_pipeline import RAGPipeline
from summary_rag_pipeline import SummaryPipeline
from chat_history import ChatHistoryManager
from db_utils import get_db_connection 

specific_video_words = ["video", "whole video", "entire video", "full video", "full lecture", "complete video", "complete lecture", "lecture"]
summary_trigger_words = ["summarize", "summary", "brief", "intro"] 

def classify_intent(question : str) -> str :
    lower_question = question.lower()
    contains_summary_word = any(word in lower_question for word in summary_trigger_words)
    if not contains_summary_word :
        return "normal"
    contains_sepcific_video_word = any(word in lower_question for word in specific_video_words)
    if contains_sepcific_video_word :
        return "specific_summary"
    return "vague"

def get_stored_chunks(video_url : str) -> List[Dict] :
    conn = get_db_connection()
    try :
        with conn.cursor() as cur :
            cur.execute("SELECT chunk_text, start_time, end_time FROM video_chunks WHERE video_id = %s ORDER BY chunk_index", (video_url,))
            rows = cur.fetchall()
        return [
            {
                "text" : row[0],
                "start_time" : row[1],
                "end_time" : row[2]
            }
            for row in rows
        ]
    finally :
        conn.close()

class QueryRouter :
    def __init__(self) :
        self.rag_pipeline = RAGPipeline()
        self.summary_pipeline = SummaryPipeline()
        self.chat_history = ChatHistoryManager()
    def handle_query(self, question : str, video_url : str, user_id : str) -> Dict :
        self.chat_history.save_message(user_id, video_url, "user", question)
        intent = classify_intent(question)
        if intent == "specific_summary" :
            chunks = get_stored_chunks(video_url)
            answer = self.summary_pipeline.generate_video_summary(chunks)
            self.chat_history.save_message(user_id, video_url, "assistant", answer)
            return {
                "type" : "answer",
                "answer" : answer
            }
        if intent == "vague" :
            last_question = self.chat_history.get_last_user_question(user_id, video_url)
            if not last_question :
                chunks = get_stored_chunks(video_url)
                answer = self.summary_pipeline.generate_video_summary(chunks)
                self.chat_history.save_message(user_id, video_url, "assistant", answer)
                return {
                    "type" : "answer",
                    "answer" : answer
                }
            return {
                "type" : "needs_clarification",
                "options" : [
                    {"key" : "video", "label" : "Summary of this video"},
                    {"key" : "last_question", "label" : "Answer based on your last question"}
                ]
            }
        retriever_result = self._retrieve_chunks(question, video_url)
        answer = self.rag_pipeline.generate_answer(question, retriever_result)
        self.chat_history.save_message(user_id, video_url, "assistant", answer)
        return {
            "type" : "answer",
            "answer" : answer
        }

    def resolve_clarification(self, choice_key : str, video_url : str, user_id : str) -> Dict :
        if choice_key == "video" :
            chunks = get_stored_chunks(video_url)
            answer = self.summary_pipeline.generate_video_summary(chunks)
            self.chat_history.save_message(user_id, video_url, "assistant", answer)
            return {
                "type" : "answer",
                "answer" : answer
            }
        if choice_key == "last_question" :
            last_question = self.chat_history.get_last_user_question(user_id, video_url)
            if not last_question :
                answer = "I dont have a previous question to refer back to"
                self.chat_history.save_message(user_id, video_url, "assistant", answer)
                return {
                    "type" : "answer",
                    "answer" : answer
                }
            retriever_results = self._retrieve_chunks(last_question, video_url)
            answer = self.rag_pipeline.generate_answer(last_question, retriever_results)
            self.chat_history.save_message(user_id, video_url, "assistant", answer)
            return {
                "type" : "answer",
                "answer" : answer
            }
        answer = "Sorry, I didn't understand that choice"
        self.chat_history.save_message(user_id, video_url, "assistant", answer)
        return {
            "type" : "answer",
            "answer" : answer
        }

    def _retrieve_chunks(self, question : str, video_url : str) -> List[Dict] :
        from retriever import VideoRetriever
        retriever = VideoRetriever()
        try :
            retriever.connect()
            results = retriever.retrieve(query = question, video_url = video_url, top_k = 5)
            return results
        finally :
            retriever.close()