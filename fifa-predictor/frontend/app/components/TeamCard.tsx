'use client';
import { clsx } from 'clsx';
import type { Team } from '@/app/lib/api';

const FORM_STYLES = {
  W: 'bg-accent/20 text-accent',
  D: 'bg-amber/20 text-amber',
  L: 'bg-danger/20 text-danger',
};

export function TeamCard({ team, onClick }: { team: Team; onClick?: () => void }) {
  const wins = team.form.filter(f => f === 'W').length;
  const totalMatches = team.h2h_wins! + team.h2h_draws! + team.h2h_losses!;

  return (
    <div
      className="bg-surface border border-border2 rounded-2xl p-5 card-hover cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl">{team.flag}</div>
        <div>
          <h3 className="font-head font-bold text-base">{team.name}</h3>
          <p className="text-[12px] text-muted">
            Group {team.group} · FIFA #{team.fifa_rank} · {team.confederation}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatBox label="Goals/Match" value={team.goals_per_match.toFixed(1)} color="text-primary" />
        <StatBox label="Conceded/Match" value={team.conceded_per_match.toFixed(1)} color="text-danger" />
        <StatBox label="Win Rate" value={`${team.win_rate}%`} color="text-accent" />
        <StatBox label="AI Rating" value={String(team.ai_rating)} color="text-amber" />
      </div>

      {/* Form */}
      <div className="mb-3">
        <div className="text-[11px] text-muted mb-1.5">Last 5 matches</div>
        <div className="flex gap-1.5">
          {team.form.slice(-5).map((r, i) => (
            <div
              key={i}
              className={clsx(
                'w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold',
                FORM_STYLES[r as keyof typeof FORM_STYLES] ?? 'bg-surface2 text-muted'
              )}
            >
              {r}
            </div>
          ))}
        </div>
      </div>

      {/* H2H */}
      <div className="pt-3 border-t border-border text-[11px] text-muted flex justify-between">
        <span>H2H: {team.h2h_wins}W {team.h2h_draws}D {team.h2h_losses}L</span>
        <span className="text-primary text-[11px]">Tap for analysis →</span>
      </div>

      {/* Rating bar */}
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-muted mb-1">
          <span>AI Power Rating</span>
          <span>{team.ai_rating}/100</span>
        </div>
        <div className="h-1 bg-surface2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent prob-bar"
            style={{ width: `${team.ai_rating}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-surface2 rounded-xl p-2.5">
      <div className={clsx('font-head font-bold text-lg leading-none', color)}>{value}</div>
      <div className="text-[10px] text-muted mt-0.5">{label}</div>
    </div>
  );
}
