import random
import io
from pypdf import PdfReader

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    text = ""
    if filename.lower().endswith(".pdf"):
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                text += page.extract_text() + "\n"
        except Exception as e:
            text = f"Error parsing PDF: {str(e)}"
    elif filename.lower().endswith(".txt"):
        text = file_bytes.decode("utf-8", errors="ignore")
    else:
        text = f"Mock text for {filename}. This platform supports .pdf and .txt for real extraction."
    return text.strip()

def generate_40_min_plan(text: str, chapter_title: str) -> dict:
    return {
        "chapter": chapter_title,
        "minutes_0_5": "Overview: Read the learning objectives and skim the chapter headings.",
        "minutes_5_15": "Deep Dive: Review the core definitions and formulas extracted from your notes.",
        "minutes_15_25": "Practice: Take the Basic Quiz to test your fundamental understanding.",
        "minutes_25_35": "Challenge: Attempt the Main Quiz for board-style application questions.",
        "minutes_35_40": "Review: Check your mistakes, review the explanations, and note weak topics."
    }

def generate_quiz_fallback(text: str) -> list:
    questions = []
    sentences = [s.strip() for s in text.replace('\n', ' ').split('.') if len(s.strip()) > 20]
    
    if not sentences:
        sentences = ["This is a sample question generated because the document was empty or too short."]

    for i, sentence in enumerate(sentences[:10]): 
        words = sentence.split()
        if len(words) < 5: continue
        
        target_word = words[len(words) // 2].strip(",.!?()")
        question_text = sentence.replace(target_word, "________", 1)
        
        # Generate fake wrong options (distractors)
        distractors = [w.strip(",.!?()") for w in words if w.lower() != target_word.lower() and len(w) > 3]
        wrong_options = random.sample(distractors, min(3, len(distractors))) if len(distractors) >= 3 else ["Option A", "Option B", "Option C"]
        
        options = [target_word] + wrong_options
        random.shuffle(options)
        
        questions.append({
            "type": "multiple_choice",
            "text": question_text,
            "correct_answer": target_word,
            "options": options,
            "explanation": f"The original sentence was: '{sentence}'",
            "difficulty": "Medium" if i % 2 == 0 else "Hard",
            "marks": 2 if i % 2 == 0 else 5
        })
        
        is_true = random.choice([True, False])
        tf_text = sentence if is_true else sentence.replace(target_word, "something_else")
        questions.append({
            "type": "true_false",
            "text": f"True or False: {tf_text}",
            "correct_answer": "True" if is_true else "False",
            "options": ["True", "False"],
            "explanation": f"Derived directly from the text: '{sentence}'",
            "difficulty": "Easy",
            "marks": 1
        })

    return questions[:5]