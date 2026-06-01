from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.schemas import ProjectCreateRequest, ProjectResponse, ProjectUpdateRequest
from app.core.security import get_current_user
from app.routers.auth import MOCK_USERS

router = APIRouter()

# ---------------------------------------------------------------------------
# In-memory mock project store
# ---------------------------------------------------------------------------

MOCK_PROJECTS: list[dict] = [
    {"id": "proj-1",  "title": "냥이 점프",      "author": "코딩고양이", "authorId": "user-001", "emoji": "🐱", "likes": 234, "views": 1200, "published": True,  "description": "냥이와 함께 장애물을 피하며 달려가요!", "tags": ["게임", "냥이", "달리기"], "blocks_json": {}},
    {"id": "proj-2",  "title": "바다 탐험",      "author": "바다소녀",   "authorId": "user-002", "emoji": "🌊", "likes": 189, "views":  876, "published": True,  "description": "깊은 바다 속을 탐험해봐요!",            "tags": ["탐험", "바다"],           "blocks_json": {}},
    {"id": "proj-3",  "title": "별 수집하기",    "author": "별동이",     "authorId": "user-003", "emoji": "🌟", "likes": 312, "views": 2100, "published": True,  "description": "하늘의 별을 모두 모아봐요!",            "tags": ["별", "수집"],             "blocks_json": {}},
    {"id": "proj-4",  "title": "나비 미로",      "author": "초등코더",   "authorId": "user-004", "emoji": "🦋", "likes": 156, "views":  654, "published": True,  "description": "미로를 탈출하는 나비를 도와주세요.",     "tags": ["미로", "나비"],           "blocks_json": {}},
    {"id": "proj-5",  "title": "토끼 달리기",    "author": "토끼야",     "authorId": "user-005", "emoji": "🐰", "likes": 201, "views":  920, "published": True,  "description": "빠른 토끼를 조종해봐요!",               "tags": ["달리기", "토끼"],         "blocks_json": {}},
    {"id": "proj-6",  "title": "무지개 그림판",  "author": "색깔왕",     "authorId": "user-006", "emoji": "🌈", "likes": 278, "views": 1500, "published": True,  "description": "무지개 색으로 그림을 그려요!",          "tags": ["그림", "창작"],           "blocks_json": {}},
    {"id": "proj-7",  "title": "우주 여행",      "author": "우주선장",   "authorId": "user-007", "emoji": "🚀", "likes": 344, "views": 2800, "published": True,  "description": "우주를 누비는 모험을 떠나요!",          "tags": ["우주", "모험"],           "blocks_json": {}},
    {"id": "proj-8",  "title": "음악 연주",      "author": "피아노맨",   "authorId": "user-008", "emoji": "🎵", "likes": 198, "views":  730, "published": True,  "description": "나만의 음악을 만들어봐요!",             "tags": ["음악", "연주"],           "blocks_json": {}},
    {"id": "proj-11", "title": "냥이의 대모험",  "author": "테스트유저", "authorId": "user-test-001", "emoji": "🐱", "likes": 234, "views": 1200, "published": True,  "description": "대모험!", "tags": ["게임"],    "blocks_json": {}},
    {"id": "proj-12", "title": "바다 탐험 2",   "author": "테스트유저", "authorId": "user-test-001", "emoji": "🌊", "likes":  89, "views":  430, "published": True,  "description": "바다!", "tags": ["탐험"],     "blocks_json": {}},
    {"id": "proj-13", "title": "별 수집 (작업중)", "author": "테스트유저", "authorId": "user-test-001", "emoji": "🌟", "likes": 0, "views": 0, "published": False, "description": "", "tags": [],              "blocks_json": {}},
]


def _to_response(project: dict) -> ProjectResponse:
    """Convert a project dict to ProjectResponse."""
    return ProjectResponse(
        id=project["id"],
        title=project["title"],
        author=project["author"],
        authorId=project["authorId"],
        emoji=project["emoji"],
        likes=project["likes"],
        views=project["views"],
        published=project["published"],
        description=project["description"],
        tags=project["tags"],
        blocks_json=project.get("blocks_json", {}),
    )


# ---------------------------------------------------------------------------
# GET /projects — public project list
# ---------------------------------------------------------------------------

@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    sort: str = "latest",
    search: str = "",
) -> list[ProjectResponse]:
    """Return all published projects, optionally filtered and sorted."""
    projects = [p for p in MOCK_PROJECTS if p["published"]]

    # Apply search filter (title or author, case-insensitive)
    if search:
        search_lower = search.lower()
        projects = [
            p for p in projects
            if search_lower in p["title"].lower() or search_lower in p["author"].lower()
        ]

    # Sort
    if sort == "views":
        projects = sorted(projects, key=lambda p: p["views"], reverse=True)
    elif sort == "likes":
        projects = sorted(projects, key=lambda p: p["likes"], reverse=True)
    else:
        # latest: reverse insertion order
        projects = list(reversed(projects))

    return [_to_response(p) for p in projects]


# ---------------------------------------------------------------------------
# GET /projects/my — current user's projects (JWT required)
# IMPORTANT: must be declared BEFORE GET /projects/{id}
# ---------------------------------------------------------------------------

@router.get("/my", response_model=list[ProjectResponse])
async def list_my_projects(
    current_user: dict = Depends(get_current_user),
) -> list[ProjectResponse]:
    """Return all projects owned by the authenticated user."""
    username: str = current_user.get("sub", "")
    user = MOCK_USERS.get(username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    user_id: str = user["id"]
    projects = [p for p in MOCK_PROJECTS if p["authorId"] == user_id]
    return [_to_response(p) for p in projects]


# ---------------------------------------------------------------------------
# POST /projects — create project (JWT required)
# ---------------------------------------------------------------------------

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectCreateRequest,
    current_user: dict = Depends(get_current_user),
) -> ProjectResponse:
    """Create a new project for the authenticated user."""
    username: str = current_user.get("sub", "")
    user = MOCK_USERS.get(username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    new_project: dict = {
        "id": str(uuid4()),
        "title": body.title,
        "author": user["nickname"],
        "authorId": user["id"],
        "emoji": body.emoji,
        "likes": 0,
        "views": 0,
        "published": False,
        "description": body.description,
        "tags": body.tags,
        "blocks_json": {},
    }

    MOCK_PROJECTS.append(new_project)
    return _to_response(new_project)


# ---------------------------------------------------------------------------
# GET /projects/{id} — project detail (public)
# ---------------------------------------------------------------------------

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str) -> ProjectResponse:
    """Return details for a single project by ID."""
    project = next((p for p in MOCK_PROJECTS if p["id"] == project_id), None)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return _to_response(project)


# ---------------------------------------------------------------------------
# PUT /projects/{id} — update project (JWT required)
# ---------------------------------------------------------------------------

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    body: ProjectUpdateRequest,
    current_user: dict = Depends(get_current_user),
) -> ProjectResponse:
    """Update fields of an existing project. Only the owner may update."""
    username: str = current_user.get("sub", "")
    user = MOCK_USERS.get(username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    project = next((p for p in MOCK_PROJECTS if p["id"] == project_id), None)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if project["authorId"] != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not the project owner",
        )

    # Apply only non-None fields from request
    update_data = body.model_dump(exclude_none=True)
    project.update(update_data)

    return _to_response(project)


# ---------------------------------------------------------------------------
# DELETE /projects/{id} — delete project (JWT required)
# ---------------------------------------------------------------------------

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
) -> Response:
    """Delete a project. Only the owner may delete."""
    username: str = current_user.get("sub", "")
    user = MOCK_USERS.get(username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    project = next((p for p in MOCK_PROJECTS if p["id"] == project_id), None)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if project["authorId"] != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not the project owner",
        )

    MOCK_PROJECTS.remove(project)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
