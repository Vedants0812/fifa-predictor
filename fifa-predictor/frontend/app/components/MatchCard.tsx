'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Zap, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import type { Match } from '@/app/lib/api';

const CONF_COLORS = {
  High: 'text-accent border-accent/30 bg-accent/10',
  Medium: 'text-amber border-amber/30 bg-amber/10',
  Low: 'text-danger border-danger/30 bg-danger/10',
};

export function MatchCard({ match }: { match: Match }) {
  const [open, setOpen] = useState(false);
  const { team_a: ta, team_b: tb } = match;

  return (
    <motion.div
      layout
      className="bg-surface border border-border2 rounded-2xl overflow-hidden card-hover cursor-pointer relative"
      onClick={() => setOpen(o => !o)}
    >
      {/* Top accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-primary to-purple-500" />

      <div className="p-5">
        {/* Meta */}
        <div className="flex justify-between items-center mb-4 text-[12px] text-muted">
          <span>📅 {match.match_date}</span>
          <span className="bg-surface2 border border-border2 px-2 py-0.5 rounded-md font-medium text-subtle">
            {match.group ?? match.stage}
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex-1 text-center">
            <div className="text-4xl mb-1">{ta.flag}</div>
            <div className="font-semibold text-[13px]">{ta.name}</div>
            <div className="text-[11px] text-muted">FIFA #{ta.fifa_rank}</div>
          </div>
          <div className="bg-surface2 border border-border2 rounded-lg px-3 py-2 font-bold text-[13px] text-subtle shrink-0">
            VS
          </div>
          <div className="flex-1 text-center">
            <div className="text-4xl mb-1">{tb.flag}</div>
            <div className="font-semibold text-[13px]">{tb.name}</div>
            <div className="text-[11px] text-muted">FIFA #{tb.fifa_rank}</div>
          </div>
        </div>

        {/* Predicted score */}
        <div className="text-center font-head font-bold text-2xl tracking-widest mb-4">
          {match.predicted_score_a} – {match.predicted_score_b}
        </div>

        {/* Probability bars */}
        <div className="space-y-2.5 mb-4">
          <ProbBar label={`${ta.name} Win`} value={match.prob_a} color="bg-primary" />
          <ProbBar label="Draw" value={match.prob_draw} color="bg-amber" />
          <ProbBar label={`${tb.name} Win`} value={match.prob_b} color="bg-accent" />
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          {match.is_underdog_alert && (
            <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber/10 text-amber border border-amber/30">
              <Zap size={10} /> Underdog Alert
            </span>
          )}
          <span className={clsx(
            'flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border',
            CONF_COLORS[match.confidence]
          )}>
            <TrendingUp size={10} /> {match.confidence} Confidence
          </span>
        </div>

        {/* Expand toggle */}
        <div className={clsx(
          'mt-3 flex items-center gap-1 text-[12px] text-muted transition-transform',
          open && 'text-primary'
        )}>
          <ChevronDown size={14} className={clsx('transition-transform', open && 'rotate-180')} />
          {open ? 'Hide' : 'Show'} AI analysis
        </div>

        {/* AI explanation */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-3 bg-surface2 rounded-xl border border-border text-[12px] text-subtle leading-relaxed">
                💡 {match.ai_explanation}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(match.features_used).map(([k, v]) => (
                  <div key={k} className="bg-surface2 rounded-lg px-3 py-2">
                    <div className="text-[10px] text-muted capitalize">{k.replace('_', ' ')}</div>
                    <div className="font-semibold text-[13px] text-primary">{Number(v) > 0 ? '+' : ''}{Number(v).toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ProbBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-subtle mb-1">
        <span>{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
        <motion.div
          className={clsx('h-full rounded-full', color)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </div>
  );
}
