from fastapi import APIRouter, Depends

from app.core.deps import require_portal
from app.models import User

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/education/hello")
def edu_hello(user: User = Depends(require_portal("education"))):
    return {"message": f"Hello {user.full_name}, you are in the Education portal."}


@router.get("/business/hello")
def biz_hello(user: User = Depends(require_portal("business"))):
    return {"message": f"Hello {user.full_name}, you are in the Business portal."}
