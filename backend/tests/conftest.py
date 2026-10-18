import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

# In-memory SQLite for high-speed, isolated unit and integration tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_brief():
    return {
        "brand_name": "Maison Living Studio",
        "industry": "Luxury Architecture & Interiors",
        "target_audience": "Discerning art collectors and high-net-worth homeowners.",
        "brand_voice": "Quiet luxury, architectural, restrained.",
        "products_services": "Bespoke architectural joinery and residential pavilions.",
        "campaign_objective": "Launch 2026 monograph and secure private commissions.",
        "platforms": ["Instagram", "LinkedIn"],
        "content_preferences": "Focus on tactile textures, natural travertine, and ambient lighting.",
        "number_of_days": 7
    }
