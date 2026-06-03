from fastapi import APIRouter, HTTPException
from app.models.schemas import PredictRequest
from app.data.teams import TEAMS, GROUPS
from app.ml.predictor import (
    predict_probabilities, predict_score,
    confidence_level, generate_explanation
)
from typing import List
import itertools

router = APIRouter()


def to_py(val):
    """Convert any numpy scalar to a native Python type."""
    if hasattr(val, "item"):
        return val.item()
    return val


def team_to_base(t: dict) -> dict:
    return {
        "id": str(t["id"]),
        "name": str(t["name"]),
        "flag": str(t["flag"]),
        "group": str(t["group"]) if t.get("group") else None,
        "fifa_rank": int(t["fifa_rank"]),
        "ai_rating": float(t["ai_rating"]),
        "goals_per_match": float(t["goals_per_match"]),
        "conceded_per_match": float(t["conceded_per_match"]),
        "win_rate": float(t["win_rate"]),
        "form": [str(r) for r in t["form"]],
        "confederation": str(t["confederation"]),
    }


def build_match(mid, stage, group, date, ta, tb) -> dict:
    p_a, p_d, p_b = predict_probabilities(ta, tb)
    sa, sb = predict_score(ta, tb)
    max_p = max(p_a, p_b)
    underdog = bool(min(p_a, p_b) >= 38)   # explicit bool() kills numpy.bool_

    form_diff = round(
        sum(3 if r == "W" else 1 if r == "D" else 0 for r in ta["form"][-5:]) -
        sum(3 if r == "W" else 1 if r == "D" else 0 for r in tb["form"][-5:]),
        2,
    )

    return {
        "match_id": int(mid),
        "stage": str(stage),
        "group": str(group) if group else None,
        "match_date": str(date),
        "team_a": team_to_base(ta),
        "team_b": team_to_base(tb),
        "prob_a": float(p_a),
        "prob_draw": float(p_d),
        "prob_b": float(p_b),
        "predicted_score_a": int(sa),
        "predicted_score_b": int(sb),
        "confidence": str(confidence_level(max_p)),
        "is_underdog_alert": underdog,
        "ai_explanation": str(generate_explanation(ta, tb, p_a, p_b)),
        "features_used": {
            "rating_diff": float(ta["ai_rating"] - tb["ai_rating"]),
            "form_diff": float(form_diff),
            "goals_diff": float(round(ta["goals_per_match"] - tb["goals_per_match"], 2)),
            "rank_diff": int(ta["fifa_rank"] - tb["fifa_rank"]),
        },
    }


def build_group_matches() -> List[dict]:
    """Generate all 72 group-stage matches (12 groups × 6 per group)."""
    matches = []
    mid = 1
    for group_name, team_ids in GROUPS.items():
        valid_ids = [tid for tid in team_ids if tid in TEAMS]
        for ta_id, tb_id in itertools.combinations(valid_ids, 2):
            ta = TEAMS[ta_id]
            tb = TEAMS[tb_id]
            date = f"Jun {14 + (mid % 20)}, 2026"
            matches.append(build_match(mid, "group", f"Group {group_name}", date, ta, tb))
            mid += 1
    return matches


@router.get("/matches", summary="Get all group-stage match predictions")
def get_all_matches(stage: str = None, group: str = None):
    matches = build_group_matches()
    if stage:
        matches = [m for m in matches if m["stage"] == stage]
    if group:
        matches = [m for m in matches if (m.get("group") or "").lower() == group.lower()]
    return {"total": len(matches), "matches": matches}


@router.post("/predict-match", summary="Predict a specific match")
def predict_match(req: PredictRequest):
    ta = TEAMS.get(req.team_a_id)
    tb = TEAMS.get(req.team_b_id)
    if not ta:
        raise HTTPException(404, f"Team '{req.team_a_id}' not found")
    if not tb:
        raise HTTPException(404, f"Team '{req.team_b_id}' not found")

    p_a, p_d, p_b = predict_probabilities(ta, tb, req.neutral_venue)
    sa, sb = predict_score(ta, tb)
    max_p = max(p_a, p_b)

    return {
        "match_id": 0,
        "stage": str(req.stage),
        "group": None,
        "match_date": "On demand",
        "team_a": team_to_base(ta),
        "team_b": team_to_base(tb),
        "prob_a": float(p_a),
        "prob_draw": float(p_d),
        "prob_b": float(p_b),
        "predicted_score_a": int(sa),
        "predicted_score_b": int(sb),
        "confidence": str(confidence_level(max_p)),
        "is_underdog_alert": bool(min(p_a, p_b) >= 38),
        "ai_explanation": str(generate_explanation(ta, tb, p_a, p_b)),
        "features_used": {
            "rating_diff": float(ta["ai_rating"] - tb["ai_rating"]),
            "goals_diff": float(round(ta["goals_per_match"] - tb["goals_per_match"], 2)),
            "rank_diff": int(ta["fifa_rank"] - tb["fifa_rank"]),
        },
    }
