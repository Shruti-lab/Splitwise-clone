from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    # groups: List[int] = []  # List of group IDs the user belongs to

    class Config:
        orm_mode = True

# group schemas
class GroupCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    user_ids: List[int] = Field(..., description="List of user IDs to add to the group")
    total_expenses: float = 0.0  # Default to 0.0 if not provided

class Group(BaseModel):
    id: int
    name: str
    member_count: int  # Adding member count to the schema
    class Config:
        orm_mode = True

class GroupDetails(Group):
    users: List[User]
    total_expenses: float

    class Config:
        orm_mode = True



# class GroupCreate(BaseModel):
#     id: int
#     name: str = Field(..., min_length=1, max_length=100)
#     user_ids: List[int] = Field(..., description="List of user IDs to add to the group")
#     total_expenses: float
    
# class GroupBase(BaseModel):
#     id: int
#     name: str = Field(..., min_length=1, max_length=100)
#     users: List[UserBase] = []
#     total_expenses: float


# Schemas for Expense Management
class ExpenseCreate(BaseModel):
    description: str
    amount: float
    paid_by: int
    split_type: str  # 'equal' or 'percentage'
    # splits: Optional[Dict[int, float]]  # user_id to amount or percentage

class ExpenseResponse(BaseModel):
    id: int
    description: str
    amount: float
    paid_by: int
    split_type: str
    # splits: Dict[int, float]
    group_id : int
    class Config:
        orm_mode = True

# balance schemas
class Balance(BaseModel):
    user_id: int
    username: str
    amount: float # Positive means the user is owed money, negative means the user owes money

class BalanceDetail(BaseModel):
    from_user_id: int
    from_username: str
    to_user_id: int
    to_username: str
    amount: float

class BalanceResponse(BaseModel):
    group_id: int
    group_name: str
    balances: List[BalanceDetail]

class UserBalanceResponse(BaseModel):
    user_id: int
    username: str
    balances_by_group: Dict[str, List[BalanceDetail]]  # group_name to balances
    total_balance: float

