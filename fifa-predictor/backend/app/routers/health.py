from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health")
def health():
    return {
        "status": "ok",
        "service": "FIFA World Cup 2026 AI Predictor",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "teams_loaded": 48,
        "total_matches": 104,
    }
