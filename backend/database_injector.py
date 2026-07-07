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
    