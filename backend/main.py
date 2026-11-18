import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.db import init_db
from backend.database.seed_data import seed

from backend.routes.auth_routes import router as auth_router
from backend.routes.family_routes import router as family_router
from backend.routes.module1_routes import router as module1_router
from backend.routes.module2_routes import router as module2_router
from backend.routes.module3_routes import router as module3_router
from backend.routes.dashboard_routes import router as dashboard_router
from backend.routes.reports_routes import router as reports_router
from backend.routes.iot_routes import router as iot_router
from backend.routes.simulation_routes import router as simulation_router
from backend.routes.activity_routes import router as activity_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize SQLite schema & seed demo data
    init_db()
    seed()
    yield


app = FastAPI(
    title="Smart Energy Management Platform – Family-Owned Properties",
    description="Multi-Property Energy Intelligence, Machine Learning & Optimization Platform",
    version="2.5.0",
    lifespan=lifespan,
)

# Enable CORS for frontend Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router, prefix="/api")
app.include_router(family_router, prefix="/api")
app.include_router(module1_router, prefix="/api")
app.include_router(module2_router, prefix="/api")
app.include_router(module3_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(iot_router, prefix="/api")
app.include_router(simulation_router, prefix="/api")
app.include_router(activity_router, prefix="/api")


@app.get("/", tags=["General"])
def root():
    return {
        "platform": "Smart Energy Management Platform – Family-Owned Properties",
        "academic_modules": [
            "Module 1: Data Collection, Integration & Preprocessing",
            "Module 2: Energy Consumption Prediction & Analytics",
            "Module 3: Energy Optimization, Smart Recommendations & Deployment",
        ],
        "version": "2.5.0",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health", tags=["General"])
def health_check():
    return {
        "status": "healthy",
        "service": "smart-energy-backend",
        "version": "2.5.0",
    }


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
