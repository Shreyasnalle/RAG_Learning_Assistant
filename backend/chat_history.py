import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import List, Optional, cast

load_dotenv("supabase_key.env")
load_dotenv()

class ChatHistoryManager:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        service_role_key = os.getenv("SUPABASE_SERVICE_KEY")
        if not supabase_url or not service_role_key:
            raise RuntimeError("missing supabase url make sure correct supabase url is used")
        self.client: Client = create_client(supabase_url, service_role_key)

    def save_message(self, user_id: str, video_url: str, role: str, message: str) -> dict:
        if role not in ("user", "assistant"):
            return {
                "success": False,
                "error": "role must be 'user' or 'assistant'"
            }
        try:
            self.client.table("chat_history").insert({
                "user_id": user_id,
                "video_url": video_url,
                "role": role,
                "message": message
            }).execute()
            print(f"[ChatHistory] Successfully saved message for user {user_id} on {video_url}")
            return {"success": True}
        except Exception as e:
            print(f"[ChatHistory] ERROR saving message: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def get_chat_history(self, user_id: str, video_url: str, limit: int = 50) -> List:
        try:
            response = (
                self.client.table("chat_history")
                .select("role, message")
                .eq("user_id", user_id)
                .eq("video_url", video_url)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            messages = response.data or []
            messages.reverse()
            print(f"[ChatHistory] Retrieved {len(messages)} messages for user {user_id} on {video_url}")
            return messages
        except Exception as e:
            print(f"[ChatHistory] ERROR retrieving messages: {e}")
            return []

    def get_last_user_question(self, user_id: str, video_url: str) -> Optional[str]:
        response = (
            self.client.table("chat_history")
            .select("message")
            .eq("user_id", user_id)
            .eq("video_url", video_url)
            .eq("role", "user")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if response.data:
            return cast(dict, response.data[0])["message"]
        return None