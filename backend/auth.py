from datetime import datetime, timedelta
from typing import Optional
import uuid
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, validator
import os
from dotenv import load_dotenv

# Load .env FIRST — must happen before os.getenv("SECRET_KEY") is read,
# regardless of what order Python imports this module.
load_dotenv()

from database import get_db
import models
from schemas import UserCreate, UserResponse, EmployeeCreate
from email_service import send_reset_email

# ---------------------------------------------------------------------------
# Startup validation — fail hard if SECRET_KEY is not set
# ---------------------------------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY environment variable is not set! "
        "Add it to your backend/.env file."
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter(prefix="/auth", tags=["authentication"])

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# ---------------------------------------------------------------------------
# In-memory rate limiting (simple per-IP counter; replace with Redis in prod)
# ---------------------------------------------------------------------------
from collections import defaultdict
import time as _time

_rate_store: dict = defaultdict(list)

def _check_rate_limit(ip: str, max_calls: int, window_seconds: int):
    now = _time.time()
    _rate_store[ip] = [t for t in _rate_store[ip] if now - t < window_seconds]
    if len(_rate_store[ip]) >= max_calls:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many requests. Limit: {max_calls} per {window_seconds}s."
        )
    _rate_store[ip].append(now)


# ---------------------------------------------------------------------------
# Pydantic request models
# ---------------------------------------------------------------------------
class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @validator("new_password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire, "jti": str(uuid.uuid4())})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user_by_username(db, username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not getattr(current_user, "is_active", True):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

async def require_admin(current_user: models.User = Depends(get_current_active_user)):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return current_user

async def require_employee_or_admin(current_user: models.User = Depends(get_current_active_user)):
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.EMPLOYEE]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return current_user


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------

@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()

    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )

    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        role=models.UserRole.USER
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip, max_calls=10, window_seconds=60)

    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role.value
        }
    }


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ---------------------------------------------------------------------------
# Admin endpoints
# ---------------------------------------------------------------------------

@router.post("/admin/employees", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_employee(user: EmployeeCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    db_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()

    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email or username already registered")

    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        role=models.UserRole.EMPLOYEE
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/admin/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db), current_user: models.User = Depends(require_employee_or_admin)):
    return db.query(models.User).all()


@router.put("/admin/users/{user_id}/role")
def update_user_role(user_id: int, role: str, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        target_user.role = models.UserRole(role)
        db.commit()
        return {"message": "Role updated successfully"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role")


# ---------------------------------------------------------------------------
# Password reset endpoints
# ---------------------------------------------------------------------------

@router.post("/forgot-password")
async def forgot_password(
    request: Request,
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip, max_calls=5, window_seconds=60)

    email = data.email
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        return {"message": "If this email is registered, you will receive reset instructions."}

    reset_token = str(uuid.uuid4())
    expires = datetime.utcnow() + timedelta(hours=1)
    user.reset_token = reset_token
    user.reset_token_expires = expires
    db.commit()

    reset_link = f"https://loan-default-predictor-one.vercel.app/reset-password?token={reset_token}"

    background_tasks.add_task(
        send_reset_email,
        to_email=email,
        reset_link=reset_link,
        username=user.username
    )

    return {"message": "If this email is registered, you will receive reset instructions.", "email_queued": True}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password — accepts JSON body (token + new_password), never query params."""
    user = db.query(models.User).filter(
        models.User.reset_token == data.token,
        models.User.reset_token_expires > datetime.utcnow()
    ).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    user.hashed_password = get_password_hash(data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    return {"message": "Password reset successful. Please login with your new password."}


@router.get("/verify-reset-token")
def verify_reset_token(token: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.reset_token == token,
        models.User.reset_token_expires > datetime.utcnow()
    ).first()

    if not user:
        return {"valid": False}

    return {"valid": True, "email": user.email}
