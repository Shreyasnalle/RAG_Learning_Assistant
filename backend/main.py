from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid
import re

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
    allow_origins=[
        "https://simply-rouge.vercel.app",
        "https://www.youtube.com",
        "https://youtube.com",
        "http://localhost:5173"
    ],
    allow_origin_regex = r"^chrome-extension://.*$",
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
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials.strip() if credentials and credentials.credentials else ""
    if not token or token.lower() in ("undefined", "null", "none"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_response = auth_manager.client.auth.get_user(token)
        if user_response and user_response.user:
            return user_response.user.id
    except Exception:
        pass

    try:
        user_response = auth_manager.admin_client.auth.get_user(token)
        if user_response and user_response.user:
            return user_response.user.id
    except Exception:
        pass

    extracted_user_id = None
    try:
        import base64, json
        parts = token.split(".")
        if len(parts) == 3:
            payload_b64 = parts[1] + "=" * (-len(parts[1]) % 4)
            payload_bytes = base64.urlsafe_b64decode(payload_b64)
            payload = json.loads(payload_bytes.decode("utf-8"))
            extracted_user_id = payload.get("sub")
    except Exception:
        pass

    target_id = str(extracted_user_id) if extracted_user_id else (token if re.match(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$", token) else None)

    if target_id:
        try:
            user_res = auth_manager.admin_client.auth.admin.get_user_by_id(target_id)
            if user_res and user_res.user:
                return user_res.user.id
        except Exception:
            pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or user does not exist",
        headers={"WWW-Authenticate": "Bearer"},
    )


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


class SendOTPData(BaseModel):
    email: str


class VerifyOTPData(BaseModel):
    email: str
    otp: str
    new_password: str


class ChatHistoryData(BaseModel):
    user_id: str
    video_url: str


class IngestData(BaseModel):
    video_url: str
    file_id: str


class AskData(BaseModel):
    question: str
    video_url: str


class ClarificationData(BaseModel):
    choice_key: str
    video_url: str


def normalize_youtube_url(url: str) -> str:
    if not url:
        return ""
    match = re.search(r"[?&]v=([^&]+)", url)
    if match:
        return f"https://www.youtube.com/watch?v={match.group(1)}"
    return url


@app.post("/api/captions")
def receive_captions(data: CaptionData):
    clean_url = normalize_youtube_url(data.videourl)

    if len(data.rawtext) < 100:
        return {"status": "skipped", "reason": "payload too small"}

    match = re.search(r"[?&]v=([^&]+)", clean_url)
    video_id = match.group(1) if match else str(uuid.uuid4())

    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM video_chunks WHERE video_id = %s", (clean_url,))
            count = cur.fetchone()[0]
        conn.close()
        if count > 0:
            return {
                "status": "success",
                "video_id": video_id,
                "video_url": clean_url,
                "already_ingested": True,
                "chunks_stored": count
            }
    except Exception:
        pass

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

    return {
        "status": "success",
        "video_id": video_id,
        "video_url": clean_url,
        "chunks_stored": len(chunks)
    }


@app.post("/api/signup")
def signup(data: SignUpData):
    return auth_manager.sign_up(
        email=data.email,
        password=data.password,
        name=data.name,
        mobile_number=data.mobile_number
    )


@app.post("/api/login")
def login(data: SignInData):
    return auth_manager.sign_in(email=data.email, password=data.password)


@app.post("/api/user-profile")
def get_user_profile(data: ProfileData):
    return auth_manager.get_profile(user_id=data.user_id)


@app.post("/api/change-password")
def change_password(data: ChangePasswordData):
    return auth_manager.change_password(
        user_id=data.user_id,
        old_password=data.old_password,
        new_password=data.new_password
    )


@app.post("/api/delete-account")
def delete_account(data: DeleteAccountData):
    return auth_manager.delete_account(user_id=data.user_id)


@app.post("/api/send-otp")
def send_otp(data: SendOTPData):
    return auth_manager.send_otp(email=data.email)


@app.post("/api/verify-otp-reset")
def verify_otp_reset(data: VerifyOTPData):
    return auth_manager.verify_otp_reset_password(
        email=data.email,
        otp=data.otp,
        new_password=data.new_password
    )


@app.post("/api/ingest")
def ingest_video(data: IngestData):
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
    except Exception:
        return {"success": True, "already_ingested": True, "video_url": clean_url}


@app.post("/api/ask")
def ask_question(data: AskData, user_id: str = Depends(get_current_user)):
    clean_url = normalize_youtube_url(data.video_url)
    return query_router.handle_query(
        question=data.question,
        video_url=clean_url,
        user_id=user_id
    )


@app.post("/api/resolve-clarification")
def resolve_clarification(data: ClarificationData, user_id: str = Depends(get_current_user)):
    clean_url = normalize_youtube_url(data.video_url)
    return query_router.resolve_clarification(
        choice_key=data.choice_key,
        video_url=clean_url,
        user_id=user_id
    )


@app.post("/api/chat-history")
def get_chat_history_endpoint(data: ChatHistoryData, request: Request):
    clean_url = normalize_youtube_url(data.video_url)
    user_id = data.user_id.strip() if data.user_id else ""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
        try:
            user_id = get_current_user(HTTPAuthorizationCredentials(scheme="Bearer", credentials=token))
        except Exception:
            pass

    if user_id:
        try:
            user_res = auth_manager.admin_client.auth.admin.get_user_by_id(user_id)
            if not user_res or not user_res.user:
                user_id = ""
        except Exception:
            user_id = ""

    messages = chat_history_manager.get_chat_history(user_id=user_id, video_url=clean_url) if user_id else []
    return {
        "success": True,
        "video_url": clean_url,
        "messages": messages
    }


@app.get("/")
def root():
    return {"message": "backend is running"}