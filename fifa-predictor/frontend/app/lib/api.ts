const BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

export const fetcher = (url: string) => apiFetch(url);

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  flag: string;
  group: string | null;
  fifa_rank: number;
  ai_rating: number;
  goals_per_match: number;
  conceded_per_match: number;
  win_rate: number;
  form: string[];
  confederation: string;
  h2h_wins?: number;
  h2h_draws?: number;
  h2h_losses?: number;
  squad_depth?: number;
  tournament_experience?: number;
}

export interface Match {
  match_id: number;
  stage: string;
  group: string | null;
  match_date: string;
  team_a: Team;
  team_b: Team;
  prob_a: number;
  prob_draw: number;
  prob_b: number;
  predicted_score_a: number;
  predicted_score_b: number;
  confidence: 'High' | 'Medium' | 'Low';
  is_underdog_alert: boolean;
  ai_explanation: string;
  features_used: Record<string, number>;
}

export interface TournamentResult {
  champion: Team & { championship_probability: number };
  runner_up: Team;
  third_place: Team;
  standings: Record<string, { teams: Array<{ id: string; name: string; flag: string; points: number; goal_diff: number; advanced: boolean }> }>;
  bracket: {
    round_of_32: KOMatch[];
    round_of_16: KOMatch[];
    quarterfinals: KOMatch[];
    semifinals: KOMatch[];
    third_place: KOMatch[];
    final: KOMatch[];
  };
  match_counts: Record<string, number>;
}

export interface KOMatch {
  team_a: string;
  team_b: string;
  score_a: number;
  score_b: number;
  winner: string;
  prob_a: number;
  prob_b: number;
  round: string;
}
