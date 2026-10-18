import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  FolderPlus,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  Trash2
} from 'lucide-react';
import type { Campaign, DashboardStats } from '../types';

interface DashboardOverviewProps {
  stats: DashboardStats | null;
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onOpenCreateModal: () => void;
  onLoadDemo: () => void;
  onDeleteCampaign: (id: number) => void;
  isSeedingDemo: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  campaigns,
  onSelectCampaign,
  onOpenCreateModal,
  onLoadDemo,
  onDeleteCampaign,
  isSeedingDemo,
}) => {
  const totalPosts = stats?.total_generated_posts ?? 0;
  const pendingPosts = stats?.posts_awaiting_review ?? 0;
  const approvedPosts = stats?.approved_posts ?? 0;
  const rejectedPosts = stats?.rejected_posts ?? 0;

  return (
    <div className="space-y-10">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ivory-200 via-ivory-50 to-sand/40 border border-borderMuted p-8 sm:p-10 shadow-subtle">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-olive-100/80 border border-olive-200/80 text-olive-900 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-olive-700" />
            AI Content Architecture for Luxury Brands
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-charcoal-900 leading-tight">
            Curate enduring social narratives for architectural ateliers.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-charcoal-600 leading-relaxed max-w-2xl">
            Generate 7-day structured content calendars for high-end interior designers, bespoke
            furniture ateliers, and architectural studios. Review copy, approve creative direction,
            and export ready-to-publish campaigns.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-charcoal-900 text-ivory-100 font-medium hover:bg-charcoal-800 transition-all shadow-subtle hover:shadow-elevated text-sm"
            >
              <FolderPlus className="w-4 h-4 text-olive-300" />
              <span>Create Campaign</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLoadDemo}
              disabled={isSeedingDemo}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-charcoal-300/60 bg-white/80 backdrop-blur text-charcoal-800 font-medium hover:bg-white hover:text-charcoal-950 transition-all text-sm shadow-subtle"
            >
              <Sparkles className="w-4 h-4 text-taupe-500" />
              <span>{isSeedingDemo ? 'Loading Maison Demo...' : 'Load Maison Living Demo'}</span>
            </button>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-olive-100/40 blur-3xl pointer-events-none" />
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Posts */}
        <div className="bg-white rounded-xl border border-borderMuted p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400">
              Total Generated
            </span>
            <div className="w-8 h-8 rounded-lg bg-ivory-200 flex items-center justify-center text-charcoal-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-editorial text-charcoal-900">{totalPosts}</span>
            <span className="text-xs text-charcoal-500">posts created</span>
          </div>
        </div>

        {/* Awaiting Review */}
        <div className="bg-white rounded-xl border border-borderMuted p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-taupe-600">
              Awaiting Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-taupe-100 flex items-center justify-center text-taupe-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-editorial text-charcoal-900">{pendingPosts}</span>
            <span className="text-xs text-taupe-600">pending sign-off</span>
          </div>
        </div>

        {/* Approved Posts */}
        <div className="bg-white rounded-xl border border-borderMuted p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-olive-700">
              Approved Content
            </span>
            <div className="w-8 h-8 rounded-lg bg-olive-100 flex items-center justify-center text-olive-700">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-editorial text-olive-900">{approvedPosts}</span>
            <span className="text-xs text-olive-700">ready to export</span>
          </div>
        </div>

        {/* Rejected Posts */}
        <div className="bg-white rounded-xl border border-borderMuted p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400">
              Needs Revision
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-editorial text-charcoal-800">{rejectedPosts}</span>
            <span className="text-xs text-charcoal-500">rejected / reworked</span>
          </div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900">Recent Campaigns</h2>
            <p className="text-xs sm:text-sm text-charcoal-500">
              Active luxury studio campaigns stored in your local SQLite workspace.
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="text-xs sm:text-sm font-medium text-olive-700 hover:text-olive-800 flex items-center gap-1.5"
          >
            <span>+ New Campaign</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-borderMuted p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-ivory-200 text-charcoal-600 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-xl font-semibold text-charcoal-900">
              No Campaigns Yet
            </h3>
            <p className="mt-2 text-sm text-charcoal-500">
              Enter a brand brief to generate a 7-day architectural social media plan or test with our sample studio.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={onOpenCreateModal}
                className="px-4 py-2.5 rounded-lg bg-charcoal-900 text-ivory-100 text-xs font-medium hover:bg-charcoal-800 transition-colors"
              >
                Create Campaign
              </button>
              <button
                onClick={onLoadDemo}
                disabled={isSeedingDemo}
                className="px-4 py-2.5 rounded-lg border border-borderMuted bg-ivory-50 text-charcoal-800 text-xs font-medium hover:bg-ivory-200 transition-colors"
              >
                {isSeedingDemo ? 'Loading...' : 'Load Maison Studio Demo'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => {
              const approvalRate =
                camp.total_posts > 0 ? Math.round((camp.approved_posts / camp.total_posts) * 100) : 0;

              return (
                <div
                  key={camp.id}
                  className="bg-white rounded-xl border border-borderMuted p-6 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-olive-700 bg-olive-50 px-2 py-0.5 rounded border border-olive-200/60">
                          {camp.industry.split('&')[0].trim()}
                        </span>
                        <h3 className="font-editorial text-xl font-bold text-charcoal-900 mt-2 group-hover:text-olive-800 transition-colors">
                          {camp.brand_name}
                        </h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete campaign "${camp.brand_name}"?`)) {
                            onDeleteCampaign(camp.id);
                          }
                        }}
                        className="text-charcoal-300 hover:text-rose-600 transition-colors p-1"
                        title="Delete campaign"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-charcoal-600 line-clamp-2 leading-relaxed">
                      {camp.campaign_objective}
                    </p>

                    {/* Meta tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {camp.platforms.map((p) => (
                        <span
                          key={p}
                          className="text-[10px] font-medium text-charcoal-600 bg-ivory-200 px-2 py-0.5 rounded"
                        >
                          {p}
                        </span>
                      ))}
                      <span className="text-[10px] font-medium text-charcoal-500 bg-ivory-100 px-2 py-0.5 rounded border border-borderMuted">
                        {camp.number_of_days} Days
                      </span>
                      {camp.is_demo_mode && (
                        <span className="text-[10px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Demo Mode
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-charcoal-500">
                        <span>Sign-off Progress</span>
                        <span className="font-semibold text-charcoal-800">
                          {camp.approved_posts} / {camp.total_posts} Approved ({approvalRate}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-ivory-200 overflow-hidden flex">
                        <div
                          className="bg-olive-600 h-full transition-all duration-500"
                          style={{
                            width: `${(camp.approved_posts / (camp.total_posts || 1)) * 100}%`,
                          }}
                        />
                        <div
                          className="bg-taupe-400 h-full transition-all duration-500"
                          style={{
                            width: `${(camp.pending_posts / (camp.total_posts || 1)) * 100}%`,
                          }}
                        />
                        <div
                          className="bg-stone-300 h-full transition-all duration-500"
                          style={{
                            width: `${(camp.rejected_posts / (camp.total_posts || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Open Calendar Action */}
                  <div className="mt-6 pt-4 border-t border-borderMuted/60 flex items-center justify-between">
                    <span className="text-[11px] text-charcoal-400">
                      Created {new Date(camp.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => onSelectCampaign(camp)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-900 hover:text-olive-800 transition-colors"
                    >
                      <span>Open Calendar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
