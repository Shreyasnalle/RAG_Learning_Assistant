import os
import time
import random
import json
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("supabase_key.env")
load_dotenv()

_otp_store: dict = {}


class AuthManager:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        anon_key = os.getenv("SUPABASE_ANON_KEY")
        service_role_key = os.getenv("SUPABASE_SERVICE_KEY")
        if not supabase_url or not anon_key or not service_role_key:
            raise RuntimeError("Missing Supabase keys, check if correct supabase keys are used")
        self.client: Client = create_client(supabase_url, anon_key)
        self.admin_client: Client = create_client(supabase_url, service_role_key)
        self.resend_api_key = os.getenv("RESEND_API_KEY", "")
        self.resend_from_email = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")

    def _send_via_resend(self, to_email: str, subject: str, html_body: str) -> bool:
        if not self.resend_api_key or self.resend_api_key == "your_resend_api_key_here":
            return False
        try:
            resp = requests.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {self.resend_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": self.resend_from_email,
                    "to": [to_email],
                    "subject": subject,
                    "html": html_body
                },
                timeout=10
            )
            return resp.status_code in (200, 201)
        except Exception:
            return False

    def _get_all_users(self) -> list:
        try:
            res = self.admin_client.auth.admin.list_users()
            if isinstance(res, list):
                return res
            if hasattr(res, 'users') and isinstance(res.users, list):
                return res.users
            return []
        except Exception:
            return []

    def _save_otp(self, email: str, otp_code: str):
        clean_email = email.strip().lower()
        expiry = time.time() + 600
        _otp_store[clean_email] = (otp_code, expiry)
        try:
            cache_path = os.path.join(os.path.dirname(__file__), ".otp_cache.json")
            cache = {}
            if os.path.exists(cache_path):
                with open(cache_path, "r") as f:
                    cache = json.load(f)
            cache[clean_email] = {"otp": otp_code, "expiry": expiry}
            with open(cache_path, "w") as f:
                json.dump(cache, f)
        except Exception:
            pass

    def _get_otp(self, email: str):
        clean_email = email.strip().lower()
        if clean_email in _otp_store:
            return _otp_store[clean_email]
        try:
            cache_path = os.path.join(os.path.dirname(__file__), ".otp_cache.json")
            if os.path.exists(cache_path):
                with open(cache_path, "r") as f:
                    cache = json.load(f)
                if clean_email in cache:
                    data = cache[clean_email]
                    return (data["otp"], data["expiry"])
        except Exception:
            pass
        return None

    def _clear_otp(self, email: str):
        clean_email = email.strip().lower()
        if clean_email in _otp_store:
            del _otp_store[clean_email]
        try:
            cache_path = os.path.join(os.path.dirname(__file__), ".otp_cache.json")
            if os.path.exists(cache_path):
                with open(cache_path, "r") as f:
                    cache = json.load(f)
                if clean_email in cache:
                    del cache[clean_email]
                    with open(cache_path, "w") as f:
                        json.dump(cache, f)
        except Exception:
            pass

    def sign_up(self, email: str, password: str, name: str, mobile_number: str) -> dict:
        try:
            mobile_check = self.admin_client.table("profiles").select("id").eq("mobile_number", mobile_number).execute()
            if mobile_check.data and len(mobile_check.data) > 0:
                return {
                    "success": False,
                    "error": "The number is already reigsterd"
                }
        except Exception:
            pass

        try:
            user_list = self._get_all_users()
            if any(getattr(u, 'email', '') == email for u in user_list):
                return {
                    "success": False,
                    "error": "The emailID is already registered"
                }
        except Exception:
            pass

        try:
            auth_response = self.admin_client.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True
            })
        except Exception as e:
            err_str = str(e).lower()
            if "already registered" in err_str or "already exists" in err_str or "already been registered" in err_str:
                return {
                    "success": False,
                    "error": "The emailID is already registered"
                }
            return {
                "success": False,
                "error": str(e)
            }

        user = getattr(auth_response, 'user', None) or auth_response
        if not user or not hasattr(user, 'id'):
            return {
                "success": False,
                "error": "sign up failed and new no user was created"
            }
        user_id = user.id
        try:
            self.admin_client.table("profiles").insert({
                "id": user_id,
                "name": name,
                "mobile_number": mobile_number
            }).execute()
        except Exception as e:
            return {
                "success": False,
                "error": f"user created but profile insert failed : {e}"
            }

        greeting = f"Hey {name}," if name else "Hey there,"
        welcome_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Simply</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #050d0b;
      font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #ffffff;
    }}
    .wrapper {{
      width: 100%;
      table-layout: fixed;
      background-color: #050d0b;
      padding: 40px 0;
    }}
    .container {{
      max-width: 600px;
      margin: 0 auto;
      background-color: #0d1f1c;
      border: 1.5px solid rgba(251, 133, 105, 0.25);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
    }}
    .header {{
      padding: 24px 40px;
      background-color: #0d1f1c;
      border-bottom: 1px solid rgba(251, 133, 105, 0.15);
    }}
    .header-table {{
      width: 100%;
      border-collapse: collapse;
    }}
    .brand {{
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 0.15em;
      color: #fb8569;
      text-decoration: none;
      vertical-align: middle;
      margin-left: 12px;
      display: inline-block;
    }}
    .content {{
      padding: 42px 40px;
    }}
    h1 {{
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 16px;
      line-height: 1.3;
    }}
    p {{
      font-size: 16px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 0;
      margin-bottom: 24px;
    }}
    .accent-word {{
      color: #fb8569;
      font-weight: 700;
    }}
    .btn-container {{
      margin: 36px 0;
    }}
    .btn {{
      display: inline-block;
      padding: 14px 32px;
      background-color: #fb8569;
      color: #0d1f1c !important;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-decoration: none;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }}
    .footer {{
      padding: 24px 40px;
      background-color: #071210;
      border-top: 1px solid rgba(251, 133, 105, 0.1);
      text-align: center;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }}
    .footer a {{
      color: #fb8569;
      text-decoration: none;
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <table class="header-table" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <span class="brand">SIMPLY</span>
            </td>
          </tr>
        </table>
      </div>
      <div class="content">
        <h1>Welcome to the family!</h1>
        <p>{greeting}</p>
        <p>Your account on <span class="accent-word">Simply</span> has been successfully created. We are excited to have you join our community!</p>
        <p>With Simply, you can interact with video lectures directly, ask complex questions, and get precise, structured answers with accurate timestamps instantly.</p>
        <div class="btn-container">
          <a href="http://localhost:5173" class="btn" target="_blank">Go to Dashboard</a>
        </div>
        <p>Since this is a solo project built by me, if you have any questions, suggestions, or feedback along the way, feel free to directly email me at <a href="mailto:shreyas.nalle7@gmail.com" style="color: #fb8569; text-decoration: none;">shreyas.nalle7@gmail.com</a>.</p>
        <p>Cheers,<br>Shreyas Nalle</p>
      </div>
      <div class="footer">
        If you did not sign up for this account, please ignore this email or write to <a href="mailto:shreyas.nalle7@gmail.com">shreyas.nalle7@gmail.com</a>.
      </div>
    </div>
  </div>
</body>
</html>"""
        self._send_via_resend(email, "Welcome to the family! — Simply", welcome_html)

        return {
            "success": True,
            "user_id": user_id,
            "email": email,
            "name": name,
            "mobile_number": mobile_number
        }

    def sign_in(self, email: str, password: str) -> dict:
        clean_email = email.strip().lower() if email else ""
        if not clean_email:
            return {
                "success": False,
                "error": "Please enter your email address."
            }

        user_list = self._get_all_users()
        user_obj = next((u for u in user_list if getattr(u, 'email', '').strip().lower() == clean_email), None)
        if not user_obj:
            return {
                "success": False,
                "error": "Account not registered. Please sign up first."
            }

        try:
            auth_response = self.client.auth.sign_in_with_password({
                "email": clean_email,
                "password": password
            })
            if auth_response and auth_response.user:
                access_token = auth_response.session.access_token if auth_response.session else None
                return {
                    "success": True,
                    "user_id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "access_token": access_token or auth_response.user.id
                }
        except Exception:
            pass

        try:
            auth_response = self.admin_client.auth.sign_in_with_password({
                "email": clean_email,
                "password": password
            })
            if auth_response and auth_response.user:
                access_token = auth_response.session.access_token if auth_response.session else None
                return {
                    "success": True,
                    "user_id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "access_token": access_token or auth_response.user.id
                }
        except Exception:
            pass

        return {
            "success": False,
            "error": "Incorrect password. Please check your password or use Reset Password."
        }

    def get_profile(self, user_id: str) -> dict:
        try:
            res = self.admin_client.table("profiles").select("*").eq("id", user_id).execute()
            raw = res.data[0] if res.data else {}
            user_data: dict = raw if isinstance(raw, dict) else {}
            auth_user = self.admin_client.auth.admin.get_user_by_id(user_id)
            raw_email = auth_user.user.email if auth_user and auth_user.user else ""
            email: str = raw_email if isinstance(raw_email, str) else ""
            return {
                "success": True,
                "name": user_data.get("name", ""),
                "mobile_number": user_data.get("mobile_number", ""),
                "email": email
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def change_password(self, user_id: str, old_password: str, new_password: str) -> dict:
        try:
            auth_user = self.admin_client.auth.admin.get_user_by_id(user_id)
            if not auth_user or not auth_user.user or not auth_user.user.email:
                return {
                    "success": False,
                    "error": "User not found"
                }
            email = auth_user.user.email
            try:
                verify_res = self.client.auth.sign_in_with_password({
                    "email": email,
                    "password": old_password
                })
                if not verify_res.user:
                    return {
                        "success": False,
                        "error": "Incorrect old password"
                    }
            except Exception:
                return {
                    "success": False,
                    "error": "Incorrect old password"
                }

            self.admin_client.auth.admin.update_user_by_id(user_id, {"password": new_password})
            return {
                "success": True
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def delete_account(self, user_id: str) -> dict:
        try:
            self.admin_client.table("chat_history").delete().eq("user_id", user_id).execute()
            self.admin_client.table("profiles").delete().eq("id", user_id).execute()
            self.admin_client.auth.admin.delete_user(user_id)
            return {
                "success": True
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def send_otp(self, email: str) -> dict:
        try:
            clean_email = email.strip().lower()
            user_list = self._get_all_users()
            matched_user = next((u for u in user_list if getattr(u, 'email', '').strip().lower() == clean_email), None)
            if not matched_user:
                return {
                    "success": False,
                    "error": "No account found with this email address."
                }

            otp_code = str(random.randint(100000, 999999))
            self._save_otp(clean_email, otp_code)

            reset_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #050d0b;
      font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #ffffff;
    }}
    .wrapper {{
      width: 100%;
      table-layout: fixed;
      background-color: #050d0b;
      padding: 40px 0;
    }}
    .container {{
      max-width: 600px;
      margin: 0 auto;
      background-color: #0d1f1c;
      border: 1.5px solid rgba(251, 133, 105, 0.25);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
    }}
    .header {{
      padding: 24px 40px;
      background-color: #0d1f1c;
      border-bottom: 1px solid rgba(251, 133, 105, 0.15);
    }}
    .header-table {{
      width: 100%;
      border-collapse: collapse;
    }}
    .brand {{
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 0.15em;
      color: #fb8569;
      text-decoration: none;
      vertical-align: middle;
      margin-left: 12px;
      display: inline-block;
    }}
    .content {{
      padding: 42px 40px;
    }}
    h1 {{
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 16px;
      line-height: 1.3;
    }}
    p {{
      font-size: 16px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 0;
      margin-bottom: 24px;
    }}
    .otp-card {{
      text-align: center;
      background-color: #050d0b;
      border: 1px solid rgba(251, 133, 105, 0.15);
      border-radius: 8px;
      padding: 24px;
      margin: 32px 0;
    }}
    .otp-code {{
      font-family: 'Courier New', Courier, monospace;
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 0.25em;
      color: #fb8569;
      margin: 0;
    }}
    .expiry-note {{
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 8px;
      margin-bottom: 0;
    }}
    .warning-box {{
      background-color: rgba(251, 133, 105, 0.05);
      border-left: 3px solid #fb8569;
      padding: 16px;
      margin-bottom: 24px;
      border-radius: 0 8px 8px 0;
    }}
    .warning-text {{
      font-size: 14px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }}
    .footer {{
      padding: 24px 40px;
      background-color: #071210;
      border-top: 1px solid rgba(251, 133, 105, 0.1);
      text-align: center;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <table class="header-table" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <span class="brand">SIMPLY</span>
            </td>
          </tr>
        </table>
      </div>
      <div class="content">
        <h1>Reset Your Password</h1>
        <p>Hello,</p>
        <p>A request was made to reset your password on Simply. Please use the verification code below to verify your identity and set a new password.</p>
        
        <div class="otp-card">
          <div class="otp-code">{otp_code}</div>
          <p class="expiry-note">This code is valid for 10 minutes.</p>
        </div>

        <div class="warning-box">
          <p class="warning-text"><strong>Security Reminder:</strong> If you did not request this, please ignore this email. Your password will remain unchanged.</p>
        </div>

        <p>If you encounter any issues during this process, feel free to contact me directly at <a href="mailto:shreyas.nalle7@gmail.com" style="color: #fb8569; text-decoration: none;">shreyas.nalle7@gmail.com</a>.</p>
        <p>Best regards,<br>Shreyas Nalle</p>
      </div>
      <div class="footer">
        This is an automated security message. Please do not reply directly to this email.
      </div>
    </div>
  </div>
</body>
</html>"""

            sent = self._send_via_resend(email, "Reset Your Password — Simply", reset_html)
            if sent:
                return {
                    "success": True,
                    "message": f"OTP email sent to {email}. Please check your inbox."
                }
            return {
                "success": False,
                "error": "Failed to send email via Resend API."
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def verify_otp_reset_password(self, email: str, otp: str, new_password: str) -> dict:
        try:
            clean_email = email.strip().lower()
            stored = self._get_otp(clean_email)
            if not stored:
                return {
                    "success": False,
                    "error": "No OTP found. Please click SEND OTP first."
                }
            stored_code, expiry = stored
            if time.time() > expiry:
                self._clear_otp(clean_email)
                return {
                    "success": False,
                    "error": "OTP has expired. Please request a new one."
                }
            if otp.strip() != str(stored_code).strip():
                return {
                    "success": False,
                    "error": "Invalid OTP. Please check the code and try again."
                }

            user_list = self._get_all_users()
            matched_user = next((u for u in user_list if getattr(u, 'email', '').strip().lower() == clean_email), None)
            if not matched_user:
                return {
                    "success": False,
                    "error": "User not found."
                }

            self.admin_client.auth.admin.update_user_by_id(matched_user.id, {"password": new_password})
            self._clear_otp(clean_email)
            return {
                "success": True,
                "message": "Password reset successfully."
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
