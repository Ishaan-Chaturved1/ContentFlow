import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api/client';
import type {
  Campaign,
  CampaignCreateInput,
  DashboardStats,
  HealthStatus,
  Post,
  SheetsSyncResult,
} from './types';
import { Navbar } from './components/Navbar';
import { DemoBanner } from './components/DemoBanner';
import { DashboardOverview } from './components/DashboardOverview';
import { ContentCalendar } from './components/ContentCalendar';
import { CampaignCreateModal } from './components/CampaignCreateModal';
import { PostEditModal } from './components/PostEditModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { ApiSetupModal } from './components/ApiSetupModal';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar'>('dashboard');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isApiSetupOpen, setIsApiSetupOpen] = useState(false);

  // Loaders
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load
  const loadData = useCallback(async () => {
    try {
      const [healthData, statsData, campaignsData] = await Promise.all([
        api.getHealth(),
        api.getDashboardStats(),
        api.getCampaigns(),
      ]);
      setHealth(healthData);
      setStats(statsData);
      setCampaigns(campaignsData);

      // If active campaign was selected, refresh it
      if (activeCampaign) {
        const refreshed = await api.getCampaign(activeCampaign.id);
        setActiveCampaign(refreshed);
      }
    } catch (err: any) {
      console.error('Error loading initial data:', err);
      addToast('error', `Connection error: ${err.message}`);
    } finally {
      setIsInitialLoading(false);
    }
  }, [activeCampaign]);

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleSelectCampaign = async (camp: Campaign) => {
    try {
      const full = await api.getCampaign(camp.id);
      setActiveCampaign(full);
      setCurrentView('calendar');
    } catch (err: any) {
      addToast('error', `Failed to open campaign: ${err.message}`);
    }
  };

  const handleCreateCampaign = async (input: CampaignCreateInput) => {
    setIsCreating(true);
    try {
      const created = await api.createCampaign(input);
      addToast(
        'success',
        `Campaign for "${created.brand_name}" created with ${created.total_posts} generated posts!`
      );
      setIsCreateModalOpen(false);
      setActiveCampaign(created);
      setCurrentView('calendar');
      await loadData();
    } catch (err: any) {
      addToast('error', `Generation failed: ${err.message}`);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const handleSeedDemo = async () => {
    setIsSeedingDemo(true);
    try {
      const demo = await api.seedDemoCampaign();
      addToast(
        'success',
        `Maison Living Studio sample campaign loaded with 7 architectural posts.`
      );
      setActiveCampaign(demo);
      setCurrentView('calendar');
      await loadData();
    } catch (err: any) {
      addToast('error', `Failed to seed demo campaign: ${err.message}`);
    } finally {
      setIsSeedingDemo(false);
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    try {
      await api.deleteCampaign(id);
      addToast('info', 'Campaign deleted from SQLite database.');
      if (activeCampaign?.id === id) {
        setActiveCampaign(null);
        setCurrentView('dashboard');
      }
      await loadData();
    } catch (err: any) {
      addToast('error', `Delete failed: ${err.message}`);
    }
  };

  const handleApprovePost = async (postId: number) => {
    try {
      const updated = await api.approvePost(postId);
      if (activeCampaign) {
        const updatedPosts = (activeCampaign.posts || []).map((p) =>
          p.id === postId ? updated : p
        );
        setActiveCampaign({
          ...activeCampaign,
          posts: updatedPosts,
          approved_posts: updatedPosts.filter((p) => p.status === 'Approved').length,
          pending_posts: updatedPosts.filter((p) => p.status === 'Pending Review').length,
          rejected_posts: updatedPosts.filter((p) => p.status === 'Rejected').length,
        });
      }
      addToast('success', `Day ${updated.day_number} post approved for publishing.`);
      api.getDashboardStats().then(setStats);
    } catch (err: any) {
      addToast('error', `Approval failed: ${err.message}`);
    }
  };

  const handleRejectPost = async (postId: number) => {
    try {
      const updated = await api.rejectPost(postId);
      if (activeCampaign) {
        const updatedPosts = (activeCampaign.posts || []).map((p) =>
          p.id === postId ? updated : p
        );
        setActiveCampaign({
          ...activeCampaign,
          posts: updatedPosts,
          approved_posts: updatedPosts.filter((p) => p.status === 'Approved').length,
          pending_posts: updatedPosts.filter((p) => p.status === 'Pending Review').length,
          rejected_posts: updatedPosts.filter((p) => p.status === 'Rejected').length,
        });
      }
      addToast('info', `Day ${updated.day_number} post marked as rejected.`);
      api.getDashboardStats().then(setStats);
    } catch (err: any) {
      addToast('error', `Reject failed: ${err.message}`);
    }
  };

  const handleResetPostToPending = async (postId: number) => {
    try {
      const updated = await api.resetPostToPending(postId);
      if (activeCampaign) {
        const updatedPosts = (activeCampaign.posts || []).map((p) =>
          p.id === postId ? updated : p
        );
        setActiveCampaign({
          ...activeCampaign,
          posts: updatedPosts,
          approved_posts: updatedPosts.filter((p) => p.status === 'Approved').length,
          pending_posts: updatedPosts.filter((p) => p.status === 'Pending Review').length,
          rejected_posts: updatedPosts.filter((p) => p.status === 'Rejected').length,
        });
      }
      addToast('info', `Day ${updated.day_number} moved back to Pending Review.`);
      api.getDashboardStats().then(setStats);
    } catch (err: any) {
      addToast('error', `Reset failed: ${err.message}`);
    }
  };

  const handleSavePostEdit = async (postId: number, patch: Partial<Post>) => {
    setIsSavingPost(true);
    try {
      const updated = await api.updatePost(postId, patch);
      if (activeCampaign) {
        const updatedPosts = (activeCampaign.posts || []).map((p) =>
          p.id === postId ? updated : p
        );
        setActiveCampaign({
          ...activeCampaign,
          posts: updatedPosts,
          approved_posts: updatedPosts.filter((p) => p.status === 'Approved').length,
          pending_posts: updatedPosts.filter((p) => p.status === 'Pending Review').length,
          rejected_posts: updatedPosts.filter((p) => p.status === 'Rejected').length,
        });
      }
      addToast('success', `Changes saved to SQLite for Day ${updated.day_number}.`);
      api.getDashboardStats().then(setStats);
    } catch (err: any) {
      addToast('error', `Save failed: ${err.message}`);
      throw err;
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleExportCsv = async (approvedOnly: boolean) => {
    if (!activeCampaign) return;
    setIsExporting(true);
    try {
      await api.exportCampaignCsv(activeCampaign.id, approvedOnly);
      addToast(
        'success',
        approvedOnly
          ? 'Approved posts exported to CSV successfully.'
          : 'Complete campaign exported to CSV successfully.'
      );
    } catch (err: any) {
      addToast('error', `Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRegenerate = async () => {
    if (!activeCampaign) return;
    setIsRegenerating(true);
    try {
      const refreshed = await api.regenerateCampaign(activeCampaign.id);
      setActiveCampaign(refreshed);
      addToast('success', 'Calendar regenerated successfully with new creative angles.');
      await loadData();
    } catch (err: any) {
      addToast('error', `Regeneration failed: ${err.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSyncGoogleSheets = async (spreadsheetId?: string): Promise<SheetsSyncResult> => {
    if (!activeCampaign) throw new Error('No active campaign');
    return await api.syncToGoogleSheets(activeCampaign.id, spreadsheetId, true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 text-charcoal-900 selection:bg-olive-100 selection:text-olive-900 font-sans">
      {/* Demo vs Live banner */}
      <DemoBanner health={health} onOpenSetupGuide={() => setIsApiSetupOpen(true)} />

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeCampaign={activeCampaign}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onLoadDemo={handleSeedDemo}
        isSeedingDemo={isSeedingDemo}
        health={health}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-olive-700 mb-3" />
            <p className="text-sm font-medium text-charcoal-600">
              Connecting to ContentFlow AI backend...
            </p>
          </div>
        ) : currentView === 'calendar' && activeCampaign ? (
          <ContentCalendar
            campaign={activeCampaign}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onEditPost={(p) => setEditingPost(p)}
            onApprovePost={handleApprovePost}
            onRejectPost={handleRejectPost}
            onResetPostToPending={handleResetPostToPending}
            onExportCsv={handleExportCsv}
            onRegenerate={handleRegenerate}
            onOpenGoogleSheets={() => setIsSheetsModalOpen(true)}
            isRegenerating={isRegenerating}
            isExporting={isExporting}
          />
        ) : (
          <DashboardOverview
            stats={stats}
            campaigns={campaigns}
            onSelectCampaign={handleSelectCampaign}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onLoadDemo={handleSeedDemo}
            onDeleteCampaign={handleDeleteCampaign}
            isSeedingDemo={isSeedingDemo}
          />
        )}
      </main>

      {/* Modals */}
      <CampaignCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCampaign}
        isLoading={isCreating}
      />

      <PostEditModal
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        onSave={handleSavePostEdit}
        isSaving={isSavingPost}
      />

      {activeCampaign && (
        <GoogleSheetsModal
          isOpen={isSheetsModalOpen}
          onClose={() => setIsSheetsModalOpen(false)}
          campaign={activeCampaign}
          onSync={handleSyncGoogleSheets}
        />
      )}

      <ApiSetupModal
        isOpen={isApiSetupOpen}
        onClose={() => setIsApiSetupOpen(false)}
      />

      {/* Toast notifications container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="mt-auto border-t border-borderMuted/80 bg-white/70 py-6 text-center text-xs text-charcoal-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 ContentFlow AI — AI Generalist Intern Portfolio Project</p>
          <div className="flex items-center gap-4 text-charcoal-600">
            <span>FastAPI + SQLite Backend</span>
            <span>•</span>
            <span>React + Vite + Tailwind Frontend</span>
            <span>•</span>
            <button
              onClick={() => setIsApiSetupOpen(true)}
              className="text-olive-700 hover:text-olive-900 underline"
            >
              LLM Provider Config
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
