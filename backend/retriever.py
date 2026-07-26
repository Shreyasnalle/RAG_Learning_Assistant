from pgvector.psycopg2 import register_vector
from hf_embed import get_embeddings
from typing import List, Dict
from db_utils import get_db_connection


class VideoRetriever:
    def __init__(self):
        self.conn = None

    def connect(self):
        self.conn = get_db_connection()
        register_vector(self.conn)

    def retrieve(self, query: str, video_url: str, top_k: int = 5) -> List[Dict]:
        if not self.conn:
            raise RuntimeError("not connected to the database, make sure to call connect() first")
        query_embedding = get_embeddings(query)
        with self.conn.cursor() as cur:
            cur.execute("""SELECT chunk_text, start_time, end_time, 1 - (embedding <=> %s::vector) as similarity FROM video_chunks WHERE video_id = %s ORDER BY embedding <=> %s::vector LIMIT %s""", (query_embedding, video_url, query_embedding, top_k))
            results = cur.fetchall()
        retrieved = []
        for row in results:
            retrieved.append({
                "text": row[0],
                "start_time": row[1],
                "end_time": row[2],
                "similarity": row[3]
            })
        return retrieved

    def close(self):
        if self.conn:
            self.conn.close()