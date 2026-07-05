from pickle import TRUE
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import uuid
import os
from datetime import datetime
app = FastAPI(title = "backend to grab captions")
class CaptionData(BaseModel) :
    videourl : str
    trackurl : Optional[str] = None
    rawtext : str
@app.post("/api/captions")
async def receive_captions(data : CaptionData) :
    print(f"received the captions for {data.videourl["70"]}...")
    os.makedirs("raw_captions", exist_ok = TRUE)
    file_id = str(uuid.uuid4())
    file_path = f"raw_captions/{file_id}.txt"
    with open(file_path, "w", encoding = "utf-8") as f :
        f.write(data.rawtext)
    print(f"Saved to : {file_path}")
    print(f"Size : {len(data.rawtext)} characters")
    return {
        "status" : "success",
        "message" : "captions recieved and saved successfully",
        "file_id" : file_id,
        "video_url" : data.videourl
    }
@app.get("/")
async def root() :
    return {
        "message" : "backend is running"
    }