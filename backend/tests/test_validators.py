import pytest

from app.utils.validators import detect_ioc_type, is_valid_ioc, sanitize_ioc


class TestIOCTypeDetection:
    """Test IOC type detection logic"""

    def test_ip_detection(self):
        """Test IP detection"""
        assert detect_ioc_type("192.168.1.1") == "ip"
        assert detect_ioc_type("8.8.8.8") == "ip"
        assert detect_ioc_type("999.999.999.999") == "unknown"
        assert detect_ioc_type("192.168.1") == "unknown"

    def test_hash_detection(self):
        """Test hash detection by length"""
        assert detect_ioc_type("d41d8cd98f00b204e9800998ecf8427e") == "md5"  # 32 chars
        assert (
            detect_ioc_type("adc83b19e793491b1c6ea0fd8b46cd9f32e592fc") == "sha1"
        )  # 40 chars
        assert (
            detect_ioc_type(
                "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            )
            == "sha256"
        )  # 64 chars
        assert detect_ioc_type("not_hex!") == "unknown"
        assert detect_ioc_type("abc123") == "unknown"  # too short

    def test_domain_detection(self):
        """Test domain detection"""
        assert detect_ioc_type("google.com") == "domain"
        assert detect_ioc_type("sub.domain.com") == "domain"
        assert detect_ioc_type("domain") == "unknown"  # no TLD
        assert detect_ioc_type(".com") == "unknown"

    def test_unknown_and_whitespace(self):
        """Test unknown types and whitespace handling"""
        assert detect_ioc_type("") == "unknown"
        assert detect_ioc_type("random text") == "unknown"
        assert detect_ioc_type("  192.168.1.1  ") == "ip"  # whitespace trimmed


class TestIOCValidation:
    """Test IOC validation"""

    def test_validation_logic(self):
        """Test valid/invalid IOC detection"""
        # Valid IOCs
        assert is_valid_ioc("192.168.1.1") is True
        assert is_valid_ioc("google.com") is True
        assert is_valid_ioc("d41d8cd98f00b204e9800998ecf8427e") is True

        # Invalid IOCs
        assert is_valid_ioc("") is False
        assert is_valid_ioc("random text") is False
        assert is_valid_ioc("999.999.999.999") is False


class TestIOCSanitization:
    """Test IOC sanitization"""

    def test_basic_sanitization(self):
        """Test whitespace and URL prefix removal"""
        assert sanitize_ioc("  192.168.1.1  ") == "192.168.1.1"
        assert sanitize_ioc("http://google.com") == "google.com"
        assert sanitize_ioc("https://example.com") == "example.com"

    def test_path_removal(self):
        """Test path removal from URLs"""
        assert sanitize_ioc("google.com/search") == "google.com"
        assert sanitize_ioc("https://evil.com/malware/payload.exe") == "evil.com"
        assert (
            sanitize_ioc("subdomain.example.com/api/v1/data") == "subdomain.example.com"
        )

    def test_edge_cases(self):
        """Test sanitization edge cases"""
        assert sanitize_ioc("") == ""
        assert sanitize_ioc("   ") == ""
        assert sanitize_ioc("http://") == ""
        assert sanitize_ioc("GOOGLE.COM") == "GOOGLE.COM"  # case preserved

    def test_real_world_scenarios(self):
        """Test complex real-world URLs"""
        test_cases = [
            (
                "https://malicious-domain.evil.com/ransomware/payload.exe",
                "malicious-domain.evil.com",
            ),
            ("HTTP://PHISHING.EXAMPLE.ORG/LOGIN/FAKE/", "PHISHING.EXAMPLE.ORG"),
            ("https://cdn.attacker.net/js/malware.js?v=1.2.3", "cdn.attacker.net"),
        ]
        for input_val, expected in test_cases:
            assert sanitize_ioc(input_val) == expected


class TestIntegrationWorkflow:
    """Test end-to-end validation workflow"""

    def test_complete_workflow(self):
        """Test sanitize -> detect -> validate pipeline"""
        test_cases = [
            ("https://google.com/search", "domain", True),
            ("  192.168.1.1  ", "ip", True),
            (" d41d8cd98f00b204e9800998ecf8427e ", "md5", True),
            ("invalid input", "unknown", False),
        ]

        for raw_input, expected_type, expected_valid in test_cases:
            sanitized = sanitize_ioc(raw_input)
            detected_type = detect_ioc_type(sanitized)
            is_valid = is_valid_ioc(sanitized)

            assert detected_type == expected_type
            assert is_valid == expected_valid
