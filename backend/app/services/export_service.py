import csv
import io
from typing import List
from app.models import Campaign, Post


def generate_campaign_csv(campaign: Campaign, posts: List[Post]) -> str:
    """
    Generate RFC 4180 compliant CSV string for campaign posts.
    Handles multiline captions, quotes, and commas with proper escaping.
    """
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_ALL, lineterminator="\r\n")

    # Header
    writer.writerow([
        "Day Number",
        "Scheduled Date",
        "Platform",
        "Content Type",
        "Topic / Hook",
        "Caption",
        "Hashtags",
        "Call to Action (CTA)",
        "Visual Generation Prompt",
        "Review Status",
        "Editorial Notes",
        "Brand Name",
        "Campaign Objective"
    ])

    for post in posts:
        writer.writerow([
            post.day_number,
            post.scheduled_date,
            post.platform,
            post.content_type,
            post.topic,
            post.caption,
            post.hashtags,
            post.cta,
            post.visual_prompt,
            post.status,
            post.notes or "",
            campaign.brand_name,
            campaign.campaign_objective
        ])

    return output.getvalue()
