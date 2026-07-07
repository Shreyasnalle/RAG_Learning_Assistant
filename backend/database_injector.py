import os
from sentence_transformers import SentenceTransformer
import psycopg2
from pgvector.psycopg2 import register_vector
from typing import List, Dict
import json

class ChunkInjector :
    def __init__(self) :
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.conn = None
    def connect(self) :
        self.conn = psycopg2.connect (
            dname = "rag_assistant",
            user = "shreyas",
            password = "root123",
            host = "localhost"
        )
        register_vector(self.conn)
        print("connected to database")
    def store_video_chunks(self, video_url : str, segments : List[Dict]) :
        if not segments :
            print("No segments to store")
            return 
        with self.conn.cursor() as cur :
            cur.execute("DELETE FROM video_chunks WHERE video_id = %s", (video_url,))
            texts = [seg["text"] for seg in segments]
            embeddings = self.model.encode(texts).tolist()
        with self.conn.cursor() as curr :
            for i, seg in enumerate(segments) :
                cur.execute("""INSERT INTO video_chunks (video_id, chunk_index, chunk_text, start_time, end_time, embedding) VALUES (%s, %s, %s, %s, %s)""", (video_url, i, seg["text"], seg["start_time"], seg["end_time"], embeddings[i]))
        self.conn.commit()
        print(f"Stored {len(segments)} chunks for video : {video_url}")
    def close(self) :
        if self.conn :
            self.conn.close()
            print("Connection closed")
if __name__ == "__main__" :
    injector = ChunkInjector()
    injector.connect()
    injector.store_video_chunks(video_url, segments)
    injector.close()