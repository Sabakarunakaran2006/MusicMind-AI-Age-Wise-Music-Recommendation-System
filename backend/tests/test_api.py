import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import verify_password, hash_password

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_listener_login():
    response = client.post("/api/auth/login", json={
        "email": "listener@musicmind.ai",
        "password": "ListenerPassword123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "listener"
    assert data["user"]["age"] == 24
    assert data["user"]["age_group"] == "Young Adult"

def test_admin_login():
    response = client.post("/api/auth/login", json={
        "email": "admin@musicmind.ai",
        "password": "AdminPassword123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_registration_and_duplicate_email():
    new_email = "testnewuser@musicmind.ai"
    reg_payload = {
        "name": "Jordan Lee",
        "email": new_email,
        "password": "SecurePassword123!",
        "age": 18,
        "preferred_language": "English",
        "preferred_genres": ["Pop", "Hip-Hop"]
    }
    # First registration
    resp = client.post("/api/auth/register", json=reg_payload)
    if resp.status_code == 201:
        data = resp.json()
        assert data["user"]["age_group"] == "Teen"
        assert "access_token" in data

    # Duplicate registration must fail
    dup_resp = client.post("/api/auth/register", json=reg_payload)
    assert dup_resp.status_code == 400
    assert "already exists" in dup_resp.json()["detail"].lower()

def test_rbac_admin_protection():
    # 1. Listener token trying admin route
    login_resp = client.post("/api/auth/login", json={
        "email": "listener@musicmind.ai",
        "password": "ListenerPassword123!"
    })
    listener_token = login_resp.json()["access_token"]

    forbidden_resp = client.get(
        "/api/admin/overview",
        headers={"Authorization": f"Bearer {listener_token}"}
    )
    assert forbidden_resp.status_code == 403

    # 2. Admin token accessing admin route
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@musicmind.ai",
        "password": "AdminPassword123!"
    })
    admin_token = admin_login.json()["access_token"]

    admin_resp = client.get(
        "/api/admin/overview",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert admin_resp.status_code == 200
    assert "total_users" in admin_resp.json()
    assert admin_resp.json()["total_users"] >= 2

def test_recommendation_generation():
    # Test age 17 (Teen) recommendation
    teen_resp = client.post("/api/recommendations/generate", json={
        "age": 17,
        "mood": "Energetic",
        "preferred_genres": ["Pop", "Hip-Hop"],
        "limit": 5
    })
    assert teen_resp.status_code == 200
    teen_data = teen_resp.json()
    assert teen_data["detected_age_group"] == "Teen"
    assert len(teen_data["recommendations"]) == 5
    assert all("similarity_score" in r for r in teen_data["recommendations"])
    assert all("recommendation_reason" in r for r in teen_data["recommendations"])

    # Test age 68 (Senior) recommendation
    senior_resp = client.post("/api/recommendations/generate", json={
        "age": 68,
        "mood": "Chill",
        "preferred_genres": ["Classical", "Jazz"],
        "limit": 5
    })
    assert senior_resp.status_code == 200
    senior_data = senior_resp.json()
    assert senior_data["detected_age_group"] == "Senior"
    assert len(senior_data["recommendations"]) == 5

def test_song_search_and_filters():
    resp = client.get("/api/songs?query=Blinding&limit=5")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert any("Blinding Lights" in s["title"] for s in data["songs"])

def test_model_evaluation_metrics():
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@musicmind.ai",
        "password": "AdminPassword123!"
    })
    admin_token = admin_login.json()["access_token"]

    metrics_resp = client.get(
        "/api/admin/model-metrics?k=10",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert metrics_resp.status_code == 200
    metrics = metrics_resp.json()
    assert "precision_at_k" in metrics
    assert "catalog_coverage_pct" in metrics
    assert metrics["dataset_size"] >= 50
    assert metrics["catalog_coverage_pct"] > 0
