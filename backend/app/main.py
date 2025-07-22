from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import router

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="A threat intelligence enrichment tool for IOCs (IPs, domains, hashes)",
    openapi_url="/api/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# Include API routes
app.include_router(router, prefix="/api")


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "documentation": "/docs",
        "api_health": "/api/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",  # TODO: change to 0.0.0.0 before deployment
        port=8000,
        reload=settings.DEBUG,
    )
