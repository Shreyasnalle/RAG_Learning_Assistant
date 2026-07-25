import os
import time
import psycopg2
from dotenv import load_dotenv

load_dotenv("supabase_key.env")


def get_db_connection(max_retries: int = 3, retry_delay: float = 0.5):
    db_url = os.getenv("SUPABASE_DB_URL")
    if not db_url:
        raise ValueError("supabase db url not found")
    last_exception = None
    for attempt in range(max_retries):
        try:
            return psycopg2.connect(db_url)
        except Exception as e:
            last_exception = e
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
    raise last_exception if last_exception is not None else RuntimeError("get_db_connection failed: max_retries exhausted")