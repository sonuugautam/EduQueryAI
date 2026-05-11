import os
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from typing import Optional
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
import time
import logging
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["auth"])

# OAuth Setup
config = Config(".env")
oauth = OAuth(config)

oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
)

oauth.register(
    name='github',
    access_token_url='https://github.com/login/oauth/access_token',
    access_token_params=None,
    authorize_url='https://github.com/login/oauth/authorize',
    authorize_params=None,
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email'},
)

# Mock storage for access requests
access_requests = []

class RequestAccessSchema(BaseModel):
    name: str
    email: EmailStr
    reason: str

class LoginSchema(BaseModel):
    email: str
    password: str

@router.post("/request-access")
async def request_access(data: RequestAccessSchema):
    logging.info(f"New access request from {data.email}")
    access_requests.append(data.dict())
    return {"message": "Request submitted successfully"}

@router.post("/login")
async def login(credentials: LoginSchema):
    if credentials.email and credentials.password == "password123":
        return {
            "access_token": "mock_token_" + str(int(time.time())),
            "token_type": "bearer",
            "user": {
                "name": "Kushal P.",
                "email": credentials.email,
                "role": "Premium Student"
            }
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/{provider}")
async def auth_login(provider: str, request: Request):
    if provider not in ['google', 'github']:
        raise HTTPException(status_code=400, detail="Invalid provider")
    
    # Check if configured
    client_id = os.getenv(f"{provider.upper()}_CLIENT_ID")
    if not client_id or "your_" in client_id:
        # For demo purposes, we will return a special response that the frontend can use to "Mock" success
        # if the user specifically wants to test the flow without real keys.
        return {
            "error": "not_configured",
            "message": f"{provider.capitalize()} OAuth requires real Client IDs in .env",
            "demo_url": f"http://localhost:5173/?demo_login={provider}"
        }

    redirect_uri = request.url_for('auth_callback', provider=provider)
    return await getattr(oauth, provider).authorize_redirect(request, str(redirect_uri))

@router.get("/{provider}/callback")
async def auth_callback(provider: str, request: Request):
    if provider not in ['google', 'github']:
        raise HTTPException(status_code=400, detail="Invalid provider")
        
    try:
        token = await getattr(oauth, provider).authorize_access_token(request)
        user_info = token.get('userinfo')
        if not user_info:
            # Fallback for providers that don't use OIDC userinfo
            user_info = await getattr(oauth, provider).get('user', token=token)
            user_info = user_info.json()

        return {
            "access_token": token['access_token'],
            "token_type": "bearer",
            "user": {
                "name": user_info.get('name', user_info.get('login')),
                "email": user_info.get('email'),
                "role": "Beta User"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")
