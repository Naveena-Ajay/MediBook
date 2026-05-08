"""Pydantic schemas for user data."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, validator


class UserBase(BaseModel):
    """Base fields shared across user schemas."""

    full_name: str
    email: EmailStr
    role: str
    specialization: Optional[str] = None
    bio: Optional[str] = None

    @validator("role")
    def role_must_be_valid(cls, value: str) -> str:
        if value not in {"patient", "doctor"}:
            raise ValueError("role must be 'patient' or 'doctor'")
        return value

    @validator("full_name")
    def name_must_have_content(cls, value: str) -> str:
        if len(value.strip()) < 2:
            raise ValueError("full_name must be at least 2 characters")
        return value.strip()


class UserCreate(UserBase):
    """User registration payload."""

    password: str

    @validator("password")
    def password_strength(cls, value: str) -> str:
        if len(value) < 6:
            raise ValueError("password must be at least 6 characters")
        return value


class UserLogin(BaseModel):
    """Login payload."""

    email: EmailStr
    password: str


class UserPublic(BaseModel):
    """Public user representation."""

    id: int
    full_name: str
    email: EmailStr
    role: str
    specialization: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class TokenResponse(BaseModel):
    """Response for login/register endpoints."""

    access_token: str
    token_type: str
    user: UserPublic


class DoctorFilter(BaseModel):
    """Filter input for doctor search."""

    specialization: Optional[str] = None


class DoctorPublic(BaseModel):
    """Doctor representation for lists."""

    id: int
    full_name: str
    specialization: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        orm_mode = True


class AvailabilitySlot(BaseModel):
    """Doctor availability slot."""

    datetime: str
    available: bool


class CurrentUser(BaseModel):
    """Wrapper schema for /me."""

    user: UserPublic


class UserUpdate(BaseModel):
    """Profile update payload."""

    full_name: Optional[str] = None
    bio: Optional[str] = None

    @validator("full_name")
    def validate_full_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError("full_name must be at least 2 characters")
        return cleaned
