from fastapi import APIRouter, HTTPException
from app.data.teams import TEAMS

router = APIRouter()


@router.get("/teams", summary="List all 48 teams")
def list_teams(confederation: str = None, group: str = None):
    teams = list(TEAMS.values())
    if confederation:
        teams = [t for t in teams if t["confederation"].upper() == confederation.upper()]
    if group:
        teams = [t for t in teams if t.get("group", "").upper() == group.upper()]
    return {"total": len(teams), "teams": teams}


@router.get("/teams/{team_id}", summary="Get team detail")
def get_team(team_id: str):
    team = TEAMS.get(team_id.lower())
    if not team:
        raise HTTPException(404, f"Team '{team_id}' not found. Valid IDs: {list(TEAMS.keys())}")
    return team


@router.get("/teams/{team_id}/head-to-head/{opponent_id}", summary="Head-to-head stats")
def head_to_head(team_id: str, opponent_id: str):
    ta = TEAMS.get(team_id.lower())
    tb = TEAMS.get(opponent_id.lower())
    if not ta:
        raise HTTPException(404, f"Team '{team_id}' not found")
    if not tb:
        raise HTTPException(404, f"Team '{opponent_id}' not found")

    total = ta["h2h_wins"] + ta["h2h_draws"] + ta["h2h_losses"]
    return {
        "team_a": {"id": ta["id"], "name": ta["name"], "flag": ta["flag"]},
        "team_b": {"id": tb["id"], "name": tb["name"], "flag": tb["flag"]},
        "total_matches": total,
        "team_a_wins": ta["h2h_wins"],
        "draws": ta["h2h_draws"],
        "team_b_wins": ta["h2h_losses"],
        "team_a_win_pct": round(ta["h2h_wins"] / max(1, total) * 100, 1),
        "team_b_win_pct": round(ta["h2h_losses"] / max(1, total) * 100, 1),
    }
