'use client';

import { useEffect } from 'react';
import { explorerTxUrl } from '@/lib/stellar';
import type { TxState, AppError } from '@/types';

interface ToastProps {
  txState: TxState;
  error: AppError | null;
  onDismiss: () => void;
}

export default function Toast({ txState, error, onDismiss }: ToastProps) {
  const isVisible =
    txState.status !== 'idle' || error !== null;

  // Auto-dismiss success after 6 seconds
  useEffect(() => {
    if (txState.status === 'success') {
      const t = setTimeout(onDismiss, 6000);
      return () => clearTimeout(t);
    }
  }, [txState.status, onDismiss]);

  if (!isVisible) return null;

  // Derive display content
  let icon: React.ReactNode;
  let borderColor: string;
  let bgColor: string;
  let title: string;
  let body: string;

  if (txState.status === 'pending') {
    icon        = <Spinner />;
    borderColor = 'border-cyan-500/40';
    bgColor     = 'bg-cyan-500/8';
    title       = 'Transaction Pending';
    body        = txState.message;
  } else if (txState.status === 'success') {
    icon        = <CheckIcon />;
    borderColor = 'border-emerald-500/40';
    bgColor     = 'bg-emerald-500/8';
    title       = 'Vote Confirmed! 🎉';
    body        = txState.message;
  } else if (txState.status === 'error' || error) {
    icon        = <ErrorIcon />;
    borderColor = 'border-red-500/40';
    bgColor     = 'bg-red-500/8';
    title       = errorTitle(error?.type);
    body        = error?.message ?? txState.message;
  } else {
    return null;
  }

  return (
    <div className="fixed top-6 right-6 z-50 w-full max-w-sm toast-enter">
      <div
        className={`
          glass-card ${bgColor} border ${borderColor}
          p-4 flex items-start gap-3 shadow-2xl
        `}
      >
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">{icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-sm text-white">{title}</p>
          <p className="font-body text-xs text-slate-400 mt-0.5 leading-relaxed">{body}</p>

          {/* Explorer link on success */}
          {txState.status === 'success' && txState.hash && (
            <a
              href={explorerTxUrl(txState.hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View on Stellar Explorer
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          {/* Help text for specific errors */}
          {error?.type === 'INSUFFICIENT_BALANCE' && (
            <a
              href="https://friendbot.stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              Fund with Friendbot (testnet)
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        {/* Dismiss button */}
        {txState.status !== 'pending' && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
            aria-label="Dismiss notification"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

function ErrorIcon() {
  return (
    <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );
}

function errorTitle(type?: string): string {
  switch (type) {
    case 'WALLET_NOT_CONNECTED': return 'Wallet Not Connected';
    case 'USER_REJECTED':        return 'Transaction Rejected';
    case 'INSUFFICIENT_BALANCE': return 'Insufficient Balance';
    case 'ALREADY_VOTED':        return 'Already Voted';
    case 'POLL_INACTIVE':        return 'Poll Closed';
    default:                     return 'Transaction Failed';
  }
}
