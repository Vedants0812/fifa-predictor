'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/app/lib/api';
import { TeamCard } from '@/app/components/TeamCard';
import { SkeletonTeamCard } from '@/app/components/Skeleton';
import type { Team } from '@/app/lib/api';

const CONFEDERATIONS = ['All', 'UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'];
const GROUPS_LIST = ['All Groups', ...Array.from('ABCDEFGHIJKL').map(g => `Group ${g}`)];

export default function TeamsPage() {
  const [conf, setConf] = useState('All');
  const [group, setGroup] = useState('All Groups');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'rank' | 'rating' | 'winrate'>('rank');

  const confParam = conf !== 'All' ? `?confederation=${conf}` : '';
  const { data, isLoading } = useSWR<{ teams: Team[]; total: number }>(
    `/teams${confParam}`, fetcher
  );

  let teams = data?.teams ?? [];

  if (group !== 'All Groups') {
    const letter = group.replace('Group ', '');
    teams = teams.filter(t => t.group === letter);
  }
  if (search) {
    const q = search.toLowerCase();
    teams = teams.filter(t => t.name.toLowerCase().includes(q) || t.confederation.toLowerCase().includes(q));
  }
  teams = [...teams].sort((a, b) => {
    if (sort === 'rank') return a.fifa_rank - b.fifa_rank;
    if (sort === 'rating') return b.ai_rating - a.ai_rating;
    return b.win_rate - a.win_rate;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-head font-extrabold text-3xl mb-1">Team Analytics</h1>
        <p className="text-subtle text-[14px]">All 48 qualified teams — stats, form, AI ratings</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="bg-surface border border-border2 rounded-xl px-4 py-2.5 text-[14px] text-white placeholder-muted outline-none focus:border-primary/50 w-full sm:w-64 transition-colors"
          placeholder="Search teams..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="bg-surface border border-border2 rounded-xl px-4 py-2.5 text-[14px] text-white outline-none focus:border-primary/50 transition-colors"
          value={sort}
          onChange={e => setSort(e.target.value as any)}
        >
          <option value="rank">Sort by FIFA Rank</option>
          <option value="rating">Sort by AI Rating</option>
          <option value="winrate">Sort by Win Rate</option>
        </select>
        <div className="text-[12px] text-muted self-center ml-auto">
          {isLoading ? '...' : `${teams.length} teams`}
        </div>
      </div>

      {/* Confederation filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CONFEDERATIONS.map(c => (
          <button
            key={c}
            onClick={() => setConf(c)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
              conf === c
                ? 'bg-primary border-primary text-white'
                : 'bg-surface border-border2 text-subtle hover:border-primary/40 hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Group filter */}
      <div className="flex gap-2 flex-wrap mb-8 overflow-x-auto">
        {GROUPS_LIST.map(g => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`px-3 py-1 rounded-lg text-[11px] font-medium border transition-all whitespace-nowrap ${
              group === g
                ? 'bg-accent/20 border-accent/50 text-accent'
                : 'bg-surface border-border2 text-muted hover:text-white'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(12)].map((_, i) => <SkeletonTeamCard key={i} />)}
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <div className="text-5xl mb-4">🏳️</div>
          <p className="font-medium">No teams found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {teams.map(t => <TeamCard key={t.id} team={t} />)}
        </div>
      )}
    </div>
  );
}
