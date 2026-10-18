from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator, ConfigDict


PlatformType = Literal["Instagram", "LinkedIn"]
PostStatus = Literal["Pending Review", "Approved", "Rejected"]


class PostBase(BaseModel):
    day_number: int = Field(..., ge=1, le=30, description="Day index in the calendar")
    scheduled_date: str = Field(..., description="Scheduled date/label")
    platform: PlatformType = Field(..., description="Social platform")
    content_type: str = Field(..., min_length=2, max_length=100, description="Type of content e.g. Carousel, Thought Leadership")
    topic: str = Field(..., min_length=2, max_length=255, description="Core hook or topic")
    caption: str = Field(..., min_length=5, description="Full social copy/caption")
    hashtags: str = Field(..., description="Curated hashtags")
    cta: str = Field(..., min_length=2, description="Call to action")
    visual_prompt: str = Field(..., min_length=5, description="Detailed creative brief for photography/visuals")
    notes: Optional[str] = Field(default="", description="Internal creative or editorial notes")


class GeneratedPostSchema(PostBase):
    """Schema expected from LLM generation before DB insertion"""
    pass


class GeneratedCalendarSchema(BaseModel):
    """Container for LLM output"""
    brand_summary: Optional[str] = None
    posts: List[GeneratedPostSchema]


class PostCreate(PostBase):
    campaign_id: int
    status: PostStatus = "Pending Review"


class PostUpdate(BaseModel):
    topic: Optional[str] = None
    caption: Optional[str] = None
    hashtags: Optional[str] = None
    cta: Optional[str] = None
    visual_prompt: Optional[str] = None
    notes: Optional[str] = None
    content_type: Optional[str] = None
    platform: Optional[PlatformType] = None
    scheduled_date: Optional[str] = None
    status: Optional[PostStatus] = None


class PostResponse(PostBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    campaign_id: int
    status: PostStatus
    created_at: datetime
    updated_at: datetime


class CampaignCreate(BaseModel):
    brand_name: str = Field(..., min_length=2, max_length=255, description="Brand or studio name")
    industry: str = Field(..., min_length=2, max_length=255, description="e.g. Luxury Interior Design, High-End Furniture")
    target_audience: str = Field(..., min_length=3, description="Demographic and psychographic profile")
    brand_voice: str = Field(..., min_length=2, max_length=255, description="e.g. Refined, Architectural, Understated Luxury")
    products_services: str = Field(..., min_length=3, description="Key offerings or current collection")
    campaign_objective: str = Field(..., min_length=3, description="e.g. Launch new collection, drive consultations")
    platforms: List[PlatformType] = Field(..., min_length=1, description="Target platforms")
    content_preferences: Optional[str] = Field(default="", description="Key motifs, tone guardrails, or focal points")
    number_of_days: int = Field(default=7, ge=1, le=30, description="Calendar length in days")

    @field_validator("platforms")
    @classmethod
    def validate_platforms(cls, v):
        valid = {"Instagram", "LinkedIn"}
        for p in v:
            if p not in valid:
                raise ValueError(f"Platform {p} is not supported. Use Instagram or LinkedIn.")
        return v


class CampaignSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    brand_name: str
    industry: str
    target_audience: str
    brand_voice: str
    campaign_objective: str
    platforms: List[str]
    number_of_days: int
    is_demo_mode: bool
    generation_provider: Optional[str]
    total_posts: int
    pending_posts: int
    approved_posts: int
    rejected_posts: int
    created_at: datetime
    updated_at: datetime


class CampaignResponse(CampaignSummary):
    model_config = ConfigDict(from_attributes=True)

    products_services: str
    content_preferences: str
    posts: List[PostResponse] = []


class DashboardStatsResponse(BaseModel):
    total_generated_posts: int
    posts_awaiting_review: int
    approved_posts: int
    rejected_posts: int
    total_campaigns: int
    recent_campaigns: List[CampaignSummary]
