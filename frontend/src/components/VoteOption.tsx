'use client';

import type { PollOption } from '@/types';

interface VoteOptionProps {
  option: PollOption;
  totalVotes: number;
  hasVoted: boolean;
  isVoting: boolean;
  isWinner: boolean;
  onVote: (index: number) => void;
}

// Color schemes for each option
const OPTION_COLORS = [
  {
    accent:      'text-cyan-400',
    border:      'hover:border-cyan-400/60',
    selectedBg:  'bg-cyan-500/10',
    selectedBorder: 'border-cyan-500',
    bar:         'bg-gradient-to-r from-cyan-500 to-cyan-400',
    barGlow:     'shadow-[0_0_12px_rgba(6,182,212,0.5)]',
    badge:       'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    icon:        '⚡',
  },
  {
    accent:      'text-violet-400',
    border:      'hover:border-violet-400/60',
    selectedBg:  'bg-violet-500/10',
    selectedBorder: 'border-violet-500',
    bar:         'bg-gradient-to-r from-violet-500 to-violet-400',
    barGlow:     'shadow-[0_0_12px_rgba(139,92,246,0.5)]',
    badge:       'bg-violet-500/20 text-violet-300 border-violet-500/30',
    icon:        '🤖',
  },
  {
    accent:      'text-emerald-400',
    border:      'hover:border-emerald-400/60',
    selectedBg:  'bg-emerald-500/10',
    selectedBorder: 'border-emerald-500',
    bar:         'bg-gradient-to-r from-emerald-500 to-emerald-400',
    barGlow:     'shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    badge:       'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon:        '🌿',
  },
  {
    accent:      'text-rose-400',
    border:      'hover:border-rose-400/60',
    selectedBg:  'bg-rose-500/10',
    selectedBorder: 'border-rose-500',
    bar:         'bg-gradient-to-r from-rose-500 to-rose-400',
    barGlow:     'shadow-[0_0_12px_rgba(244,63,94,0.5)]',
    badge:       'bg-rose-500/20 text-rose-300 border-rose-500/30',
    icon:        '🔥',
  },
];

export default function VoteOption({
  option,
  totalVotes,
  hasVoted,
  isVoting,
  isWinner,
  onVote,
}: VoteOptionProps) {
  const colors = OPTION_COLORS[option.index % OPTION_COLORS.length];

const pct =
  totalVotes > 0
    ? (option.votes * 100) / totalVotes
    : 0;

  const canVote = !hasVoted && !isVoting;

  return (
    <button
      onClick={() => canVote && onVote(option.index)}
      disabled={!canVote}
      className={`
        btn-vote group
        ${!hasVoted && !isVoting ? colors.border : ''}
        ${isWinner && hasVoted ? `${colors.selectedBorder} ${colors.selectedBg}` : ''}
      `}
      aria-label={`Vote for ${option.label}`}
    >
      {/* ── Top row: label + vote count ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Emoji icon */}
          <span className="text-xl" role="img" aria-label={option.label}>
            {colors.icon}
          </span>

          {/* Option label */}
          <span className={`font-body font-semibold text-base text-white group-hover:${colors.accent} transition-colors`}>
            {option.label}
          </span>

          {/* Winner badge */}
          {isWinner && hasVoted && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-mono font-medium ${colors.badge}`}>
              Leading
            </span>
          )}
        </div>

        {/* Vote count + percentage */}
        <div className="text-right">
          <span className={`font-mono text-sm font-bold ${colors.accent}`}>
            {pct.toFixed(1)}%
          </span>
          <div className="text-xs text-slate-500 font-mono">
            {option.votes.toString()} votes
          </div>
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────── */}
      <div className="relative h-2 w-full rounded-full bg-slate-800/80 overflow-hidden">
        <div
          className={`
            absolute inset-y-0 left-0 rounded-full transition-all duration-700
            ${colors.bar}
            ${isWinner ? colors.barGlow : ''}
          `}
          style={{ width: `${pct}%` }}
        />
        {/* Shimmer effect on the bar */}
        {pct > 5 && (
          <div
            className="absolute inset-y-0 left-0 rounded-full opacity-40"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s linear infinite',
            }}
          />
        )}
      </div>

      {/* ── Vote CTA (shown only when user hasn't voted) ─────────────── */}
      {!hasVoted && !isVoting && (
        <div className={`mt-2 text-xs font-body ${colors.accent} opacity-0 group-hover:opacity-100 transition-opacity`}>
          Click to vote →
        </div>
      )}

      {/* ── Voting spinner overlay ───────────────────────────────────── */}
      {isVoting && (
        <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-cosmos-900/60 backdrop-blur-sm">
          <svg className="animate-spin w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}
    </button>
  );
}
