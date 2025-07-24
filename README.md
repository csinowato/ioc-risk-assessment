# IOC Risk Assessment Tool

<!-- TODO -->

A risk assessment tool that analyzes Indicators of Compromise (IOCs) and provides real-time security scoring. It analyzes IPs, domains, or file hashes and produces an aggregated, weighted risk assessment, reducing the need to manually cross‑check against multiple threat intelligence sources.

## ⚡ Key Features

- **Multi-Source Intelligence** - Integrates VirusTotal, AbuseIPDB, and IPInfo APIs
- **Intelligent Risk Scoring** - Weighted algorithm combining detection rates and contextual data
- **Real-Time Analysis** - Parallel API calls across multiple sources
- **Bulk Analysis** - Process multiple IOCs simultaneously
- **Responsive Design** - Optimized for desktop and mobile devices

## 🛠️ Tech Stack

- **Backend:** FastAPI, Python 3.9+, Pydantic
- **Frontend:** React, JavaScript, Vite, Tailwind CSS
- **APIs:** VirusTotal, AbuseIPDB, IPInfo
- **Deployment:** Render

## 🚀 Live Demo

<!-- TODO  -->

**Quick Test:**

<!-- TODO -->

## 🔍 Detailed Analysis Results

<!-- TODO -->

## 📋 Example Response

```
{
  "ioc": "malicious-domain.com",
  "ioc_type": "domain",
  "risk_score": 75,
  "risk_level": "HIGH RISK",
  "sources": [
    {
      "source": "VirusTotal",
      "status": "success",
      "data": {"positives": 15, "total": 50}
    }
  ],
  "summary": "HIGH RISK - DOMAIN analyzed by 1 source (detected by 15/50 engines) - 75% risk",
  "timestamp": "2025-01-23T10:30:00Z"
}
```

## 🎯 Risk Scoring Algorithm

The tool uses a weighted multi-source risk assessment:

- **VirusTotal (60%)** - Malware detection rates from 50+ antivirus engines
- **AbuseIPDB (30%)** - Abuse confidence percentage for IPs
- **IPInfo (10%)** - Contextual risk factors (hosting type, geolocation)

## ⚖️ Risk Levels

- 🟢 MINIMAL RISK (0-14) - Clean indicators, no detections
- 🟡 LOW RISK (15-39) - Few detections, monitoring recommended
- 🟠 MODERATE RISK (40-69) - Multiple detections, investigation needed
- 🔴 HIGH RISK (70-100) - Strong malicious indicators, immediate action required

_For detailed scoring logic, see [risk_scoring.py](backend/app/risk_scoring.py)_

## 📊 Supported IOC Types

| Type       | Example                                    | Detection Method             |
| ---------- | ------------------------------------------ | ---------------------------- |
| **IPv4**   | `192.168.1.1`                              | Regex pattern validation     |
| **Domain** | `malicious.com`                            | DNS pattern + TLD validation |
| **MD5**    | `5d41402abc4b2a76b9719d911017c592`         | 32 hex characters            |
| **SHA1**   | `adc83b19e793491b1c6ea0fd8b46cd9f32e592fc` | 40 hex characters            |
| **SHA256** | `e3b0c44298fc1c149afbf4c8996fb924...`      | 64 hex characters            |
