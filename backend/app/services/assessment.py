import asyncio
from datetime import datetime
from typing import List
from app.models import IOCResult, SourceResult
from app.utils.validators import detect_ioc_type, sanitize_ioc
from app.risk_scoring import calculate_risk_score, generate_summary
from app.services.external_apis import query_virustotal, query_abuseipdb, query_ipinfo


async def assess_single_ioc(ioc: str) -> IOCResult:
    """Assess a single IOC by querying all sources"""
    # Clean and validate the IOC
    clean_ioc = sanitize_ioc(ioc)
    ioc_type = detect_ioc_type(clean_ioc)

    # Run all API calls in parallel for performance
    tasks = [
        query_virustotal(clean_ioc, ioc_type),
        query_abuseipdb(clean_ioc, ioc_type),
        query_ipinfo(clean_ioc, ioc_type),
    ]

    # Gather results and handle any exceptions
    sources = await asyncio.gather(*tasks, return_exceptions=True)

    # Convert exceptions to error SourceResults
    clean_sources = []
    for i, source in enumerate(sources):
        if isinstance(source, Exception):
            source_names = ["VirusTotal", "AbuseIPDB", "IPInfo"]
            clean_sources.append(
                SourceResult(
                    source=source_names[i] if i < len(source_names) else "Unknown",
                    status="error",
                    error=str(source),
                )
            )
        else:
            clean_sources.append(source)

    # Calculate risk score based on all source results
    risk_score = calculate_risk_score(clean_sources)

    # Generate readable summary
    summary = generate_summary(clean_ioc, ioc_type, clean_sources, risk_score)

    return IOCResult(
        ioc=clean_ioc,
        ioc_type=ioc_type,
        risk_score=risk_score,
        sources=clean_sources,
        summary=summary,
        timestamp=datetime.now().isoformat(),
    )


async def assess_multiple_iocs(iocs: List[str]) -> List[IOCResult]:
    """Assess multiple IOCs in parallel"""
    # Filter out empty or invalid IOCs
    valid_iocs = [ioc.strip() for ioc in iocs if ioc.strip()]
    if not valid_iocs:
        return []

    # Process all IOCs in parallel for performance
    tasks = [assess_single_ioc(ioc) for ioc in valid_iocs]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Filter out exceptions (defensive programming - shouldn't happen)
    clean_results = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            print(f"Warning: Unexpected exception for IOC {valid_iocs[i]}: {result}")
            continue
        clean_results.append(result)

    return clean_results


def export_results_json(results: List[IOCResult]) -> dict:
    """Export results in JSON format"""
    return {
        "export_timestamp": datetime.now().isoformat(),
        "total_iocs": len(results),
        "results": [result.model_dump() for result in results],
        "metadata": {"tool": "IOC Risk Assessment Tool", "version": "1.0.0"},
    }
