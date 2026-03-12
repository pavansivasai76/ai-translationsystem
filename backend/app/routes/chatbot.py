"""
TranslateAI Pro — Chatbot Routes
AI assistant for interactive translation and text analysis.
"""

from fastapi import APIRouter, Depends
from ..models import User
from ..schemas import ChatMessage, ChatResponse
from ..auth.dependencies import get_current_user
from ..services.chatbot import process_message

router = APIRouter(prefix="/api/chatbot", tags=["AI Chatbot"])


@router.post("/message", response_model=ChatResponse)
async def chat(
    message: ChatMessage,
    current_user: User = Depends(get_current_user),
):
    """Process a chatbot message and return a response."""
    result = process_message(message.message)
    return ChatResponse(
        reply=result["reply"],
        action_performed=result.get("action_performed"),
        translation_result=result.get("translation_result"),
    )
