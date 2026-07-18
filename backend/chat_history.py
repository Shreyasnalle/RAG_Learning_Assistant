import os
import uuid
from supabase import create_client, Client 
from dotenv import load_dotenv
from typing import List, Dict, Optional, cast
load_dotenv("supabase_key.env")
class ChatHistoryManager :
    def __init__(self) :
        supabase_url = os.getenv("SUPABASE_URL")
        service_role_key = os.getenv("SUPABASE_SERVICE_KEY")
        if not supabase_url or not service_role_key :
            raise RuntimeError("missing supabase url make sure correct supabase url is used")
        self.client : Client = create_client(supabase_url, service_role_key)
    def save_message(self, user_id : str, video_url : str, role : str, message : str) -> dict :
        if role not in ("user", "assistant") :
            return {
                "success" : False,
                "error" : "role must be 'user' or 'assistant'"
            }
        try :
            self.client.table("chat_history").insert({
                "user_id" : user_id,
                "video_url" : video_url,
                "role" : role,
                "message" : message
            }).execute()
            return {"success": True}
        except Exception as e :
            return {
                "success" : False,
                "error" : str(e)
            }
    def get_chat_history(self, user_id : str, video_url : str, limit : int = 50) -> List:
        response = (
            self.client.table("chat_history")
            .select("role, message")
            .eq("user_id", user_id)
            .eq("video_url", video_url)
            .order("created_at", desc = True)
            .limit(limit)
            .execute()
        )
        messages = response.data or []
        messages.reverse()
        return messages 
    def get_last_user_question(self, user_id : str, video_url : str) -> str | None :
        response = (
            self.client.table("chat_history")
            .select("message")
            .eq("user_id", user_id)
            .eq("video_url", video_url)
            .eq("role", "user")
            .order("created_at", desc = True)
            .limit(1)
            .execute()
        )
        if response.data :
            return cast(dict, response.data[0])["message"]
        return None
if __name__ == "__main__" :
    chat = ChatHistoryManager()
    test_user_id = "d9b7a76d-6a7f-42ed-ab90-fc250d2d6a53"
    test_video_url = "https://www.youtube.com/watch?v=example"
    r1 = chat.save_message(test_user_id, test_video_url, "user", "what is machine learning pipeline?")
    print("save 1 :", r1)
    r2 = chat.save_message(test_user_id, test_video_url, "assistant", "A machine learning pipeline is ....")
    print("save 2 :", r2)
    r3 = chat.save_message(test_user_id, test_video_url, "user", "brief it")
    print("save 3 :", r3)
    history = chat.get_chat_history(test_user_id, test_video_url)
    print("\nchat history :")
    for msg in history :
        print(f"[{msg['role']}] {msg['message']}")
    last_q = chat.get_last_user_question(test_user_id, test_video_url)
    print("\nLast user question :", last_q)