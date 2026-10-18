def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "ok"


def test_create_campaign_and_generation(client, sample_brief):
    response = client.post("/api/campaigns", json=sample_brief)
    assert response.status_code == 201
    data = response.json()
    assert data["brand_name"] == "Maison Living Studio"
    assert data["total_posts"] == 7
    assert data["pending_posts"] == 7
    assert data["approved_posts"] == 0
    assert data["is_demo_mode"] is True
    assert len(data["posts"]) == 7

    # Verify first post structure
    first_post = data["posts"][0]
    assert first_post["day_number"] == 1
    assert first_post["status"] == "Pending Review"
    assert len(first_post["caption"]) > 20
    assert len(first_post["visual_prompt"]) > 20
    assert first_post["cta"] != ""


def test_list_and_get_campaign(client, sample_brief):
    # Create campaign
    create_resp = client.post("/api/campaigns", json=sample_brief)
    campaign_id = create_resp.json()["id"]

    # List campaigns
    list_resp = client.get("/api/campaigns")
    assert list_resp.status_code == 200
    campaigns = list_resp.json()
    assert len(campaigns) >= 1
    assert any(c["id"] == campaign_id for c in campaigns)

    # Get single campaign
    get_resp = client.get(f"/api/campaigns/{campaign_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == campaign_id


def test_dashboard_stats(client, sample_brief):
    # Initially 0
    resp0 = client.get("/api/campaigns/dashboard")
    assert resp0.status_code == 200
    assert resp0.json()["total_campaigns"] == 0

    # Create 1 campaign with 7 posts
    client.post("/api/campaigns", json=sample_brief)

    resp1 = client.get("/api/campaigns/dashboard")
    assert resp1.status_code == 200
    stats = resp1.json()
    assert stats["total_campaigns"] == 1
    assert stats["total_generated_posts"] == 7
    assert stats["posts_awaiting_review"] == 7
    assert stats["approved_posts"] == 0
    assert stats["rejected_posts"] == 0


def test_delete_campaign(client, sample_brief):
    create_resp = client.post("/api/campaigns", json=sample_brief)
    cid = create_resp.json()["id"]

    del_resp = client.delete(f"/api/campaigns/{cid}")
    assert del_resp.status_code == 204

    get_resp = client.get(f"/api/campaigns/{cid}")
    assert get_resp.status_code == 404
