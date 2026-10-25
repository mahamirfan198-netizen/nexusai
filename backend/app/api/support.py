from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.deps import get_current_user
from app.models import User, Product
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/api/support", tags=["support"])

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def rag_chat(req: ChatRequest):
    msg = req.message.lower()
    if "upload" in msg or "pdf" in msg or "notes" in msg:
        return {"reply": "To upload notes, go to your Education Dashboard, select a chapter, and click Upload."}
    elif "quiz" in msg or "game" in msg:
        return {"reply": "To play the AI Quiz game, upload notes to a chapter first. Then click Play Game to earn XP."}
    elif "inventory" in msg or "stock" in msg:
        return {"reply": "Manage stock in the Business Dashboard. The Action Lab will alert you when stock is low."}
    elif "teacher" in msg or "instructor" in msg or "help" in msg:
        return {"reply": "Find your instructors by clicking Help Directory in the navigation bar."}
    elif "certificate" in msg:
        return {"reply": "Go to the Education Dashboard and click Get Certificate to download your PDF."}
    else:
        return {"reply": "I am the NexusAI Help Bot. Ask me about uploading notes, playing quizzes, managing inventory, or finding instructors."}

@router.post("/portal-chat")
def portal_chat(req: ChatRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    msg = req.message.lower()
    if user.active_portal == "business":
        products = db.query(Product).filter(Product.user_id == user.id).all()
        if "value" in msg or "worth" in msg:
            total = sum(p.quantity * p.unit_cost for p in products)
            return {"reply": f"Your total inventory value is ${total:,.2f}."}
        elif "low" in msg or "reorder" in msg:
            low = [p.name for p in products if p.quantity <= p.reorder_level]
            return {"reply": f"Low stock items: {chr(44).join(low) if low else chr(78)+chr(111)+chr(110)+chr(101)}"}
        return {"reply": "As your AI Data Analyst, I can answer questions about inventory value and low stock."}
    else:
        return {"reply": "As your AI Instructor, I recommend using the 40-Minute Plan. Start with the overview, then take the quiz."}