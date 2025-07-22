from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # API Configuration
    PROJECT_NAME: str = "IOC Enrichment Tool"
    VERSION: str = "1.0.0"
    DEBUG: bool = True

    # CORS Settings
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # External API Keys
    VIRUSTOTAL_API_KEY: Optional[str] = None
    ABUSEIPDB_API_KEY: Optional[str] = None
    IPINFO_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def allowed_origins_list(self) -> list[str]:
        """Convert string to list for CORS"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
