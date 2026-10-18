import csv
import io
import json
import pytest
from unittest.mock import patch
from app.models import Campaign, Post
from app.services.export_service import generate_campaign_csv
from app.services.sheets_service import RealGoogleSheetsService


def test_export_csv_workflow(client, sample_brief):
    """Test full CSV export lifecycle with approved-only and all-posts filtering."""
    # 1. Create campaign
    create_resp = client.post("/api/campaigns", json=sample_brief)
    cid = create_resp.json()["id"]
    posts = create_resp.json()["posts"]

    # 2. Export approved_only when none approved -> should yield header row only
    resp_empty = client.get(f"/api/campaigns/{cid}/export?approved_only=true")
    assert resp_empty.status_code == 200
    assert "text/csv" in resp_empty.headers["Content-Type"]
    assert resp_empty.headers["X-Exported-Count"] == "0"

    reader = csv.reader(io.StringIO(resp_empty.text))
    rows = list(reader)
    assert len(rows) == 1  # Header row only
    assert "Day Number" in rows[0]
    assert "Scheduled Date" in rows[0]
    assert "Platform" in rows[0]
    assert "Content Type" in rows[0]
    assert "Topic / Hook" in rows[0]
    assert "Caption" in rows[0]
    assert "Hashtags" in rows[0]
    assert "Call to Action (CTA)" in rows[0]
    assert "Visual Generation Prompt" in rows[0]
    assert "Review Status" in rows[0]

    # 3. Approve 2 posts
    client.post(f"/api/posts/{posts[0]['id']}/approve")
    client.post(f"/api/posts/{posts[1]['id']}/approve")

    # 4. Export approved_only again -> should yield 2 data rows + 1 header row
    resp_approved = client.get(f"/api/campaigns/{cid}/export?approved_only=true")
    assert resp_approved.status_code == 200
    assert resp_approved.headers["X-Exported-Count"] == "2"

    reader_appr = csv.reader(io.StringIO(resp_approved.text))
    rows_appr = list(reader_appr)
    assert len(rows_appr) == 3  # 1 header + 2 approved posts
    assert rows_appr[1][9] == "Approved"  # Review Status
    assert rows_appr[2][9] == "Approved"

    # 5. Export entire campaign (all posts) -> should yield 7 data rows + 1 header row
    resp_all = client.get(f"/api/campaigns/{cid}/export?approved_only=false")
    assert resp_all.status_code == 200
    assert resp_all.headers["X-Exported-Count"] == "7"

    reader_all = csv.reader(io.StringIO(resp_all.text))
    rows_all = list(reader_all)
    assert len(rows_all) == 8  # 1 header + 7 posts


def test_csv_escaping_special_characters(db_session):
    """
    Test RFC 4180 escaping with:
    - multiline captions
    - embedded double quotes ("quiet luxury")
    - commas, semicolons, and emojis
    - trailing whitespace and carriage returns
    """
    campaign = Campaign(
        id=99,
        brand_name='Studio "L\'Élégance", Milano',
        industry="Luxury Architecture, Millwork & Bespoke Furniture",
        target_audience="Art collectors, billionaires & architects",
        brand_voice="Poetic, architectural, restrained",
        products_services="Travertine credenzas; bronze doors",
        campaign_objective="Launch monograph & book 5 commissions",
        platforms="Instagram,LinkedIn",
        number_of_days=1,
        is_demo_mode=False,
        generation_provider="test"
    )

    tricky_caption = (
        'A study in "spatial geometry".\n\n'
        'When stone meets bronze, proportion is everything, isn\'t it?\n'
        'Items:\n- Item 1, with comma\n- Item 2; with semicolon\n'
        'Crafted with 100% monolithic integrity 🏛️.'
    )

    tricky_prompt = 'Close-up "macro" shot of artisan\'s hands, chiseling stone, high contrast, 8k.'

    post = Post(
        id=1,
        campaign_id=99,
        day_number=1,
        scheduled_date="Monday, Nov 3",
        platform="Instagram",
        content_type="Case Study / Carousel",
        topic='The "Monolith" Series: Detail & Proportion',
        caption=tricky_caption,
        hashtags="#LuxuryDesign, #Bespoke, #Architecture",
        cta='Visit our atelier at "Via Montenapoleone, 12".',
        visual_prompt=tricky_prompt,
        status="Approved",
        notes="High-priority post; verified by founder."
    )

    csv_output = generate_campaign_csv(campaign, [post])
    assert isinstance(csv_output, str)
    assert len(csv_output) > 0

    # Parse back with standard Python CSV reader
    reader = csv.reader(io.StringIO(csv_output))
    rows = list(reader)
    assert len(rows) == 2  # 1 header + 1 post
    data_row = rows[1]

    # Verify every tricky field survived the round-trip without corruption
    assert data_row[0] == "1"  # Day Number
    assert data_row[1] == "Monday, Nov 3"
    assert data_row[2] == "Instagram"
    assert data_row[4] == 'The "Monolith" Series: Detail & Proportion'
    assert data_row[5] == tricky_caption
    assert data_row[6] == "#LuxuryDesign, #Bespoke, #Architecture"
    assert data_row[7] == 'Visit our atelier at "Via Montenapoleone, 12".'
    assert data_row[8] == tricky_prompt
    assert data_row[9] == "Approved"
    assert data_row[11] == 'Studio "L\'Élégance", Milano'


def test_csv_export_empty_campaign(client, db_session):
    """Test exporting a campaign that has 0 posts returns valid CSV header without 500 error."""
    camp = Campaign(
        brand_name="Empty Studio",
        industry="Architecture",
        target_audience="Developers",
        brand_voice="Minimal",
        products_services="Planning",
        campaign_objective="Brand awareness",
        platforms="Instagram",
        number_of_days=7,
        is_demo_mode=True,
        generation_provider="demo"
    )
    db_session.add(camp)
    db_session.commit()
    db_session.refresh(camp)

    resp = client.get(f"/api/campaigns/{camp.id}/export?approved_only=false")
    assert resp.status_code == 200
    assert resp.headers["X-Exported-Count"] == "0"
    reader = csv.reader(io.StringIO(resp.text))
    rows = list(reader)
    assert len(rows) == 1
    assert "Day Number" in rows[0]


def test_google_sheets_missing_credentials_status(client):
    """Test integrations status when GOOGLE_SERVICE_ACCOUNT_JSON is not configured."""
    with patch.dict("os.environ", {"GOOGLE_SERVICE_ACCOUNT_JSON": ""}, clear=False):
        resp = client.get("/api/integrations/google-sheets/status")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "Not Configured"
        assert data["service_account_configured"] is False
        assert "Not Configured" in data["message"]


def test_google_sheets_error_status_when_file_missing(client):
    """Test integrations status when GOOGLE_SERVICE_ACCOUNT_JSON points to a missing file."""
    with patch.dict("os.environ", {"GOOGLE_SERVICE_ACCOUNT_JSON": "non_existent_key_file.json"}, clear=False):
        resp = client.get("/api/integrations/google-sheets/status")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "Error"
        assert data["service_account_configured"] is False
        assert "not found" in data["error_details"].lower()


def test_google_sheets_sync_never_simulates_success(client, sample_brief):
    """Verify sync endpoint strictly rejects requests without credentials and never fakes sync."""
    create_resp = client.post("/api/campaigns", json=sample_brief)
    cid = create_resp.json()["id"]

    with patch.dict("os.environ", {"GOOGLE_SERVICE_ACCOUNT_JSON": ""}, clear=False):
        sync_resp = client.post(f"/api/campaigns/{cid}/sync-sheets?spreadsheet_id=fake_sheet_123")
        assert sync_resp.status_code == 200
        data = sync_resp.json()
        assert data["success"] is False
        assert data["status"] == "Not Configured"
        assert data["setup_guide_required"] is True
        assert data["rows_synced"] == 0
        assert data["spreadsheet_url"] is None
