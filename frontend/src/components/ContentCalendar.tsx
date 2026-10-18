import React, { useState } from 'react';
import {
  Download,
  Search,
  FileSpreadsheet,
  RotateCw,
  LayoutGrid,
  Table as TableIcon,
  ArrowLeft,
  FileText,
  Edit3
} from 'lucide-react';
import type { Campaign, Post, PlatformType, PostStatus } from '../types';
import { PostCard } from './PostCard';
import { StatusBadge, PlatformBadge } from './Badge';

interface ContentCalendarProps {
  campaign: Campaign;
  onBackToDashboard: () => void;
  onEditPost: (post: Post) => void;
  onApprovePost: (id: number) => Promise<void>;
  onRejectPost: (id: number) => Promise<void>;
  onResetPostToPending: (id: number) => Promise<void>;
  onExportCsv: (approvedOnly: boolean) => Promise<void>;
  onRegenerate: () => Promise<void>;
  onOpenGoogleSheets: () => void;
  isRegenerating: boolean;
  isExporting: boolean;
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  campaign,
  onBackToDashboard,
  onEditPost,
  onApprovePost,
  onRejectPost,
  onResetPostToPending,
  onExportCsv,
  onRegenerate,
  onOpenGoogleSheets,
  isRegenerating,
  isExporting,
}) => {
  const [platformFilter, setPlatformFilter] = useState<'All' | PlatformType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | PostStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const posts = campaign.posts || [];

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (platformFilter !== 'All' && post.platform !== platformFilter) return false;
    if (statusFilter !== 'All' && post.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTopic = post.topic.toLowerCase().includes(q);
      const matchCaption = post.caption.toLowerCase().includes(q);
      const matchType = post.content_type.toLowerCase().includes(q);
      const matchPrompt = post.visual_prompt.toLowerCase().includes(q);
      if (!matchTopic && !matchCaption && !matchType && !matchPrompt) return false;
    }
    return true;
  });

  const approvedCount = posts.filter((p) => p.status === 'Approved').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Campaign Header & Meta */}
      <div className="bg-white rounded-2xl border border-borderMuted p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-borderMuted/60">
          <div>
            <button
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-charcoal-900 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Studio Dashboard</span>
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900">
                {campaign.brand_name}
              </h1>
              <span className="text-xs uppercase tracking-wider font-semibold text-olive-800 bg-olive-100/70 px-2.5 py-1 rounded-full border border-olive-200">
                {campaign.industry}
              </span>
              {campaign.is_demo_mode && (
                <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Labelled Demo Strategy
                </span>
              )}
            </div>
            <p className="mt-2 text-xs sm:text-sm text-charcoal-600 max-w-3xl leading-relaxed">
              <strong>Objective:</strong> {campaign.campaign_objective}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            {/* Export Approved CSV */}
            <button
              onClick={() => onExportCsv(true)}
              disabled={isExporting || approvedCount === 0}
              title={
                approvedCount === 0
                  ? 'Approve at least one post to export approved calendar'
                  : 'Export approved posts to CSV'
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-olive-700 text-white text-xs font-medium hover:bg-olive-800 transition-all shadow-subtle disabled:opacity-40"
            >
              <Download className="w-4 h-4 text-olive-200" />
              <span>Export Approved CSV ({approvedCount})</span>
            </button>

            {/* Export All CSV */}
            <button
              onClick={() => onExportCsv(false)}
              disabled={isExporting || posts.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-borderMuted bg-ivory-50 text-charcoal-800 text-xs font-medium hover:bg-ivory-200 transition-all shadow-subtle"
            >
              <Download className="w-4 h-4 text-taupe-500" />
              <span>Export All ({posts.length})</span>
            </button>

            {/* Integrations Modal Trigger */}
            <button
              onClick={onOpenGoogleSheets}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-emerald-300/80 bg-emerald-50 text-emerald-900 text-xs font-medium hover:bg-emerald-100 transition-all shadow-subtle"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Integrations & Cloud Sync</span>
            </button>

            {/* Regenerate LLM Content */}
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-borderMuted bg-white text-charcoal-700 text-xs font-medium hover:bg-ivory-100 transition-all shadow-subtle disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* Campaign Details Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-charcoal-400 uppercase font-semibold text-[10px] tracking-wider block">
              Brand Voice
            </span>
            <span className="text-charcoal-800 font-medium mt-0.5 block">{campaign.brand_voice}</span>
          </div>
          <div>
            <span className="text-charcoal-400 uppercase font-semibold text-[10px] tracking-wider block">
              Platforms
            </span>
            <span className="text-charcoal-800 font-medium mt-0.5 block">
              {campaign.platforms.join(', ')}
            </span>
          </div>
          <div>
            <span className="text-charcoal-400 uppercase font-semibold text-[10px] tracking-wider block">
              Target Audience
            </span>
            <span className="text-charcoal-800 font-medium mt-0.5 block line-clamp-1">
              {campaign.target_audience}
            </span>
          </div>
          <div>
            <span className="text-charcoal-400 uppercase font-semibold text-[10px] tracking-wider block">
              Offerings / Products
            </span>
            <span className="text-charcoal-800 font-medium mt-0.5 block line-clamp-1">
              {campaign.products_services}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and View Toolbar */}
      <div className="bg-white rounded-xl border border-borderMuted p-4 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, copy, or visual prompts..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-borderMuted bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 text-xs"
          />
        </div>

        {/* Filter Badges & View Switcher */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Platform Filter */}
          <div className="flex items-center gap-1 bg-ivory-100 p-1 rounded-lg border border-borderMuted/80 text-xs">
            {(['All', 'Instagram', 'LinkedIn'] as const).map((plat) => (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  platformFilter === plat
                    ? 'bg-white text-charcoal-900 shadow-subtle'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-ivory-100 p-1 rounded-lg border border-borderMuted/80 text-xs">
            {(['All', 'Pending Review', 'Approved', 'Rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-white text-charcoal-900 shadow-subtle'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Grid vs Table Toggle */}
          <div className="flex items-center gap-1 bg-ivory-100 p-1 rounded-lg border border-borderMuted/80 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-charcoal-900 shadow-subtle'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-charcoal-900 shadow-subtle'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
              title="Compact Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Posts Display */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-borderMuted p-12 text-center max-w-md mx-auto">
          <FileText className="w-8 h-8 text-charcoal-400 mx-auto mb-3" />
          <h3 className="font-editorial text-lg font-bold text-charcoal-900">
            No matching posts found
          </h3>
          <p className="mt-1 text-xs text-charcoal-500">
            Try adjusting your search query or relaxing your platform/status filters.
          </p>
          <button
            onClick={() => {
              setPlatformFilter('All');
              setStatusFilter('All');
              setSearchQuery('');
            }}
            className="mt-4 px-3 py-1.5 rounded-lg border border-borderMuted text-xs font-medium text-charcoal-700 hover:bg-ivory-100"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={onEditPost}
              onApprove={onApprovePost}
              onReject={onRejectPost}
              onResetToPending={onResetPostToPending}
            />
          ))}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-white rounded-2xl border border-borderMuted overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 border-b border-borderMuted text-charcoal-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Day & Date</th>
                  <th className="px-4 py-3.5">Platform</th>
                  <th className="px-4 py-3.5">Topic & Copy</th>
                  <th className="px-4 py-3.5">Call to Action</th>
                  <th className="px-4 py-3.5">Visual Prompt</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderMuted/60 font-sans">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-ivory-50/60 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-charcoal-900">
                      <div>Day {post.day_number}</div>
                      <div className="text-[10px] text-charcoal-500">{post.scheduled_date}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <PlatformBadge platform={post.platform} />
                    </td>
                    <td className="px-4 py-4 max-w-sm">
                      <div className="font-semibold text-charcoal-900 font-editorial text-sm">
                        {post.topic}
                      </div>
                      <div className="text-charcoal-600 line-clamp-2 mt-1 leading-relaxed">
                        {post.caption}
                      </div>
                      <div className="text-[10px] text-charcoal-400 font-mono mt-1">
                        {post.hashtags}
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-xs text-charcoal-700 leading-relaxed">
                      {post.cta}
                    </td>
                    <td className="px-4 py-4 max-w-xs text-charcoal-600 italic text-[11px] leading-relaxed">
                      "{post.visual_prompt.slice(0, 100)}..."
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={post.status} size="sm" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right space-x-1.5">
                      <button
                        onClick={() => onEditPost(post)}
                        className="p-1.5 text-charcoal-600 hover:text-charcoal-950 rounded hover:bg-ivory-200 transition-colors"
                        title="Edit Post"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {post.status !== 'Approved' && (
                        <button
                          onClick={() => onApprovePost(post.id)}
                          className="px-2 py-1 bg-olive-700 text-white rounded text-[11px] font-medium hover:bg-olive-800 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {post.status !== 'Rejected' && (
                        <button
                          onClick={() => onRejectPost(post.id)}
                          className="px-2 py-1 border border-borderMuted text-stone-700 rounded text-[11px] font-medium hover:bg-stone-100 transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
