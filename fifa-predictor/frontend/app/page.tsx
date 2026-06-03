'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MatchCard } from '@/app/components/MatchCard';
import type { Match } from '@/app/lib/api';

export default function HomePage() {
  const [featured, setFeatured] = useState<Match[]>([]);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${base}/api/matches?group=Group%20A`)
      .then(r => r.ok ? r.json() : { matches: [] })
      .then(d => setFeatured((d.matches ?? []).slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-blue-400 px-4 py-1.5 rounded-full text-[13px] font-medium mb-7">
          🤖 AI-Powered · 104 Matches · 48 Teams · 2026
        </div>
        <h1 className="font-head font-extrabold text-[clamp(36px,7vw,68px)] leading-[1.05] tracking-tight mb-5">
          Predicting the Future<br />of <span className="text-primary">Football</span> with AI
        </h1>
        <p className="text-[18px] text-subtle max-w-xl mx-auto leading-relaxed mb-10">
          Data-driven insights for every match, every team, every champion. Powered by machine learning and decades of FIFA data.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/predictions" className="bg-primary text-white px-7 py-3 rounded-xl font-semibold text-[15px] hover:bg-blue-600 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30">
            View All 104 Predictions
          </Link>
          <Link href="/bracket" className="bg-surface2 text-white border border-border2 px-7 py-3 rounded-xl font-semibold text-[15px] hover:bg-surface3 transition-all hover:-translate-y-0.5">
            Simulate Tournament
          </Link>
          <Link href="/predictor" className="bg-surface2 text-accent border border-accent/30 px-7 py-3 rounded-xl font-semibold text-[15px] hover:bg-accent/10 transition-all hover:-translate-y-0.5">
            ⚡ Custom Prediction
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 md:px-8 mb-20 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { num: '48', label: 'Teams Competing' },
          { num: '104', label: 'Total Matches' },
          { num: '12', label: 'Groups of 4' },
          { num: '2026', label: 'USA · CAN · MEX' },
        ].map(s => (
          <div key={s.num} className="bg-surface border border-border2 rounded-2xl p-5 text-center">
            <div className="font-head font-extrabold text-[32px] text-primary leading-none">{s.num}</div>
            <div className="text-[13px] text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Match breakdown */}
      <section className="max-w-4xl mx-auto px-6 md:px-8 mb-20">
        <h2 className="font-head font-bold text-xl mb-4">104 Match Breakdown</h2>
        <div className="bg-surface border border-border2 rounded-2xl overflow-hidden">
          {[
            { stage: 'Group Stage',   matches: 72, desc: '12 groups × 6 matches each' },
            { stage: 'Round of 32',   matches: 16, desc: '32 qualifiers → 16 teams' },
            { stage: 'Round of 16',   matches: 8,  desc: '16 teams → 8 teams' },
            { stage: 'Quarterfinals', matches: 4,  desc: '8 teams → 4 teams' },
            { stage: 'Semifinals',    matches: 2,  desc: '4 teams → 2 finalists' },
            { stage: 'Third Place',   matches: 1,  desc: 'Bronze medal playoff' },
            { stage: 'Final',         matches: 1,  desc: 'World Cup Champion crowned' },
          ].map((row, i) => (
            <div key={row.stage} className={`flex items-center justify-between px-5 py-3.5 ${i > 0 ? 'border-t border-border' : ''} hover:bg-surface2 transition-colors`}>
              <div>
                <div className="font-medium text-[14px]">{row.stage}</div>
                <div className="text-[12px] text-muted">{row.desc}</div>
              </div>
              <div className="font-head font-bold text-xl text-primary">{row.matches}</div>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-4 bg-primary/10 border-t border-primary/20">
            <div className="font-bold text-[15px]">Total Matches</div>
            <div className="font-head font-extrabold text-2xl text-primary">104</div>
          </div>
        </div>
      </section>

      {/* Featured matches */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 mb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-head font-bold text-xl">Featured Matches</h2>
            <p className="text-[13px] text-muted mt-0.5">Group A AI predictions</p>
          </div>
          <Link href="/predictions" className="text-primary text-[13px] hover:underline">All matches →</Link>
        </div>
        {featured.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface border border-border2 rounded-2xl h-64 skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featured.map((m: Match) => <MatchCard key={m.match_id} match={m} />)}
          </div>
        )}
      </section>
    </>
  );
}
