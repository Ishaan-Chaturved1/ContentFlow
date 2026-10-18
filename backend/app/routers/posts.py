from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Post
from app.schemas import PostResponse, PostUpdate

router = APIRouter(prefix="/api/posts", tags=["Posts"])


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.patch("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, post_in: PostUpdate, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    update_data = post_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        if val is not None:
            setattr(post, field, val)

    db.commit()
    db.refresh(post)
    return post


@router.post("/{post_id}/approve", response_model=PostResponse)
def approve_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.status = "Approved"
    db.commit()
    db.refresh(post)
    return post


@router.post("/{post_id}/reject", response_model=PostResponse)
def reject_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.status = "Rejected"
    db.commit()
    db.refresh(post)
    return post


@router.post("/{post_id}/pending", response_model=PostResponse)
def reset_post_to_pending(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.status = "Pending Review"
    db.commit()
    db.refresh(post)
    return post
