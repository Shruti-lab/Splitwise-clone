from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from chat.chatbot import process_chat_question

router = APIRouter()

class ChatRequest(BaseModel):
    question: str
    user_id: Optional[int] = 1  # Default to user 1 (Shruti) if not specified

class ChatResponse(BaseModel):
    answer: str

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Send a message to the AI assistant and get a response.
    
    This endpoint processes natural language questions about expenses, balances,
    and other information in the database.
    
    Examples of questions:
    - "Who owes the most money in the Goa Trip group?"
    - "What expenses did I add last week?"
    - "Show me the balance details for the Dinner Club group."
    """
    try:
        # Process the question with our LangChain chatbot
        answer = await process_chat_question(request.question)
        
        return ChatResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")