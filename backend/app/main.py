from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from app.config import get_settings
from app.database import Base, engine
from app.api import auth, users, education, business, support, certificate

settings = get_settings()
app = FastAPI(title="NexusAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
# Auto-seed demo data for Vercel
from app.database import SessionLocal
from app.models import User
from app.core.security import hash_password
db = SessionLocal()
if not db.query(User).first():
    db.add(User(email="demo_education@nexusai.com", hashed_password=hash_password("demo1234"), full_name="Demo Education User", roles="student", active_portal="education"))
    db.add(User(email="demo_business@nexusai.com", hashed_password=hash_password("demo1234"), full_name="Demo Business User", roles="business_manager", active_portal="business"))
    db.add(User(email="demo_instructor@nexusai.com", hashed_password=hash_password("demo1234"), full_name="Demo Instructor User", roles="teacher,education_admin", active_portal="education"))
    db.commit()
db.close()

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(education.router)
app.include_router(business.router)
app.include_router(support.router)
app.include_router(certificate.router)

@app.get("/api/health")
def health():
    return {"status": "ok"}