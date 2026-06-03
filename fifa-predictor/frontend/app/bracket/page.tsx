'use client';
import { useState } from 'react';
import useSWR from 'swr';
import type { TournamentResult, KOMatch } from '@/app/lib/api';
import { RefreshCw, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const TEAMS_MAP: Record<string, { name: string; flag: string }> = {};

const apiFetcher = (url: string) =>
  fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api${url}`).then(r => r.json());

function useTeams() {
  const { data } = useSWR<{ teams: any[] }>('/teams', apiFetcher);
  if (data?.teams) {
    data.teams.forEach((t: any) => { TEAMS_MAP[t.id] = { name: t.name, flag: t.flag }; });
  }
}

function BracketMatch({ match }: { match: KOMatch }) {
  const ta = TEAMS_MAP[match.team_a] ?? { name: match.team_a, flag: '🏳️' };
  const tb = TEAMS_MAP[match.team_b] ?? { name: match.team_b, flag: '🏳️' };
  return (
    <div className="bg-surface border border-border2 rounded-xl w-[175px] overflow-hidden hover:border-primary/40 transition-colors">
      <div className={`flex justify-between items-center px-3 py-2 border-b border-border text-[12px] ${match.winner === match.team_a ? 'font-bold text-white' : 'text-muted'}`}>
        <span>{ta.flag} {ta.name}</span>
        <span className={match.winner === match.team_a ? 'text-primary font-bold' : ''}>{match.score_a}</span>
      </div>
      <div className={`flex justify-between items-center px-3 py-2 text-[12px] ${match.winner === match.team_b ? 'font-bold text-white' : 'text-muted'}`}>
        <span>{tb.flag} {tb.name}</span>
        <span className={match.winner === match.team_b ? 'text-primary font-bold' : ''}>{match.score_b}</span>
      </div>
    </div>
  );
}

function RoundColumn({ title, matches }: { title: string; matches: KOMatch[] }) {
  const gap = Math.max(8, 240 / Math.max(1, matches.length));
  return (
    <div className="flex flex-col shrink-0">
      <div className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3 text-center">{title}</div>
      <div className="flex flex-col" style={{ gap: `${gap}px` }}>
        {matches.map((m, i) => <BracketMatch key={i} match={m} />)}
      </div>
    </div>
  );
}

export default function BracketPage() {
  useTeams();
  const [seed, setSeed] = useState<number>(Date.now());
  const [simulating, setSimulating] = useState(false);

  const { data, isLoading } = useSWR<TournamentResult>(
    `/simulate-tournament?seed=${seed}`,
    apiFetcher
  );

  const resimulate = () => {
    setSimulating(true);
    setSeed(Math.floor(Math.random() * 999999));
    setTimeout(() => setSimulating(false), 900);
  };

  const champ = data?.champion;
  const bracket = data?.bracket;
  const counts = data?.match_counts;

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-12">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-head font-extrabold text-3xl mb-1">Tournament Bracket</h1>
          <p className="text-subtle text-[14px]">Full simulation — 72 group + 32 knockout = 104 matches</p>
        </div>
        <button
          onClick={resimulate}
          disabled={simulating || isLoading}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-[14px] hover:bg-blue-600 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={simulating ? 'animate-spin' : ''} />
          Re-Simulate
        </button>
      </div>

      {counts && (
        <div className="flex flex-wrap gap-2 mb-8">
          {Object.entries(counts).filter(([k]) => k !== 'total').map(([k, v]) => (
            <span key={k} className="text-[11px] bg-surface border border-border2 px-3 py-1 rounded-full text-subtle">
              {k.replace(/_/g, ' ')}: <strong className="text-white">{String(v)}</strong>
            </span>
          ))}
          <span className="text-[11px] bg-primary/15 border border-primary/30 px-3 py-1 rounded-full text-primary font-bold">
            Total: {counts.total}
          </span>
        </div>
      )}

      {champ && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/30 rounded-2xl p-8 text-center mb-10 relative overflow-hidden"
        >
          <Trophy className="absolute top-4 right-4 text-amber opacity-30" size={40} />
          <div className="text-[64px] mb-2">{champ.flag}</div>
          <div className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-1">Predicted World Cup Champion 2026</div>
          <div className="font-head font-extrabold text-4xl mb-2">{champ.name}</div>
          <div className="text-subtle text-[14px]">
            Championship probability: <span className="text-accent font-bold">{champ.championship_probability}%</span>
            {data?.runner_up?.name && (
              <> · Runner-up: <span className="text-white">{data.runner_up.flag} {data.runner_up.name}</span></>
            )}
            {data?.third_place?.name && (
              <> · 3rd: <span className="text-white">{data.third_place.flag} {data.third_place.name}</span></>
            )}
          </div>
        </motion.div>
      )}

      {isLoading || simulating ? (
        <div className="flex items-center justify-center h-64 text-muted">
          <RefreshCw size={24} className="animate-spin mr-3" />
          Simulating 104 matches...
        </div>
      ) : bracket ? (
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-8 min-w-max">
            <RoundColumn title="Round of 32" matches={bracket.round_of_32} />
            <RoundColumn title="Round of 16" matches={bracket.round_of_16} />
            <RoundColumn title="Quarterfinals" matches={bracket.quarterfinals} />
            <RoundColumn title="Semifinals" matches={bracket.semifinals} />
            <RoundColumn title="Final" matches={bracket.final} />
            <RoundColumn title="3rd Place" matches={bracket.third_place} />
          </div>
        </div>
      ) : null}

      {data?.standings && (
        <div className="mt-16">
          <h2 className="font-head font-bold text-xl mb-6">Group Stage Standings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(data.standings).map(([g, gData]) => (
              <div key={g} className="bg-surface border border-border2 rounded-xl overflow-hidden">
                <div className="bg-surface2 px-4 py-2.5 font-head font-bold text-[13px] border-b border-border">
                  Group {g}
                </div>
                {gData.teams.map((t, i) => (
                  <div key={t.id} className={`flex items-center justify-between px-4 py-2 text-[12px] border-b border-border last:border-0 ${t.advanced ? 'text-white' : 'text-muted'}`}>
                    <span className="flex items-center gap-2">
                      <span className="text-muted w-3">{i + 1}</span>
                      {TEAMS_MAP[t.id]?.flag ?? '🏳️'} {t.name}
                      {t.advanced && <span className="text-[9px] bg-primary/20 text-primary px-1 rounded">ADV</span>}
                    </span>
                    <span className="font-bold text-primary">{t.points} pts</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
