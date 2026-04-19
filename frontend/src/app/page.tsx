'use client';

import { useCallback } from 'react';
import StarField from '@/components/StarField';
import Header from '@/components/Header';
import PollCard from '@/components/PollCard';
import PollSkeleton from '@/components/PollSkeleton';
import ContractBanner from '@/components/ContractBanner';
import Toast from '@/components/Toast';
import { useWallet } from '@/hooks/useWallet';
import { usePoll } from '@/hooks/usePoll';

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID ?? '';
const IS_CONTRACT_CONFIGURED =
  !!CONTRACT_ID && CONTRACT_ID !== 'YOUR_CONTRACT_ID_HERE';

export default function HomePage() {
  // ── Wallet state ──────────────────────────────────────────────────────────
  const wallet = useWallet();

  // ── Poll state + voting ───────────────────────────────────────────────────
  const {
    poll,
    isLoading,
    hasVoted,
    txState,
    error,
    vote,
    clearTx,
  } = usePoll(wallet.publicKey);

  // Merge wallet error into display error (wallet errors take precedence)
  const displayError = wallet.error ?? error;

  // Clear both tx state and wallet errors together
  const handleDismiss = useCallback(() => {
    clearTx();
    wallet.clearError();
  }, [clearTx, wallet]);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Animated star field */}
      <StarField />

      {/* Deep space gradient background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6,182,212,0.12) 0%, transparent 60%), ' +
            'radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.08) 0%, transparent 50%), ' +
            'linear-gradient(180deg, #060a12 0%, #080c14 100%)',
        }}
      />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Header
        wallet={wallet}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
      />

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 pb-16 pt-6">
        <div className="w-full max-w-xl">

          {/* ── Hero subtitle ──────────────────────────────────────────────── */}
          <div className="text-center mb-8 animate-slide-up">
            <p className="font-body text-slate-400 text-sm tracking-wide">
              Cast your vote on-chain · Results update every 5 seconds
            </p>
          </div>

          {/* ── Main card area ─────────────────────────────────────────────── */}
          {!IS_CONTRACT_CONFIGURED ? (
            <ContractBanner />
          ) : isLoading ? (
            <PollSkeleton />
          ) : poll ? (
            <PollCard
              poll={poll}
              isLoading={isLoading}
              hasVoted={hasVoted}
              txState={txState}
              isConnected={!!wallet.publicKey}
              onVote={vote}
              onConnect={wallet.connect}
            />
          ) : (
            /* Error loading poll */
            <div className="glass-card p-8 text-center">
              <div className="text-3xl mb-3">⚠️</div>
              <h3 className="font-display text-lg font-bold text-red-400 mb-2">
                Failed to Load Poll
              </h3>
              <p className="font-body text-sm text-slate-400">
                {displayError?.message ?? 'Could not connect to the Stellar network. Please check your contract configuration and network settings.'}
              </p>
            </div>
          )}

          {/* ── Wallet info strip (mobile) ─────────────────────────────────── */}
          {wallet.publicKey && (
            <div className="mt-4 flex items-center justify-center gap-2 sm:hidden">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="font-mono text-xs text-slate-500">
                {wallet.walletName} · {wallet.publicKey.slice(0, 6)}…{wallet.publicKey.slice(-4)}
              </span>
            </div>
          )}

          {/* ── Feature badges strip ────────────────────────────────────────── */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {[
              { label: 'Stellar Soroban',  icon: '⚡' },
              { label: 'Multi-Wallet',     icon: '🔗' },
              { label: 'On-Chain Votes',   icon: '🗳️' },
              { label: 'Real-Time',        icon: '📡' },
            ].map(({ label, icon }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700/50 bg-slate-800/30 text-xs font-body text-slate-500"
              >
                <span>{icon}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 text-center pb-6">
        <p className="font-mono text-xs text-slate-700">
          Built on Stellar Testnet · Powered by Soroban Smart Contracts
        </p>
      </footer>

      {/* ── Toast notifications ──────────────────────────────────────────────── */}
      <Toast
        txState={txState}
        error={displayError}
        publicKey={wallet.publicKey}
        onDismiss={handleDismiss}
      />
    </div>
  );
}
