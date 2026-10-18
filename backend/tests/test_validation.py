import pytest
from app.schemas import CampaignCreate


def test_campaign_create_validation_success(sample_brief):
    campaign = CampaignCreate(**sample_brief)
    assert campaign.brand_name == "Maison Living Studio"
    assert campaign.number_of_days == 7
    assert len(campaign.platforms) == 2


def test_campaign_create_validation_missing_fields():
    with pytest.raises(Exception):
        CampaignCreate(
            brand_name="M",  # Too short (min 2)
            industry="",
            target_audience="",
            brand_voice="",
            products_services="",
            campaign_objective="",
            platforms=[]
        )


def test_campaign_create_validation_invalid_platform(sample_brief):
    invalid = sample_brief.copy()
    invalid["platforms"] = ["TikTok"]  # Not in allowed list
    with pytest.raises(Exception):
        CampaignCreate(**invalid)


def test_campaign_create_validation_invalid_day_range(sample_brief):
    invalid_low = sample_brief.copy()
    invalid_low["number_of_days"] = 0
    with pytest.raises(Exception):
        CampaignCreate(**invalid_low)

    invalid_high = sample_brief.copy()
    invalid_high["number_of_days"] = 35
    with pytest.raises(Exception):
        CampaignCreate(**invalid_high)
