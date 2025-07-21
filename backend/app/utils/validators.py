import re
from typing import Literal

IOCType = Literal["ip", "domain", "md5", "sha1", "sha256", "unknown"]

# Regex patterns
IPV4_PATTERN = r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
DOMAIN_PATTERN = r"^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
HEX_PATTERN = r"^[a-fA-F0-9]+$"


def detect_ioc_type(ioc: str) -> IOCType:
    """Detect the IOC type (IP, domain, or hash)"""
    ioc = ioc.strip()

    # IPv4 address pattern
    if re.match(IPV4_PATTERN, ioc):
        return "ip"

    # Hash patterns
    if re.match(HEX_PATTERN, ioc):
        if len(ioc) == 32:
            return "md5"
        elif len(ioc) == 40:
            return "sha1"
        elif len(ioc) == 64:
            return "sha256"

    # Domain pattern (basic validation)
    if re.match(DOMAIN_PATTERN, ioc) and "." in ioc:
        return "domain"

    return "unknown"


def is_valid_ioc(ioc: str) -> bool:
    """Check if the IOC format is valid"""
    return detect_ioc_type(ioc) != "unknown"


def sanitize_ioc(ioc: str) -> str:
    """Clean and sanitize the IOC input"""
    # Remove common prefixes and clean up
    ioc = ioc.strip()

    # Remove common URL prefixes for domains
    prefixes = ["http://", "https://", "ftp://"]
    for prefix in prefixes:
        if ioc.lower().startswith(prefix):
            ioc = ioc[len(prefix) :]

    # Remove trailing slashes and paths for domains
    if "/" in ioc:
        base_part = ioc.split("/")[0]
        if detect_ioc_type(base_part) == "domain":
            ioc = base_part

    return ioc.strip()
