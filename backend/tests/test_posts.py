def test_post_approval_and_rejection_workflow(client, sample_brief):
    # 1. Create campaign
    create_resp = client.post("/api/campaigns", json=sample_brief)
    cid = create_resp.json()["id"]
    posts = create_resp.json()["posts"]
    assert len(posts) == 7

    post_1 = posts[0]
    post_2 = posts[1]

    # 2. Approve post 1
    appr_resp = client.post(f"/api/posts/{post_1['id']}/approve")
    assert appr_resp.status_code == 200
    assert appr_resp.json()["status"] == "Approved"

    # 3. Reject post 2
    rej_resp = client.post(f"/api/posts/{post_2['id']}/reject")
    assert rej_resp.status_code == 200
    assert rej_resp.json()["status"] == "Rejected"

    # 4. Check updated counts on Campaign
    camp_resp = client.get(f"/api/campaigns/{cid}")
    camp_data = camp_resp.json()
    assert camp_data["approved_posts"] == 1
    assert camp_data["rejected_posts"] == 1
    assert camp_data["pending_posts"] == 5

    # 5. Move rejected post back to Pending Review
    pend_resp = client.post(f"/api/posts/{post_2['id']}/pending")
    assert pend_resp.status_code == 200
    assert pend_resp.json()["status"] == "Pending Review"

    # Verify counts again
    camp_resp2 = client.get(f"/api/campaigns/{cid}")
    camp_data2 = camp_resp2.json()
    assert camp_data2["approved_posts"] == 1
    assert camp_data2["rejected_posts"] == 0
    assert camp_data2["pending_posts"] == 6


def test_post_editing(client, sample_brief):
    create_resp = client.post("/api/campaigns", json=sample_brief)
    post_id = create_resp.json()["posts"][0]["id"]

    patch_payload = {
        "topic": "Updated Refined Topic: Sculptural Monoliths",
        "caption": "Custom edited luxury caption discussing travertine.",
        "cta": "Contact our senior architect directly.",
        "notes": "Edited by creative director."
    }
    patch_resp = client.patch(f"/api/posts/{post_id}", json=patch_payload)
    assert patch_resp.status_code == 200
    updated = patch_resp.json()
    assert updated["topic"] == patch_payload["topic"]
    assert updated["caption"] == patch_payload["caption"]
    assert updated["cta"] == patch_payload["cta"]
    assert updated["notes"] == patch_payload["notes"]
