from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String(255), nullable=False, index=True)
    industry = Column(String(255), nullable=False)
    target_audience = Column(Text, nullable=False)
    brand_voice = Column(String(255), nullable=False)
    products_services = Column(Text, nullable=False)
    campaign_objective = Column(Text, nullable=False)
    platforms = Column(String(255), nullable=False)  # Comma separated e.g. "Instagram,LinkedIn"
    content_preferences = Column(Text, nullable=True, default="")
    number_of_days = Column(Integer, nullable=False, default=7)
    is_demo_mode = Column(Boolean, nullable=False, default=False)
    generation_provider = Column(String(64), nullable=True, default="demo")
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    posts = relationship("Post", back_populates="campaign", cascade="all, delete-orphan", order_by="Post.day_number")


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number = Column(Integer, nullable=False)
    scheduled_date = Column(String(100), nullable=False)
    platform = Column(String(50), nullable=False, index=True)  # Instagram, LinkedIn
    content_type = Column(String(100), nullable=False)
    topic = Column(String(255), nullable=False)
    caption = Column(Text, nullable=False)
    hashtags = Column(Text, nullable=False)
    cta = Column(Text, nullable=False)
    visual_prompt = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="Pending Review", index=True)  # "Pending Review", "Approved", "Rejected"
    notes = Column(Text, nullable=True, default="")
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    campaign = relationship("Campaign", back_populates="posts")
