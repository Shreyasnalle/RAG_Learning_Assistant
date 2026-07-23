import os
import psycopg2 
from dotenv import load_dotenv
load_dotenv("supabase_key.env")
import time

def get_db_connection(max_retries: int = 3, retry_delay: float = 0.5) :
    db_url = os.getenv("SUPABASE_DB_URL")
    if not db_url :
        raise ValueError("supabase db url not found")
    last_exception = None
    for attempt in range(max_retries) :
        try :
            conn = psycopg2.connect(db_url)
            print("connection of the pgvector to the supabase done")
            return conn
        except Exception as e :
            last_exception = e
            print(f"could not connect to the supabase (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1 :
                time.sleep(retry_delay)
    raise last_exception if last_exception is not None else RuntimeError("get_db_connection failed: max_retries exhausted")
if __name__ == "__main__":
    get_db_connection()