from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.core.deps import get_current_user
from app.models import User
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfgen import canvas
import io

router = APIRouter(prefix="/api/certificate", tags=["certificate"])

@router.get("/generate")
def generate_certificate(user: User = Depends(get_current_user)):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)
    
    # Background (Navy)
    p.setFillColorRGB(0.02, 0.04, 0.06)
    p.rect(0, 0, width, height, fill=1)
    
    # Border (Teal)
    p.setStrokeColorRGB(0, 0.84, 0.56)
    p.setLineWidth(5)
    p.rect(20, 20, width-40, height-40, fill=0)
    
    # Title
    p.setFillColorRGB(1, 1, 1)
    p.setFont("Helvetica-Bold", 40)
    p.drawCentredString(width/2, height-120, "CERTIFICATE OF COMPLETION")
    
    # Text
    p.setFont("Helvetica", 20)
    p.drawCentredString(width/2, height-200, "This is proudly presented to")
    
    # Name
    p.setFillColorRGB(0, 0.84, 0.56)
    p.setFont("Helvetica-Bold", 45)
    p.drawCentredString(width/2, height-280, user.full_name)
    
    # Body
    p.setFillColorRGB(1, 1, 1)
    p.setFont("Helvetica", 18)
    p.drawCentredString(width/2, height-340, "For successfully completing the NexusAI Education Intelligence Curriculum")
    
    # Footer
    p.setFont("Helvetica", 14)
    p.drawString(100, 100, "Date: NexusAI Platform")
    p.drawString(width-250, 100, "Signed: NexusAI AI Engine")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return StreamingResponse(
        buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=NexusAI_Certificate.pdf"}
    )