from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Campaign, Post
from app.schemas import (
    CampaignCreate,
    CampaignResponse,
    CampaignSummary,
    DashboardStatsResponse,
    PostResponse,
)
from app.services.llm_provider import get_llm_provider
from app.services.export_service import generate_campaign_csv
from app.services.sheets_service import get_sheets_service, SheetsSyncResult

router = APIRouter(prefix="/api/campaigns", tags=["Campaigns"])


def serialize_campaign(campaign: Campaign) -> dict:
    total = len(campaign.posts)
    pending = sum(1 for p in campaign.posts if p.status == "Pending Review")
    approved = sum(1 for p in campaign.posts if p.status == "Approved")
    rejected = sum(1 for p in campaign.posts if p.status == "Rejected")
    platforms_list = [p.strip() for p in campaign.platforms.split(",") if p.strip()]

    return {
        "id": campaign.id,
        "brand_name": campaign.brand_name,
        "industry": campaign.industry,
        "target_audience": campaign.target_audience,
        "brand_voice": campaign.brand_voice,
        "products_services": campaign.products_services,
        "campaign_objective": campaign.campaign_objective,
        "platforms": platforms_list,
        "content_preferences": campaign.content_preferences or "",
        "number_of_days": campaign.number_of_days,
        "is_demo_mode": campaign.is_demo_mode,
        "generation_provider": campaign.generation_provider,
        "total_posts": total,
        "pending_posts": pending,
        "approved_posts": approved,
        "rejected_posts": rejected,
        "created_at": campaign.created_at,
        "updated_at": campaign.updated_at,
        "posts": campaign.posts
    }


@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    all_campaigns = db.query(Campaign).order_by(desc(Campaign.created_at)).all()
    all_posts = db.query(Post).all()

    total_posts = len(all_posts)
    pending = sum(1 for p in all_posts if p.status == "Pending Review")
    approved = sum(1 for p in all_posts if p.status == "Approved")
    rejected = sum(1 for p in all_posts if p.status == "Rejected")

    recent_summaries = [serialize_campaign(c) for c in all_campaigns[:10]]

    return DashboardStatsResponse(
        total_generated_posts=total_posts,
        posts_awaiting_review=pending,
        approved_posts=approved,
        rejected_posts=rejected,
        total_campaigns=len(all_campaigns),
        recent_campaigns=recent_summaries
    )


@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign_in: CampaignCreate,
    db: Session = Depends(get_db)
):
    platforms_str = ",".join(campaign_in.platforms)

    # 1. Create and persist the campaign entity
    campaign = Campaign(
        brand_name=campaign_in.brand_name.strip(),
        industry=campaign_in.industry.strip(),
        target_audience=campaign_in.target_audience.strip(),
        brand_voice=campaign_in.brand_voice.strip(),
        products_services=campaign_in.products_services.strip(),
        campaign_objective=campaign_in.campaign_objective.strip(),
        platforms=platforms_str,
        content_preferences=campaign_in.content_preferences.strip() if campaign_in.content_preferences else "",
        number_of_days=campaign_in.number_of_days,
        is_demo_mode=False,
        generation_provider="pending"
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    # 2. Generate content calendar via LLM provider abstraction
    provider = get_llm_provider()
    try:
        generated_posts, provider_name, is_demo = await provider.generate_calendar(campaign_in)
        campaign.generation_provider = provider_name
        campaign.is_demo_mode = is_demo

        for gp in generated_posts:
            post = Post(
                campaign_id=campaign.id,
                day_number=gp.day_number,
                scheduled_date=gp.scheduled_date,
                platform=gp.platform,
                content_type=gp.content_type,
                topic=gp.topic,
                caption=gp.caption,
                hashtags=gp.hashtags,
                cta=gp.cta,
                visual_prompt=gp.visual_prompt,
                status="Pending Review",
                notes=gp.notes or ""
            )
            db.add(post)

        db.commit()
        db.refresh(campaign)
    except ValueError as ve:
        db.delete(campaign)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        db.delete(campaign)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Content generation failed: {str(e)}"
        )

    return serialize_campaign(campaign)


@router.get("", response_model=List[CampaignSummary])
def list_campaigns(db: Session = Depends(get_db)):
    campaigns = db.query(Campaign).order_by(desc(Campaign.created_at)).all()
    return [serialize_campaign(c) for c in campaigns]


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail=f"Campaign with ID {campaign_id} not found")
    return serialize_campaign(campaign)


@router.post("/{campaign_id}/generate", response_model=CampaignResponse)
async def regenerate_campaign_content(
    campaign_id: int,
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail=f"Campaign with ID {campaign_id} not found")

    platforms_list = [p.strip() for p in campaign.platforms.split(",") if p.strip()]
    brief = CampaignCreate(
        brand_name=campaign.brand_name,
        industry=campaign.industry,
        target_audience=campaign.target_audience,
        brand_voice=campaign.brand_voice,
        products_services=campaign.products_services,
        campaign_objective=campaign.campaign_objective,
        platforms=platforms_list,
        content_preferences=campaign.content_preferences,
        number_of_days=campaign.number_of_days
    )

    provider = get_llm_provider()
    try:
        generated_posts, provider_name, is_demo = await provider.generate_calendar(brief)

        # Remove existing posts
        db.query(Post).filter(Post.campaign_id == campaign_id).delete()

        campaign.generation_provider = provider_name
        campaign.is_demo_mode = is_demo

        for gp in generated_posts:
            post = Post(
                campaign_id=campaign.id,
                day_number=gp.day_number,
                scheduled_date=gp.scheduled_date,
                platform=gp.platform,
                content_type=gp.content_type,
                topic=gp.topic,
                caption=gp.caption,
                hashtags=gp.hashtags,
                cta=gp.cta,
                visual_prompt=gp.visual_prompt,
                status="Pending Review",
                notes=gp.notes or ""
            )
            db.add(post)

        db.commit()
        db.refresh(campaign)
    except ValueError as ve:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Calendar regeneration failed: {str(e)}"
        )

    return serialize_campaign(campaign)


@router.get("/{campaign_id}/export")
def export_campaign(
    campaign_id: int,
    approved_only: bool = Query(default=True, description="Filter for approved posts only"),
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    query = db.query(Post).filter(Post.campaign_id == campaign_id).order_by(Post.day_number)
    if approved_only:
        query = query.filter(Post.status == "Approved")

    posts = query.all()

    csv_data = generate_campaign_csv(campaign, posts)
    filename_suffix = "approved" if approved_only else "all_posts"
    safe_brand = "".join(c for c in campaign.brand_name if c.isalnum() or c in (" ", "_", "-")).rstrip()
    filename = f"{safe_brand.replace(' ', '_').lower()}_campaign_{filename_suffix}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Exported-Count": str(len(posts))
        }
    )


@router.post("/{campaign_id}/sync-sheets", response_model=SheetsSyncResult)
async def sync_to_google_sheets(
    campaign_id: int,
    spreadsheet_id: Optional[str] = Query(default=None),
    approved_only: bool = Query(default=True),
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    query = db.query(Post).filter(Post.campaign_id == campaign_id).order_by(Post.day_number)
    if approved_only:
        query = query.filter(Post.status == "Approved")

    posts = query.all()
    sheets_service = get_sheets_service()
    result = await sheets_service.export_campaign_to_sheet(
        campaign=campaign,
        posts=posts,
        spreadsheet_id=spreadsheet_id
    )
    return result


@router.post("/seed-demo", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def seed_demo_campaign(db: Session = Depends(get_db)):
    """
    Seeds the realistic Maison Living Studio luxury interior design campaign.
    """
    demo_brief = CampaignCreate(
        brand_name="Maison Living Studio",
        industry="Luxury Interior Architecture & Bespoke Furniture",
        target_audience="High-net-worth homeowners, art collectors, real estate developers, and design purists seeking understated elegance.",
        brand_voice="Refined, architectural, quiet luxury, contemplative, and deeply respectful of organic materiality.",
        products_services="Full-service architectural interior renovations, custom millwork, and the Signature Monolith travertine and smoked oak furniture collection.",
        campaign_objective="Launch the Autumn/Winter Atelier Monograph and book 5 bespoke residential architectural commissions.",
        platforms=["Instagram", "LinkedIn"],
        content_preferences="Focus on natural light study, raw travertine textures, zero decorative clutter, and craftsmen atelier notes.",
        number_of_days=7
    )

    return await create_campaign(demo_brief, db)


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    db.delete(campaign)
    db.commit()
    return None
