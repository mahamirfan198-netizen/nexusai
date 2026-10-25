from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models import User, Subject, Chapter, Document, Quiz, Question
from app.core.deps import require_portal
from app.core.ai_engine import extract_text_from_file, generate_40_min_plan, generate_quiz_fallback

router = APIRouter(prefix="/api/education", tags=["education"])

class SubjectCreate(BaseModel):
    name: str
class SubjectResponse(BaseModel):
    id: str
    name: str
    created_at: datetime
    class Config: from_attributes = True

class ChapterCreate(BaseModel):
    title: str
    subject_id: str
class ChapterResponse(BaseModel):
    id: str
    title: str
    subject_id: str
    class Config: from_attributes = True

class QuestionResponse(BaseModel):
    id: str
    text: str
    question_type: str
    correct_answer: str
    options: list
    explanation: str
    class Config: from_attributes = True

class DocumentResponse(BaseModel):
    id: str
    filename: str
    status: str
    chapter_id: str | None
    plan: dict | None = None
    class Config: from_attributes = True

@router.post("/subjects", response_model=SubjectResponse)
def create_subject(req: SubjectCreate, db: Session = Depends(get_db), user: User = Depends(require_portal("education"))):
    subject = Subject(name=req.name, user_id=user.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject

@router.get("/subjects", response_model=List[SubjectResponse])
def get_subjects(db: Session = Depends(get_db), user: User = Depends(require_portal("education"))):
    return db.query(Subject).filter(Subject.user_id == user.id).all()

@router.post("/chapters", response_model=ChapterResponse)
def create_chapter(req: ChapterCreate, db: Session = Depends(get_db), user: User = Depends(require_portal("education"))):
    subj = db.query(Subject).filter(Subject.id == req.subject_id, Subject.user_id == user.id).first()
    if not subj: raise HTTPException(403, "Subject not found or unauthorized")
    chapter = Chapter(title=req.title, subject_id=req.subject_id)
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter

@router.get("/chapters/{subject_id}", response_model=List[ChapterResponse])
def get_chapters(subject_id: str, db: Session = Depends(get_db), user: User = Depends(require_portal("education"))):
    return db.query(Chapter).filter(Chapter.subject_id == subject_id).all()

@router.post("/documents/upload", response_model=DocumentResponse)
def upload_document(
    file: UploadFile = File(...),
    chapter_id: str = Form(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_portal("education"))
):
    chap = db.query(Chapter).join(Subject).filter(Chapter.id == chapter_id, Subject.user_id == user.id).first()
    if not chap: raise HTTPException(403, "Chapter not found or unauthorized")

    file_bytes = file.file.read()
    extracted_text = extract_text_from_file(file_bytes, file.filename)
    plan = generate_40_min_plan(extracted_text, chap.title)
    generated_qs = generate_quiz_fallback(extracted_text)
    
    doc = Document(
        filename=file.filename,
        extracted_text=extracted_text,
        status="Ready",
        user_id=user.id,
        chapter_id=chapter_id
    )
    db.add(doc)
    db.commit()
    
    quiz = Quiz(chapter_id=chapter_id, title=f"Auto-Quiz for {chap.title}")
    db.add(quiz)
    db.commit()
    
    for q in generated_qs:
        new_q = Question(
            quiz_id=quiz.id,
            text=q["text"],
            question_type=q["type"],
            correct_answer=q["correct_answer"],
            options=q.get("options", []),
            explanation=q["explanation"],
            difficulty=q["difficulty"],
            marks=q["marks"]
        )
        db.add(new_q)
    db.commit()
    db.refresh(doc)
    
    return {
        "id": doc.id,
        "filename": doc.filename,
        "status": doc.status,
        "chapter_id": doc.chapter_id,
        "plan": plan
    }

@router.get("/chapters/{chapter_id}/quiz", response_model=List[QuestionResponse])
def get_quiz(chapter_id: str, db: Session = Depends(get_db), user: User = Depends(require_portal("education"))):
    quiz = db.query(Quiz).filter(Quiz.chapter_id == chapter_id).first()
    if not quiz: return []
    return db.query(Question).filter(Question.quiz_id == quiz.id).all()

class AttemptSubmit(BaseModel):
    chapter_id: str
    score: int
    max_score: int
    answers: list[dict]

@router.post("/attempts")
def save_attempt(req: AttemptSubmit, db: Session = Depends(get_db), user: User = Depends(require_portal("education"))):
    attempt = QuizAttempt(
        user_id=user.id,
        chapter_id=req.chapter_id,
        score=req.score,
        max_score=req.max_score
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    for ans in req.answers:
        new_ans = AttemptAnswer(
            attempt_id=attempt.id,
            question_id=ans["question_id"],
            selected_answer=ans["selected_answer"],
            is_correct=ans["is_correct"]
        )
        db.add(new_ans)
    db.commit()
    return {"status": "saved", "attempt_id": attempt.id}

class LeaderboardEntry(BaseModel):
    user_name: str
    chapter_title: str
    score: int
    max_score: int
    date: str

@router.get("/teacher/leaderboard", response_model=list[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db), user: User = Depends(require_portal("education"))):
    if user.role.value not in ["teacher", "education_admin", "platform_admin"]:
        raise HTTPException(403, "Only teachers can view the leaderboard")
        
    attempts = db.query(QuizAttempt).order_by(QuizAttempt.created_at.desc()).limit(50).all()
    
    results = []
    for a in attempts:
        student = db.query(User).filter(User.id == a.user_id).first()
        chapter = db.query(Chapter).filter(Chapter.id == a.chapter_id).first()
        if student and chapter:
            results.append({
                "user_name": student.full_name,
                "chapter_title": chapter.title,
                "score": a.score,
                "max_score": a.max_score,
                "date": a.created_at.strftime("%Y-%m-%d %H:%M")
            })
    return results