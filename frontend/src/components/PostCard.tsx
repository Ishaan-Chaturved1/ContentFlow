import React, { useState } from 'react';
import {
  Check,
  X,
  RotateCcw,
  Edit3,
  Camera,
  MessageSquare,
  Tag,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Post } from '../types';
import { StatusBadge, PlatformBadge } from './Badge';

interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  onResetToPending: (id: number) => Promise<void>;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onEdit,
  onApprove,
  onReject,
  onResetToPending,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (actionFn: (id: number) => Promise<void>) => {
    setIsProcessing(true);
    try {
      await actionFn(post.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const isApproved = post.status === 'Approved';
  const isRejected = post.status === 'Rejected';

  return (
    <article
      aria-label={`Post Day ${post.day_number}: ${post.topic}`}
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isApproved
          ? 'border-olive-200/90 shadow-subtle bg-gradient-to-b from-white to-olive-50/20'
          : isRejected
          ? 'border-stone-300/80 bg-stone-50/40 opacity-75'
          : 'border-borderMuted shadow-subtle hover:shadow-elevated'
      }`}
    >
      <div className="p-6">
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-borderMuted/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif font-bold text-charcoal-900 bg-ivory-200 px-2.5 py-1 rounded-lg">
              Day {post.day_number}
            </span>
            <span className="text-xs text-charcoal-500 font-medium">{post.scheduled_date}</span>
          </div>

          <div className="flex items-center gap-2">
            <PlatformBadge platform={post.platform} />
            <StatusBadge status={post.status} size="sm" />
          </div>
        </div>

        {/* Content Type & Topic */}
        <div className="mt-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-taupe-600 block mb-1">
            {post.content_type}
          </span>
          <h3 className="font-editorial text-lg font-bold text-charcoal-900 leading-snug">
            {post.topic}
          </h3>
        </div>

        {/* Caption */}
        <div className="mt-3.5 relative">
          <p
            className={`text-xs text-charcoal-700 font-sans leading-relaxed whitespace-pre-line ${
              expanded ? '' : 'line-clamp-4'
            }`}
          >
            {post.caption}
          </p>
          {post.caption.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-[11px] font-semibold text-olive-700 hover:text-olive-800 flex items-center gap-1"
            >
              {expanded ? (
                <>
                  Show Less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Read Full Caption <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>

        {/* CTA & Hashtags */}
        <div className="mt-4 pt-3 border-t border-borderMuted/40 space-y-2">
          {/* CTA */}
          <div className="flex items-start gap-1.5 text-xs text-charcoal-800">
            <ArrowUpRight className="w-3.5 h-3.5 text-olive-600 shrink-0 mt-0.5" />
            <span className="font-medium text-charcoal-900">CTA:</span>
            <span className="text-charcoal-600">{post.cta}</span>
          </div>

          {/* Hashtags */}
          <div className="flex items-start gap-1.5 text-[11px] text-charcoal-500">
            <Tag className="w-3.5 h-3.5 text-taupe-500 shrink-0 mt-0.5" />
            <span className="font-mono text-charcoal-600">{post.hashtags}</span>
          </div>
        </div>

        {/* Visual Generation Prompt Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-ivory-100/80 border border-sand text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-charcoal-700 text-[11px] uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5 text-olive-600" />
            <span>Art Direction / Visual Prompt</span>
          </div>
          <p className="text-charcoal-600 font-sans italic text-[11px] leading-relaxed">
            "{post.visual_prompt}"
          </p>
        </div>

        {/* Editorial notes if present */}
        {post.notes && (
          <div className="mt-3 text-[11px] text-charcoal-500 italic flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-taupe-400 shrink-0" />
            <span>Note: {post.notes}</span>
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="p-4 bg-ivory-50/60 border-t border-borderMuted/60 flex items-center justify-between gap-2">
        <button
          onClick={() => onEdit(post)}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-borderMuted bg-white text-charcoal-700 text-xs font-medium hover:bg-ivory-100 transition-colors shadow-subtle"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* If Approved or Rejected, allow resetting back to Pending */}
          {(isApproved || isRejected) && (
            <button
              onClick={() => handleAction(onResetToPending)}
              disabled={isProcessing}
              title="Reset status back to Pending Review"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-800 text-xs font-medium hover:bg-ivory-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* Reject button */}
          {!isRejected && (
            <button
              onClick={() => handleAction(onReject)}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-borderMuted bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 text-xs font-medium transition-colors shadow-subtle"
            >
              <X className="w-3.5 h-3.5 text-stone-500" />
              <span>Reject</span>
            </button>
          )}

          {/* Approve button */}
          {!isApproved && (
            <button
              onClick={() => handleAction(onApprove)}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-olive-700 text-white text-xs font-medium hover:bg-olive-800 transition-colors shadow-subtle"
            >
              <Check className="w-3.5 h-3.5 text-olive-200" />
              <span>Approve</span>
            </button>
          )}

          {isApproved && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-olive-800 px-2 py-1 bg-olive-100 rounded-md">
              <Check className="w-3.5 h-3.5 text-olive-600" />
              Approved
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
