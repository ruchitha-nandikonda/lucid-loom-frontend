from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    otp_code = Column(String, nullable=True)
    otp_expires = Column(DateTime, nullable=True)
    email_verified = Column(String, default="False")  # Store as string for SQLite compatibility

    dreams = relationship("Dream", back_populates="user")


class Dream(Base):
    __tablename__ = "dreams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    raw_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="dreams")

    interpretation = relationship(
        "DreamInterpretation", back_populates="dream", uselist=False
    )


class DreamInterpretation(Base):
    __tablename__ = "dream_interpretations"

    id = Column(Integer, primary_key=True, index=True)
    poetic_narrative = Column(Text)
    meaning = Column(Text)
    symbols = Column(Text)
    emotions = Column(Text)
    image_url = Column(String)

    dream_id = Column(Integer, ForeignKey("dreams.id"))
    dream = relationship("Dream", back_populates="interpretation")

