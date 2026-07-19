from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid
import os
import re
import json

from auth import AuthManager
from query_router import QueryRouter
from caption_parser import CaptionParser
from chunk_merger import ChunkMerger
from database_injector import ChunkInjector

app = FastAPI(title="Simply backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.youtube.com", "https://youtube.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PrivateNetworkMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["Access-Control-Allow-Private-Network"] = "true"
        return response


app.add_middleware(PrivateNetworkMiddleware)

auth_manager = AuthManager()
query_router = QueryRouter()


class CaptionData(BaseModel):
    videourl: str
    trackurl: Optional[str] = None
    rawtext: str


class SignUpData(BaseModel):
    email: str
    password: str
    name: str
    mobile_number: Optional[str] = None


class SignInData(BaseModel):
    email: str
    password: str


class IngestData(BaseModel):
    video_url: str
    file_id: str


class AskData(BaseModel):
    question: str
    video_url: str
    user_id: str


class ClarificationData(BaseModel):
    choice_key: str
    video_url: str
    user_id: str


@app.post("/api/captions")
async def receive_captions(data: CaptionData):
    print(f"Received captions for: {data.videourl[:70]}...")

    if len(data.rawtext) < 5000:
        print(f"Skipping — payload too small ({len(data.rawtext)} chars), likely a partial caption")
        return {"status": "skipped", "reason": "payload too small"}

    match = re.search(r"[?&]v=([^&]+)", data.videourl)
    video_id = match.group(1) if match else str(uuid.uuid4())

    os.makedirs("raw_captions", exist_ok=True)
    file_path = f"raw_captions/{video_id}.txt"
    meta_path = f"raw_captions/{video_id}_meta.json"

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(data.rawtext)
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump({
            "video_url": data.videourl,
            "track_url": data.trackurl
        }, f)

    print(f"Saved to: {file_path}")
    return {
        "status": "success",
        "video_id": video_id,
        "video_url": data.videourl
    }


@app.post("/api/signup")
async def signup(data: SignUpData):
    result = auth_manager.sign_up(
        email=data.email,
        password=data.password,
        name=data.name,
        mobile_number=data.mobile_number
    )
    return result


@app.post("/api/login")
async def login(data: SignInData):
    result = auth_manager.sign_in(email=data.email, password=data.password)
    return result


@app.post("/api/ingest")
async def ingest_video(data: IngestData):
    caption_file = f"raw_captions/{data.file_id}.txt"
    if not os.path.exists(caption_file):
        return {"success": False, "error": "Caption file not found for this file_id"}
    parser = CaptionParser()
    segments = parser.parse_raw_captions(caption_file)
    
    merger = ChunkMerger()
    chunks = merger.merge_segments(segments, target_duration=45.0)

    injector = ChunkInjector()
    injector.connect()
    injector.store_video_chunks(data.video_url, chunks)
    injector.close()

    return {
        "success": True,
        "chunks_stored": len(chunks),
        "video_url": data.video_url
    }


@app.post("/api/ask")
async def ask_question(data: AskData):
    result = query_router.handle_query(
        question=data.question,
        video_url=data.video_url,
        user_id=data.user_id
    )
    return result


@app.post("/api/resolve-clarification")
async def resolve_clarification(data: ClarificationData):
    result = query_router.resolve_clarification(
        choice_key=data.choice_key,
        video_url=data.video_url,
        user_id=data.user_id
    )
    return result


@app.get("/")
async def root():
    return {"message": "backend is running"}