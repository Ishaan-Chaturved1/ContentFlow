import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, KeyRound } from 'lucide-react';
import type { HealthStatus } from '../types';

interface DemoBannerProps {
  health: HealthStatus | null;
  onOpenSetupGuide: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ health, onOpenSetupGuide }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isDemo = health?.is_demo_mode ?? true;

  if (!isDemo) {
    return (
      <div className="bg-olive-50 border-b border-olive-200 px-4 py-2.5 text-xs text-olive-800 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-olive-600"></span>
            <span className="font-semibold tracking-wide uppercase text-[10px] bg-olive-200/80 px-2 py-0.5 rounded text-olive-900">
              Live LLM Active
            </span>
            <span>
              Connected to <strong>{health?.active_provider}</strong>. Real-time structured generation enabled.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside aria-label="Demo mode announcement" className="bg-amber-50/80 border-b border-amber-200/80 px-4 py-2.5 text-xs text-amber-950">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1 font-semibold tracking-wider uppercase text-[10px] bg-amber-200/90 text-amber-900 px-2 py-0.5 rounded">
            <Sparkles className="w-3 h-3 text-amber-800" />
            Labelled Demo Mode
          </span>
          <span className="text-amber-900">
            Generating using high-fidelity luxury interior design heuristics for <strong>Maison Living Studio</strong>. No active live API billing required.
          </span>
          <button
            onClick={onOpenSetupGuide}
            className="inline-flex items-center gap-1 font-medium text-amber-900 underline hover:text-amber-950 transition-colors ml-1"
          >
            <KeyRound className="w-3 h-3" />
            Configure Gemini or OpenAI API Key
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-950 p-1 transition-colors"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
