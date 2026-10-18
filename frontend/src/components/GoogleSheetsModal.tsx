import React, { useState } from 'react';
import { X, FileSpreadsheet, KeyRound, ExternalLink, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import type { Campaign, SheetsSyncResult } from '../types';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  onSync: (spreadsheetId?: string) => Promise<SheetsSyncResult>;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onSync,
}) => {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<SheetsSyncResult | null>(null);

  if (!isOpen) return null;

  const handleTestSync = async () => {
    setIsTesting(true);
    setResult(null);
    try {
      const res = await onSync(spreadsheetId.trim() || undefined);
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        message: err?.message || 'Sync request failed',
        rows_synced: 0,
        setup_guide_required: true,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-charcoal-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-borderMuted shadow-elevated w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-borderMuted flex items-center justify-between bg-ivory-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-bold text-charcoal-900">
                Google Sheets Integration Architecture
              </h2>
              <p className="text-xs text-charcoal-500">
                Direct two-way synchronization service interface for enterprise teams.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Honest architectural notice */}
          <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>No Faked Connections Policy</span>
            </div>
            <p className="leading-relaxed">
              In accordance with senior engineering standards, ContentFlow AI provides a validated
              service interface stub and does not simulate fictitious cloud sync. Live streaming
              requires a verified Google Cloud Service Account.
            </p>
          </div>

          {/* Integration Setup Instructions */}
          <div className="space-y-3">
            <h3 className="font-editorial text-base font-bold text-charcoal-900">
              Prerequisites for Production Integration
            </h3>
            <ol className="space-y-2.5 text-xs text-charcoal-700 list-decimal list-inside leading-relaxed bg-ivory-50/70 p-4 rounded-xl border border-borderMuted">
              <li>
                <strong>Create a Google Cloud Project:</strong> Navigate to{' '}
                <a
                  href="https://console.cloud.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-olive-700 underline inline-flex items-center gap-0.5"
                >
                  console.cloud.google.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and enable the <code>Google Sheets API v4</code>.
              </li>
              <li>
                <strong>Provision a Service Account:</strong> Generate a Service Account and download
                its private key file as <code>service-account.json</code> into the <code>backend/</code>{' '}
                directory.
              </li>
              <li>
                <strong>Configure Environment Variable:</strong> Set{' '}
                <code>GOOGLE_SERVICE_ACCOUNT_JSON=./service-account.json</code> in <code>backend/.env</code>.
              </li>
              <li>
                <strong>Grant Edit Access:</strong> Share your target Google Spreadsheet with the
                Service Account email address (e.g.{' '}
                <code>contentflow-sync@your-project.iam.gserviceaccount.com</code>) with Editor role.
              </li>
            </ol>
          </div>

          {/* Test Live API Endpoint */}
          <div className="space-y-3 pt-2 border-t border-borderMuted">
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
              Test Service Endpoint (POST /api/campaigns/{campaign.id}/sync-sheets)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="Enter Spreadsheet ID (e.g. 1BxiMVs0XR839ePE_bXg...)"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-borderMuted bg-ivory-50/50 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-600 text-xs font-mono"
              />
              <button
                onClick={handleTestSync}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl bg-charcoal-900 text-ivory-100 text-xs font-medium hover:bg-charcoal-800 transition-colors shrink-0 disabled:opacity-60 flex items-center gap-1.5"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <span>Test Endpoint</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Test Response Display */}
          {result && (
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1 ${
                result.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-stone-50 border-stone-300 text-stone-800'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5">
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <KeyRound className="w-4 h-4 text-stone-600" />
                )}
                <span>Backend Response Status:</span>
              </div>
              <p>{result.message}</p>
              {result.spreadsheet_url && (
                <a
                  href={result.spreadsheet_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 underline block mt-2"
                >
                  Open Synchronized Spreadsheet
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-borderMuted bg-ivory-50/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-charcoal-900 text-ivory-100 text-xs font-medium hover:bg-charcoal-800 transition-colors"
          >
            Close Architecture Guide
          </button>
        </div>
      </div>
    </div>
  );
};
