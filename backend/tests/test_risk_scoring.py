import pytest
from unittest.mock import Mock

from app.risk_scoring import (
    calculate_virustotal_risk,
    calculate_abuseipdb_risk,
    calculate_ipinfo_risk,
    calculate_risk_score,
    get_risk_level,
    generate_summary,
)


class TestVirusTotalRisk:
    """Test VirusTotal risk scoring"""

    def test_detection_ranges(self):
        """Test key VT detection ranges"""
        assert (
            calculate_virustotal_risk(
                {
                    "data": {
                        "attributes": {
                            "last_analysis_stats": {
                                "malicious": 0,
                                "suspicious": 0,
                                "harmless": 40,
                                "undetected": 10,
                            }
                        }
                    }
                }
            )
            == 0
        )
        assert (
            calculate_virustotal_risk(
                {
                    "data": {
                        "attributes": {
                            "last_analysis_stats": {
                                "malicious": 1,
                                "suspicious": 0,
                                "harmless": 40,
                                "undetected": 9,
                            }
                        }
                    }
                }
            )
            == 20
        )
        assert (
            calculate_virustotal_risk(
                {
                    "data": {
                        "attributes": {
                            "last_analysis_stats": {
                                "malicious": 5,
                                "suspicious": 0,
                                "harmless": 35,
                                "undetected": 10,
                            }
                        }
                    }
                }
            )
            == 50
        )
        assert (
            calculate_virustotal_risk(
                {
                    "data": {
                        "attributes": {
                            "last_analysis_stats": {
                                "malicious": 20,
                                "suspicious": 0,
                                "harmless": 20,
                                "undetected": 10,
                            }
                        }
                    }
                }
            )
            == 80
        )

    def test_edge_cases(self):
        """Test VT edge cases"""
        assert calculate_virustotal_risk({}) == 0
        assert (
            calculate_virustotal_risk(
                {
                    "data": {
                        "attributes": {
                            "last_analysis_stats": {
                                "malicious": 15,
                                "suspicious": 0,
                                "harmless": 0,
                                "undetected": 0,
                            }
                        }
                    }
                }
            )
            == 95
        )


class TestAbuseIPDBRisk:
    """Test AbuseIPDB risk scoring"""

    def test_confidence_scoring(self):
        """Test abuse confidence mapping"""
        assert calculate_abuseipdb_risk({}) == 0
        assert calculate_abuseipdb_risk({"abuseConfidenceScore": 75}) == 75


class TestIPInfoRisk:
    """Test IPInfo risk scoring"""

    def test_risk_categories(self):
        """Test IPInfo risk categories"""
        assert (
            calculate_ipinfo_risk({"org": "bulletproof hosting", "country": "US"}) == 40
        )
        assert calculate_ipinfo_risk({"org": "tor exit node", "country": "US"}) == 35
        assert calculate_ipinfo_risk({"org": "regular isp", "country": "RU"}) == 15
        assert calculate_ipinfo_risk({"org": "comcast", "country": "US"}) == 0
        assert calculate_ipinfo_risk({}) == 0


class TestRiskScoreCalculation:
    """Test overall risk score calculation"""

    def test_weighted_scoring(self):
        """Test weighted risk calculation"""
        sources = [
            Mock(
                source="VirusTotal",
                status="success",
                data={
                    "data": {
                        "attributes": {
                            "last_analysis_stats": {
                                "malicious": 10,
                                "suspicious": 0,
                                "harmless": 30,
                                "undetected": 10,
                            }
                        }
                    }
                },
            ),  # 65
            Mock(
                source="AbuseIPDB",
                status="success",
                data={"abuseConfidenceScore": 60},
            ),  # 60
            Mock(
                source="IPInfo",
                status="success",
                data={"org": "bulletproof hosting", "country": "US"},
            ),  # 40
        ]
        assert calculate_risk_score(sources) == 61  # 65*0.6 + 60*0.3 + 40*0.1

    def test_failed_sources(self):
        """Test handling of failed sources"""
        sources = [Mock(source="VirusTotal", status="failed", data={})]
        assert calculate_risk_score(sources) == 0
        assert calculate_risk_score([]) == 0


class TestRiskLevel:
    """Test risk level categorization"""

    def test_level_thresholds(self):
        """Test risk level boundaries"""
        assert get_risk_level(0) == "MINIMAL RISK"
        assert get_risk_level(15) == "LOW RISK"
        assert get_risk_level(40) == "MODERATE RISK"
        assert get_risk_level(70) == "HIGH RISK"


class TestSummaryGeneration:
    """Test summary formatting"""

    def test_summary_format(self):
        """Test summary generation"""
        sources = [
            Mock(
                source="VirusTotal",
                status="success",
                data={
                    "data": {
                        "attributes": {
                            "last_analysis_stats": {
                                "malicious": 5,
                                "suspicious": 0,
                                "harmless": 35,
                                "undetected": 10,
                            }
                        }
                    }
                },
            ),
            Mock(
                source="AbuseIPDB",
                status="success",
                data={"abuseConfidenceScore": 30},
            ),
        ]

        result = generate_summary("192.168.1.1", "ip", sources, 45)

        assert "MODERATE RISK" in result
        assert "2 sources" in result
        assert "45% risk" in result
