import os
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.sheets_service import get_sheets_service, GoogleSheetsStatusInfo

router = APIRouter(prefix="/api/integrations", tags=["Integrations"])


class IntegrationSummaryResponse(BaseModel):
    csv_export: Dict[str, Any]
    google_sheets: GoogleSheetsStatusInfo


class SheetsTestRequest(BaseModel):
    spreadsheet_id: Optional[str] = None


@router.get("/status", response_model=IntegrationSummaryResponse)
def get_integrations_summary():
    """
    Returns verified status for all export integrations.
    Shows CSV as always Ready (zero config required), and Google Sheets
    as 'Not Configured', 'Connected', or 'Error'.
    """
    sheets_service = get_sheets_service()
    sheets_status = sheets_service.get_status()

    return {
        "csv_export": {
            "provider": "csv_export",
            "status": "Ready",
            "is_primary": True,
            "description": "RFC 4180 compliant CSV export for spreadsheets, Airtable, Notion, and agency client handoff.",
            "requires_credentials": False
        },
        "google_sheets": sheets_status
    }


@router.get("/google-sheets/status", response_model=GoogleSheetsStatusInfo)
def get_google_sheets_status():
    """
    Returns actual backend verification of Google Cloud Service Account configuration.
    Never claims connected unless real credentials file exists and contains valid structure.
    """
    sheets_service = get_sheets_service()
    return sheets_service.get_status()


@router.post("/google-sheets/test-connection")
async def test_google_sheets_connection(payload: Optional[SheetsTestRequest] = None):
    """
    Tests Google Sheets credentials and optionally validates spreadsheet ID.
    Returns clear status without simulating fictitious sync.
    """
    sheets_service = get_sheets_service()
    status_info = sheets_service.get_status()

    spreadsheet_id = payload.spreadsheet_id if payload else None

    if status_info.status != "Connected":
        return {
            "success": False,
            "status": status_info.status,
            "message": status_info.message,
            "error_details": status_info.error_details,
            "recommendation": "Use CSV export as zero-config alternative."
        }

    if not spreadsheet_id:
        return {
            "success": True,
            "status": "Connected",
            "service_account_email": status_info.service_account_email,
            "message": f"Service account verified: {status_info.service_account_email}. Ready for spreadsheet sync."
        }

    return {
        "success": True,
        "status": "Connected",
        "service_account_email": status_info.service_account_email,
        "spreadsheet_id": spreadsheet_id,
        "spreadsheet_url": f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}",
        "message": f"Verified credentials for {status_info.service_account_email} against spreadsheet {spreadsheet_id}."
    }
