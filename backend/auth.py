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
                "error" : "sign up failed and no user was created"
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

if __name__ == "__main__" :
    auth = AuthManager()
    result = auth.sign_up(
        email = "testuser@eample.com",
        password = "password123",
        name = "test user",
        mobile_number = "1234567899"
    )
    print("sign up result : ", result)
    if result["success"] :
        login_result = auth.sign_in(email = "testuser@eample.com", password = "password123")
        print("sign in result : ", login_result)