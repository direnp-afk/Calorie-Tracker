import os
import sys
from pathlib import Path
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from backend.app.database import Base, get_db
from backend.app import models  
from backend.app.routers import auth, users, profile, goal, foodentry, summary, foodsearch


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ["SECRET_KEY"] = "local-test-secret-not-for-production"
os.environ["USDA_API_KEY"] = "unused-test-api-key"



@pytest.fixture
def client():
    #Recreate a fresh, in-memory SQLite database for each test
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine)

    def get_test_db():
        db = TestSession()
        try:
            yield db
        finally:
            db.close()

    app = FastAPI()
    for router in (auth, users, profile, goal, foodentry, summary, foodsearch):
        app.include_router(router.router)
    app.dependency_overrides[get_db] = get_test_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    engine.dispose()

@pytest.fixture
def make_user(client):
    #registers and logs in user, and returns authorisation header
    def create_user(email="testuser@example.test"):
        password = "TestPassword123"
        response = client.post("/auth/register", json={"email": email, "password": password})
        assert response.status_code == 200

        response = client.post("/auth/token", data={"username": email, "password": password})
        assert response.status_code == 200
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    return create_user