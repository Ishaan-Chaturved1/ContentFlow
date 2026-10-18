import React from 'react';
import { Sparkles, Plus, LayoutDashboard, Calendar } from 'lucide-react';
import type { Campaign, HealthStatus } from '../types';

interface NavbarProps {
  currentView: 'dashboard' | 'calendar';
  setCurrentView: (view: 'dashboard' | 'calendar') => void;
  activeCampaign: Campaign | null;
  onOpenCreateModal: () => void;
  onLoadDemo: () => void;
  isSeedingDemo: boolean;
  health: HealthStatus | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  activeCampaign,
  onOpenCreateModal,
  onLoadDemo,
  isSeedingDemo,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-borderMuted sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Title */}
        <div className="flex items-center gap-8">
          <div
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-olive-700 text-ivory-100 flex items-center justify-center font-serif text-xl font-bold shadow-subtle group-hover:bg-olive-800 transition-colors">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-xl font-bold tracking-tight text-charcoal-900">
                  ContentFlow
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-olive-100 text-olive-800 font-semibold tracking-wide">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-charcoal-500 tracking-wider uppercase font-medium">
                Luxury & Interior Studio Suite
              </p>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-borderMuted/80">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'dashboard'
                  ? 'bg-ivory-200 text-charcoal-900 shadow-subtle'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            {activeCampaign && (
              <button
                onClick={() => setCurrentView('calendar')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === 'calendar'
                    ? 'bg-ivory-200 text-charcoal-900 shadow-subtle'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendar</span>
              <span className="text-xs bg-olive-200/70 text-olive-900 px-1.5 py-0.5 rounded-full font-medium">
                {activeCampaign.brand_name.split(' ')[0]}
              </span>
            </button>
          )}
        </nav>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Quick 1-click Demo Seed for Maison Living Studio */}
        <button
          onClick={onLoadDemo}
          disabled={isSeedingDemo}
          title="Load sample Maison Living Studio luxury campaign"
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-borderMuted bg-ivory-50 text-charcoal-700 text-xs font-medium hover:bg-ivory-200 hover:text-charcoal-900 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-taupe-500" />
          {isSeedingDemo ? 'Loading Demo...' : 'Load Maison Demo'}
        </button>

        {/* Create Campaign CTA */}
        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-charcoal-900 text-ivory-100 text-sm font-medium hover:bg-charcoal-800 transition-all shadow-subtle hover:shadow-elevated"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>
    </div>
  </header>
  );
};
