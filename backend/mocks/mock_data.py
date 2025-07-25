# Mock IOCs that return "malicious" responses
MALICIOUS_TEST_IOCS = ["1.1.1.1", "suspicious-domain.com"]

# VirusTotal mock responses
VT_MALICIOUS_RESPONSE = {
    "data": {
        "attributes": {
            "last_analysis_stats": {
                "malicious": 5,
                "suspicious": 0,
                "harmless": 60,
                "undetected": 5,
            },
            "date": 1721472000,  # Unix timestamp for 2025-07-20
            "last_analysis_results": {
                "Kaspersky": {"category": "malicious", "result": "Malware.Generic"},
                "Symantec": {"category": "malicious", "result": "Suspicious.Cloud.9"},
            },
        }
    }
}

VT_CLEAN_RESPONSE = {
    "data": {
        "attributes": {
            "last_analysis_stats": {
                "malicious": 0,
                "suspicious": 0,
                "harmless": 68,
                "undetected": 2,
            },
            "date": 1721472000,  # Unix timestamp for 2025-07-20
        }
    }
}

# AbuseIPDB mock responses
ABUSEIPDB_MALICIOUS_RESPONSE = {
    "abuseConfidenceScore": 85,
    "countryCode": "US",
    "usageType": "Data Center/Web Hosting/Transit",
    "isp": "Example ISP",
    "totalReports": 12,
    "numDistinctUsers": 8,
}

ABUSEIPDB_CLEAN_RESPONSE = {
    "abuseConfidenceScore": 0,
    "countryCode": "US",
    "usageType": "Data Center/Web Hosting/Transit",
    "isp": "Example ISP",
    "totalReports": 0,
    "numDistinctUsers": 0,
}

ABUSEIPDB_NOT_APPLICABLE = {"message": "AbuseIPDB only supports IP addresses"}

# IPInfo mock responses
IPINFO_IP_RESPONSE = {
    "city": "San Francisco",
    "region": "California",
    "country": "US",
    "org": "AS13335 Cloudflare, Inc.",
    "postal": "94105",
    "timezone": "America/Los_Angeles",
    "loc": "37.7621,-122.3971",
}

IPINFO_DOMAIN_RESPONSE = {
    "domain": "{ioc}",
    "ip": "192.168.1.1",
    "city": "San Francisco",
    "country": "US",
    "org": "AS13335 Cloudflare, Inc.",
}

IPINFO_NOT_APPLICABLE = {"message": "IPInfo supports IP and domain lookups"}
