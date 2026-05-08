# MediBook

MediBook is a full-stack Hospital Appointment Booking System built with FastAPI,
SQLite, and a vanilla HTML/CSS/JS frontend. It supports patient registration,
doctor search, appointment booking, and doctor-issued prescriptions.

## Features

- Patient registration and login with JWT authentication
- Doctor listing and specialization search
- Appointment booking, cancelation, and rescheduling
- Doctor availability slots for the next 7 days
- Doctor portal for prescriptions
- Appointment confirmation emails via SMTP

## Tech Stack

- Backend: FastAPI, SQLAlchemy, SQLite
- Frontend: HTML, CSS, Vanilla JavaScript
- Auth: JWT (HS256)

## Project Structure

- backend
  - main.py: FastAPI app and startup seed
  - database.py: SQLAlchemy engine and session
  - models: User, Appointment, Prescription
  - routes: auth, doctors, appointments, prescriptions
  - utils: JWT auth and SMTP email
  - schemas: Pydantic models
- frontend
  - index.html, login.html, dashboard.html, doctor.html, admin.html
  - js: API client, auth, dashboard, booking
  - css: shared styles

## Setup

1. Create and activate a virtual environment.
2. Install backend requirements.
3. Run the FastAPI app.
4. Open the frontend files in a browser.

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

The API will run at http://127.0.0.1:8000.

### Frontend

Open frontend/index.html in a browser. If you use a local file server, keep it
pointed at the frontend folder. The app uses CORS to call the API.

## Seed Accounts

When the app starts, it seeds demo accounts if the database is empty:

- Doctors
  - priya.menon@medibook.local / doctor123
  - arjun.rao@medibook.local / doctor123
  - aisha.khan@medibook.local / doctor123
- Patient
  - patient@medibook.local / patient123

## API Overview

### Auth

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Doctors

- GET /api/doctors
- GET /api/doctors/{doctor_id}/availability

### Appointments

- GET /api/appointments
- POST /api/appointments
- POST /api/appointments/{id}/cancel
- POST /api/appointments/{id}/reschedule

### Prescriptions

- POST /api/prescriptions
- GET /api/prescriptions/{appointment_id}

## Email Configuration

The SMTP settings are defined in backend/utils/email.py. Update the
credentials to your SMTP provider before using email notifications.

## Notes

- All times are stored and returned in UTC.
- The frontend uses native browser dialogs for rescheduling.
- Doctor availability is generated from fixed daily slots.

## Troubleshooting

- If JWT errors occur, clear localStorage and login again.
- If CORS errors occur, ensure the API is running on port 8000.
- If SQLite is locked, stop and restart the server.

## License

This project is provided for educational purposes.
