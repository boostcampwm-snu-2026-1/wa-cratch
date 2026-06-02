from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.schemas import FollowResponse, FollowingUserResponse
from app.core.security import get_current_user
from app.database import get_db
from app.services import auth_service
from app.models.follow import Follow
from app.models.project import Project
from app.models.user import User

router = APIRouter()


@router.post("/{user_id}/follow", response_model=FollowResponse)
async def follow_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FollowResponse:
    username: str = current_user.get("sub", "")
    user = auth_service.get_user_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    if user.id == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot follow yourself")

    target_user = db.query(User).filter(User.id == user_id).first()
    if target_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing_follow = db.query(Follow).filter(
        Follow.follower_id == user.id,
        Follow.followee_id == user_id,
    ).first()

    if existing_follow:
        return FollowResponse(following=True)

    new_follow = Follow(follower_id=user.id, followee_id=user_id)
    db.add(new_follow)
    db.commit()
    return FollowResponse(following=True)


@router.delete("/{user_id}/follow", status_code=status.HTTP_204_NO_CONTENT)
async def unfollow_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    username: str = current_user.get("sub", "")
    user = auth_service.get_user_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    existing_follow = db.query(Follow).filter(
        Follow.follower_id == user.id,
        Follow.followee_id == user_id,
    ).first()

    if existing_follow:
        db.delete(existing_follow)
        db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me/following", response_model=list[FollowingUserResponse])
async def list_following(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[FollowingUserResponse]:
    username: str = current_user.get("sub", "")
    user = auth_service.get_user_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    follows = db.query(Follow).filter(Follow.follower_id == user.id).all()

    result = []
    for follow in follows:
        followee = db.query(User).filter(User.id == follow.followee_id).first()
        if followee is None:
            continue
        project_count = (
            db.query(Project)
            .filter(Project.user_id == followee.id, Project.published == True)  # noqa: E712
            .count()
        )
        result.append(
            FollowingUserResponse(
                id=followee.id,
                nickname=followee.nickname,
                avatar=followee.avatar,
                projectCount=project_count,
            )
        )

    return result
