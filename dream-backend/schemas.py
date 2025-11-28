from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


# ---------- Auth ----------
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    class Config:
        from_attributes = True


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyResetOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class DeleteAccountRequest(BaseModel):
    password: str


class RegisterResponse(BaseModel):
    message: str
    email: EmailStr
    otp_sent: bool = False


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str


class ResendOTPRequest(BaseModel):
    email: EmailStr


# ---------- Dreams ----------
class DreamCreate(BaseModel):
    title: str
    raw_text: str
    generate_image: bool = False  # Default to False to save money (images cost $0.04 with DALL-E 3)


class DreamUpdate(BaseModel):
    title: Optional[str] = None
    raw_text: Optional[str] = None


class DreamInterpretationOut(BaseModel):
    poetic_narrative: Optional[str]
    meaning: Optional[str]
    symbols: Optional[str]
    emotions: Optional[str]
    image_url: Optional[str]

    class Config:
        from_attributes = True


class DreamOut(BaseModel):
    id: int
    title: str
    raw_text: str
    created_at: datetime
    interpretation: Optional[DreamInterpretationOut]

    class Config:
        from_attributes = True


class DreamRewriteRequest(BaseModel):
    style: str


class DreamRewriteResponse(BaseModel):
    rewritten_narrative: str
    style: str


class SymbolExplanationResponse(BaseModel):
    symbol: str
    general_meaning: str
    psychological: str
    cultural: str
    personal_context: str


# ---------- Analytics ----------
class AnalyticsSummary(BaseModel):
    total_dreams: int
    dreams_with_images: int
    top_symbols: List[dict]
    top_emotions: List[dict]
    dreams_with_dates: List[dict]  # Changed from dreams_by_day - contains created_at ISO strings


class PatternAnalysisResponse(BaseModel):
    recurring_themes: str
    emotional_patterns: str
    symbol_patterns: str
    temporal_insights: str
    personal_growth: str
    recommendations: str

