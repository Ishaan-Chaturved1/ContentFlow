import type {
  Campaign,
  CampaignCreateInput,
  DashboardStats,
  HealthStatus,
  Post,
  SheetsSyncResult,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
    const res = await fetch(`${API_BASE}/api/health`);
    return handleResponse<HealthStatus>(res);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/api/campaigns/dashboard`);
    return handleResponse<DashboardStats>(res);
  },

  async getCampaigns(): Promise<Campaign[]> {
    const res = await fetch(`${API_BASE}/api/campaigns`);
    return handleResponse<Campaign[]>(res);
  },

  async getCampaign(id: number): Promise<Campaign> {
    const res = await fetch(`${API_BASE}/api/campaigns/${id}`);
    return handleResponse<Campaign>(res);
  },

  async createCampaign(input: CampaignCreateInput): Promise<Campaign> {
    const res = await fetch(`${API_BASE}/api/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Campaign>(res);
  },

  async regenerateCampaign(id: number): Promise<Campaign> {
    const res = await fetch(`${API_BASE}/api/campaigns/${id}/generate`, {
      method: 'POST',
    });
    return handleResponse<Campaign>(res);
  },

  async seedDemoCampaign(): Promise<Campaign> {
    const res = await fetch(`${API_BASE}/api/campaigns/seed-demo`, {
      method: 'POST',
    });
    return handleResponse<Campaign>(res);
  },

  async deleteCampaign(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/campaigns/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete campaign ${id}`);
    }
  },

  async updatePost(id: number, patch: Partial<Post>): Promise<Post> {
    const res = await fetch(`${API_BASE}/api/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    return handleResponse<Post>(res);
  },

  async approvePost(id: number): Promise<Post> {
    const res = await fetch(`${API_BASE}/api/posts/${id}/approve`, {
      method: 'POST',
    });
    return handleResponse<Post>(res);
  },

  async rejectPost(id: number): Promise<Post> {
    const res = await fetch(`${API_BASE}/api/posts/${id}/reject`, {
      method: 'POST',
    });
    return handleResponse<Post>(res);
  },

  async resetPostToPending(id: number): Promise<Post> {
    const res = await fetch(`${API_BASE}/api/posts/${id}/pending`, {
      method: 'POST',
    });
    return handleResponse<Post>(res);
  },

  async exportCampaignCsv(id: number, approvedOnly: boolean = true): Promise<void> {
    const url = `${API_BASE}/api/campaigns/${id}/export?approved_only=${approvedOnly}`;
    const res = await fetch(url);
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

    const res = await fetch(`${API_BASE}/api/campaigns/${id}/sync-sheets?${params.toString()}`, {
      method: 'POST',
    });
    return handleResponse<SheetsSyncResult>(res);
  },
};
