from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import predictions, teams, tournament, health
import uvicorn

app = FastAPI(
    title="FIFA World Cup 2026 AI Predictor API",
    description="ML-powered predictions for FIFA World Cup 2026 — 104 matches",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in prod: ["https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router,       prefix="/api",        tags=["Health"])
app.include_router(predictions.router,  prefix="/api",        tags=["Predictions"])
app.include_router(teams.router,        prefix="/api",        tags=["Teams"])
app.include_router(tournament.router,   prefix="/api",        tags=["Tournament"])

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
