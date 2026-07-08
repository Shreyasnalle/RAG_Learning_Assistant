from sentence_transformers.util import similarity
import psycopg2
import psycopg2
from pgvector.psycopg2 import register_vector
from sentence_transformers import SentenceTransformer
from typing import List, Dict
import json
import os
class VideoRetriever :
    def __init__(self) :
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.conn = None
    def connect(self) :
        self.conn = psycopg2.connect(
            dbname = "rag_assistant",
            user = "shreyas",
            password = "root123",
            host = "localhost"
        )
        register_vector(self.conn)
        print("Connected to database for retrieval")
    def retrieve(self, query : str, video_url : str, top_k : int = 5) -> List[Dict] :
        if not self.conn :
            raise RuntimeError("not connected to the database, make sure to call connect() first")
        query_embedding = self.model.encode(query).tolist()
        with self.conn.cursor() as cur :
            cur.execute ("""SELECT chunk_text, start_time, end_time, 1 - (embedding <=> %s::vector) as similarity FROM video_chunks WHERE video_id = %s ORDER BY embedding <=> %s::vector LIMIT %s""", (query_embedding, video_url, query_embedding, top_k))
            results = cur.fetchall()
        retrieved = []
        for row in results :
            retrieved.append({
                "text" : row[0],
                "start_time" : row[1],
                "end_time" : row[2],
                "similarity" : row[3]
            })
        return retrieved
    def close(self) :
        if self.conn :
            self.conn.close()
            print("connection closed")
if __name__ == "__main__" :
    import json
    caption_file = "/home/shreyas-nalle/Desktop/RAG_teaching_assistant/backend/raw_captions/e01010fd-134e-4b89-8634-629fba4da689.txt"
    meta_path = caption_file.replace(".txt", "_meta.json")
    with open(meta_path, "r", encoding = "utf8") as f :
        meta = json.load(f)
    video_url = meta["video_url"]
    retriever = VideoRetriever()
    retriever.connect()
    results = retriever.retrieve(
        query = "what is machine learning pipeline?",
        video_url = video_url,
        top_k = 5
    )
    if not results :
        print("not the appropiate question for this video found")
    else :
        for r in results :
            print(f"[{r['start_time']:.1f}s] {r['text']}... (similarity: {r['similarity']:.3f})")
    retriever.close()