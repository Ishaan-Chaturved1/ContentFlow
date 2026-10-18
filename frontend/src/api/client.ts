import type {
  Campaign,
  CampaignCreateInput,
  DashboardStats,
  HealthStatus,
  Post,
  SheetsSyncResult,
  GoogleSheetsStatusInfo,
  IntegrationsSummary,
} from '../types';

const rawApiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE = rawApiBase.replace(/\/+$/, '');

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err: any) {
    if (err instanceof TypeError || (err.message && err.message.toLowerCase().includes('fetch'))) {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const isTargetHttp = url.startsWith('http://');

      if (isHttps && isTargetHttp) {
        throw new Error(
          `Mixed Content Error: Deployed HTTPS site cannot fetch insecure HTTP URL (${url}). Configure VITE_API_BASE_URL with 'https://' in Vercel settings and trigger a redeploy.`
        );
      }

      if (url.includes('localhost') && isHttps) {
        throw new Error(
          `Vercel is attempting to connect to localhost. In your Vercel project settings, add the environment variable VITE_API_BASE_URL pointing to your deployed Render backend (e.g. https://your-backend.onrender.com) and redeploy.`
        );
      }

      throw new Error(
        `Network error reaching backend (${API_BASE}). Verify your backend is running or waking up from sleep, and check CORS settings.`
      );
    }
    throw err;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) {
        errorDetail =
          typeof errorJson.detail === 'string'
            ? errorJson.detail
            : JSON.stringify(errorJson.detail);
      }
    } catch {
      // response wasn't json
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<HealthStatus> {
    const res = await safeFetch(`${API_BASE}/api/health`);
    return handleResponse<HealthStatus>(res);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await safeFetch(`${API_BASE}/api/campaigns/dashboard`);
    return handleResponse<DashboardStats>(res);
  },

  async getCampaigns(): Promise<Campaign[]> {
    const res = await safeFetch(`${API_BASE}/api/campaigns`);
    return handleResponse<Campaign[]>(res);
  },

  async getCampaign(id: number): Promise<Campaign> {
    const res = await safeFetch(`${API_BASE}/api/campaigns/${id}`);
    return handleResponse<Campaign>(res);
  },

  async createCampaign(input: CampaignCreateInput): Promise<Campaign> {
    const res = await safeFetch(`${API_BASE}/api/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Campaign>(res);
  },

  async regenerateCampaign(id: number): Promise<Campaign> {
    const res = await safeFetch(`${API_BASE}/api/campaigns/${id}/generate`, {
      method: 'POST',
    });
    return handleResponse<Campaign>(res);
  },

  async seedDemoCampaign(): Promise<Campaign> {
    const res = await safeFetch(`${API_BASE}/api/campaigns/seed-demo`, {
      method: 'POST',
    });
    return handleResponse<Campaign>(res);
  },

  async deleteCampaign(id: number): Promise<void> {
    const res = await safeFetch(`${API_BASE}/api/campaigns/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete campaign ${id}`);
    }
  },

  async updatePost(id: number, patch: Partial<Post>): Promise<Post> {
    const res = await safeFetch(`${API_BASE}/api/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    return handleResponse<Post>(res);
  },

  async approvePost(id: number): Promise<Post> {
    const res = await safeFetch(`${API_BASE}/api/posts/${id}/approve`, {
      method: 'POST',
    });
    return handleResponse<Post>(res);
  },

  async rejectPost(id: number): Promise<Post> {
    const res = await safeFetch(`${API_BASE}/api/posts/${id}/reject`, {
      method: 'POST',
    });
    return handleResponse<Post>(res);
  },

  async resetPostToPending(id: number): Promise<Post> {
    const res = await safeFetch(`${API_BASE}/api/posts/${id}/pending`, {
      method: 'POST',
    });
    return handleResponse<Post>(res);
  },

  async exportCampaignCsv(id: number, approvedOnly: boolean = true): Promise<void> {
    const url = `${API_BASE}/api/campaigns/${id}/export?approved_only=${approvedOnly}`;
    const res = await safeFetch(url);
    if (!res.ok) {
      throw new Error('Failed to export campaign CSV');
    }

    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition');
    let filename = `campaign_${id}_export.csv`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    a.remove();
  },

  async syncToGoogleSheets(
    id: number,
    spreadsheetId?: string,
    approvedOnly: boolean = true
  ): Promise<SheetsSyncResult> {
    const params = new URLSearchParams();
    if (spreadsheetId) params.set('spreadsheet_id', spreadsheetId);
    params.set('approved_only', String(approvedOnly));

    const res = await safeFetch(`${API_BASE}/api/campaigns/${id}/sync-sheets?${params.toString()}`, {
      method: 'POST',
    });
    return handleResponse<SheetsSyncResult>(res);
  },

  async getIntegrationsSummary(): Promise<IntegrationsSummary> {
    const res = await safeFetch(`${API_BASE}/api/integrations/status`);
    return handleResponse<IntegrationsSummary>(res);
  },

  async getGoogleSheetsStatus(): Promise<GoogleSheetsStatusInfo> {
    const res = await safeFetch(`${API_BASE}/api/integrations/google-sheets/status`);
    return handleResponse<GoogleSheetsStatusInfo>(res);
  },

  async testGoogleSheetsConnection(spreadsheetId?: string): Promise<any> {
    const res = await safeFetch(`${API_BASE}/api/integrations/google-sheets/test-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spreadsheet_id: spreadsheetId || null }),
    });
    return handleResponse<any>(res);
  },
};
