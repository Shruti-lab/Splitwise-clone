from sqlalchemy import Column, Integer, String, ForeignKey, Table, Float
from sqlalchemy.orm import relationship
from app.database import Base

# Association table for many-to-many relationship between users and groups
group_users = Table(
    'group_users',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('group_id', Integer, ForeignKey('groups.id'), primary_key=True)
)


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    email = Column(String, unique=True, index=True)

    expenses = relationship("Expense", back_populates="user")
    groups = relationship("Group", secondary="group_users", back_populates="users")
    expense_splits = relationship("ExpenseSplit", back_populates="user")  # Add this line



class Expense(Base):
    __tablename__ = 'expenses'

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True)
    amount = Column(Integer)
    paid_by = Column(Integer, ForeignKey('users.id'))
    group_id = Column(Integer, ForeignKey('groups.id'))
    split_type = Column(String)  # 'equal' or 'percentage'


    user = relationship("User", back_populates="expenses")
    group = relationship("Group", back_populates="expenses")
    splits = relationship("ExpenseSplit", back_populates="expense")  # Add this line



class Group(Base):
    __tablename__ = 'groups'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

    users = relationship("User", secondary="group_users", back_populates="groups")
    expenses = relationship("Expense", back_populates="group")



class ExpenseSplit(Base):
    __tablename__ = "expense_splits"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)  # Positive means owes, negative means is owed

    expense = relationship("Expense", back_populates="splits")
    user = relationship("User", back_populates="expense_splits")