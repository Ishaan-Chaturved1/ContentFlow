import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  FolderPlus,
  ArrowRight,
  Sparkles,
  Trash2,
  Download,
  FileSpreadsheet,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import type { Campaign, DashboardStats } from '../types';

interface DashboardOverviewProps {
  stats: DashboardStats | null;
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onOpenCreateModal: () => void;
  onLoadDemo: () => void;
  onDeleteCampaign: (id: number) => void;
  onExportCsv?: (campaignId: number, approvedOnly: boolean) => Promise<void>;
  onOpenIntegrations?: () => void;
  isSeedingDemo: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  campaigns,
  onSelectCampaign,
  onOpenCreateModal,
  onLoadDemo,
  onDeleteCampaign,
  onExportCsv,
  onOpenIntegrations,
  isSeedingDemo,
}) => {
  const [exportingCampId, setExportingCampId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const totalPosts = stats?.total_generated_posts ?? 0;
  const pendingPosts = stats?.posts_awaiting_review ?? 0;
  const approvedPosts = stats?.approved_posts ?? 0;
  const rejectedPosts = stats?.rejected_posts ?? 0;

  const handleQuickExport = async (campaignId: number, approvedOnly: boolean) => {
    if (!onExportCsv) return;
    setExportingCampId(campaignId);
    setOpenDropdownId(null);
    try {
      await onExportCsv(campaignId, approvedOnly);
    } finally {
      setExportingCampId(null);
    }
  };

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
            and export ready-to-publish campaigns with zero-config CSV delivery.
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

            {onOpenIntegrations && (
              <button
                onClick={onOpenIntegrations}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl border border-borderMuted bg-ivory-100/80 text-charcoal-700 font-medium hover:bg-ivory-200 transition-all text-sm"
              >
                <Download className="w-4 h-4 text-olive-700" />
                <span>Export & Integrations</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Analytics KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Generated Posts */}
        <div className="bg-white rounded-xl border border-borderMuted p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
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
              Active luxury studio campaigns stored in your SQLite database.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenIntegrations && (
              <button
                onClick={onOpenIntegrations}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-borderMuted bg-white text-xs font-medium text-charcoal-700 hover:bg-ivory-100 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Integration Settings</span>
              </button>
            )}
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-olive-700 text-white text-xs font-medium hover:bg-olive-800 transition-colors shadow-subtle"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-borderMuted p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-ivory-200 text-charcoal-500 flex items-center justify-center mx-auto">
              <FolderPlus className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="font-editorial text-lg font-bold text-charcoal-900">
                No active campaigns found
              </h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Begin by creating a brand brief for an architectural studio or load our curated Maison
                Living Studio luxury demo.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onOpenCreateModal}
                className="px-4 py-2 rounded-lg bg-charcoal-900 text-ivory-100 text-xs font-medium hover:bg-charcoal-800 transition-colors"
              >
                Create Campaign
              </button>
              <button
                onClick={onLoadDemo}
                disabled={isSeedingDemo}
                className="px-4 py-2 rounded-lg border border-borderMuted bg-ivory-100 text-charcoal-800 text-xs font-medium hover:bg-ivory-200 transition-colors"
              >
                Load Maison Demo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => {
              const approvalRate =
                camp.total_posts > 0 ? Math.round((camp.approved_posts / camp.total_posts) * 100) : 0;
              const isExportingThis = exportingCampId === camp.id;
              const isDropdownOpen = openDropdownId === camp.id;

              return (
                <div
                  key={camp.id}
                  className="bg-white rounded-xl border border-borderMuted p-6 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between group relative"
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

                  {/* Actions Bar: Obvious Export CSV + Open Calendar */}
                  <div className="mt-6 pt-4 border-t border-borderMuted/60 flex items-center justify-between gap-2">
                    {/* Obvious Export CSV Action with Dropdown Options */}
                    <div className="relative">
                      <div className="inline-flex rounded-lg shadow-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickExport(camp.id, camp.approved_posts > 0);
                          }}
                          disabled={isExportingThis || camp.total_posts === 0}
                          title={
                            camp.approved_posts > 0
                              ? `Export ${camp.approved_posts} approved posts to CSV`
                              : `Export all ${camp.total_posts} posts to CSV`
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-l-lg border border-borderMuted bg-ivory-50 text-charcoal-700 hover:bg-olive-50 hover:border-olive-300 hover:text-olive-900 text-xs font-medium transition-all disabled:opacity-40"
                        >
                          {isExportingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-olive-700" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-olive-700" />
                          )}
                          <span>
                            Export CSV (
                            {camp.approved_posts > 0 ? `${camp.approved_posts} Approved` : `${camp.total_posts} All`}
                            )
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(isDropdownOpen ? null : camp.id);
                          }}
                          className="px-1.5 py-1.5 border border-l-0 border-borderMuted bg-ivory-50 text-charcoal-600 hover:bg-ivory-200 rounded-r-lg text-xs"
                          title="More export options"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Export Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute left-0 bottom-full mb-1 w-48 rounded-xl bg-white border border-borderMuted shadow-elevated p-1 z-20 animate-fade-in text-xs">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickExport(camp.id, true);
                            }}
                            disabled={camp.approved_posts === 0}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-olive-50 text-charcoal-800 hover:text-olive-900 flex items-center justify-between disabled:opacity-40"
                          >
                            <span>Approved Only</span>
                            <span className="font-semibold text-olive-700">({camp.approved_posts})</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickExport(camp.id, false);
                            }}
                            disabled={camp.total_posts === 0}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-ivory-100 text-charcoal-800 flex items-center justify-between disabled:opacity-40"
                          >
                            <span>All Campaign Posts</span>
                            <span className="font-semibold text-charcoal-600">({camp.total_posts})</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Open Calendar */}
                    <button
                      onClick={() => onSelectCampaign(camp)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-900 hover:text-olive-800 transition-colors shrink-0"
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
