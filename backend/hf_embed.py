import os
import requests
from dotenv import load_dotenv

load_dotenv("supabase_key.env")
load_dotenv()

HF_API_KEY = os.getenv("HUGGING_FACE")
API_URL = "https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5"
headers = {"Authorization": f"Bearer {HF_API_KEY}"}

def get_embeddings(texts):
    response = requests.post(API_URL, headers=headers, json={"inputs": texts, "options": {"wait_for_model": True}})
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"HuggingFace API request failed with status code {response.status_code}: {response.text}")
