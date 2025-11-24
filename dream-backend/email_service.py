import smtplib
import os
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

# Email configuration from environment variables
# Try SendGrid first (works better on Railway), fallback to SMTP
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "")
SENDGRID_FROM_NAME = os.getenv("SENDGRID_FROM_NAME", "Lucid Loom")

# SMTP fallback configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USER)
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Lucid Loom")


def send_otp_email(to_email: str, otp_code: str) -> bool:
    """
    Send OTP email to user.
    Uses SendGrid API if available, otherwise falls back to SMTP.
    Returns True if successful, False otherwise.
    """
    print(f"🚀 send_otp_email() called for {to_email} with OTP {otp_code}")
    print(f"🔍 Checking email configuration...")
    print(f"   SENDGRID_API_KEY: {'Set' if SENDGRID_API_KEY else 'Not set'}")
    print(f"   SMTP_USER: {'Set' if SMTP_USER else 'Not set'}")
    print(f"   SMTP_PASSWORD: {'Set' if SMTP_PASSWORD else 'Not set'}")
    
    # Try SendGrid first (works better on Railway)
    if SENDGRID_API_KEY:
        print("📬 Using SendGrid API")
        return _send_via_sendgrid(to_email, otp_code)
    
    # Fallback to SMTP
    if not SMTP_USER or not SMTP_PASSWORD:
        print("⚠️ Email configuration missing. Set SENDGRID_API_KEY or SMTP_USER/SMTP_PASSWORD in .env")
        print(f"   Would send OTP {otp_code} to {to_email}")
        return False
    
    print("📧 Using SMTP fallback")
    return _send_via_smtp(to_email, otp_code)


def _send_via_sendgrid(to_email: str, otp_code: str) -> bool:
    """Send email using SendGrid API"""
    try:
        from_email = SENDGRID_FROM_EMAIL or "lucidloom.app@gmail.com"
        from_name = SENDGRID_FROM_NAME or "Lucid Loom"
        
        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #6366f1;">Welcome to Lucid Loom</h2>
              <p>Thank you for signing up! Please use the following verification code to complete your registration:</p>
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #6366f1; font-size: 32px; letter-spacing: 4px; margin: 0;">{otp_code}</h1>
              </div>
              <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
              <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
            </div>
          </body>
        </html>
        """
        
        text_body = f"""
        Welcome to Lucid Loom!
        
        Thank you for signing up! Please use the following verification code to complete your registration:
        
        {otp_code}
        
        This code will expire in 10 minutes.
        
        If you didn't request this code, please ignore this email.
        """
        
        payload = {
            "personalizations": [{
                "to": [{"email": to_email}],
                "subject": "Your Lucid Loom Verification Code"
            }],
            "from": {
                "email": from_email,
                "name": from_name
            },
            "content": [
                {
                    "type": "text/plain",
                    "value": text_body
                },
                {
                    "type": "text/html",
                    "value": html_body
                }
            ]
        }
        
        headers = {
            "Authorization": f"Bearer {SENDGRID_API_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            "https://api.sendgrid.com/v3/mail/send",
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 202:
            print(f"✅ OTP email sent to {to_email} via SendGrid")
            return True
        else:
            print(f"❌ SendGrid API error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Failed to send OTP email via SendGrid to {to_email}: {e}")
        return False


def _send_via_smtp(to_email: str, otp_code: str) -> bool:
    """Send email using SMTP (fallback)"""
    print(f"🔧 Attempting SMTP connection to {SMTP_HOST}:{SMTP_PORT}")
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Your Lucid Loom Verification Code"
        msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        msg["To"] = to_email
        
        # Create email body
        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #6366f1;">Welcome to Lucid Loom</h2>
              <p>Thank you for signing up! Please use the following verification code to complete your registration:</p>
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #6366f1; font-size: 32px; letter-spacing: 4px; margin: 0;">{otp_code}</h1>
              </div>
              <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
              <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
            </div>
          </body>
        </html>
        """
        
        text_body = f"""
        Welcome to Lucid Loom!
        
        Thank you for signing up! Please use the following verification code to complete your registration:
        
        {otp_code}
        
        This code will expire in 10 minutes.
        
        If you didn't request this code, please ignore this email.
        """
        
        # Attach parts
        part1 = MIMEText(text_body, "plain")
        part2 = MIMEText(html_body, "html")
        
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email - support both STARTTLS (587) and SSL (465)
        # Add timeout to prevent hanging on network issues
        print(f"🔌 Connecting to SMTP server {SMTP_HOST}:{SMTP_PORT}...")
        if SMTP_PORT == 465:
            # Use SSL for port 465
            print("🔐 Using SSL connection (port 465)")
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                print("🔑 Attempting SMTP login...")
                server.login(SMTP_USER, SMTP_PASSWORD)
                print("📤 Sending email message...")
                server.send_message(msg)
                print("✅ Email sent successfully!")
        else:
            # Use STARTTLS for port 587 (default)
            print("🔐 Using STARTTLS connection (port 587)")
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                print("🔒 Starting TLS...")
                server.starttls()
                print("🔑 Attempting SMTP login...")
                server.login(SMTP_USER, SMTP_PASSWORD)
                print("📤 Sending email message...")
                server.send_message(msg)
                print("✅ Email sent successfully!")
        
        print(f"✅ OTP email sent to {to_email} via SMTP")
        return True
        
    except smtplib.SMTPException as e:
        print(f"❌ SMTP error sending email to {to_email}: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return False
    except OSError as e:
        print(f"❌ Network error sending email to {to_email}: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error sending email to {to_email}: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return False

