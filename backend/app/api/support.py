from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from app.core.deps import get_current_user, require_portal
from app.models import User, Product, StockMovement
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/api/support", tags=["support"])

# Massive Knowledge Base
KNOWLEDGE_BASE = [
    "To upload notes, go to your Education Dashboard, select a subject, then a chapter, and click the Upload button. We support PDF and TXT files.",
    "To play the AI Quiz game, upload notes to a chapter first. Then click the Play Game button next to that chapter. You will earn XP and streaks for correct answers.",
    "The 40-Minute Smart Chapter Plan is generated automatically after you upload notes. It breaks your study session into 5-minute overviews, 10-minute deep dives, and practice quizzes.",
    "To manage inventory, go to the Business Dashboard. You can add products, set reorder levels, and record stock movements (IN or OUT).",
    "The Action Lab automatically detects when a product is low on stock. It generates a recommendation to reorder. You must click Approve Reorder to execute it.",
    "To find an instructor or business manager, click on the Help Directory link in the navigation bar. You can search by name or role and find their email and phone number.",
    "If you forget your password, please contact the platform administrator or your assigned instructor via the Help Directory.",
    "The platform is free for students. Business managers get a 14-day free trial of the Pro inventory tier.",
    "NexusAI uses evidence-based AI. We do not guess. For business, we use actual stock ledgers. For education, we use verified past-paper evidence.",
    "To switch between the Education and Business portals, click the Switch Portal button in the top right header of your dashboard.",
    "To generate your certificate, go to the Education Dashboard and click the Get Certificate button. It will download a PDF.",
    "To view your analytics, click on the View Analytics link in the Education header. It shows your XP progression and subject mastery.",
    "If you are a teacher, you can view the class leaderboard by going to the Instructor Workspace. It shows student scores and class averages.",
]

print("Loading Global RAG Model...")
model = SentenceTransformer("all-MiniLM-L6-v2")
kb_embeddings = model.encode(KNOWLEDGE_BASE)

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def rag_chat(req: ChatRequest):
    query_embedding = model.encode([req.message.strip()])
    similarities = cosine_similarity(query_embedding, kb_embeddings)[0]
    best_match_idx = int(np.argmax(similarities))
    
    if float(similarities[best_match_idx]) < 0.35:
        return {"reply": "I am not sure about that. I can help with uploading notes, playing quizzes, managing inventory, and finding instructors."}
    return {"reply": KNOWLEDGE_BASE[best_match_idx]}

@router.post("/portal-chat")
def portal_chat(req: ChatRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    msg = req.message.lower()
    
    if user.active_portal == "business":
        products = db.query(Product).filter(Product.user_id == user.id).all()
        if "low stock" in msg or "reorder" in msg:
            low = [p for p in products if p.quantity <= p.reorder_level]
            if not low: return {"reply": "All products are currently above their reorder levels."}
            return {"reply": f"You have {len(low)} low-stock items: " + ", ".join([f"{p.name} ({p.quantity})" for p in low])}
        elif "value" in msg or "worth" in msg:
            total = sum(p.quantity * p.unit_cost for p in products)
            return {"reply": f"Your total inventory value is ${total:,.2f}."}
        else:
            return {"reply": f"Hello {user.full_name}, as your AI Data Analyst, I can answer questions about your inventory value and low-stock items."}
    
    else:
        if "quiz" in msg or "study" in msg:
            return {"reply": "As your AI Instructor, I recommend using the 40-Minute Plan. Start with the overview, then take the basic quiz to test your knowledge."}
        elif "xp" in msg or "score" in msg:
            return {"reply": "You earn 10 XP for every correct answer. If you get a 3x streak, you earn bonus XP! Check your Analytics page for details."}
        else:
            return {"reply": f"Hello {user.full_name}, as your AI Instructor, I can help you study, understand quizzes, and plan your revision."}