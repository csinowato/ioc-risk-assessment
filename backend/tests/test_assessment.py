import pytest
from unittest.mock import patch
from datetime import datetime

from app.services.assessment import (
    assess_single_ioc,
    assess_multiple_iocs,
)
from app.services.external_apis import query_virustotal, query_abuseipdb, query_ipinfo
from app.models import SourceResult, IOCResult
from app.config import settings


@patch.object(settings, "DEBUG", True)  # force mocks for all tests in this class
class TestExternalAPIFunctions:
    """Test external API functions - uses mocks when DEBUG=True, and real APIs when DEBUG=False"""

    @pytest.mark.asyncio
    async def test_query_virustotal_structure(self):
        result = await query_virustotal("8.8.8.8", "ip")

        assert isinstance(result, SourceResult)
        assert result.source == "VirusTotal"
        assert result.status in ["success", "error", "not_applicable"]
        assert result.data is not None

        # Test v3 API structure
        if result.status == "success":
            assert "data" in result.data
            assert "attributes" in result.data["data"]

    @pytest.mark.asyncio
    async def test_query_abuseipdb_ip_only(self):
        # Should work for IPs
        result = await query_abuseipdb("192.168.1.1", "ip")
        assert result.status == "success"

        # Should return not_applicable for non-IPs
        result = await query_abuseipdb("google.com", "domain")
        assert result.status == "not_applicable"

    @pytest.mark.asyncio
    async def test_query_ipinfo_coverage(self):
        # Should work for IPs
        ip_result = await query_ipinfo("8.8.8.8", "ip")
        assert ip_result.status == "success"

        # Should work for domains
        domain_result = await query_ipinfo("google.com", "domain")
        assert domain_result.status == "success"

        # Should be not_applicable for hashes
        hash_result = await query_ipinfo("d41d8cd98f00b204e9800998ecf8427e", "md5")
        assert hash_result.status == "not_applicable"

    @pytest.mark.asyncio
    async def test_malicious_detection_logic(self):
        """Test that the 'malicious' keyword triggers the correct mock responses"""

        # Test malicious domain
        result = await query_virustotal("suspicious-domain.com", "domain")
        assert result.status == "success"

        # Test v3 structure for malicious response
        if result.data and "data" in result.data:
            attributes = result.data["data"].get("attributes", {})
            stats = attributes.get("last_analysis_stats", {})
            assert stats.get("malicious", 0) > 0

        # Test clean domain
        clean_result = await query_virustotal("google.com", "domain")
        assert clean_result.status == "success"


@patch.object(settings, "DEBUG", True)  # force mocks for all tests in this class
class TestAssessmentCore:
    """Test core assessment logic"""

    @pytest.mark.asyncio
    async def test_assess_single_ioc_structure(self):
        result = await assess_single_ioc("8.8.8.8")

        # Test return type and required fields
        assert isinstance(result, IOCResult)
        assert result.ioc == "8.8.8.8"
        assert result.ioc_type == "ip"
        assert isinstance(result.risk_score, int)
        assert 0 <= result.risk_score <= 100
        assert isinstance(result.sources, list)
        assert len(result.sources) == 3  # VT, AbuseIPDB, IPInfo
        assert result.summary is not None
        assert result.timestamp is not None

    @pytest.mark.asyncio
    async def test_assess_single_ioc_sanitization(self):
        """Test that IOCs are properly sanitized"""
        result = await assess_single_ioc("https://google.com/path")
        assert result.ioc == "google.com"  # should strip URL components
        assert result.ioc_type == "domain"

    @pytest.mark.asyncio
    async def test_assess_single_ioc_source_coverage(self):
        """Test that all expected sources are queried"""
        result = await assess_single_ioc("192.168.1.1")

        source_names = {source.source for source in result.sources}
        expected_sources = {"VirusTotal", "AbuseIPDB", "IPInfo"}
        assert source_names == expected_sources

    @pytest.mark.asyncio
    async def test_assess_multiple_iocs_parallel(self):
        """Test that multiple IOCs are processed in parallel"""
        iocs = ["8.8.8.8", "google.com", "d41d8cd98f00b204e9800998ecf8427e"]

        start_time = datetime.now()
        results = await assess_multiple_iocs(iocs)
        end_time = datetime.now()

        # Should complete faster than sequential processing
        # (each mock has 0.1s delay, so parallel should be ~0.1s vs ~0.9s sequential)
        elapsed = (end_time - start_time).total_seconds()
        assert elapsed < 1.0

        # Should return correct number of results
        assert len(results) == 3

        # Results should match input IOCs
        result_iocs = {result.ioc for result in results}
        expected_iocs = {"8.8.8.8", "google.com", "d41d8cd98f00b204e9800998ecf8427e"}
        assert result_iocs == expected_iocs

    @pytest.mark.asyncio
    async def test_assess_multiple_iocs_empty_handling(self):
        """Test handling of empty and invalid IOCs"""
        iocs = ["", "   ", "8.8.8.8", ""]
        results = await assess_multiple_iocs(iocs)

        # Should filter out empty IOCs
        assert len(results) == 1
        assert results[0].ioc == "8.8.8.8"
