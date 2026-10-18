import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from google.genai.errors import APIError

from app.schemas import CampaignCreate
from app.services.llm_provider import GeminiProvider
from app.config import settings


@pytest.fixture
def mock_gemini_success_response():
    sample_posts = [
        {
            "day_number": i + 1,
            "scheduled_date": f"Day {i + 1} - Oct {20 + i}",
            "platform": "Instagram" if i % 2 == 0 else "LinkedIn",
            "content_type": "Materiality Study" if i % 2 == 0 else "Architectural Essay",
            "topic": f"Topic hook for day {i + 1}",
            "caption": f"Sophisticated luxury architectural caption for post {i + 1}.",
            "hashtags": "#LuxuryDesign #Architecture #QuietLuxury",
            "cta": "Inquire via private consultation.",
            "visual_prompt": f"Editorial photography of raw travertine and smoked oak, day {i + 1}.",
            "notes": f"Editorial strategy day {i + 1}."
        }
        for i in range(7)
    ]
    response_payload = {
        "brand_summary": "Understated architectural luxury studio.",
        "posts": sample_posts
    }

    mock_resp = MagicMock()
    mock_resp.text = json.dumps(response_payload)
    return mock_resp


def test_gemini_provider_missing_key_raises_error(sample_brief):
    provider = GeminiProvider(api_key="", model_name="gemini-2.5-flash")
    brief = CampaignCreate(**sample_brief)

    with pytest.raises(ValueError) as exc_info:
        import asyncio
        asyncio.run(provider.generate_calendar(brief))

    assert "Gemini API key is not configured" in str(exc_info.value) or "missing" in str(exc_info.value)


@pytest.mark.anyio
async def test_gemini_provider_success(sample_brief, mock_gemini_success_response):
    provider = GeminiProvider(api_key="AIzaFakeTestKeyForTestingOnly", model_name="gemini-2.5-flash")
    brief = CampaignCreate(**sample_brief)

    mock_client = MagicMock()
    mock_client.aio.models.generate_content = AsyncMock(return_value=mock_gemini_success_response)

    with patch.object(provider, "_get_client", return_value=mock_client):
        posts, provider_name, is_demo = await provider.generate_calendar(brief)

        assert len(posts) == 7
        assert "gemini" in provider_name
        assert is_demo is False
        assert posts[0].topic == "Topic hook for day 1"
        assert posts[0].day_number == 1


@pytest.mark.anyio
async def test_gemini_provider_quota_rate_limit_error(sample_brief):
    provider = GeminiProvider(api_key="AIzaFakeTestKeyForTestingOnly", model_name="gemini-2.5-flash")
    brief = CampaignCreate(**sample_brief)

    mock_client = MagicMock()
    api_error = APIError(code=429, response_json={"error": {"message": "RESOURCE_EXHAUSTED: quota exceeded"}})
    mock_client.aio.models.generate_content = AsyncMock(side_effect=api_error)

    with patch.object(provider, "_get_client", return_value=mock_client):
        with pytest.raises(RuntimeError) as exc_info:
            await provider.generate_calendar(brief)

        assert "quota exceeded" in str(exc_info.value).lower() or "429" in str(exc_info.value)


@pytest.mark.anyio
async def test_gemini_provider_invalid_api_key_error(sample_brief):
    provider = GeminiProvider(api_key="AIzaInvalidKey", model_name="gemini-2.5-flash")
    brief = CampaignCreate(**sample_brief)

    mock_client = MagicMock()
    api_error = APIError(code=400, response_json={"error": {"message": "API_KEY_INVALID: User API key not valid."}})
    mock_client.aio.models.generate_content = AsyncMock(side_effect=api_error)

    with patch.object(provider, "_get_client", return_value=mock_client):
        with pytest.raises(RuntimeError) as exc_info:
            await provider.generate_calendar(brief)

        assert "authentication failed" in str(exc_info.value).lower() or "invalid" in str(exc_info.value).lower()


@pytest.mark.anyio
async def test_gemini_provider_timeout_error(sample_brief):
    provider = GeminiProvider(api_key="AIzaFakeKey", model_name="gemini-2.5-flash")
    brief = CampaignCreate(**sample_brief)

    mock_client = MagicMock()
    mock_client.aio.models.generate_content = AsyncMock(side_effect=TimeoutError("Connection timed out after 45s"))

    with patch.object(provider, "_get_client", return_value=mock_client):
        with pytest.raises(RuntimeError) as exc_info:
            await provider.generate_calendar(brief)

        assert "timed out" in str(exc_info.value).lower()


@pytest.mark.anyio
async def test_gemini_provider_invalid_json_output(sample_brief):
    provider = GeminiProvider(api_key="AIzaFakeKey", model_name="gemini-2.5-flash")
    brief = CampaignCreate(**sample_brief)

    mock_resp = MagicMock()
    mock_resp.text = "This is not valid JSON string."
    mock_client = MagicMock()
    mock_client.aio.models.generate_content = AsyncMock(return_value=mock_resp)

    with patch.object(provider, "_get_client", return_value=mock_client):
        with pytest.raises(RuntimeError) as exc_info:
            await provider.generate_calendar(brief)

        assert "invalid structured calendar output" in str(exc_info.value).lower()


def test_api_route_with_gemini_provider_success(client, sample_brief, mock_gemini_success_response):
    """Test FastAPI campaign creation route when LLM_PROVIDER is set to gemini"""
    with patch.object(settings, "LLM_PROVIDER", "gemini"), \
         patch.object(settings, "GEMINI_API_KEY", "AIzaLiveTestKey"):

        with patch("google.genai.Client") as mock_genai_cls:
            mock_client_instance = MagicMock()
            mock_client_instance.aio.models.generate_content = AsyncMock(return_value=mock_gemini_success_response)
            mock_genai_cls.return_value = mock_client_instance

            resp = client.post("/api/campaigns", json=sample_brief)
            assert resp.status_code == 201
            data = resp.json()
            assert data["is_demo_mode"] is False
            assert "gemini" in data["generation_provider"]
            assert data["total_posts"] == 7
            assert data["posts"][0]["status"] == "Pending Review"


def test_api_route_with_gemini_provider_failure_returns_502(client, sample_brief):
    """Test FastAPI campaign creation returns 502 with clear error when Gemini fails"""
    with patch.object(settings, "LLM_PROVIDER", "gemini"), \
         patch.object(settings, "GEMINI_API_KEY", "AIzaLiveTestKey"):

        with patch("google.genai.Client") as mock_genai_cls:
            mock_client_instance = MagicMock()
            api_error = APIError(code=429, response_json={"error": {"message": "RESOURCE_EXHAUSTED: rate limit exceeded"}})
            mock_client_instance.aio.models.generate_content = AsyncMock(side_effect=api_error)
            mock_genai_cls.return_value = mock_client_instance

            resp = client.post("/api/campaigns", json=sample_brief)
            assert resp.status_code == 502
            data = resp.json()
            assert "Content generation failed" in data["detail"]
            assert "quota" in data["detail"].lower() or "rate limit" in data["detail"].lower()
