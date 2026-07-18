import os
import psycopg2 
from dotenv import load_dotenv
load_dotenv("supabase_key.env")
def get_db_connection() :
    db_url = os.getenv("SUPABASE_DB_URL")
    if not db_url :
        raise ValueError(
            "supabase db url not found"
        )
    try :
        conn = psycopg2.connect(db_url)
        print(f"connection of the pgvector to the supabase done")
        return conn
    except Exception as e :
        print(f"could not connect to the supabase")
        raise e 
if __name__ == "__main__":
    get_db_connection()