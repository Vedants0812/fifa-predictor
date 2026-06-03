from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class MatchResult(str, Enum):
    WIN = "W"
    DRAW = "D"
    LOSS = "L"


class Stage(str, Enum):
    GROUP = "group"
    R32   = "round_of_32"
    R16   = "round_of_16"
    QF    = "quarterfinal"
    SF    = "semifinal"
    THIRD = "third_place"
    FINAL = "final"


class TeamBase(BaseModel):
    id: str
    name: str
    flag: str
    group: Optional[str]
    fifa_rank: int
    ai_rating: float
    goals_per_match: float
    conceded_per_match: float
    win_rate: float
    form: List[MatchResult]
    confederation: str


class TeamDetail(TeamBase):
    h2h_wins: int
    h2h_draws: int
    h2h_losses: int
    squad_depth: float
    home_advantage: float
    tournament_experience: int   # World Cup appearances


class MatchPrediction(BaseModel):
    match_id: int
    stage: Stage
    group: Optional[str]
    match_date: str
    team_a: TeamBase
    team_b: TeamBase
    prob_a: float = Field(..., ge=0, le=100)
    prob_draw: float = Field(..., ge=0, le=100)
    prob_b: float = Field(..., ge=0, le=100)
    predicted_score_a: int
    predicted_score_b: int
    confidence: str        # High / Medium / Low
    is_underdog_alert: bool
    ai_explanation: str
    features_used: dict


class PredictRequest(BaseModel):
    team_a_id: str
    team_b_id: str
    stage: Stage = Stage.GROUP
    neutral_venue: bool = True


class TournamentResult(BaseModel):
    champion: TeamBase
    runner_up: TeamBase
    third_place: TeamBase
    fourth_place: TeamBase
    champion_probability: float
    bracket: dict
    top_scorers_predicted: List[dict]


class SimulateRequest(BaseModel):
    iterations: int = Field(default=1000, le=10000)
    random_seed: Optional[int] = None
