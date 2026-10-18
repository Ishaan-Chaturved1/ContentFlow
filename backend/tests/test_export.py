import csv
import io


def test_export_csv_workflow(client, sample_brief):
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
    assert "Visual Generation Prompt" in rows[0]

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

    # 5. Export entire campaign (all posts) -> should yield 7 data rows + 1 header row
    resp_all = client.get(f"/api/campaigns/{cid}/export?approved_only=false")
    assert resp_all.status_code == 200
    assert resp_all.headers["X-Exported-Count"] == "7"

    reader_all = csv.reader(io.StringIO(resp_all.text))
    rows_all = list(reader_all)
    assert len(rows_all) == 8  # 1 header + 7 posts


def test_google_sheets_sync_stub(client, sample_brief):
    create_resp = client.post("/api/campaigns", json=sample_brief)
    cid = create_resp.json()["id"]

    # Call sync endpoint without configured Google credentials
    sync_resp = client.post(f"/api/campaigns/{cid}/sync-sheets?spreadsheet_id=test12345")
    assert sync_resp.status_code == 200
    data = sync_resp.json()
    assert data["success"] is False
    assert data["setup_guide_required"] is True
    assert "Google Sheets integration requires" in data["message"]
