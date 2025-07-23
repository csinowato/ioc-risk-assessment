from typing import List
from app.models import SourceResult

# Risk indicators lists
SUSPICIOUS_HOSTING = ["bulletproof", "offshore", "anonymous", "privacy", "protected"]
HIGH_RISK_COUNTRIES = ["RU", "CN", "KP", "IR"]


def calculate_virustotal_risk(vt_data: dict) -> int:
    """Calculate risk score from VirusTotal data using non-linear scaling"""
    positives = vt_data.get("positives", 0)
    total = vt_data.get("total", 1)

    if positives == 0:
        return 0
    elif positives == 1:
        return 20  # any detection is worth investigating
    elif positives <= 3:
        return 35  # suspicious
    elif positives <= 6:
        return 50  # concerning
    elif positives <= 10:
        return 65  # likely malicious
    else:
        try:
            # High confidence malicious: start at 70%, add up to 25% more based on ratio
            ratio_score = (positives / total) * 25
            return min(95, 70 + ratio_score)
        except (ZeroDivisionError, TypeError):
            return 85  # fallback if total is 0 or None


def calculate_abuseipdb_risk(abuse_data: dict) -> int:
    """AbuseIPDB confidence is already a good risk indicator"""
    return abuse_data.get("abuseConfidencePercentage", 0)


def calculate_ipinfo_risk(ipinfo_data: dict) -> int:
    """Calculate contextual risk score from IPInfo data"""
    org = ipinfo_data.get("org", "").lower()
    country = ipinfo_data.get("country", "").upper()

    # Check for bulletproof hosting (highest risk)
    if any(term in org for term in SUSPICIOUS_HOSTING):
        return 40

    # Check for Tor exit nodes
    if "tor" in org:
        return 35

    # Check for high-risk countries
    if country in HIGH_RISK_COUNTRIES:
        return 15

    # Regular hosting/cloud providers
    if any(term in org for term in ["hosting", "server", "cloud"]):
        return 10

    return 0


def calculate_risk_score(sources: List[SourceResult]) -> int:
    """Calculate weighted risk score based on all source results"""
    scores = {}
    weights = {"VirusTotal": 0.6, "AbuseIPDB": 0.3, "IPInfo": 0.1}

    # Collect available scores
    for source in sources:
        if source.status == "success" and source.data:
            if source.source == "VirusTotal":
                scores["VirusTotal"] = calculate_virustotal_risk(source.data)
            elif source.source == "AbuseIPDB":
                scores["AbuseIPDB"] = calculate_abuseipdb_risk(source.data)
            elif source.source == "IPInfo":
                scores["IPInfo"] = calculate_ipinfo_risk(source.data)

    if not scores:
        return 0

    # Calculate weighted score with normalization to handle missing sources
    total_weighted = sum(scores[source] * weights[source] for source in scores.keys())
    total_weight = sum(weights[source] for source in scores.keys())

    return min(100, int(round(total_weighted / total_weight)))


def get_risk_level(risk_score: int) -> str:
    """Convert numeric risk score to descriptive level"""
    if risk_score >= 70:
        return "HIGH RISK"
    elif risk_score >= 40:
        return "MODERATE RISK"
    elif risk_score >= 15:
        return "LOW RISK"
    else:
        return "MINIMAL RISK"


def generate_summary(
    ioc: str, ioc_type: str, sources: List[SourceResult], risk_score: int
) -> str:
    """Generate summary with threat context"""
    risk_level = get_risk_level(risk_score)
    active_sources = len([s for s in sources if s.status == "success"])

    # Collect key threat indicators
    context = []
    for source in sources:
        if source.status == "success" and source.data:
            if source.source == "VirusTotal" and source.data.get("positives", 0) > 0:
                context.append(
                    f"detected by {source.data['positives']}/{source.data['total']} engines"
                )
            elif (
                source.source == "AbuseIPDB"
                and source.data.get("abuseConfidencePercentage", 0) > 0
            ):
                context.append(
                    f"{source.data['abuseConfidencePercentage']}% abuse confidence"
                )

    context_str = f" ({', '.join(context)})" if context else ""
    return f"{risk_level} - {ioc_type.upper()} analyzed by {active_sources} sources{context_str} - {risk_score}% risk"
