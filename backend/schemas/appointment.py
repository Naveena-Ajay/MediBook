"""Pydantic schemas for appointment data."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, validator


class AppointmentBase(BaseModel):
    """Base fields for appointment operations."""

    doctor_id: int
    scheduled_at: datetime
    reason: Optional[str] = None

    @validator("reason")
    def trim_reason(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        return value.strip()


class AppointmentCreate(AppointmentBase):
    """Payload for booking a new appointment."""

    pass


class AppointmentReschedule(BaseModel):
    """Payload for rescheduling an appointment."""

    scheduled_at: datetime


class AppointmentCancel(BaseModel):
    """Payload for canceling an appointment."""

    reason: Optional[str] = None


class AppointmentPublic(BaseModel):
    """Public appointment representation."""

    id: int
    doctor_id: int
    patient_id: int
    scheduled_at: datetime
    status: str
    reason: Optional[str] = None

    class Config:
        orm_mode = True


class AppointmentDetail(AppointmentPublic):
    """Detailed appointment representation."""

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AppointmentFilter(BaseModel):
    """Filters for appointments list."""

    status: Optional[str] = None

    @validator("status")
    def validate_status(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        allowed = {"scheduled", "confirmed", "canceled", "rescheduled", "completed"}
        if value not in allowed:
            raise ValueError("invalid status filter")
        return value


class AppointmentListResponse(BaseModel):
    """List wrapper for appointment responses."""

    items: list[AppointmentPublic]


class PrescriptionCreate(BaseModel):
    """Payload for doctor to create a prescription."""

    appointment_id: int
    medication: str
    dosage: str
    instructions: str

    @validator("medication", "dosage", "instructions")
    def must_not_be_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("field must not be empty")
        return value.strip()


class PrescriptionPublic(BaseModel):
    """Public representation of prescription."""

    id: int
    appointment_id: int
    doctor_id: int
    patient_id: int
    medication: str
    dosage: str
    instructions: str
    created_at: datetime

    class Config:
        orm_mode = True


class PrescriptionListResponse(BaseModel):
    """List wrapper for prescriptions."""

    items: list[PrescriptionPublic]
