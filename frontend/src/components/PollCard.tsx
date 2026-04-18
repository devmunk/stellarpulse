'use client';

import VoteOption from './VoteOption';
import ResultsChart from './ResultsChart';
import LiveIndicator from './LiveIndicator';
import { explorerContractUrl } from '@/lib/stellar';
import type { PollData, TxState } from '@/types';

interface PollCardProps {
  poll: PollData;
  isLoading: boolean;
  hasVoted: boolean;
  txState: TxState;
  isConnected: boolean;
  onVote: (index: number) => void;
  onConnect: () => void;
}

export default function PollCard({
  poll,
  isLoading,
  hasVoted,
  txState,
  isConnected,
  onVote,
  onConnect,
}: PollCardProps) {
  const isVoting = txState.status === 'pending';

  const winnerIndex =
    poll.totalVotes > 0n
      ? poll.options.reduce((best, opt) =>
          opt.votes > poll.options[best].votes ? opt.index : best,
          0,
        )
      : -1;

  return (
    <div className="glass-card p-6 sm:p-8 animate-fade-in">
      {/* ── Card Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          {/* Active badge */}
          {poll.isActive ? (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-mono font-medium tracking-wide">
                POLL ACTIVE
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-500 border border-slate-600/30 font-mono font-medium tracking-wide">
                POLL CLOSED
              </span>
            </div>
          )}

          {/* Question */}
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-snug">
            {poll.question}
          </h2>
        </div>

        {/* Live indicator */}
        <div className="flex-shrink-0 ml-4 mt-1">
          <LiveIndicator />
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent mb-6" />

      {/* ── Voting Section ──────────────────────────────────────────── */}
      {!hasVoted && poll.isActive ? (
        <div className="space-y-3 mb-6">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
            {isConnected ? 'Cast your vote' : 'Connect wallet to vote'}
          </p>

          {poll.options.map((option) => (
            <VoteOption
              key={option.index}
              option={option}
              totalVotes={poll.totalVotes}
              hasVoted={hasVoted}
              isVoting={isVoting}
              isWinner={option.index === winnerIndex}
              onVote={isConnected ? onVote : () => onConnect()}
            />
          ))}

          {/* Wallet CTA if not connected */}
          {!isConnected && (
            <div className="mt-4 p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 flex items-center gap-3">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#06b6d4" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-body text-slate-300">
                  Connect your wallet to cast a vote on-chain.
                </p>
              </div>
              <button onClick={onConnect} className="btn-stellar text-xs px-4 py-2 flex-shrink-0">
                Connect
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ── Already voted / poll closed view ───────────────────────── */
        <div className="mb-6">
          {hasVoted && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-body text-emerald-400 font-medium">
                Your vote has been recorded on-chain.
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Results Chart ────────────────────────────────────────────── */}
      <div className="mt-2">
        <ResultsChart options={poll.options} totalVotes={poll.totalVotes} />
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-mono text-lg font-bold text-white">
              {poll.totalVotes.toString()}
            </div>
            <div className="text-xs text-slate-600 font-body">Total Votes</div>
          </div>
          <div className="w-px h-8 bg-slate-700/60" />
          <div className="text-center">
            <div className="font-mono text-lg font-bold text-white">
              {poll.options.length}
            </div>
            <div className="text-xs text-slate-600 font-body">Options</div>
          </div>
        </div>

        {/* Contract explorer link */}
        <a
          href={explorerContractUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors font-mono"
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Contract
        </a>
      </div>
    </div>
  );
}
