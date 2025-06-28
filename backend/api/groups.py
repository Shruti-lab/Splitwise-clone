from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.database import get_db


router = APIRouter()

@router.post("/", response_model=schemas.Group)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    try:
        db_group = crud.create_group(db=db, group=group)
        return db_group
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/allGroups", response_model=List[schemas.Group])
def get_groups(db: Session = Depends(get_db)):
    db_groups = crud.get_all_groups(db=db)
    if db_groups is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_groups


@router.get("/{group_id}", response_model=schemas.GroupDetails)
def get_group_details_route(group_id: int, db: Session = Depends(get_db)):
    db_group = crud.get_group_details(db=db, group_id=group_id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_group

