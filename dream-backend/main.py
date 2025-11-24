from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi import BackgroundTasks, WebSocket, WebSocketDisconnect, Path
from sqlalchemy.orm import Session
from typing import List

from database import Base, engine, get_db
import models
import schemas
import auth
import ai
from ws import manager
import email_service
from datetime import datetime, timedelta
import secrets

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS middleware for frontend
# Allow all Vercel domains (production and preview deployments)
# Using explicit regex pattern - Starlette uses re.match() which requires ^ anchor
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ],
    allow_origin_regex=r"^https://.*\.vercel\.app$",  # Starlette uses re.match() - needs ^ anchor
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


# ---------- Auth routes ----------
@app.post("/auth/register", response_model=schemas.RegisterResponse)
def register(
    user_in: schemas.UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Register a new user - sends OTP email for verification"""
    existing = auth.get_user_by_email(db, user_in.email)
    if existing:
        # If user exists but email not verified, allow resending OTP
        if existing.email_verified is None or existing.email_verified != "True":
            # Update password and generate new OTP
            existing.hashed_password = auth.hash_password(user_in.password)
        else:
            raise HTTPException(status_code=400, detail="Email already registered")
    else:
        # Create new user with unverified email
        hashed = auth.hash_password(user_in.password)
        existing = models.User(
            email=user_in.email,
            hashed_password=hashed,
            email_verified="False"
        )
        db.add(existing)
    
    # Generate 6-digit OTP
    otp_code = f"{secrets.randbelow(900000) + 100000:06d}"
    otp_expires = datetime.utcnow() + timedelta(minutes=10)
    
    # Store OTP
    existing.otp_code = otp_code
    existing.otp_expires = otp_expires
    db.commit()
    
    # Send OTP email in background (non-blocking)
    background_tasks.add_task(email_service.send_otp_email, existing.email, otp_code)
    
    return {
        "message": "Verification code sent to your email. Please check your inbox.",
        "email": existing.email
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
    user = auth.get_user_by_email(db, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Check if email is verified (handle None for existing users before migration)
    if user.email_verified is None:
        # For existing users without email_verified field, mark as verified
        user.email_verified = "True"
        db.commit()
    elif user.email_verified != "True":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address before logging in. Check your inbox for the verification code.",
        )

    token = auth.create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/auth/forgot-password")
def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate a password reset token (in production, send via email)"""
    user = auth.get_user_by_email(db, request.email)
    if not user:
        # Don't reveal if email exists for security
        return {"message": "If that email exists, a reset link has been sent."}
    
    reset_token = auth.create_reset_token(user, db)
    # In production, send email with reset link: /reset-password?token={reset_token}
    # For now, return token in response (remove in production!)
    return {
        "message": "Reset token generated. In production, this would be sent via email.",
        "token": reset_token  # Remove this in production!
    }


@app.post("/auth/reset-password")
def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using token"""
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
        except Exception:
            pass
        
        print(f"📝 Analyzing dream text: {dream.raw_text[:50]}...")
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
            
            image_url = await ai.generate_dream_image(analysis["image_prompt"], use_free=False)
        
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
            error_msg = "OpenAI API key not configured. Please set OPENAI_API_KEY in .env file."
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
            error_msg = f"OpenAI API Error: {error_msg}. Please check your API key configuration."
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
        with get_db() as task_db:
            import asyncio
            asyncio.run(_process_dream(did, task_db, gen_img))
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
        with get_db() as task_db:
            import asyncio
            asyncio.run(_process_dream(did, task_db, generate_image=True))
    
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
    dreams_by_month = {}
    
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
        
        # Group by month
        month_key = dream.created_at.strftime("%Y-%m")
        dreams_by_month[month_key] = dreams_by_month.get(month_key, 0) + 1
    
    # Get top symbols and emotions
    symbol_counts = Counter(all_symbols)
    emotion_counts = Counter(all_emotions)
    
    top_symbols = [{"symbol": sym, "count": count} for sym, count in symbol_counts.most_common(10)]
    top_emotions = [{"emotion": emo, "count": count} for emo, count in emotion_counts.most_common(10)]
    
    # Format monthly data
    monthly_data = [{"month": month, "count": count} for month, count in sorted(dreams_by_month.items())]
    
    return {
        "total_dreams": total_dreams,
        "dreams_with_images": dreams_with_images,
        "top_symbols": top_symbols,
        "top_emotions": top_emotions,
        "dreams_by_month": monthly_data,
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
        return {
            "recurring_themes": analysis.get("recurring_themes", ""),
            "emotional_patterns": analysis.get("emotional_patterns", ""),
            "symbol_patterns": analysis.get("symbol_patterns", ""),
            "temporal_insights": analysis.get("temporal_insights", ""),
            "personal_growth": analysis.get("personal_growth", ""),
            "recommendations": analysis.get("recommendations", ""),
        }
    except Exception as e:
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

