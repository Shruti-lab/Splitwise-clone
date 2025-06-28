import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Added the parent directory to the path so we can import the api module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Now we can import modules from the parent directory
from app.database import Base, engine
from api import groups, expenses, balances, users, chat

app = FastAPI()

# Create the database tables
Base.metadata.create_all(bind=engine)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://frontend:5173"],  # For development, in production specify your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI application!"}

# Include API routers
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(groups.router, prefix="/groups", tags=["groups"])
app.include_router(expenses.router, prefix="/groups/{group_id}/expenses", tags=["expenses"])
app.include_router(balances.router, tags=["balances"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])  