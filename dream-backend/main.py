from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi import BackgroundTasks, WebSocket, WebSocketDisconnect, Path
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import httpx

from database import Base, engine, get_db
import models
import schemas
import auth
import ai
from ws import manager
import email_service
from datetime import datetime, timedelta, timezone
import secrets
import re

Base.metadata.create_all(bind=engine)


def generate_username(first_name: str, last_name: str, db: Session) -> str:
    """Generate a unique username from first and last name"""
    # Clean names: lowercase, remove special chars, keep only alphanumeric
    first_clean = re.sub(r'[^a-zA-Z0-9]', '', first_name.lower())
    last_clean = re.sub(r'[^a-zA-Z0-9]', '', last_name.lower())
    
    # Base username: firstname + lastname
    base_username = f"{first_clean}{last_clean}"
    
    # If base username is empty, use a default
    if not base_username:
        base_username = "user"
    
    # Check if username exists, if so append numbers
    username = base_username
    counter = 1
    while db.query(models.User).filter(models.User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1
        # Safety limit
        if counter > 9999:
            # Fallback to random number
            username = f"{base_username}{secrets.randbelow(10000)}"
            break
    
    return username

app = FastAPI()

# CORS middleware for frontend
# Allow all Vercel domains (production and preview deployments)
# Adding explicit origins for known Vercel domains + regex for others
# Updated: 2025-11-23 - Force Railway deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://lucid-loom.vercel.app",
        "https://lucid-loom-2lipirbqw-rns-projects-28c53b11.vercel.app",  # Latest preview
        "https://lucid-loom-p4gzwv9j0-rns-projects-28c53b11.vercel.app",  # Previous preview
        "https://lucid-loom-5s9xaxmhn-rns-projects-28c53b11.vercel.app",  # Older preview
    ],
    allow_origin_regex=r"^https://.*\.vercel\.app$",  # Match all other Vercel preview deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Root and health check ----------
@app.get("/")
def root():
    return {"message": "Lucid Loom API", "status": "running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}


# ---------- Image proxy endpoint ----------
@app.get("/api/images/proxy")
async def proxy_image(
    url: str,
    current_user: models.User = Depends(auth.get_current_user),
):
    """
    Proxy endpoint to fetch images from external sources (like Azure Blob Storage)
    with proper authentication. This solves 403 errors when frontend tries to load
    images directly.
    
    The endpoint requires authentication to prevent abuse, but the images themselves
    are fetched server-side with proper headers.
    """
    if not url:
        raise HTTPException(status_code=400, detail="URL parameter is required")
    
    # Validate that the URL is from a trusted source
    allowed_domains = [
        "oaidalleapiprodscus.blob.core.windows.net",
        "openai.com",
        "dalleprodscus.blob.core.windows.net",
        "blob.core.windows.net",
    ]
    
    if not any(domain in url for domain in allowed_domains):
        raise HTTPException(status_code=403, detail="URL not allowed")
    
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            # Fetch the image - Azure Blob Storage URLs from OpenAI should work without auth
            # but we'll try with a user-agent to avoid blocking
            headers = {
                "User-Agent": "Mozilla/5.0 (compatible; LucidLoom/1.0)",
            }
            response = await client.get(url, headers=headers)
            
            if response.status_code != 200:
                # If we get 403, the URL might have expired or need different handling
                print(f"⚠️ Image proxy failed: {response.status_code} for {url[:100]}...")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to fetch image: {response.status_code}. The image URL may have expired."
                )
            
            # Return the image with appropriate content type
            content_type = response.headers.get("content-type", "image/png")
            return StreamingResponse(
                iter([response.content]),
                media_type=content_type,
                headers={
                    "Cache-Control": "public, max-age=31536000",  # Cache for 1 year
                    "Access-Control-Allow-Origin": "*",  # Allow CORS for images
                }
            )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Image fetch timeout")
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        print(f"❌ Image proxy error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to proxy image: {str(e)}")


# ---------- Auth routes ----------
@app.post("/auth/register", response_model=schemas.RegisterResponse)
def register(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user - sends OTP for email verification"""
    from datetime import datetime, timedelta
    import random
    
    existing = auth.get_user_by_email(db, user_in.email)
    if existing and existing.email_verified == "True":
        raise HTTPException(status_code=400, detail="Email already registered. Please log in.")
    
    # Generate OTP
    otp_code = str(random.randint(100000, 999999))
    otp_expires = datetime.utcnow() + timedelta(minutes=10)
    
    if existing:
        # Update existing unverified user
        print(f"🔐 Register: User {user_in.email} exists but not verified, updating and sending new OTP")
        hashed = auth.hash_password(user_in.password)
        existing.hashed_password = hashed
        existing.first_name = user_in.first_name
        existing.last_name = user_in.last_name
        if not existing.username:
            existing.username = generate_username(user_in.first_name, user_in.last_name, db)
        existing.otp_code = otp_code
        existing.otp_expires = otp_expires
        existing.email_verified = "False"
        db.commit()
    else:
        # Create new user
        hashed = auth.hash_password(user_in.password)
        username = generate_username(user_in.first_name, user_in.last_name, db)
        print(f"🔐 Register: Creating new user {user_in.email}")
        print(f"   Username: {username}")
        
        new_user = models.User(
            email=user_in.email,
            username=username,
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            hashed_password=hashed,
            otp_code=otp_code,
            otp_expires=otp_expires,
            email_verified="False"
        )
        db.add(new_user)
        db.commit()
    
    # Send OTP email
    from email_service import send_otp_email
    import os
    email_sent = send_otp_email(user_in.email, otp_code)
    
    # Log OTP for backend debugging only (not shown to user)
    print(f"\n{'='*60}")
    print(f"🔐 OTP Generated for {user_in.email}")
    print(f"   OTP Code: {otp_code}")
    print(f"   Valid for: 10 minutes")
    print(f"   Email sent: {email_sent}")
    print(f"{'='*60}\n")
    
    if not email_sent:
        print(f"⚠️ Failed to send OTP email to {user_in.email}")
        print(f"   Check email configuration in .env file")
        print(f"   SENDGRID_FROM_EMAIL must be a verified email in SendGrid")
        print(f"   Current SENDGRID_FROM_EMAIL: {os.getenv('SENDGRID_FROM_EMAIL', 'NOT SET')}")
        print(f"   OTP Code (for admin/debugging only): {otp_code}")
        # Don't fail registration - allow user to verify later or contact support
        return {
            "message": "Registration successful! However, we couldn't send the verification email. Please check your email configuration in the backend .env file (SENDGRID_FROM_EMAIL must be a verified email).",
            "email": user_in.email,
            "otp_sent": False
        }
    
    # Success - email sent
    return {
        "message": "Registration successful! Please check your email for the verification code.",
        "email": user_in.email,
        "otp_sent": email_sent
    }


@app.post("/auth/verify-otp")
def verify_otp(request: schemas.VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify OTP and complete user registration"""
    user = auth.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=400, detail="User not found. Please register first.")
    
    # Check if email already verified
    if user.email_verified == "True":
        raise HTTPException(status_code=400, detail="Email already verified. Please login.")
    
    # Check OTP
    if not user.otp_code or user.otp_code != request.otp_code:
        raise HTTPException(status_code=400, detail="Invalid verification code.")
    
    # Check expiration
    if not user.otp_expires or user.otp_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new one.")
    
    # Verify email
    user.email_verified = "True"
    user.otp_code = None
    user.otp_expires = None
    db.commit()
    db.refresh(user)
    
    # Generate access token
    access_token = auth.create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "message": "Email verified successfully"
    }


@app.post("/auth/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # Try case-insensitive email lookup (SQLite compatible)
    email_lower = form_data.username.lower().strip()
    # Try exact match first
    user = auth.get_user_by_email(db, form_data.username)
    # If not found, try case-insensitive by checking all users
    if not user:
        all_users = db.query(models.User).all()
        for u in all_users:
            if u.email and u.email.lower() == email_lower:
                user = u
                break
    
    if not user:
        print(f"❌ Login: User {form_data.username} not found")
        # List all users for debugging (remove in production)
        all_users = db.query(models.User).all()
        print(f"   Available users: {[u.email for u in all_users]}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    print(f"🔐 Login: Attempting login for {form_data.username}")
    print(f"   Found user: {user.email}")
    print(f"   Stored hash length: {len(user.hashed_password) if user.hashed_password else 0}")
    print(f"   Stored hash preview: {user.hashed_password[:20] if user.hashed_password else 'None'}...")
    
    if not user.hashed_password:
        print(f"❌ Login: User {user.email} has no password hash")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    password_valid = auth.verify_password(form_data.password, user.hashed_password)
    print(f"   Password verification result: {password_valid}")
    print(f"   Input password length: {len(form_data.password)}")
    
    if not password_valid:
        print(f"❌ Login: Password verification failed for {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # OTP verification is only required for signup, not for login
    # Allow login regardless of email_verified status
    # (For existing users without email_verified field, mark as verified for consistency)
    if user.email_verified is None:
        user.email_verified = "True"
    
    # Generate username for existing users who don't have one
    if not user.username and (user.first_name or user.last_name):
        user.username = generate_username(
            user.first_name or "user",
            user.last_name or "",
            db
        )
        db.commit()
        print(f"   Generated username for existing user: {user.username}")
        db.commit()

    token = auth.create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/auth/forgot-password")
def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send OTP for password reset"""
    from datetime import datetime, timedelta
    import random
    
    user = auth.get_user_by_email(db, request.email)
    if not user:
        # Don't reveal if email exists for security
        return {"message": "If that email exists, a verification code has been sent."}
    
    # Generate OTP
    otp_code = str(random.randint(100000, 999999))
    otp_expires = datetime.utcnow() + timedelta(minutes=10)
    
    # Store OTP in user record
    user.otp_code = otp_code
    user.otp_expires = otp_expires
    db.commit()
    
    # Send OTP email
    from email_service import send_otp_email
    email_sent = send_otp_email(user.email, otp_code)
    
    # Log OTP for backend debugging only
    print(f"\n{'='*60}")
    print(f"🔐 Password Reset OTP Generated for {user.email}")
    print(f"   OTP Code: {otp_code}")
    print(f"   Valid for: 10 minutes")
    print(f"   Email sent: {email_sent}")
    print(f"{'='*60}\n")
    
    if not email_sent:
        print(f"⚠️ Failed to send OTP email to {user.email}")
        return {
            "message": "Failed to send verification email. Please check your email configuration or try again later.",
            "otp_sent": False
        }
    
    return {
        "message": "Verification code sent to your email. Please check your inbox.",
        "otp_sent": True
    }


@app.post("/auth/verify-reset-otp")
def verify_reset_otp(request: schemas.VerifyResetOTPRequest, db: Session = Depends(get_db)):
    """Verify OTP for password reset"""
    from datetime import datetime
    
    user = auth.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    # Check OTP
    if not user.otp_code or user.otp_code != request.otp_code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Check expiration
    if not user.otp_expires or user.otp_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new one.")
    
    # OTP is valid - clear it and allow password reset
    user.otp_code = None
    user.otp_expires = None
    # Set a flag or token to allow password reset (we'll use a temporary token)
    reset_token = auth.create_reset_token(user, db)
    db.commit()
    
    return {
        "message": "Verification code verified successfully",
        "reset_token": reset_token  # Temporary token for password reset
    }


@app.post("/auth/reset-password")
def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using token (after OTP verification)"""
    from datetime import datetime
    
    user = db.query(models.User).filter(models.User.reset_token == request.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    if not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Update password
    user.hashed_password = auth.hash_password(request.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    return {"message": "Password reset successfully"}


@app.post("/auth/change-password")
def change_password(
    request: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Change password for logged-in user"""
    if not auth.verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    current_user.hashed_password = auth.hash_password(request.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}


# ---------- User Settings ----------
@app.get("/user/info")
def get_user_info(
    current_user: models.User = Depends(auth.get_current_user),
):
    """Get current user information"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email_verified": current_user.email_verified == "True",
    }


@app.get("/user/stats")
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Get user account statistics"""
    dreams = (
        db.query(models.Dream)
        .filter(models.Dream.user_id == current_user.id)
        .all()
    )
    
    total_dreams = len(dreams)
    dreams_with_images = sum(1 for d in dreams if d.interpretation and d.interpretation.image_url)
    dreams_with_interpretation = sum(1 for d in dreams if d.interpretation)
    
    # Get oldest and newest dream dates
    if dreams:
        dates = [d.created_at for d in dreams if d.created_at]
        oldest_dream = min(dates) if dates else None
        newest_dream = max(dates) if dates else None
    else:
        oldest_dream = None
        newest_dream = None
    
    return {
        "total_dreams": total_dreams,
        "dreams_with_images": dreams_with_images,
        "dreams_with_interpretation": dreams_with_interpretation,
        "oldest_dream_date": oldest_dream.isoformat() if oldest_dream else None,
        "newest_dream_date": newest_dream.isoformat() if newest_dream else None,
        "account_created": "N/A",  # We don't track account creation date
    }


@app.get("/user/export")
def export_user_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Export all user's dreams as JSON"""
    dreams = (
        db.query(models.Dream)
        .filter(models.Dream.user_id == current_user.id)
        .order_by(models.Dream.created_at.desc())
        .all()
    )
    
    export_data = {
        "user_email": current_user.email,
        "export_date": datetime.now(timezone.utc).isoformat(),
        "total_dreams": len(dreams),
        "dreams": []
    }
    
    for dream in dreams:
        dream_data = {
            "id": dream.id,
            "title": dream.title,
            "raw_text": dream.raw_text,
            "created_at": dream.created_at.isoformat() if dream.created_at else None,
        }
        
        if dream.interpretation:
            dream_data["interpretation"] = {
                "poetic_narrative": dream.interpretation.poetic_narrative,
                "meaning": dream.interpretation.meaning,
                "symbols": dream.interpretation.symbols,
                "emotions": dream.interpretation.emotions,
                "image_url": dream.interpretation.image_url,
            }
        
        export_data["dreams"].append(dream_data)
    
    return export_data


@app.delete("/user/account")
def delete_account(
    request: schemas.DeleteAccountRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Delete user account and all associated data"""
    # Verify password
    if not auth.verify_password(request.password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    # Delete all user's dreams (cascade will delete interpretations)
    dreams = (
        db.query(models.Dream)
        .filter(models.Dream.user_id == current_user.id)
        .all()
    )
    
    for dream in dreams:
        # Delete interpretation if exists
        if dream.interpretation:
            db.delete(dream.interpretation)
        db.delete(dream)
    
    # Delete user account
    db.delete(current_user)
    db.commit()
    
    return {"message": "Account deleted successfully"}


async def _process_dream(dream_id: int, db: Session, generate_image: bool = True) -> None:
    # Load fresh copy in this DB session
    dream = db.query(models.Dream).filter(models.Dream.id == dream_id).first()
    if not dream:
        print(f"❌ Dream {dream_id} not found in database")
        return
    try:
        print(f"🔄 Processing dream {dream_id}: {dream.title}")
        # Notify: analyzing
        try:
            await manager.send_to(dream_id, {"status": "analyzing", "message": "Analyzing your dream..."})
        except Exception as ws_err:
            print(f"⚠️ WebSocket send failed (non-critical): {ws_err}")
        
        print(f"📝 Analyzing dream text: {dream.raw_text[:50]}...")
        # Check API key before attempting analysis
        import os
        groq_key = os.getenv("GROQ_API_KEY", "")
        if not groq_key or groq_key == "your_groq_api_key_here":
            raise ValueError("GROQ_API_KEY not configured. Please set GROQ_API_KEY in .env file.")
        
        analysis = await ai.analyze_dream(dream.raw_text)
        print(f"✅ Analysis complete for dream {dream_id}")
        
        # Generate image only if requested (always uses paid DALL-E 3 for reliability)
        image_url = None
        if generate_image:
            # Notify: generating image
            try:
                await manager.send_to(dream_id, {"status": "generating_image", "message": "Generating realistic image..."})
            except Exception:
                pass
            
            image_url = await ai.generate_dream_image(analysis["image_prompt"], dream_text=dream.raw_text, use_free=False)
        
        # Convert symbols dict to string if needed
        symbols = analysis.get("symbols")
        if isinstance(symbols, dict):
            import json
            symbols = json.dumps(symbols)
        elif symbols is None:
            symbols = None
        
        # Convert emotions list to string if needed
        emotions = analysis.get("emotions")
        if isinstance(emotions, list):
            emotions = ", ".join(emotions)
        elif emotions is None:
            emotions = None
        
        interp = models.DreamInterpretation(
            poetic_narrative=analysis.get("poetic_narrative"),
            meaning=analysis.get("meaning"),
            symbols=symbols,
            emotions=emotions,
            image_url=image_url,
            dream_id=dream.id,
        )
    except ValueError as e:
        # API key not configured
        error_msg = str(e)
        print(f"❌ ValueError for dream {dream_id}: {error_msg}")
        if "API key" in error_msg:
            if "GROQ_API_KEY" in error_msg:
                error_msg = "Groq API key not configured. Please set GROQ_API_KEY in .env file."
            elif "OPENAI_API_KEY" in error_msg:
                error_msg = "OpenAI API key not configured. Please set OPENAI_API_KEY in .env file (required for image generation)."
            else:
                error_msg = "API key not configured. Please set GROQ_API_KEY (for text) and/or OPENAI_API_KEY (for images) in .env file."
        interp = models.DreamInterpretation(
            poetic_narrative=None,
            meaning=f"⚠️ Configuration Error: {error_msg}",
            symbols=None,
            emotions=None,
            image_url=None,
            dream_id=dream.id,
        )
    except Exception as e:
        # Store error message as "meaning" so UI can display something helpful
        error_msg = str(e)
        print(f"❌ Exception for dream {dream_id}: {error_msg}")
        import traceback
        traceback.print_exc()
        if "API" in error_msg or "key" in error_msg.lower():
            if "Groq" in error_msg or "GROQ" in error_msg:
                error_msg = f"Groq API Error: {error_msg}. Please check your GROQ_API_KEY configuration."
            elif "OpenAI" in error_msg or "OPENAI" in error_msg:
                error_msg = f"OpenAI API Error: {error_msg}. Please check your OPENAI_API_KEY configuration (required for image generation)."
            else:
                error_msg = f"API Error: {error_msg}. Please check your API key configuration (GROQ_API_KEY for text, OPENAI_API_KEY for images)."
        interp = models.DreamInterpretation(
            poetic_narrative=None,
            meaning=f"⚠️ AI interpretation unavailable: {error_msg}",
            symbols=None,
            emotions=None,
            image_url=None,
            dream_id=dream.id,
        )
    db.add(interp)
    db.commit()
    print(f"✅ Dream {dream_id} interpretation saved to database")
    # Notify any connected clients that this dream is ready
    try:
        await manager.send_to(dream_id, {"status": "done", "dreamId": dream_id})
        print(f"✅ WebSocket notification sent for dream {dream_id}")
    except Exception as e:
        print(f"⚠️ WebSocket notification failed for dream {dream_id}: {e}")
        pass  # WebSocket might not be connected, that's okay


# ---------- Dream routes ----------
@app.post("/dreams", response_model=schemas.DreamOut)
async def create_dream(
    dream_in: schemas.DreamCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    # Create the base dream record first
    dream = models.Dream(
        title=dream_in.title,
        raw_text=dream_in.raw_text,
        user_id=current_user.id,
    )
    db.add(dream)
    db.commit()
    db.refresh(dream)
    # Spawn background processing
    # We pass a fresh session to the task
    def runner(did: int, gen_img: bool):
        # new session for background work
        db_gen = get_db()
        task_db = next(db_gen)
        try:
            import asyncio
            asyncio.run(_process_dream(did, task_db, gen_img))
        finally:
            try:
                next(db_gen, None)  # Close the generator
            except StopIteration:
                pass
    background_tasks.add_task(runner, dream.id, dream_in.generate_image)
    # Return immediately without interpretation (WS will notify on completion)
    return dream


@app.get("/dreams", response_model=List[schemas.DreamOut])
def list_dreams(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    dreams = (
        db.query(models.Dream)
        .filter(models.Dream.user_id == current_user.id)
        .order_by(models.Dream.created_at.desc())
        .all()
    )
    return dreams


@app.get("/dreams/{dream_id}", response_model=schemas.DreamOut)
def get_dream(
    dream_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    dream = (
        db.query(models.Dream)
        .filter(models.Dream.id == dream_id, models.Dream.user_id == current_user.id)
        .first()
    )
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    return dream


@app.put("/dreams/{dream_id}", response_model=schemas.DreamOut)
def update_dream(
    dream_id: int,
    dream_update: schemas.DreamUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Update a dream's title or text"""
    dream = (
        db.query(models.Dream)
        .filter(models.Dream.id == dream_id, models.Dream.user_id == current_user.id)
        .first()
    )
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    if dream_update.title is not None:
        dream.title = dream_update.title
    if dream_update.raw_text is not None:
        dream.raw_text = dream_update.raw_text
    
    db.commit()
    db.refresh(dream)
    return dream


@app.delete("/dreams/{dream_id}")
def delete_dream(
    dream_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Delete a dream"""
    dream = (
        db.query(models.Dream)
        .filter(models.Dream.id == dream_id, models.Dream.user_id == current_user.id)
        .first()
    )
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    db.delete(dream)
    db.commit()
    return {"message": "Dream deleted successfully"}


@app.post("/dreams/{dream_id}/regenerate")
async def regenerate_dream(
    dream_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Regenerate AI interpretation and image for a dream"""
    dream = (
        db.query(models.Dream)
        .filter(models.Dream.id == dream_id, models.Dream.user_id == current_user.id)
        .first()
    )
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    # Delete existing interpretation if it exists
    if dream.interpretation:
        db.delete(dream.interpretation)
        db.commit()
    
    # Spawn background processing (regenerate always includes image)
    def runner(did: int):
        db_gen = get_db()
        task_db = next(db_gen)
        try:
            import asyncio
            asyncio.run(_process_dream(did, task_db, generate_image=True))
        finally:
            try:
                next(db_gen, None)  # Close the generator
            except StopIteration:
                pass
    
    background_tasks.add_task(runner, dream.id)
    return {"message": "Dream regeneration started", "dream_id": dream_id}


@app.post("/dreams/{dream_id}/rewrite", response_model=schemas.DreamRewriteResponse)
async def rewrite_dream_style(
    dream_id: int,
    rewrite_request: schemas.DreamRewriteRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Rewrite a dream in a different narrative style"""
    dream = (
        db.query(models.Dream)
        .filter(models.Dream.id == dream_id, models.Dream.user_id == current_user.id)
        .first()
    )
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    try:
        rewritten = await ai.rewrite_dream(dream.raw_text, rewrite_request.style)
        return {
            "rewritten_narrative": rewritten,
            "style": rewrite_request.style,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rewrite dream: {str(e)}")


@app.get("/symbols/{symbol}/explain", response_model=schemas.SymbolExplanationResponse)
async def explain_symbol_endpoint(
    symbol: str,
    current_user: models.User = Depends(auth.get_current_user),
):
    """Get detailed explanation of a dream symbol"""
    try:
        explanation = await ai.explain_symbol(symbol)
        return {
            "symbol": symbol,
            "general_meaning": explanation.get("general_meaning", ""),
            "psychological": explanation.get("psychological", ""),
            "cultural": explanation.get("cultural", ""),
            "personal_context": explanation.get("personal_context", ""),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to explain symbol: {str(e)}")


# ---------- Analytics routes ----------
@app.get("/analytics/summary", response_model=schemas.AnalyticsSummary)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    from collections import Counter
    from datetime import datetime
    
    # Get all user's dreams with interpretations
    dreams = (
        db.query(models.Dream)
        .filter(models.Dream.user_id == current_user.id)
        .all()
    )
    
    total_dreams = len(dreams)
    dreams_with_images = sum(1 for d in dreams if d.interpretation and d.interpretation.image_url)
    
    # Extract symbols and emotions
    all_symbols = []
    all_emotions = []
    # Store dreams with their full datetime for frontend timezone conversion
    dreams_with_dates = []
    
    for dream in dreams:
        if dream.interpretation:
            # Parse symbols (comma-separated or newline-separated)
            if dream.interpretation.symbols:
                symbols = [s.strip() for s in dream.interpretation.symbols.replace('\n', ',').split(',') if s.strip()]
                all_symbols.extend(symbols)
            
            # Parse emotions (comma-separated or newline-separated)
            if dream.interpretation.emotions:
                emotions = [e.strip() for e in dream.interpretation.emotions.replace('\n', ',').split(',') if e.strip()]
                all_emotions.extend(emotions)
        
        # Store full datetime ISO string so frontend can convert to user's local timezone
        if dream.created_at:
            dreams_with_dates.append({
                "created_at": dream.created_at.isoformat(),
                "count": 1
            })
    
    # Get top symbols and emotions
    symbol_counts = Counter(all_symbols)
    emotion_counts = Counter(all_emotions)
    
    top_symbols = [{"symbol": sym, "count": count} for sym, count in symbol_counts.most_common(10)]
    top_emotions = [{"emotion": emo, "count": count} for emo, count in emotion_counts.most_common(10)]
    
    # Send full datetime info - frontend will group by local day
    # Return dreams with their ISO timestamps so frontend can convert to local timezone
    return {
        "total_dreams": total_dreams,
        "dreams_with_images": dreams_with_images,
        "top_symbols": top_symbols,
        "top_emotions": top_emotions,
        "dreams_with_dates": dreams_with_dates,  # Changed from dreams_by_day
    }


@app.post("/analytics/patterns", response_model=schemas.PatternAnalysisResponse)
async def analyze_patterns(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Analyze patterns across all user's dreams using AI"""
    # Get all user's dreams with interpretations
    dreams = (
        db.query(models.Dream)
        .filter(models.Dream.user_id == current_user.id)
        .order_by(models.Dream.created_at.asc())
        .all()
    )
    
    if len(dreams) < 2:
        raise HTTPException(
            status_code=400,
            detail="Need at least 2 dreams to analyze patterns. Keep logging your dreams!"
        )
    
    # Prepare dreams data for AI analysis
    dreams_data = []
    for dream in dreams:
        dream_dict = {
            "title": dream.title,
            "raw_text": dream.raw_text,
            "created_at": dream.created_at.isoformat() if dream.created_at else None,
        }
        if dream.interpretation:
            dream_dict["symbols"] = dream.interpretation.symbols or ""
            dream_dict["emotions"] = dream.interpretation.emotions or ""
        dreams_data.append(dream_dict)
    
    try:
        analysis = await ai.analyze_dream_patterns(dreams_data)
        print(f"✅ Pattern analysis successful. Keys received: {list(analysis.keys())}")
        return {
            "recurring_themes": analysis.get("recurring_themes", ""),
            "emotional_patterns": analysis.get("emotional_patterns", ""),
            "symbol_patterns": analysis.get("symbol_patterns", ""),
            "temporal_insights": analysis.get("temporal_insights", ""),
            "personal_growth": analysis.get("personal_growth", ""),
            "recommendations": analysis.get("recommendations", ""),
        }
    except ValueError as e:
        # API key or configuration errors
        print(f"❌ Configuration error in pattern analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except Exception as e:
        # Other errors (API errors, JSON parsing, etc.)
        print(f"❌ Error in pattern analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to analyze patterns: {str(e)}")


# ---------- WebSocket for dream status ----------
@app.websocket("/ws/dream-status/{dream_id}")
async def dream_status_ws(websocket: WebSocket, dream_id: int = Path(..., ge=1)):
    await manager.connect(dream_id, websocket)
    try:
        while True:
            # We don't expect messages from client; keep the socket open
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(dream_id, websocket)

