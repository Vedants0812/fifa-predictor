"""
Tournament simulation — FIFA World Cup 2026
48 teams | 12 groups | 104 matches

Match count:
  Group stage  : 12 groups × 6 matches = 72
  Round of 32  : 16  (top 2 + 8 best 3rd place = 32 teams)
  Round of 16  : 16  — wait, official is:
    Round of 32 : 16 matches  (32 → 16)
    Round of 16 : 8  matches  (16 → 8)
    Quarterfinals: 4 matches  (8 → 4)
    Semifinals  : 2 matches   (4 → 2)
    3rd place   : 1 match
    Final       : 1 match
    Knockout    : 16+8+4+2+1+1 = 32
  Total = 72 + 32 = 104 ✓
"""
from fastapi import APIRouter
from app.data.teams import TEAMS, GROUPS
from app.ml.predictor import simulate_knockout_match, predict_probabilities
from typing import List
import random

router = APIRouter()


def group_stage_standings() -> dict:
    """
    Simulate group stage using Poisson-based goals.
    Returns {group: [sorted team_ids by points]}.
    """
    import itertools, numpy as np

    standings: dict = {}

    for g, ids in GROUPS.items():
        valid = [i for i in ids if i in TEAMS]
        pts = {i: 0 for i in valid}
        gd  = {i: 0 for i in valid}  # goal difference
        gf  = {i: 0 for i in valid}

        for a_id, b_id in itertools.combinations(valid, 2):
            ta = TEAMS[a_id]; tb = TEAMS[b_id]
            # quick score sim
            rng = np.random.default_rng()
            la = max(0.3, ta["goals_per_match"] * 0.85 + (ta["ai_rating"] - tb["ai_rating"]) * 0.05)
            lb = max(0.3, tb["goals_per_match"] * 0.85 + (tb["ai_rating"] - ta["ai_rating"]) * 0.05)
            sa = int(rng.poisson(la)); sb = int(rng.poisson(lb))
            gf[a_id] += sa; gf[b_id] += sb
            gd[a_id] += sa - sb; gd[b_id] += sb - sa
            if sa > sb:   pts[a_id] += 3
            elif sa == sb: pts[a_id] += 1; pts[b_id] += 1
            else:          pts[b_id] += 3

        sorted_teams = sorted(valid, key=lambda i: (pts[i], gd[i], gf[i]), reverse=True)
        standings[g] = {
            "teams": sorted_teams,
            "points": pts,
            "goal_diff": gd,
        }

    return standings


def best_third_place(standings: dict) -> List[str]:
    """Pick best 8 third-place teams to fill R32 (32 teams advance)."""
    thirds = []
    for g, data in standings.items():
        if len(data["teams"]) >= 3:
            third_id = data["teams"][2]
            thirds.append((third_id, data["points"][third_id], data["goal_diff"][third_id]))
    thirds.sort(key=lambda x: (x[1], x[2]), reverse=True)
    return [t[0] for t in thirds[:8]]


def run_knockout_round(team_ids: List[str], round_name: str) -> dict:
    """Pair teams and simulate. Returns {results, winners}."""
    results = []
    winners = []
    for i in range(0, len(team_ids), 2):
        if i + 1 >= len(team_ids):
            winners.append(team_ids[i])   # bye
            continue
        a_id = team_ids[i]; b_id = team_ids[i + 1]
        ta = TEAMS[a_id]; tb = TEAMS[b_id]
        res = simulate_knockout_match(ta, tb)
        results.append({**res, "round": round_name})
        winners.append(res["winner"])
    return {"results": results, "winners": winners}


@router.get("/simulate-tournament", summary="Full 104-match World Cup simulation")
def simulate_tournament(seed: int = None):
    if seed:
        random.seed(seed)

    # ── Group Stage (72 matches) ──────────────────────────────────────────────
    standings = group_stage_standings()

    # Build 32 advancing teams: top 2 from each group (24) + 8 best 3rd
    r32_teams = []
    for g in sorted(GROUPS.keys()):
        data = standings[g]
        if len(data["teams"]) >= 2:
            r32_teams.extend(data["teams"][:2])
    r32_teams.extend(best_third_place(standings))

    # ── Round of 32 (16 matches) ──────────────────────────────────────────────
    r32 = run_knockout_round(r32_teams, "Round of 32")

    # ── Round of 16 (8 matches) ───────────────────────────────────────────────
    r16 = run_knockout_round(r32["winners"], "Round of 16")

    # ── Quarterfinals (4 matches) ─────────────────────────────────────────────
    qf = run_knockout_round(r16["winners"], "Quarterfinal")

    # ── Semifinals (2 matches) ────────────────────────────────────────────────
    sf = run_knockout_round(qf["winners"], "Semifinal")

    # ── Third Place (1 match) ─────────────────────────────────────────────────
    sf_losers = [
        res["team_a"] if res["winner"] == res["team_b"] else res["team_b"]
        for res in sf["results"]
    ]
    third = run_knockout_round(sf_losers[:2], "Third Place")

    # ── Final (1 match) ───────────────────────────────────────────────────────
    final = run_knockout_round(sf["winners"], "Final")

    champion_id = final["winners"][0] if final["winners"] else "arg"
    champion = TEAMS.get(champion_id, TEAMS["arg"])

    # Championship probability
    p_a, _, p_b = predict_probabilities(
        TEAMS[final["results"][0]["team_a"]] if final["results"] else champion,
        TEAMS[final["results"][0]["team_b"]] if final["results"] else TEAMS["bra"],
    )
    champ_prob = p_a if final["results"] and final["results"][0]["winner"] == final["results"][0]["team_a"] else p_b

    # Match count sanity
    total_ko_matches = (
        len(r32["results"]) + len(r16["results"]) +
        len(qf["results"]) + len(sf["results"]) +
        len(third["results"]) + len(final["results"])
    )

    return {
        "champion": {**champion, "championship_probability": round(champ_prob, 1)},
        "runner_up": TEAMS.get(
            final["results"][0]["team_b"] if final["results"] and final["results"][0]["winner"] == final["results"][0]["team_a"]
            else (final["results"][0]["team_a"] if final["results"] else "bra"), {}
        ),
        "third_place": TEAMS.get(third["winners"][0] if third["winners"] else "ned", {}),
        "standings": {
            g: {
                "teams": [{"id": tid, "name": TEAMS[tid]["name"], "flag": TEAMS[tid]["flag"],
                           "points": data["points"].get(tid, 0),
                           "goal_diff": data["goal_diff"].get(tid, 0),
                           "advanced": i < 2} for i, tid in enumerate(data["teams"]) if tid in TEAMS]
            }
            for g, data in standings.items()
        },
        "bracket": {
            "round_of_32": r32["results"],
            "round_of_16": r16["results"],
            "quarterfinals": qf["results"],
            "semifinals": sf["results"],
            "third_place": third["results"],
            "final": final["results"],
        },
        "match_counts": {
            "group_stage": 72,
            "round_of_32": len(r32["results"]),
            "round_of_16": len(r16["results"]),
            "quarterfinals": len(qf["results"]),
            "semifinals": len(sf["results"]),
            "third_place": len(third["results"]),
            "final": len(final["results"]),
            "total_knockout": total_ko_matches,
            "total": 72 + total_ko_matches,
        },
    }


@router.get("/standings", summary="Group stage standings")
def get_standings():
    return {"groups": group_stage_standings()}
