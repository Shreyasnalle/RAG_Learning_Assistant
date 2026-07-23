import os
from supabase import create_client, Client
from dotenv import load_dotenv
load_dotenv("supabase_key.env")
class AuthManager :
    def __init__(self) :
        supabase_url = os.getenv("SUPABASE_URL")
        anon_key = os.getenv("SUPABASE_ANON_KEY")
        service_role_key = os.getenv("SUPABASE_SERVICE_KEY")
        if not supabase_url or not anon_key or not service_role_key :
            raise RuntimeError("Missing Supabase keys, check if correct supabase keys are used")
        self.client : Client = create_client(supabase_url, anon_key)
        self.admin_client : Client = create_client(supabase_url, service_role_key)
    def sign_up(self, email : str, password : str, name : str, mobile_number : str) -> dict :
        try :
            auth_response = self.client.auth.sign_up({
                "email" : email,
                "password" : password
            })
        except Exception as e :
            return {
                "success" : False,
                "error" : str(e)
            }
        if not auth_response.user :
            return {
                "success" : False,
                "error" : "sign up failed and new no user was created"
            }
        user_id = auth_response.user.id
        try :
            self.admin_client.table("profiles").insert({
                "id" : user_id,
                "name" : name,
                "mobile_number" : mobile_number
            }).execute()
        except Exception as e :
            return {
                "success" : False,
                "error" : f"user created but profile insert failed : {e}"
            }
        return {
            "success" : True,
            "user_id" : user_id,
            "email" : email,
            "name" : name,
            "mobile_number" : mobile_number
        }
    def sign_in(self, email : str, password : str) -> dict :
        try :
            auth_response = self.client.auth.sign_in_with_password({
                "email" : email,
                "password" : password
            })
        except Exception as e :
            return {
                "success" : False,
                "error" : "invalid email or password"
            }
        if not auth_response.user :
            return {
                "success" : False,
                "error" : "invalid email or password"
            }
        access_token = auth_response.session.access_token if auth_response.session else None
        
        return {
            "success" : True,
            "user_id" : auth_response.user.id,
            "email" : auth_response.user.email,
            "access_token" : access_token
        }

    def get_profile(self, user_id : str) -> dict :
        try :
            res = self.admin_client.table("profiles").select("*").eq("id", user_id).execute()
            raw = res.data[0] if res.data else {}
            user_data : dict = raw if isinstance(raw, dict) else {}
            auth_user = self.admin_client.auth.admin.get_user_by_id(user_id)
            raw_email = auth_user.user.email if auth_user and auth_user.user else ""
            email : str = raw_email if isinstance(raw_email, str) else ""
            return {
                "success" : True,
                "name" : user_data.get("name", ""),
                "mobile_number" : user_data.get("mobile_number", ""),
                "email" : email
            }
        except Exception as e :
            return {
                "success" : False,
                "error" : str(e)
            }

    def change_password(self, user_id : str, old_password : str, new_password : str) -> dict :
        try :
            auth_user = self.admin_client.auth.admin.get_user_by_id(user_id)
            if not auth_user or not auth_user.user or not auth_user.user.email :
                return {
                    "success" : False,
                    "error" : "User not found"
                }
            email = auth_user.user.email
            try :
                verify_res = self.client.auth.sign_in_with_password({
                    "email" : email,
                    "password" : old_password
                })
                if not verify_res.user :
                    return {
                        "success" : False,
                        "error" : "Incorrect old password"
                    }
            except Exception :
                return {
                    "success" : False,
                    "error" : "Incorrect old password"
                }

            self.admin_client.auth.admin.update_user_by_id(user_id, {"password" : new_password})
            return {
                "success" : True
            }
        except Exception as e :
            return {
                "success" : False,
                "error" : str(e)
            }

    def delete_account(self, user_id : str) -> dict :
        try :
            # Delete in correct order: dependent data first, auth record last
            # 1. Delete chat history for this user
            self.admin_client.table("chat_history").delete().eq("user_id", user_id).execute()
            # 2. Delete profile record
            self.admin_client.table("profiles").delete().eq("id", user_id).execute()
            # 3. Delete the auth user record (must be last to avoid FK violations)
            self.admin_client.auth.admin.delete_user(user_id)
            return {
                "success" : True
            }
        except Exception as e :
            return {
                "success" : False,
                "error" : str(e)
            }
