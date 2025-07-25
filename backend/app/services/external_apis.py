import asyncio
import aiohttp
import socket
from typing import Optional
from app.models import SourceResult
from app.config import settings
from mocks.mock_data import (
    MALICIOUS_TEST_IOCS,
    VT_MALICIOUS_RESPONSE,
    VT_CLEAN_RESPONSE,
    ABUSEIPDB_MALICIOUS_RESPONSE,
    ABUSEIPDB_CLEAN_RESPONSE,
    ABUSEIPDB_NOT_APPLICABLE,
    IPINFO_IP_RESPONSE,
    IPINFO_DOMAIN_RESPONSE,
    IPINFO_NOT_APPLICABLE,
)


class ExternalAPIClient:
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()


async def query_virustotal(ioc: str, ioc_type: str) -> SourceResult:
    """Query VirusTotal API - uses mocks in DEBUG mode, real API otherwise"""
    await asyncio.sleep(0.1)  # simulate API delay

    if settings.DEBUG:
        # Use mocks in DEBUG mode
        return _get_mock_vt_response(ioc, ioc_type)
    else:
        # Production mode - use real API key
        if not settings.VIRUSTOTAL_API_KEY:
            return SourceResult(
                source="VirusTotal",
                status="error",
                error="VirusTotal API key not configured",
            )

        # VirusTotal API integration
        headers = {"x-apikey": settings.VIRUSTOTAL_API_KEY}

        # Determine correct endpoint based on IOC type
        if ioc_type == "domain":
            url = f"https://www.virustotal.com/api/v3/domains/{ioc}"
        elif ioc_type == "ip":
            url = f"https://www.virustotal.com/api/v3/ip_addresses/{ioc}"
        elif ioc_type in ["md5", "sha1", "sha256"]:
            url = f"https://www.virustotal.com/api/v3/files/{ioc}"
        else:
            return SourceResult(
                source="VirusTotal",
                status="error",
                error=f"Unsupported IOC type: {ioc_type}",
            )

        # Set timeout to prevent hanging
        timeout = aiohttp.ClientTimeout(total=10)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return SourceResult(
                        source="VirusTotal", status="success", data=data
                    )
                else:
                    return SourceResult(
                        source="VirusTotal",
                        status="error",
                        error=f"API returned {response.status}",
                    )


async def query_abuseipdb(ioc: str, ioc_type: str) -> SourceResult:
    """Query AbuseIPDB API - uses mocks in DEBUG mode, real API otherwise"""
    await asyncio.sleep(0.1)

    if settings.DEBUG:
        # Use mocks in DEBUG mode
        return _get_mock_abuseipdb_response(ioc, ioc_type)
    else:
        # Production mode - use real API key
        if not settings.ABUSEIPDB_API_KEY:
            return SourceResult(
                source="AbuseIPDB",
                status="error",
                error="AbuseIPDB API key not configured",
            )

        # AbuseIPDB only supports IP addresses
        if ioc_type != "ip":
            return SourceResult(
                source="AbuseIPDB",
                status="not_applicable",
                data=ABUSEIPDB_NOT_APPLICABLE,
            )

        # AbuseIPDB API integration for IPs
        headers = {"Key": settings.ABUSEIPDB_API_KEY, "Accept": "application/json"}
        url = "https://api.abuseipdb.com/api/v2/check"
        params = {"ipAddress": ioc, "maxAgeInDays": 90}
        # Set timeout to prevent hanging
        timeout = aiohttp.ClientTimeout(total=10)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return SourceResult(source="AbuseIPDB", status="success", data=data)
                else:
                    return SourceResult(
                        source="AbuseIPDB",
                        status="error",
                        error=f"API returned {response.status}",
                    )


async def query_ipinfo(ioc: str, ioc_type: str) -> SourceResult:
    """Query IPInfo API - uses mocks in DEBUG mode, real API otherwise"""
    await asyncio.sleep(0.1)

    if settings.DEBUG:
        # Use mocks in DEBUG mode
        return _get_mock_ipinfo_response(ioc, ioc_type)
    else:
        # Production mode - use real API key
        if not settings.IPINFO_API_KEY:
            return SourceResult(
                source="IPInfo",
                status="error",
                error="IPInfo API key not configured",
            )

        # IPInfo only supports IP addresses directly
        # For domains, we need to resolve it to an IP address first
        if ioc_type == "domain":
            try:
                # Resolve domain to IP address (async to avoid blocking)
                resolved_ip = await asyncio.to_thread(socket.gethostbyname, ioc)
                target_ip = resolved_ip
            except socket.gaierror:
                return SourceResult(
                    source="IPInfo",
                    status="error",
                    error="Unable to resolve domain to IP address",
                )
        elif ioc_type == "ip":
            target_ip = ioc
        else:
            return SourceResult(
                source="IPInfo", status="not_applicable", data=IPINFO_NOT_APPLICABLE
            )

        # IPInfo API integration (only uses IP)
        headers = {"Accept": "application/json"}
        url = f"https://ipinfo.io/{target_ip}/json?token={settings.IPINFO_API_KEY}"

        # Set timeout to prevent hanging
        timeout = aiohttp.ClientTimeout(total=10)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    # If domain was manually resolved, add the original domain info
                    if ioc_type == "domain":
                        data["resolved_from_domain"] = ioc
                        data["resolved_ip"] = target_ip
                    return SourceResult(source="IPInfo", status="success", data=data)
                elif response.status == 404:
                    return SourceResult(
                        source="IPInfo",
                        status="error",
                        error="IP address not found in IPInfo database",
                    )
                elif response.status == 429:
                    return SourceResult(
                        source="IPInfo",
                        status="error",
                        error="IPInfo rate limit exceeded",
                    )
                else:
                    return SourceResult(
                        source="IPInfo",
                        status="error",
                        error=f"IPInfo API error: {response.status}",
                    )


# Mock functions for development/testing
def _get_mock_vt_response(ioc: str, ioc_type: str) -> SourceResult:
    """Get mock VirusTotal response for development"""
    is_test_malicious = "malicious" in ioc.lower() or ioc in MALICIOUS_TEST_IOCS

    if is_test_malicious:
        data = VT_MALICIOUS_RESPONSE.copy()
        return SourceResult(source="VirusTotal", status="success", data=data)
    else:
        data = VT_CLEAN_RESPONSE.copy()
        return SourceResult(source="VirusTotal", status="success", data=data)


def _get_mock_abuseipdb_response(ioc: str, ioc_type: str) -> SourceResult:
    """Get mock AbuseIPDB response for development"""
    if ioc_type != "ip":
        return SourceResult(
            source="AbuseIPDB", status="not_applicable", data=ABUSEIPDB_NOT_APPLICABLE
        )

    is_test_malicious = "malicious" in ioc.lower() or ioc in MALICIOUS_TEST_IOCS

    if is_test_malicious:
        return SourceResult(
            source="AbuseIPDB", status="success", data=ABUSEIPDB_MALICIOUS_RESPONSE
        )
    else:
        return SourceResult(
            source="AbuseIPDB", status="success", data=ABUSEIPDB_CLEAN_RESPONSE
        )


def _get_mock_ipinfo_response(ioc: str, ioc_type: str) -> SourceResult:
    """Get mock IPInfo response for development"""
    if ioc_type == "ip":
        return SourceResult(source="IPInfo", status="success", data=IPINFO_IP_RESPONSE)
    elif ioc_type == "domain":
        data = IPINFO_DOMAIN_RESPONSE.copy()
        data["domain"] = ioc
        return SourceResult(source="IPInfo", status="success", data=data)
    else:
        return SourceResult(
            source="IPInfo", status="not_applicable", data=IPINFO_NOT_APPLICABLE
        )
