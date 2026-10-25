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

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(education.router)
app.include_router(business.router)
app.include_router(support.router)
app.include_router(certificate.router)

@app.get("/api/health")
def health():
    return {"status": "ok"}