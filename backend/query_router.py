from typing import Optional, List, Dict
from rag_pipeline import RAGPipeline
from summary_rag_pipeline import SummaryPipeline
from chat_history import ChatHistoryManager

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

class QueryRouter :
    def __init__(self) :
        self.rag_pipeline = RAGPipeline()
        self.summary_pipeline = SummaryPipeline()
        self.chat_history = ChatHistoryManager()
    def handle_query(self, question : str, video_url : str, chunks : List[Dict], user_id : str) -> Dict :
        self.chat_history.save_message(user_id, video_url, "user", question)
        intent = classify_intent(question)
        if intent == "specific_summary" :
            answer = self.summary_pipeline.generate_video_summary(chunks)
            return {
                "type" : "answer",
                "answer" : answer
            }
        if intent == "vague" :
            last_question = self.chat_history.get_last_user_question(user_id, video_url)
            if not last_question :
                answer = self.summary_pipeline.generate_video_summary(chunks)
                self.chat_history.save_message(user_id, video_url, "asistant", answer)
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
        self.chat_history.save_message(user_id, video_url, "assitant", answer)
        return {
            "type" : "answer",
            "answer" : answer
        }

    def resolve_clarification(self, choice_key : str, video_url : str, chunks : List[Dict], user_id : str) -> Dict :
        if choice_key == "video" :
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
                self.chat_history.save_message(user_id, video_url, "assitant", answer)
                return {
                    "type" : "answer",
                    "answer" : answer
                }
            retriever_results = self._retrieve_chunks(last_question, video_url)
            answer = self.rag_pipeline.generate_answer(last_question, retriever_results)
            self.chat_history.save_message(user_id, video_url, "assitant", answer)
            return {
                "type" : "answer",
                "answer" : answer
            }
        answer = "Sorry, I didn't understand that choice"
        self.chat_history.save_message(user_id, video_url, "assitant", answer)
        return {
            "type" : "answer",
            "answer" : answer
        }

    def _retrieve_chunks(self, question : str, video_url : str) -> List[Dict] :
        from retriever import VideoRetriever
        retriever = VideoRetriever()
        retriever.connect()
        results = retriever.retrieve(query = question, video_url = video_url, top_k = 5)
        retriever.close()
        return results

if __name__ == "__main__" :
    from file_utils import get_latest_caption_file
    from caption_parser import CaptionParser
    from chunk_merger import ChunkMerger
    import json

    caption_file = get_latest_caption_file("raw_captions")
    parser = CaptionParser()
    segments = parser.parse_raw_captions(caption_file)
    merger = ChunkMerger()
    chunks = merger.merge_segments(segments, target_duration = 45.0)

    meta_path = caption_file.replace(".txt", "_meta.json")
    with open(meta_path, "r", encoding = "utf-8") as f :
        video_url = json.load(f)["video_url"]
    
    test_user_id = "d9b7a76d-6a7f-42ed-ab90-fc250d2d6a53"

    router = QueryRouter()

    # first question, no history yet 
    result = router.handle_query("which is the latest model of anthropic?", video_url, chunks, test_user_id)
    print("First question result : ", result)

    # vauge question, should ask for clarification
    result = router.handle_query("brief it", video_url, chunks, test_user_id)
    print("Vauge follow up result : ", result)

    if result["type"] == "needs_clarification" :
        resolved = router.resolve_clarification("last_question", video_url, chunks, test_user_id)
        print("Resolved answer : ", resolved["answer"])
