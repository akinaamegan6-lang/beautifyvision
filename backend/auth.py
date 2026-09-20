"""Authentication module for BeautifyVision — JWT email/password + Emergent Google."""
import os
import uuid
import bcrypt
import jwt as pyjwt
import httpx
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorDatabase

ALGORITHM = "HS256"

def _secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return pyjwt.encode(payload, _secret(), algorithm=ALGORITHM)


# === Schemas ===
class SignupReq(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class GoogleSessionReq(BaseModel):
    session_id: str


class AuthResp(BaseModel):
    token: str
    user: dict


def build_router(db: AsyncIOMotorDatabase) -> APIRouter:
    router = APIRouter(prefix="/auth", tags=["auth"])

    async def _public(user_doc: dict) -> dict:
        return {k: v for k, v in user_doc.items() if k not in ("_id", "password_hash")}

    async def current_user(request: Request) -> dict:
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Non authentifié")
        token = auth_header[7:]
        try:
            payload = pyjwt.decode(token, _secret(), algorithms=[ALGORITHM])
        except pyjwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expiré")
        except pyjwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Token invalide")
        user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur introuvable")
        return user

    @router.post("/register", response_model=AuthResp)
    async def register(req: SignupReq):
        email = req.email.lower().strip()
        if await db.users.find_one({"email": email}):
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé.")
        if len(req.password) < 6:
            raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 6 caractères.")
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        doc = {
            "user_id": user_id,
            "email": email,
            "name": req.name or email.split("@")[0],
            "password_hash": hash_password(req.password),
            "auth_method": "password",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(doc)
        token = create_token(user_id, email)
        return {"token": token, "user": await _public(doc)}

    @router.post("/login", response_model=AuthResp)
    async def login(req: LoginReq):
        email = req.email.lower().strip()
        user = await db.users.find_one({"email": email})
        if not user or not user.get("password_hash") or not verify_password(req.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Identifiants incorrects.")
        token = create_token(user["user_id"], email)
        return {"token": token, "user": await _public(user)}

    @router.get("/me")
    async def me(user: dict = Depends(current_user)):
        return user

    @router.post("/google-callback", response_model=AuthResp)
    async def google_callback(req: GoogleSessionReq):
        async with httpx.AsyncClient(timeout=20) as client:
            try:
                r = await client.get(
                    "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                    headers={"X-Session-ID": req.session_id},
                )
            except Exception as e:
                raise HTTPException(status_code=502, detail=f"Auth provider unreachable: {e}")
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Session Google invalide")
        data = r.json()
        email = (data.get("email") or "").lower().strip()
        if not email:
            raise HTTPException(status_code=400, detail="Email Google manquant")
        existing = await db.users.find_one({"email": email})
        if existing:
            user_id = existing["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {"picture": data.get("picture"), "name": data.get("name") or existing.get("name")}},
            )
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            await db.users.insert_one({
                "user_id": user_id,
                "email": email,
                "name": data.get("name") or email.split("@")[0],
                "picture": data.get("picture"),
                "auth_method": "google",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
        token = create_token(user_id, email)
        return {"token": token, "user": user}

    return router, current_user


async def seed_admin(db: AsyncIOMotorDatabase):
    """Create indexes and admin user on startup."""
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@beautifyvision.fr").lower()
    admin_pw = os.environ.get("ADMIN_PASSWORD", "Admin1234!")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": admin_email,
            "name": "Admin",
            "password_hash": hash_password(admin_pw),
            "auth_method": "password",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif existing.get("password_hash") and not verify_password(admin_pw, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_pw)}},
        )
