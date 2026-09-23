"""Backend auth tests for BeautifyVision — JWT email/password + Emergent Google."""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://makeup-match-test.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@beautifyvision.fr"
ADMIN_PASSWORD = "Admin1234!"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def unique_email():
    return f"test_{uuid.uuid4().hex[:10]}@beautifyvision.fr"


# --- Register / login flow ---
class TestRegister:
    def test_register_new_user_returns_token_and_user(self, session, unique_email):
        r = session.post(f"{API}/auth/register", json={
            "email": unique_email, "password": "Secret123", "name": "Test User"
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
        assert data["user"]["email"] == unique_email
        assert data["user"]["name"] == "Test User"
        assert "password_hash" not in data["user"]
        assert "_id" not in data["user"]
        # store token for later
        pytest.test_token = data["token"]

    def test_me_with_valid_token(self, session, unique_email):
        token = pytest.test_token
        r = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200, r.text
        assert r.json()["email"] == unique_email

    def test_register_duplicate_email_returns_400(self, session, unique_email):
        r = session.post(f"{API}/auth/register", json={
            "email": unique_email, "password": "Secret123", "name": "Dup"
        })
        assert r.status_code == 400
        assert "déjà utilisé" in r.json().get("detail", "")


# --- Admin login ---
class TestLogin:
    def test_admin_login_success(self, session):
        r = session.post(f"{API}/auth/login", json={
            "email": ADMIN_EMAIL, "password": ADMIN_PASSWORD
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        pytest.admin_token = data["token"]

    def test_admin_me(self, session):
        r = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {pytest.admin_token}"})
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_login_wrong_password_returns_401(self, session):
        r = session.post(f"{API}/auth/login", json={
            "email": ADMIN_EMAIL, "password": "wrong_password"
        })
        assert r.status_code == 401

    def test_me_without_token_returns_401(self, session):
        r = session.get(f"{API}/auth/me")
        assert r.status_code == 401


# --- Google callback (invalid session) ---
class TestGoogleCallback:
    def test_invalid_session_id_returns_401(self, session):
        r = session.post(f"{API}/auth/google-callback", json={"session_id": "bogus_invalid_session_id_xxx"})
        assert r.status_code == 401
        assert "invalide" in r.json().get("detail", "").lower()
