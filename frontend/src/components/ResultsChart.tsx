'use client';

import type { PollOption } from '@/types';

interface ResultsChartProps {
  options: PollOption[];
  totalVotes: number;
}

const BAR_COLORS = [
  { fill: 'from-cyan-500 to-cyan-300',     glow: 'rgba(6,182,212,0.4)',   text: 'text-cyan-400'   },
  { fill: 'from-violet-500 to-violet-300', glow: 'rgba(139,92,246,0.4)',  text: 'text-violet-400' },
  { fill: 'from-emerald-500 to-emerald-300', glow: 'rgba(16,185,129,0.4)', text: 'text-emerald-400' },
  { fill: 'from-rose-500 to-rose-300',     glow: 'rgba(244,63,94,0.4)',   text: 'text-rose-400'   },
];

export default function ResultsChart({ options, totalVotes }: ResultsChartProps) {
  const maxVotes = options.reduce(
  (m, o) => (o.votes > m ? o.votes : m),
  0,
);


  return (
    <div className="space-y-3">
      {/* Chart header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          Live Results
        </span>
        <span className="text-xs font-mono text-slate-500">
          {totalVotes.toString()} total votes
        </span>
      </div>

      {/* Bars */}
      {options.map((option, idx) => {
        const colors = BAR_COLORS[idx % BAR_COLORS.length];
        const pct =
        totalVotes > 0
    ? (option.votes * 100) / totalVotes
    : 0;

const isLeading = option.votes === maxVotes && maxVotes > 0;

        return (
          <div key={option.index} className="flex items-center gap-3">
            {/* Option label */}
            <div className="w-16 flex-shrink-0">
              <span className={`font-body text-sm font-semibold ${colors.text}`}>
                {option.label}
              </span>
            </div>

            {/* Bar track */}
            <div className="flex-1 h-7 relative rounded-lg bg-slate-800/60 overflow-hidden border border-slate-700/40">
              {/* Fill bar */}
              <div
                className={`absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r ${colors.fill} transition-all duration-700`}
                style={{
                  width: `${pct}%`,
                  boxShadow: pct > 0 ? `0 0 12px ${colors.glow}` : 'none',
                }}
              />

              {/* Percentage label inside bar */}
              <div className="absolute inset-0 flex items-center px-2.5">
                <span className="font-mono text-xs font-bold text-white/90 relative z-10">
                  {pct.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Vote count + leading badge */}
            <div className="w-20 flex-shrink-0 text-right flex items-center justify-end gap-1.5">
              <span className="font-mono text-xs text-slate-400">
                {option.votes.toString()}
              </span>
              {isLeading && totalVotes > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  #1
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {totalVotes === 0 && (
        <p className="text-center text-xs text-slate-600 font-body py-2">
          No votes yet — be the first!
        </p>
      )}
    </div>
  );
}
