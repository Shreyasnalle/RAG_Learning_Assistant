from hf_embed import get_embeddings
from pgvector.psycopg2 import register_vector
from typing import List, Dict
from db_utils import get_db_connection


class ChunkInjector:
    def __init__(self):
        self.conn = None

    def connect(self):
        self.conn = get_db_connection()
        register_vector(self.conn)

    def store_video_chunks(self, video_url: str, segments: List[Dict]):
        if self.conn is None:
            raise RuntimeError("database not connected, Call connect() before storing chunks")
        if not segments:
            return
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM video_chunks WHERE video_id = %s", (video_url,))
        texts = [seg["text"] for seg in segments]
        embeddings = get_embeddings(texts)
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

    def close(self):
        if self.conn:
            self.conn.close()