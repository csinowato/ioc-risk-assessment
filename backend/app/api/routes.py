import asyncio
from datetime import datetime
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import JSONResponse
from app.models import IOCRequest, AssessmentResponse, HealthResponse
from app.services.assessment import assess_multiple_iocs, export_results_json
from app.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy", timestamp=datetime.now().isoformat(), version=settings.VERSION
    )


@router.post("/assess", response_model=AssessmentResponse)
async def assess_iocs(request: IOCRequest):
    """
    Assess multiple IOCs with threat intelligence data

    - **iocs**: List of IOCs to analyze (IP addresses, domains, hashes)
    - Returns assessed data with risk scores and source information
    """
    start_time = asyncio.get_event_loop().time()

    try:
        # Process the IOCs
        results = await assess_multiple_iocs(request.iocs)

        processing_time = asyncio.get_event_loop().time() - start_time

        return AssessmentResponse(
            results=results,
            total_processed=len(results),
            processing_time=round(processing_time, 2),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing IOCs: {str(e)}")


@router.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": "/api/health",
    }
