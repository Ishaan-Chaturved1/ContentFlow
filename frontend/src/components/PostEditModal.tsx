import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { Post, PlatformType, PostStatus } from '../types';

interface PostEditModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, patch: Partial<Post>) => Promise<void>;
  isSaving: boolean;
}

export const PostEditModal: React.FC<PostEditModalProps> = ({
  post,
  isOpen,
  onClose,
  onSave,
  isSaving,
}) => {
  const [formData, setFormData] = useState<Partial<Post>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (post) {
      setFormData({
        topic: post.topic,
        content_type: post.content_type,
        platform: post.platform,
        scheduled_date: post.scheduled_date,
        caption: post.caption,
        hashtags: post.hashtags,
        cta: post.cta,
        visual_prompt: post.visual_prompt,
        notes: post.notes || '',
        status: post.status,
      });
      setError(null);
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic?.trim() || !formData.caption?.trim()) {
      setError('Topic and caption cannot be empty.');
      return;
    }

    try {
      await onSave(post.id, formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update post.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-charcoal-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-borderMuted shadow-elevated w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-borderMuted flex items-center justify-between bg-ivory-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-olive-700 bg-olive-100/70 px-2 py-0.5 rounded">
                Day {post.day_number}
              </span>
              <span className="text-xs text-charcoal-500">{formData.scheduled_date}</span>
            </div>
            <h2 className="font-editorial text-xl font-bold text-charcoal-900 mt-1">
              Edit Post Copy & Creative Direction
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Platform & Content Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) =>
                  setFormData({ ...formData, platform: e.target.value as PlatformType })
                }
                className="w-full px-3 py-2 rounded-xl border border-borderMuted bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600"
              >
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Content Type
              </label>
              <input
                type="text"
                value={formData.content_type || ''}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-borderMuted bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600"
              />
            </div>
          </div>

          {/* Topic / Hook */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Topic / Primary Hook
            </label>
            <input
              type="text"
              value={formData.topic || ''}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-borderMuted bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 font-medium"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Social Media Copy (Caption)
            </label>
            <textarea
              rows={5}
              value={formData.caption || ''}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 font-sans leading-relaxed"
            />
          </div>

          {/* Hashtags & CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Hashtags
              </label>
              <input
                type="text"
                value={formData.hashtags || ''}
                onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-borderMuted bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Call to Action (CTA)
              </label>
              <input
                type="text"
                value={formData.cta || ''}
                onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-borderMuted bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 text-xs"
              />
            </div>
          </div>

          {/* Visual Prompt */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Art Director / Visual Generation Prompt
            </label>
            <textarea
              rows={3}
              value={formData.visual_prompt || ''}
              onChange={(e) => setFormData({ ...formData, visual_prompt: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-borderMuted bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 text-xs font-mono"
            />
          </div>

          {/* Editorial Notes */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Internal Editorial Notes / Feedback
            </label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Approved by Creative Director for client review"
              className="w-full px-3 py-2 rounded-xl border border-borderMuted bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 text-xs"
            />
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Review Status
            </label>
            <div className="flex gap-3">
              {(['Pending Review', 'Approved', 'Rejected'] as PostStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: st })}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    formData.status === st
                      ? 'bg-charcoal-900 text-ivory-100 border-charcoal-900 shadow-subtle'
                      : 'bg-ivory-50 text-charcoal-700 border-borderMuted hover:bg-ivory-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-borderMuted flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-borderMuted text-charcoal-600 hover:text-charcoal-900 text-sm font-medium hover:bg-ivory-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-900 text-ivory-100 text-sm font-medium hover:bg-charcoal-800 transition-all shadow-subtle disabled:opacity-60"
            >
              <Save className="w-4 h-4 text-olive-300" />
              <span>{isSaving ? 'Saving to SQLite...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
