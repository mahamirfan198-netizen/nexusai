from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models import User, Product, StockMovement, ActionLabCase
from app.core.deps import require_portal

router = APIRouter(prefix="/api/business", tags=["business"])

class ProductCreate(BaseModel):
    name: str
    sku: str
    category: str
    quantity: int
    reorder_level: int
    unit_cost: float

class ProductResponse(BaseModel):
    id: str
    name: str
    sku: str
    category: str
    quantity: int
    reorder_level: int
    unit_cost: float
    class Config: from_attributes = True

class MovementCreate(BaseModel):
    product_id: str
    quantity_change: int
    movement_type: str
    reason: str

class DashboardStats(BaseModel):
    total_products: int
    total_value: float
    low_stock_count: int
    recent_movements: list

@router.post("/products", response_model=ProductResponse)
def create_product(req: ProductCreate, db: Session = Depends(get_db), user: User = Depends(require_portal("business"))):
    prod = Product(**req.dict(), user_id=user.id)
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod

@router.get("/products", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db), user: User = Depends(require_portal("business"))):
    return db.query(Product).filter(Product.user_id == user.id).all()

@router.post("/movements")
def record_movement(req: MovementCreate, db: Session = Depends(get_db), user: User = Depends(require_portal("business"))):
    prod = db.query(Product).filter(Product.id == req.product_id, Product.user_id == user.id).first()
    if not prod: raise HTTPException(404, "Product not found")
    
    # Update stock
    prod.quantity += req.quantity_change
    if prod.quantity < 0: raise HTTPException(400, "Stock cannot go below zero")
    
    movement = StockMovement(
        product_id=prod.id, user_id=user.id, 
        quantity_change=req.quantity_change, 
        movement_type=req.movement_type, reason=req.reason
    )
    db.add(movement)
    
    # Action Lab: Detect Low Stock
    if prod.quantity <= prod.reorder_level:
        existing_case = db.query(ActionLabCase).filter(ActionLabCase.product_id == prod.id, ActionLabCase.status == "Pending Approval").first()
        if not existing_case:
            case = ActionLabCase(
                product_id=prod.id, user_id=user.id,
                issue=f"Stock is low ({prod.quantity} remaining)",
                recommendation=f"Reorder at least {prod.reorder_level * 2} units immediately."
            )
            db.add(case)

    db.commit()
    return {"status": "success", "new_quantity": prod.quantity}

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db), user: User = Depends(require_portal("business"))):
    products = db.query(Product).filter(Product.user_id == user.id).all()
    total_value = sum(p.quantity * p.unit_cost for p in products)
    low_stock = len([p for p in products if p.quantity <= p.reorder_level])
    
    movements = db.query(StockMovement).filter(StockMovement.user_id == user.id).order_by(StockMovement.created_at.desc()).limit(5).all()
    recent = []
    for m in movements:
        p = db.query(Product).filter(Product.id == m.product_id).first()
        recent.append({
            "id": m.id, "product": p.name if p else "Unknown",
            "change": m.quantity_change, "type": m.movement_type, "date": m.created_at.strftime("%Y-%m-%d")
        })
        
    return {"total_products": len(products), "total_value": total_value, "low_stock_count": low_stock, "recent_movements": recent}

@router.get("/action-lab")
def get_action_lab(db: Session = Depends(get_db), user: User = Depends(require_portal("business"))):
    cases = db.query(ActionLabCase).filter(ActionLabCase.user_id == user.id, ActionLabCase.status == "Pending Approval").all()
    results = []
    for c in cases:
        p = db.query(Product).filter(Product.id == c.product_id).first()
        results.append({"id": c.id, "product": p.name if p else "Unknown", "issue": c.issue, "recommendation": c.recommendation})
    return results

@router.post("/action-lab/{case_id}/approve")
def approve_action(case_id: str, db: Session = Depends(get_db), user: User = Depends(require_portal("business"))):
    case = db.query(ActionLabCase).filter(ActionLabCase.id == case_id, ActionLabCase.user_id == user.id).first()
    if not case: raise HTTPException(404, "Case not found")
    
    case.status = "Approved"
    # Auto-execute the reorder
    prod = db.query(Product).filter(Product.id == case.product_id).first()
    if prod:
        reorder_qty = prod.reorder_level * 2
        prod.quantity += reorder_qty
        movement = StockMovement(
            product_id=prod.id, user_id=user.id, 
            quantity_change=reorder_qty, 
            movement_type="IN", reason="Action Lab Auto-Reorder"
        )
        db.add(movement)
    db.commit()
    return {"status": "Approved and stock updated"}

class ChatRequest(BaseModel):
    message: str

@router.post("/assistant/chat")
def ask_assistant(req: ChatRequest, db: Session = Depends(get_db), user: User = Depends(require_portal("business"))):
    msg = req.message.lower()
    products = db.query(Product).filter(Product.user_id == user.id).all()
    
    # Simple Intent Detection Fallback
    if "low stock" in msg or "reorder" in msg:
        low = [p for p in products if p.quantity <= p.reorder_level]
        if not low:
            return {"reply": "Good news! None of your products are currently below their reorder level."}
        items = ", ".join([f"{p.name} ({p.quantity} left)" for p in low])
        return {"reply": f"You have {len(low)} product(s) low on stock: {items}. I recommend approving a reorder in the Action Lab."}
        
    elif "value" in msg or "worth" in msg or "total" in msg:
        total = sum(p.quantity * p.unit_cost for p in products)
        return {"reply": f"Your total current inventory value is ${total:,.2f} across {len(products)} products."}
        
    elif "how many" in msg or "count" in msg:
        return {"reply": f"You currently have {len(products)} distinct products registered in your inventory."}
        
    elif "out of stock" in msg or "zero" in msg:
        zero = [p.name for p in products if p.quantity == 0]
        if not zero:
            return {"reply": "You have no products that are completely out of stock."}
        return {"reply": f"The following products are out of stock: {', '.join(zero)}."}
        
    else:
        return {"reply": "I can answer questions like: 'What products are low on stock?', 'What is my total inventory value?', or 'How many products do I have?'"}