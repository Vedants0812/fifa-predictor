'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { fetcher, apiFetch } from '@/app/lib/api';
import type { Team, Match } from '@/app/lib/api';
import { MatchCard } from '@/app/components/MatchCard';
import { Zap } from 'lucide-react';

export default function PredictorPage() {
  const { data: teamsData } = useSWR<{ teams: Team[] }>('/teams', fetcher);
  const teams = teamsData?.teams ?? [];

  const [teamA, setTeamA] = useState('arg');
  const [teamB, setTeamB] = useState('fra');
  const [stage, setStage] = useState('group');
  const [neutral, setNeutral] = useState(true);
  const [result, setResult] = useState<Match | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predict = async () => {
    if (teamA === teamB) { setError('Select two different teams'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch<Match>('/predict-match', {
        method: 'POST',
        body: JSON.stringify({ team_a_id: teamA, team_b_id: teamB, stage, neutral_venue: neutral }),
      });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const STAGES = [
    { value: 'group', label: 'Group Stage' },
    { value: 'round_of_16', label: 'Round of 16' },
    { value: 'quarterfinal', label: 'Quarterfinal' },
    { value: 'semifinal', label: 'Semifinal' },
    { value: 'final', label: 'Final' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-head font-extrabold text-3xl mb-1">⚡ Custom AI Predictor</h1>
        <p className="text-subtle text-[14px]">Pick any two teams — get an instant AI prediction</p>
      </div>

      <div className="bg-surface border border-border2 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Team A */}
          <div>
            <label className="text-[12px] text-muted mb-1.5 block">Team A</label>
            <select
              className="w-full bg-surface2 border border-border2 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-primary/50 transition-colors"
              value={teamA}
              onChange={e => setTeamA(e.target.value)}
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
              ))}
            </select>
          </div>

          {/* Team B */}
          <div>
            <label className="text-[12px] text-muted mb-1.5 block">Team B</label>
            <select
              className="w-full bg-surface2 border border-border2 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-primary/50 transition-colors"
              value={teamB}
              onChange={e => setTeamB(e.target.value)}
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Stage */}
          <div>
            <label className="text-[12px] text-muted mb-1.5 block">Match Stage</label>
            <select
              className="w-full bg-surface2 border border-border2 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-primary/50 transition-colors"
              value={stage}
              onChange={e => setStage(e.target.value)}
            >
              {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Neutral venue */}
          <div>
            <label className="text-[12px] text-muted mb-1.5 block">Venue</label>
            <div className="flex gap-2">
              <button
                onClick={() => setNeutral(true)}
                className={`flex-1 py-3 rounded-xl text-[13px] font-medium border transition-all ${
                  neutral ? 'bg-primary border-primary text-white' : 'bg-surface2 border-border2 text-muted hover:text-white'
                }`}
              >
                Neutral
              </button>
              <button
                onClick={() => setNeutral(false)}
                className={`flex-1 py-3 rounded-xl text-[13px] font-medium border transition-all ${
                  !neutral ? 'bg-primary border-primary text-white' : 'bg-surface2 border-border2 text-muted hover:text-white'
                }`}
              >
                Home (A)
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-[13px]">
            {error}
          </div>
        )}

        <button
          onClick={predict}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold text-[15px] hover:bg-blue-600 transition-all disabled:opacity-50"
        >
          <Zap size={16} />
          {loading ? 'Predicting...' : 'Generate Prediction'}
        </button>
      </div>

      {result && <MatchCard match={result} />}

      {/* Quick battle buttons */}
      <div className="mt-10">
        <h2 className="font-head font-bold text-lg mb-4">🔥 Classic Rivalries</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { a: 'arg', b: 'bra', label: 'El Superclásico' },
            { a: 'eng', b: 'ger', label: 'Euro Classic' },
            { a: 'esp', b: 'por', label: 'Iberian Derby' },
            { a: 'fra', b: 'bra', label: 'World Cup Final?' },
            { a: 'bra', b: 'arg', label: 'Copa América' },
            { a: 'mor', b: 'fra', label: '2022 Redux' },
          ].map(r => (
            <button
              key={r.label}
              onClick={() => { setTeamA(r.a); setTeamB(r.b); setResult(null); }}
              className="bg-surface border border-border2 rounded-xl p-3 text-left hover:border-primary/40 transition-all"
            >
              <div className="text-[13px] font-medium">{r.label}</div>
              <div className="text-[11px] text-muted mt-0.5">
                {teams.find(t => t.id === r.a)?.flag} vs {teams.find(t => t.id === r.b)?.flag}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
