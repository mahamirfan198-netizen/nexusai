from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, AuditLog
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=201)
def register(req: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    
    portal = "education" if req.role.value in ["student", "teacher", "education_admin"] else "business"
    
    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        roles=req.role.value,
        active_portal=portal
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account disabled")
    token = create_access_token(user.id, user.roles)
    return TokenResponse(access_token=token)

@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return user

class SwitchPortalRequest(BaseModel):
    portal: str

@router.post("/switch-portal")
def switch_portal(req: SwitchPortalRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if req.portal not in ["education", "business"]:
        raise HTTPException(400, "Invalid portal")
    user.active_portal = req.portal
    if req.portal == "business" and "business_manager" not in user.role_list:
        user.roles += ",business_manager"
    if req.portal == "education" and "student" not in user.role_list:
        user.roles += ",student"
    db.commit()
    return {"status": "switched", "portal": req.portal}

class DemoLoginRequest(BaseModel):
    portal: str = "education"

@router.post("/demo-login", response_model=TokenResponse)
def demo_login(req: DemoLoginRequest, db: Session = Depends(get_db)):
    role_map = {"education": "student", "business": "business_manager", "instructor": "teacher"}
    portal = req.portal if req.portal in role_map else "education"
    role = role_map[portal]
    email = f"demo_{portal}@nexusai.com"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            hashed_password=hash_password("demo1234"),
            full_name=f"Demo {portal.capitalize()} User",
            roles=role,
            active_portal="education" if portal == "instructor" else portal
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    token = create_access_token(user.id, user.roles)
    return TokenResponse(access_token=token)