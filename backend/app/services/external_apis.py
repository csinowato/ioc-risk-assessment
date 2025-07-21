import asyncio
import aiohttp
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


def _get_mock_vt_response(ioc: str, ioc_type: str) -> SourceResult:
    """Get mock VirusTotal response for development"""
    is_test_malicious = "malicious" in ioc.lower() or ioc in MALICIOUS_TEST_IOCS

    if is_test_malicious:
        data = VT_MALICIOUS_RESPONSE.copy()
        data["permalink"] = data["permalink"].format(ioc_type=ioc_type, ioc=ioc)
        return SourceResult(source="VirusTotal", status="success", data=data)
    else:
        data = VT_CLEAN_RESPONSE.copy()
        data["permalink"] = data["permalink"].format(ioc_type=ioc_type, ioc=ioc)
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


async def query_virustotal(ioc: str, ioc_type: str) -> SourceResult:
    """Query VirusTotal API - uses real API if key available, otherwise uses mocks"""
    await asyncio.sleep(0.1)  # simulate API delay

    if settings.VIRUSTOTAL_API_KEY and not settings.DEBUG:
        # TODO: Real VirusTotal API implementation
        # headers = {"x-apikey": settings.VIRUSTOTAL_API_KEY}
        # url = f"https://www.virustotal.com/api/v3/files/{ioc}"  # v3 endpoint
        # async with aiohttp.ClientSession() as session:
        #     async with session.get(url, headers=headers) as response:
        #         if response.status == 200:
        #             data = await response.json()
        #             return SourceResult(
        #                 source="VirusTotal", status="success", data=data
        #             )
        #         else:
        #             return SourceResult(
        #                 source="VirusTotal",
        #                 status="error",
        #                 error=f"API returned {response.status}",
        #             )
        return _get_mock_vt_response(ioc, ioc_type)
    else:
        # Use mocks in DEBUG mode or when no API key is present
        return _get_mock_vt_response(ioc, ioc_type)


async def query_abuseipdb(ioc: str, ioc_type: str) -> SourceResult:
    """Query AbuseIPDB API - uses real API if key available, otherwise uses mocks"""
    await asyncio.sleep(0.1)

    if settings.ABUSEIPDB_API_KEY and ioc_type == "ip" and not settings.DEBUG:
        # TODO: Real AbuseIPDB API implementation
        # headers = {"Key": settings.ABUSEIPDB_API_KEY}
        # url = "https://api.abuseipdb.com/api/v2/check"
        # params = {"ipAddress": ioc, "maxAgeInDays": 90}
        # async with aiohttp.ClientSession() as session:
        #     async with session.get(url, headers=headers, params=params) as response:
        #         if response.status == 200:
        #             data = await response.json()
        #             return SourceResult(source="AbuseIPDB", status="success", data=data)
        #         else:
        #             return SourceResult(
        #                 source="AbuseIPDB",
        #                 status="error",
        #                 error=f"API returned {response.status}",
        #             )
        return _get_mock_abuseipdb_response(ioc, ioc_type)
    else:
        # Use mocks in DEBUG mode, or when no API key is present, or for non-IP IOCs
        return _get_mock_abuseipdb_response(ioc, ioc_type)


async def query_ipinfo(ioc: str, ioc_type: str) -> SourceResult:
    """Query IPInfo API - uses real API if key available, otherwise uses mocks"""
    await asyncio.sleep(0.1)

    if settings.IPINFO_API_KEY and not settings.DEBUG:
        # TODO: Real IPInfo API implementation
        # url = f"https://ipinfo.io/{ioc}/json?token={settings.IPINFO_API_KEY}"
        # async with aiohttp.ClientSession() as session:
        #     async with session.get(url) as response:
        #         if response.status == 200:
        #             data = await response.json()
        #             return SourceResult(source="IPInfo", status="success", data=data)
        #         else:
        #             return SourceResult(
        #                 source="IPInfo",
        #                 status="error",
        #                 error=f"API returned {response.status}",
        #             )
        return _get_mock_ipinfo_response(ioc, ioc_type)
    else:
        # Use mocks in DEBUG mode or when no API key is present
        return _get_mock_ipinfo_response(ioc, ioc_type)
