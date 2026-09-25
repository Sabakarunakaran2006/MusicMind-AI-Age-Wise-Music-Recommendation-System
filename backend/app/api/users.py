from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, UserPreference
from app.schemas.schemas import UserResponse, UserUpdateRequest, UserPreferenceUpdate, UserPreferenceResponse
from app.api.deps import get_current_user
from app.api.auth import format_user_response
from app.core.security import hash_password
from app.ml.age_detector import age_detector

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return format_user_response(current_user, db)

@router.put("/me", response_model=UserResponse)
def update_user_profile(
    req: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if req.name is not None and req.name.strip():
        current_user.name = req.name.strip()
    if req.age is not None:
        current_user.age = req.age
    if req.password is not None and len(req.password) >= 6:
        current_user.password_hash = hash_password(req.password)

    db.commit()
    db.refresh(current_user)
    return format_user_response(current_user, db)

@router.put("/me/preferences", response_model=UserPreferenceResponse)
def update_user_preferences(
    req: UserPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = current_user.preference
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)

    if req.preferred_genres is not None:
        pref.preferred_genres = req.preferred_genres
    if req.preferred_language is not None:
        pref.preferred_language = req.preferred_language
    if req.mood is not None:
        pref.mood = req.mood
    if req.listening_purpose is not None:
        pref.listening_purpose = req.listening_purpose
    if req.explicit_content is not None:
        pref.explicit_content = req.explicit_content

    db.commit()
    db.refresh(pref)

    return UserPreferenceResponse(
        preferred_genres=pref.preferred_genres,
        preferred_language=pref.preferred_language,
        mood=pref.mood,
        listening_purpose=pref.listening_purpose,
        explicit_content=pref.explicit_content,
        updated_at=pref.updated_at
    )

@router.delete("/me", status_code=status.HTTP_200_OK)
def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.delete(current_user)
    db.commit()
    return {"message": "User account and all associated data permanently deleted."}

@router.post("/me/estimate-age")
async def estimate_age_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    contents = await file.read()
    result = age_detector.estimate_age_from_image(contents, file.filename or "")
    return result
