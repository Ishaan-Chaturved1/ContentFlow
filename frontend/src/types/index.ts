export type PlatformType = 'Instagram' | 'LinkedIn';
export type PostStatus = 'Pending Review' | 'Approved' | 'Rejected';
export type IntegrationState = 'Not Configured' | 'Connected' | 'Error';

export interface Post {
  id: number;
  campaign_id: number;
  day_number: number;
  scheduled_date: string;
  platform: PlatformType;
  content_type: string;
  topic: string;
  caption: string;
  hashtags: string;
  cta: string;
  visual_prompt: string;
  status: PostStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: number;
  brand_name: string;
  industry: string;
  target_audience: string;
  brand_voice: string;
  products_services: string;
  campaign_objective: string;
  platforms: string[];
  content_preferences: string;
  number_of_days: number;
  is_demo_mode: boolean;
  generation_provider?: string;
  total_posts: number;
  pending_posts: number;
  approved_posts: number;
  rejected_posts: number;
  created_at: string;
  updated_at: string;
  posts?: Post[];
}

export interface CampaignCreateInput {
  brand_name: string;
  industry: string;
  target_audience: string;
  brand_voice: string;
  products_services: string;
  campaign_objective: string;
  platforms: PlatformType[];
  content_preferences: string;
  number_of_days: number;
}

export interface DashboardStats {
  total_generated_posts: number;
  posts_awaiting_review: number;
  approved_posts: number;
  rejected_posts: number;
  total_campaigns: number;
  recent_campaigns: Campaign[];
}

export interface HealthStatus {
  status: string;
  database: string;
  configured_provider: string;
  active_provider: string;
  is_demo_mode: boolean;
  environment: string;
  project: string;
}

export interface SheetsSyncResult {
  success: boolean;
  status?: IntegrationState | string;
  message: string;
  spreadsheet_url?: string;
  rows_synced: number;
  setup_guide_required: boolean;
}

export interface GoogleSheetsStatusInfo {
  provider: 'google_sheets';
  status: IntegrationState;
  service_account_configured: boolean;
  service_account_email?: string;
  service_account_path?: string;
  error_details?: string;
  message: string;
}

export interface IntegrationsSummary {
  csv_export: {
    provider: 'csv_export';
    status: 'Ready';
    is_primary: boolean;
    description: string;
    requires_credentials: boolean;
  };
  google_sheets: GoogleSheetsStatusInfo;
}
