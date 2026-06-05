import os

from fastapi import APIRouter, Depends, HTTPException, status
from openai import OpenAI

from app.core.security import get_current_user

router = APIRouter()


@router.post("/token")
async def get_voice_token(current_user: dict = Depends(get_current_user)) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OPENAI_API_KEY not configured",
        )
    client = OpenAI(api_key=api_key)
    session = client.beta.realtime.sessions.create(
        model="gpt-4o-realtime-preview-2024-12-17",
    )
    return {"client_secret": session.client_secret.value}
