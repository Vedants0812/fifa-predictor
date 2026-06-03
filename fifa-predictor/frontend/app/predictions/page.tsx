'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { MatchCard } from '@/app/components/MatchCard';
import { SkeletonCard } from '@/app/components/Skeleton';
import type { Match } from '@/app/lib/api';

const apiFetcher = (url: string) =>
  fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api${url}`).then(r => r.json());

const GROUPS = ['All', 'Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H', 'Group I', 'Group J', 'Group K', 'Group L'];

export default function PredictionsPage() {
  const [group, setGroup] = useState('All');
  const [search, setSearch] = useState('');

  const url = group === 'All' ? '/matches' : `/matches?group=${encodeURIComponent(group)}`;
  const { data, isLoading } = useSWR<{ matches: Match[]; total: number }>(url, apiFetcher);

  const matches = (data?.matches ?? []).filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.team_a.name.toLowerCase().includes(q) || m.team_b.name.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-head font-extrabold text-3xl mb-1">Match Predictions</h1>
        <p className="text-subtle text-[14px]">AI-generated win probabilities for all 104 FIFA World Cup 2026 matches</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="bg-surface border border-border2 rounded-xl px-4 py-2.5 text-[14px] text-white placeholder-muted outline-none focus:border-primary/50 w-full sm:w-72 transition-colors"
          placeholder="Search teams..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="text-[12px] text-muted self-center ml-auto">
          {isLoading ? '...' : `${matches.length} matches`}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-8 overflow-x-auto pb-1">
        {GROUPS.map(g => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border whitespace-nowrap transition-all ${
              group === g
                ? 'bg-primary border-primary text-white'
                : 'bg-surface border-border2 text-subtle hover:border-primary/40 hover:text-white'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <div className="text-5xl mb-4">⚽</div>
          <p className="font-medium">No matches found</p>
          <p className="text-[13px] mt-1">Try a different group or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {matches.map(m => <MatchCard key={m.match_id} match={m} />)}
        </div>
      )}
    </div>
  );
}
