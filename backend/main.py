from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid
import os
import re
import json
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.cors import CORSMiddleware

from auth import AuthManager
from query_router import QueryRouter
from caption_parser import CaptionParser
from chunk_merger import ChunkMerger
from database_injector import ChunkInjector

app = FastAPI(title = "backend to grab captions")
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["https://www.youtube.com", "https://youtube.com"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)
auth_manager = AuthManager()
query_router = QueryRouter()

class CaptionData(BaseModel) :
    videourl : str
    trackurl : Optional[str] = None
    rawtext : str
class SIgnUpData(BaseModel) :
    email : str
    password : str
    name : str
    mobile_number : Optional[str] = None
class SIgnInData(BaseModel) :
    email : str
    password : str
class IngestData(BaseModel) :
    video_url : str
    file_id = str
class PrivateNetworkMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["Access-Control-Allow-Private-Network"] = "true"
        return response
app.add_middleware(PrivateNetworkMiddleware)
class CaptionData(BaseModel):
    videourl: str
    trackurl: Optional[str] = None
    rawtext: str
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
    print(f"Saved metadata to : {meta_path}")
    print(f"Size: {len(data.rawtext)} characters")
    return {
        "status": "success",
        "message": "captions received and saved successfully",
        "video_id": video_id,
        "video_url": data.videourl
    }
@app.get("/")
async def root():
    return {
        "message": "backend is running"
    }