from fastapi import APIRouter, Depends

from app.schemas import ActivityResponse
from app.core.security import get_current_user

router = APIRouter()

# ---------------------------------------------------------------------------
# Mock activity data
# ---------------------------------------------------------------------------

MOCK_ACTIVITIES: list[dict] = [
    {
        "type": "like",
        "icon": "❤️",
        "actor": "별동이",
        "projectTitle": "냥이의 대모험",
        "text": "별동이님이 \"냥이의 대모험\"을 좋아해요!",
        "time": "10분 전",
    },
    {
        "type": "view",
        "icon": "👁️",
        "actor": "바다소녀",
        "projectTitle": "바다 탐험",
        "text": "바다소녀님이 \"바다 탐험\"을 봤어요",
        "time": "1시간 전",
    },
    {
        "type": "like",
        "icon": "❤️",
        "actor": "우주선장",
        "projectTitle": "나비 미로",
        "text": "우주선장님이 \"나비 미로\"를 좋아해요!",
        "time": "어제",
    },
]


# ---------------------------------------------------------------------------
# GET /activity — returns activity list (JWT required)
# ---------------------------------------------------------------------------

@router.get("", response_model=list[ActivityResponse])
async def get_activities(current_user: dict = Depends(get_current_user)) -> list[ActivityResponse]:
    """Return the activity list for the current user."""
    return [ActivityResponse(**activity) for activity in MOCK_ACTIVITIES]
