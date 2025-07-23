from pydantic import BaseModel, field_validator
from typing import List, Dict, Any, Optional
from datetime import datetime


class IOCRequest(BaseModel):
    iocs: List[str]

    @field_validator("iocs")
    def validate_iocs(cls, v):
        if not v:
            raise ValueError("At least one IOC is required")
        if len(v) > 10:  # search limit for demo
            raise ValueError("Maximum 10 IOCs per request")
        cleaned = [ioc.strip() for ioc in v]
        return [ioc for ioc in cleaned if ioc]


class SourceResult(BaseModel):
    source: str
    status: str  # "success", "error", "not_found", "not_applicable"
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class IOCResult(BaseModel):
    ioc: str
    ioc_type: str
    risk_score: int  # 0-100
    sources: List[SourceResult]
    summary: str
    timestamp: str


class AssessmentResponse(BaseModel):
    results: List[IOCResult]
    total_processed: int
    processing_time: float


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
