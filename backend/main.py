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
from chat_history import ChatHistoryManager
from caption_parser import CaptionParser
from chunk_merger import ChunkMerger
from database_injector import ChunkInjector
from db_utils import get_db_connection

app = FastAPI(title="Simply backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.youtube.com", "https://youtube.com", "http://localhost:5173"],
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
chat_history_manager = ChatHistoryManager()


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


class ProfileData(BaseModel):
    user_id: str


class ChangePasswordData(BaseModel):
    user_id: str
    old_password: str
    new_password: str


class DeleteAccountData(BaseModel):
    user_id: str


class ChatHistoryData(BaseModel):
    user_id: str
    video_url: str


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


def normalize_youtube_url(url: str) -> str:
    if not url:
        return ""
    match = re.search(r"[?&]v=([^&]+)", url)
    if match:
        return f"https://www.youtube.com/watch?v={match.group(1)}"
    return url


@app.post("/api/captions")
async def receive_captions(data: CaptionData):
    clean_url = normalize_youtube_url(data.videourl)
    print(f"Received captions for: {clean_url[:70]}...")

    if len(data.rawtext) < 100:
        print(f"Skipping — payload too small ({len(data.rawtext)} chars), likely invalid caption")
        return {"status": "skipped", "reason": "payload too small"}

    match = re.search(r"[?&]v=([^&]+)", clean_url)
    video_id = match.group(1) if match else str(uuid.uuid4())

    # Check if already ingested in database
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM video_chunks WHERE video_id = %s", (clean_url,))
            count = cur.fetchone()[0]
        conn.close()
        if count > 0:
            print(f"Video already in DB ({count} chunks): {clean_url}")
            return {
                "status": "success",
                "video_id": video_id,
                "video_url": clean_url,
                "already_ingested": True,
                "chunks_stored": count
            }
    except Exception as e:
        print(f"Check existing chunks warning: {e}")

    # Parse and chunk in-memory directly
    parser = CaptionParser()
    segments = parser.parse_raw_text(data.rawtext)

    if not segments:
        return {"status": "error", "reason": "Failed to parse caption segments"}

    merger = ChunkMerger()
    chunks = merger.merge_segments(segments, target_duration=45.0)

    injector = ChunkInjector()
    try:
        injector.connect()
        injector.store_video_chunks(clean_url, chunks)
    finally:
        injector.close()

    print(f"Directly ingested {len(chunks)} chunks into DB for: {clean_url}")
    return {
        "status": "success",
        "video_id": video_id,
        "video_url": clean_url,
        "chunks_stored": len(chunks)
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


@app.post("/api/user-profile")
async def get_user_profile(data: ProfileData):
    result = auth_manager.get_profile(user_id=data.user_id)
    return result


@app.post("/api/change-password")
async def change_password(data: ChangePasswordData):
    result = auth_manager.change_password(
        user_id=data.user_id,
        old_password=data.old_password,
        new_password=data.new_password
    )
    return result


@app.post("/api/delete-account")
async def delete_account(data: DeleteAccountData):
    result = auth_manager.delete_account(user_id=data.user_id)
    return result


@app.post("/api/ingest")
async def ingest_video(data: IngestData):
    clean_url = normalize_youtube_url(data.video_url)
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM video_chunks WHERE video_id = %s", (clean_url,))
            count = cur.fetchone()[0]
        conn.close()
        return {
            "success": True,
            "already_ingested": True,
            "chunks_stored": count,
            "video_url": clean_url
        }
    except Exception as e:
        return {"success": True, "already_ingested": True, "video_url": clean_url}


@app.post("/api/ask")
async def ask_question(data: AskData):
    clean_url = normalize_youtube_url(data.video_url)
    result = query_router.handle_query(
        question=data.question,
        video_url=clean_url,
        user_id=data.user_id
    )
    return result


@app.post("/api/resolve-clarification")
async def resolve_clarification(data: ClarificationData):
    clean_url = normalize_youtube_url(data.video_url)
    result = query_router.resolve_clarification(
        choice_key=data.choice_key,
        video_url=clean_url,
        user_id=data.user_id
    )
    return result


@app.post("/api/chat-history")
async def get_chat_history_endpoint(data: ChatHistoryData):
    clean_url = normalize_youtube_url(data.video_url)
    messages = chat_history_manager.get_chat_history(user_id=data.user_id, video_url=clean_url)
    return {
        "success": True,
        "video_url": clean_url,
        "messages": messages
    }


@app.get("/")
async def root():
    return {"message": "backend is running"}