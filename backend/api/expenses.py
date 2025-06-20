from fastapi import APIRouter, HTTPException, Depends, Path
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.ExpenseCreate)
def add_expense(
    group_id: int = Path(...),
    expense: schemas.ExpenseCreate = None,
    db: Session = Depends(get_db)
):
    try:
        return crud.create_expense(db=db, expense=expense, group_id=group_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.ExpenseResponse])
def get_expenses(group_id: int = Path(...), db: Session = Depends(get_db)):
    return crud.get_expenses_by_group(db=db, group_id=group_id)