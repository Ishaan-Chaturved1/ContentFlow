import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
  FileText,
  ShieldCheck,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import type { Campaign, SheetsSyncResult, GoogleSheetsStatusInfo } from '../types';
import { api } from '../api/client';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Campaign | null;
  onSync?: (spreadsheetId?: string) => Promise<SheetsSyncResult>;
  onExportCsv?: (approvedOnly: boolean) => Promise<void>;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onSync,
  onExportCsv,
}) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'sheets'>('csv');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [statusInfo, setStatusInfo] = useState<GoogleSheetsStatusInfo | null>(null);
  const [syncResult, setSyncResult] = useState<SheetsSyncResult | null>(null);

  // Fetch verified backend status whenever modal opens
  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const data = await api.getGoogleSheetsStatus();
      setStatusInfo(data);
    } catch (err: any) {
      setStatusInfo({
        provider: 'google_sheets',
        status: 'Error',
        service_account_configured: false,
        error_details: err.message,
        message: `Failed to query backend integration status: ${err.message}`,
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestOrSync = async () => {
    setIsTesting(true);
    setSyncResult(null);
    try {
      if (onSync && campaign) {
        const res = await onSync(spreadsheetId.trim() || undefined);
        setSyncResult(res);
      } else {
        const res = await api.testGoogleSheetsConnection(spreadsheetId.trim() || undefined);
        setSyncResult({
          success: res.success,
          status: res.status,
          message: res.message,
          spreadsheet_url: res.spreadsheet_url,
          rows_synced: 0,
          setup_guide_required: !res.success,
        });
      }
    } catch (err: any) {
      setSyncResult({
        success: false,
        status: 'Error',
        message: err?.message || 'Sync request failed',
        rows_synced: 0,
        setup_guide_required: true,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusBadge = () => {
    if (isLoadingStatus) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-ivory-200 text-charcoal-600">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Verifying...</span>
        </span>
      );
    }

    const status = statusInfo?.status || 'Not Configured';

    if (status === 'Connected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Connected</span>
        </span>
      );
    }

    if (status === 'Error') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Configuration Error</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>Not Configured (Optional)</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-charcoal-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-borderMuted shadow-elevated w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-borderMuted flex items-center justify-between bg-ivory-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-olive-700 text-ivory-100 flex items-center justify-center font-editorial font-bold shadow-subtle">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-xl font-bold text-charcoal-900">
                  Export & Integration Settings
                </h2>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-charcoal-500">
                {campaign
                  ? `Campaign: ${campaign.brand_name} (${campaign.total_posts} posts)`
                  : 'Manage spreadsheet exports and cloud synchronization credentials.'}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-borderMuted bg-ivory-100/50 px-6 pt-3">
          <button
            onClick={() => setActiveTab('csv')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'csv'
                ? 'border-olive-700 text-olive-900'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>CSV Export (Primary Workflow)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              Ready
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'sheets'
                ? 'border-olive-700 text-olive-900'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Sheets (Optional)</span>
            {statusInfo?.status === 'Connected' ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                Connected
              </span>
            ) : (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                Optional
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* TAB 1: CSV WORKFLOW */}
          {activeTab === 'csv' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Zero-Config, Production-Ready CSV Export</span>
                </div>
                <p className="leading-relaxed">
                  ContentFlow AI adopts a <strong>CSV-first architecture</strong>. CSV files are generated
                  strictly according to <strong>RFC 4180</strong> with quoted string escaping, preserving
                  multiline captions, hashtags, visual briefs, and quotes for seamless import into Excel,
                  Google Sheets, Airtable, or agency client deliverables.
                </p>
              </div>

              {/* Data Schema Specs */}
              <div className="bg-ivory-50/70 p-4 rounded-xl border border-borderMuted space-y-2 text-xs">
                <span className="font-semibold text-charcoal-800 block">Exported Column Schema:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-charcoal-600 font-mono">
                  <span>• Day Number</span>
                  <span>• Scheduled Date</span>
                  <span>• Platform</span>
                  <span>• Content Type</span>
                  <span>• Topic / Hook</span>
                  <span>• Caption</span>
                  <span>• Hashtags</span>
                  <span>• Call to Action (CTA)</span>
                  <span>• Visual Prompt</span>
                  <span>• Review Status</span>
                  <span>• Editorial Notes</span>
                  <span>• Brand & Objective</span>
                </div>
              </div>

              {/* Action Buttons if Campaign is Available */}
              {campaign ? (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider block">
                    Download Campaign CSV ({campaign.brand_name})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => onExportCsv && onExportCsv(true)}
                      disabled={campaign.approved_posts === 0}
                      className="p-4 rounded-xl border border-olive-600 bg-olive-700 text-white hover:bg-olive-800 transition-all text-left flex items-start gap-3 shadow-subtle disabled:opacity-40"
                    >
                      <Download className="w-5 h-5 text-olive-200 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm">Export Approved Only</div>
                        <p className="text-xs text-olive-100 mt-0.5">
                          {campaign.approved_posts} posts approved and ready for scheduling.
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => onExportCsv && onExportCsv(false)}
                      disabled={campaign.total_posts === 0}
                      className="p-4 rounded-xl border border-borderMuted bg-ivory-50 text-charcoal-800 hover:bg-ivory-200 transition-all text-left flex items-start gap-3 shadow-subtle disabled:opacity-40"
                    >
                      <FileText className="w-5 h-5 text-taupe-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm">Export All Posts</div>
                        <p className="text-xs text-charcoal-500 mt-0.5">
                          Includes {campaign.total_posts} posts across all review statuses.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-ivory-50 border border-borderMuted text-xs text-charcoal-600 text-center">
                  Select or open a campaign to trigger instant CSV downloads.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GOOGLE SHEETS WORKFLOW */}
          {activeTab === 'sheets' && (
            <div className="space-y-5">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                  statusInfo?.status === 'Connected'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : statusInfo?.status === 'Error'
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-2">
                    {statusInfo?.status === 'Connected' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : statusInfo?.status === 'Error' ? (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                    <span>Backend Google Sheets Verification Status: {statusInfo?.status}</span>
                  </div>
                  <button
                    onClick={fetchStatus}
                    disabled={isLoadingStatus}
                    className="text-[11px] font-normal underline hover:opacity-80 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                    <span>Re-verify</span>
                  </button>
                </div>
                <p>{statusInfo?.message}</p>
                {statusInfo?.service_account_email && (
                  <p className="font-mono text-[11px] bg-white/70 p-1.5 rounded border border-emerald-300">
                    Service Account: {statusInfo.service_account_email}
                  </p>
                )}
                {statusInfo?.error_details && (
                  <p className="font-mono text-[11px] bg-white/70 p-1.5 rounded border border-rose-300 text-rose-800">
                    Details: {statusInfo.error_details}
                  </p>
                )}
              </div>

              {/* Policy Statement */}
              <div className="text-xs text-charcoal-600 bg-ivory-50/70 p-3 rounded-lg border border-borderMuted flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-charcoal-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict No-Simulation Policy:</strong> ContentFlow AI never simulates fake cloud
                  synchronization. If Google Cloud credentials are missing, we report it transparently and
                  recommend CSV export.
                </span>
              </div>

              {/* Setup Guide */}
              <div className="space-y-2">
                <h3 className="font-editorial text-sm font-bold text-charcoal-900">
                  Google Sheets Service Account Setup
                </h3>
                <ol className="space-y-2 text-xs text-charcoal-700 list-decimal list-inside leading-relaxed bg-ivory-50/70 p-4 rounded-xl border border-borderMuted">
                  <li>
                    <strong>Enable API:</strong> Open{' '}
                    <a
                      href="https://console.cloud.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-olive-700 underline inline-flex items-center gap-0.5"
                    >
                      Google Cloud Console <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    and enable the <code>Google Sheets API v4</code>.
                  </li>
                  <li>
                    <strong>Service Account Key:</strong> Create a Service Account, generate a JSON Key,
                    and save it as <code>backend/service-account.json</code>.
                  </li>
                  <li>
                    <strong>Environment Variable:</strong> Set{' '}
                    <code>GOOGLE_SERVICE_ACCOUNT_JSON=./service-account.json</code> in <code>backend/.env</code>{' '}
                    (or Render Dashboard Environment).
                  </li>
                  <li>
                    <strong>Grant Permission:</strong> Share your target Google Spreadsheet with the
                    Service Account email with <strong>Editor</strong> access.
                  </li>
                </ol>
              </div>

              {/* Test Connection / Sync Action */}
              <div className="space-y-3 pt-2 border-t border-borderMuted">
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
                  {campaign ? 'Sync Campaign or Test Spreadsheet ID' : 'Validate Spreadsheet ID'}
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
                    onClick={handleTestOrSync}
                    disabled={isTesting}
                    className="px-4 py-2.5 rounded-xl bg-charcoal-900 text-ivory-100 text-xs font-medium hover:bg-charcoal-800 transition-colors shrink-0 disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <span>{campaign ? 'Sync / Test' : 'Test ID'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sync / Test Result */}
              {syncResult && (
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                    syncResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-stone-50 border-stone-300 text-stone-800'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    {syncResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <KeyRound className="w-4 h-4 text-stone-600" />
                    )}
                    <span>Result:</span>
                  </div>
                  <p>{syncResult.message}</p>
                  {syncResult.spreadsheet_url && (
                    <a
                      href={syncResult.spreadsheet_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 underline block mt-1 font-semibold"
                    >
                      Open Synchronized Google Spreadsheet →
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-borderMuted bg-ivory-50/60 flex items-center justify-between">
          <div className="text-[11px] text-charcoal-500">
            {activeTab === 'csv'
              ? 'CSV export works offline and requires no cloud setup.'
              : 'Google Sheets integration is optional.'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-charcoal-900 text-ivory-100 text-xs font-medium hover:bg-charcoal-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
