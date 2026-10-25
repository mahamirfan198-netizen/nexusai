import enum
import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Enum, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    EDUCATION_ADMIN = "education_admin"
    INVENTORY_OPERATOR = "inventory_operator"
    BUSINESS_MANAGER = "business_manager"
    BUSINESS_ADMIN = "business_admin"
    PLATFORM_ADMIN = "platform_admin"

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    roles: Mapped[str] = mapped_column(String(255), default="student", nullable=False) # Comma separated roles
    active_portal: Mapped[str] = mapped_column(String(50), default="education", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    organization_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    @property
    def role_list(self) -> list[str]:
        return [r.strip() for r in self.roles.split(",")]

    @property
    def portal(self) -> str:
        return self.active_portal