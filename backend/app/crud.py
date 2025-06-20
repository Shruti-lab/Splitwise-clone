from sqlalchemy.orm import Session
from . import models, schemas
import math

# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

# Add to /Users/shrutipatil/Documents/pr/ass/backend/app/crud.py
def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(username=user.username, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Group CRUD operations
def create_group(db: Session, group: schemas.GroupCreate):
    users = db.query(models.User).filter(models.User.id.in_(group.user_ids)).all()
    
    if len(users) != len(group.user_ids):
        # Some users were not found
        raise ValueError("One or more users not found")
        
    db_group = models.Group(name=group.name, users=users)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return {
        "id": db_group.id,
        "name": db_group.name,
        "member_count": len(users)
    }


def get_all_groups(db: Session):
    groups = db.query(models.Group).all()
    result = []
    for group in groups:
        result.append({
            "id": group.id,
            "name": group.name,
            "member_count": len(group.users)
        })
    return result

def get_group(db: Session, group_id: int):
    return db.query(models.Group).filter(models.Group.id == group_id).first()

def get_group_details(db: Session, group_id: int):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        return None
        
    # Calculate total expenses for the group
    total_expenses = sum(expense.amount for expense in group.expenses)
    
    # Create group details
    return {
        "id": group.id,
            "name": group.name,
            "users": group.users,
            "total_expenses": group.total_expenses if hasattr(group, 'total_expenses') else 0,
            "member_count": len(group.users)  # Add this line
        }

# Expense CRUD operations
def create_expense(db: Session, expense: schemas.ExpenseCreate, group_id: int):
    group = get_group(db, group_id)
    if not group:
        raise ValueError("Group not found")
    
    paid_by_user = get_user(db, expense.paid_by)
    if not paid_by_user:
        raise ValueError("Payer not found")
    
    # Create expense record
    db_expense = models.Expense(
        description=expense.description,
        amount=expense.amount,
        paid_by=expense.paid_by,
        group_id=group_id,
        split_type=expense.split_type
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    
    # Calculate and create expense splits
    if expense.split_type == "equal":
        # Equal split
        per_person_amount = expense.amount / len(group.users)
        for user in group.users:
            # The payer is owed money, everyone else owes money
            split_amount = per_person_amount
            if user.id == expense.paid_by:
                split_amount = -1 * (expense.amount - per_person_amount)  # Negative amount means they're owed
            
            db_split = models.ExpenseSplit(
                expense_id=db_expense.id,
                user_id=user.id,
                amount=split_amount
            )
            db.add(db_split)
    
    elif expense.split_type == "percentage":
        # Percentage split
        if not expense.splits:
            raise ValueError("Percentage splits are required for percentage split type")
            
        total_percentage = sum(float(percentage) for percentage in expense.splits.values())
        if not math.isclose(total_percentage, 100.0, rel_tol=1e-5):
            raise ValueError(f"Split percentages must sum to 100%, got {total_percentage}%")
        
        # Calculate split amounts based on percentages
        for user_id_str, percentage in expense.splits.items():
            user_id = int(user_id_str)
            amount = (float(percentage) / 100) * expense.amount
            
            # Payer is owed money, everyone else owes money
            if user_id == expense.paid_by:
                amount = -1 * (expense.amount - amount)  # Negative means they're owed
                
            db_split = models.ExpenseSplit(
                expense_id=db_expense.id,
                user_id=user_id,
                amount=amount
            )
            db.add(db_split)
    
    db.commit()
    return db_expense

def get_expenses_by_group(db: Session, group_id: int):
    return db.query(models.Expense).filter(models.Expense.group_id == group_id).all()

# Balance calculations
def get_group_balances(db: Session, group_id: int):
    group = get_group(db, group_id)
    if not group:
        return None
    
    # Get all expense splits for this group
    splits = db.query(models.ExpenseSplit).join(
        models.Expense, models.ExpenseSplit.expense_id == models.Expense.id
    ).filter(models.Expense.group_id == group_id).all()
    
    # Calculate net balance for each user
    user_balances = {}
    for split in splits:
        user_id = split.user_id
        if user_id not in user_balances:
            user_balances[user_id] = 0
        user_balances[user_id] += split.amount
    
    # Create balance details (who owes whom)
    balance_details = []
    users = {user.id: user for user in group.users}
    
    # Users with negative balances owe money, users with positive balances are owed money
    debtors = [(user_id, -balance) for user_id, balance in user_balances.items() if balance < 0]
    creditors = [(user_id, balance) for user_id, balance in user_balances.items() if balance > 0]
    
    # Sort by amount (descending)
    debtors.sort(key=lambda x: x[1], reverse=True)
    creditors.sort(key=lambda x: x[1], reverse=True)
    
    # Match debtors with creditors
    i, j = 0, 0
    while i < len(debtors) and j < len(creditors):
        debtor_id, debt = debtors[i]
        creditor_id, credit = creditors[j]
        
        amount = min(debt, credit)
        if amount > 0.01:  # Ignore very small amounts
            balance_details.append({
                "from_user_id": debtor_id,
                "from_username": users[debtor_id].username,
                "to_user_id": creditor_id,
                "to_username": users[creditor_id].username,
                "amount": amount
            })
        
        # Update remaining amounts
        debtors[i] = (debtor_id, debt - amount)
        creditors[j] = (creditor_id, credit - amount)
        
        if math.isclose(debtors[i][1], 0, abs_tol=0.01):
            i += 1
        if math.isclose(creditors[j][1], 0, abs_tol=0.01):
            j += 1
    
    return {
        "group_id": group.id,
        "group_name": group.name,
        "balances": balance_details
    }

def get_user_balances(db: Session, user_id: int):
    user = get_user(db, user_id)
    if not user:
        return None
    
    # Get all user's groups
    groups = user.groups
    
    balances_by_group = {}
    total_balance = 0
    
    for group in groups:
        group_balances = get_group_balances(db, group.id)
        if group_balances:
            # Filter balances relevant to this user
            user_balances = [
                b for b in group_balances["balances"] 
                if b["from_user_id"] == user_id or b["to_user_id"] == user_id
            ]
            
            if user_balances:
                balances_by_group[group.name] = user_balances
                
                # Calculate impact on user's total balance
                for balance in user_balances:
                    if balance["from_user_id"] == user_id:
                        # User owes money
                        total_balance -= balance["amount"]
                    else:
                        # User is owed money
                        total_balance += balance["amount"]
    
    return {
        "user_id": user.id,
        "username": user.username,
        "balances_by_group": balances_by_group,
        "total_balance": total_balance
    }