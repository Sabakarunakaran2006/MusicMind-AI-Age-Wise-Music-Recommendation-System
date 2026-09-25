from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, UserPreference
from app.schemas.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.api.deps import get_current_user
from app.ml.recommender import recommender_engine

router = APIRouter(prefix="/auth", tags=["Authentication"])

def format_user_response(user: User, db: Session) -> UserResponse:
    age_group, _ = recommender_engine.get_age_group_for_age(user.age, db)
    pref_data = None
    if user.preference:
        pref_data = {
            "preferred_genres": user.preference.preferred_genres,
            "preferred_language": user.preference.preferred_language,
            "mood": user.preference.mood,
            "listening_purpose": user.preference.listening_purpose,
            "explicit_content": user.preference.explicit_content,
            "updated_at": user.preference.updated_at
        }
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        age=user.age,
        age_group=age_group,
        is_active=user.is_active,
        created_at=user.created_at,
        preference=pref_data
    )

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email is already taken
    existing = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Security: Always force role to listener for public registration
    hashed = hash_password(req.password)
    user = User(
        name=req.name.strip(),
        email=req.email.lower().strip(),
        password_hash=hashed,
        role="listener",
        age=req.age,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create associated preferences
    user_pref = UserPreference(
        user_id=user.id,
        preferred_language=req.preferred_language or "English",
        mood="Energetic",
        listening_purpose="Relaxation",
        explicit_content=False
    )
    if req.preferred_genres:
        user_pref.preferred_genres = req.preferred_genres

    db.add(user_pref)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=format_user_response(user, db)
    )

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended. Please contact the administrator.",
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=format_user_response(user, db)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return format_user_response(current_user, db)

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Logged out successfully", "user_id": current_user.id}
