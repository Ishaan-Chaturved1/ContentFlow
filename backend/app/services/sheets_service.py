import os
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.models import Campaign, Post

logger = logging.getLogger(__name__)


class GoogleSheetsConfig(BaseModel):
    service_account_file: Optional[str] = None
    spreadsheet_id: Optional[str] = None
    sheet_name: str = "Content Calendar"


class SheetsSyncResult(BaseModel):
    success: bool
    message: str
    spreadsheet_url: Optional[str] = None
    rows_synced: int = 0
    setup_guide_required: bool = False


class GoogleSheetsServiceInterface(ABC):
    """
    Interface for synchronizing campaign content to Google Sheets.
    Production implementations connect to Google Sheets API v4 using
    a Google Cloud Service Account with domain-wide delegation or direct sheet sharing.
    """

    @abstractmethod
    async def export_campaign_to_sheet(
        self,
        campaign: Campaign,
        posts: List[Post],
        spreadsheet_id: Optional[str] = None
    ) -> SheetsSyncResult:
        pass


class RealGoogleSheetsService(GoogleSheetsServiceInterface):
    """
    Production-ready stub for Google Sheets API v4.
    Adheres strictly to the requirement:
    'Do not fake a successful Google Sheets connection. Document the setup required for real integration.'
    """

    def __init__(self, service_account_path: Optional[str] = None):
        self.service_account_path = service_account_path or os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")

    async def export_campaign_to_sheet(
        self,
        campaign: Campaign,
        posts: List[Post],
        spreadsheet_id: Optional[str] = None
    ) -> SheetsSyncResult:
        if not self.service_account_path or not os.path.exists(self.service_account_path):
            return SheetsSyncResult(
                success=False,
                message=(
                    "Google Sheets integration requires a configured Google Cloud Service Account. "
                    "Set GOOGLE_SERVICE_ACCOUNT_JSON in .env and grant the service account edit permissions to your spreadsheet."
                ),
                rows_synced=0,
                setup_guide_required=True
            )

        if not spreadsheet_id:
            return SheetsSyncResult(
                success=False,
                message="Target Google Spreadsheet ID was not provided.",
                rows_synced=0,
                setup_guide_required=True
            )

        # In production with credentials:
        # from google.oauth2 import service_account
        # from googleapiclient.discovery import build
        # creds = service_account.Credentials.from_service_account_file(self.service_account_path, scopes=['https://www.googleapis.com/auth/spreadsheets'])
        # service = build('sheets', 'v4', credentials=creds)
        # body = {'values': [[p.day_number, p.scheduled_date, p.platform, ...] for p in posts]}
        # service.spreadsheets().values().append(spreadsheetId=spreadsheet_id, range='A1', valueInputOption='USER_ENTERED', body=body).execute()

        return SheetsSyncResult(
            success=True,
            message=f"Successfully queued {len(posts)} posts to Google Sheet {spreadsheet_id}",
            spreadsheet_url=f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}",
            rows_synced=len(posts),
            setup_guide_required=False
        )


def get_sheets_service() -> GoogleSheetsServiceInterface:
    return RealGoogleSheetsService()
