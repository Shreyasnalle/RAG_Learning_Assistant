import os
from sentence_transformers import SentenceTransformer
import psycopg2
from pgvector.psycopg2 import register_vector
from typing import List, Dict
from caption_parser import CaptionParser
from chunk_merger import ChunkMerger
from file_utils import get_latest_caption_file
import json
class ChunkInjector:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.conn = None
    def connect(self):
        self.conn = psycopg2.connect(
            dbname="rag_assistant",
            user="shreyas",
            password="root123",
            host="localhost"
        )
        register_vector(self.conn)
        print("connected to database")
    def store_video_chunks(self, video_url: str, segments: List[Dict]):
        if self.conn is None:
            raise RuntimeError("database not connected, Call connect() before storing chunks")
        if not segments:
            print("No segments to store")
            return
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM video_chunks WHERE video_id = %s", (video_url,))
        texts = [seg["text"] for seg in segments]
        embeddings = self.model.encode(texts).tolist()
        with self.conn.cursor() as cur:
            for i, seg in enumerate(segments):
                cur.execute("""
                    INSERT INTO video_chunks 
                    (video_id, chunk_index, chunk_text, start_time, end_time, embedding)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    video_url,
                    i,
                    seg["text"],
                    seg["start_time"],
                    seg["end_time"],
                    embeddings[i]
                ))
        self.conn.commit()
        print(f"Stored {len(segments)} chunks for video: {video_url}")
    def close(self):
        if self.conn:
            self.conn.close()
            print("Connection closed")
def load_video_url(caption_file_path : str) -> str :
    meta_path = caption_file_path.replace(".txt", "_meta.json")
    with open(meta_path, "r", encoding = "utf8") as f :
        meta = json.load(f)
    return meta["video_url"]
if __name__ == "__main__":
    caption_file = get_latest_caption_file("raw_captions")
    print(f"using the latest caption file : {caption_file}")
    
    parser = CaptionParser()
    segments = parser.parse_raw_captions(caption_file)
    print(f"Parsed {len(segments)} raw segments")
    
    merger = ChunkMerger()
    chunks = merger.merge_segments(segments, target_duration = 45.0)
    print(f"Merged into {len(chunks)} chunks")

    video_url = load_video_url(caption_file)
    injector = ChunkInjector()
    injector.connect()
    injector.store_video_chunks(video_url, chunks)
    injector.close()