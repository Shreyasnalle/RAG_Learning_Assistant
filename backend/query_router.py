from typing import Optional, List, Dict
from rag_pipeline import RAGPipeline
from summary_rag_pipeline import SummaryPipeline

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
    def handle_query(self, question : str, video_url : str, chunks : List[Dict], last_question : Optional[str] = None, last_answer : Optional[str] = None) :
        intent = classify_intent(question)
        if intent == "specific_summary" :
            answer = self.summary_pipeline.generate_video_summary(chunks)
            return {
                "type" : "answer",
                "answer" : answer
            }
        if intent == "vauge" :
            return {
                "type" : "needs_clarification",
                "options" : [
                    {"key" : "video", "label" : "Summary of this video"},
                    {"key" : "last_question", "label" : "Answer based on your last question"}
                ]
            }
        retriever_result = self._retrieve_chunks(question, video_url)
        answer = self.rag_pipeline.generate_answer(question, retriever_result)
        return {
            "type" : "answer",
            "answer" : answer
        }

    def resolve_clarification(self, choice_key : str, video_url : str, chunks : List[Dict], last_question : Optional[str] = None) -> Dict :
        if choice_key == "video" :
            answer = self.summary_pipeline.generate_video_summary(chunks)
            return {
                "type" : "answer",
                "answer" : answer
            }
        if choice_key == "last_question" :
            if not last_question :
                return {
                    "type" : "answer",
                    "answer" : "I don't have a previous question oto refer back to, thank you"
                }
            retriever_results = self._retrieve_chunks(last_question, video_url)
            answer = self.rag_pipeline.generate_answer(last_question, retriever_results)
            return {
                "type" : "answer",
                "answer" : answer
            }
        return {
            "type" : "answer",
            "answer" : "Sorry, I did'nt understand that choice, please reprompt properly"
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

    router = QueryRouter()

    # example 1 : normal question
    result = router.handle_query("which is the latest model launched by anthropic?", video_url, chunks)
    print("normal question result : ", result)

    # example 2 : summary request
    result = router.handle_query("summarize this video", video_url, chunks)
    print("secific summary result : ", result["answer"])

    #example 3 : a vauge request, ask for clarification
    result = router.handle_query("brief it", video_url, chunks)
    print("vauge request result : ", result)

    #example 4 resolving clarification user picks lat question
    if result["type"] == "needs_clarification" :
        resolved = router.resolve_clarification(
            "last_question",
            video_url,
            chunks,
            last_question = "which are the latest model of chatgpt?"
        )
        print("resolved answer : ", resolved)