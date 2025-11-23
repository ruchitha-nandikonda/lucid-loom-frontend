import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

# Email configuration from environment variables
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USER)
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Lucid Loom")


def send_otp_email(to_email: str, otp_code: str) -> bool:
    """
    Send OTP email to user.
    Returns True if successful, False otherwise.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print("⚠️ Email configuration missing. Set SMTP_USER and SMTP_PASSWORD in .env")
        print(f"   Would send OTP {otp_code} to {to_email}")
        return False
    
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
        if SMTP_PORT == 465:
            # Use SSL for port 465
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)
        else:
            # Use STARTTLS for port 587 (default)
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)
        
        print(f"✅ OTP email sent to {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send OTP email to {to_email}: {e}")
        return False

