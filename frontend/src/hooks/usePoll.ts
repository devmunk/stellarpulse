/**
 * usePoll — React hook for poll data with real-time updates
 *
 * Fetches poll data from the Soroban contract and re-fetches
 * on a configurable interval to keep results fresh.
 *
 * Also exposes:
 *   - vote(optionIndex) — submit a vote via the connected wallet
 *   - hasVoted          — whether the current wallet has voted
 *   - txState           — current transaction status
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchPollData,
  checkHasVoted,
  buildVoteTransaction,
  submitTransaction,
  classifyError,
} from '@/lib/stellar';
import { signTransaction } from '@/lib/wallet';
import type { PollData, TxState, AppError } from '@/types';

const POLL_INTERVAL_MS =
  Number(process.env.NEXT_PUBLIC_POLL_INTERVAL_MS) || 5000;

interface UsePollReturn {
  poll: PollData | null;
  isLoading: boolean;
  hasVoted: boolean;
  txState: TxState;
  error: AppError | null;
  vote: (optionIndex: number) => Promise<void>;
  refresh: () => Promise<void>;
  clearTx: () => void;
}

export function usePoll(publicKey: string | null): UsePollReturn {
  const [poll, setPoll]           = useState<PollData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVoted, setHasVoted]   = useState(false);
  const [txState, setTxState]     = useState<TxState>({ status: 'idle', message: '' });
  const [error, setError]         = useState<AppError | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Data Fetching ─────────────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    try {
      const data = await fetchPollData();
      setPoll(data);
      setError(null);
    } catch (err) {
      setError(classifyError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch has-voted status whenever the public key changes
  useEffect(() => {
    if (!publicKey) {
      setHasVoted(false);
      return;
    }
    checkHasVoted(publicKey).then(setHasVoted).catch(() => setHasVoted(false));
  }, [publicKey]);

  // Initial fetch + real-time polling interval
  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  // ── Voting ────────────────────────────────────────────────────────────────
  
  const vote = useCallback(async (optionIndex: number) => {
    let txSuccess = false;
    // Error 1: wallet not connected
    if (!publicKey) {
      setError({ type: 'WALLET_NOT_CONNECTED', message: 'Please connect your wallet before voting.' });
      return;
    }

    setTxState({ status: 'pending', message: 'Building transaction…' });
    setError(null);

    try {
      // Step 1: Build unsigned transaction
      setTxState({ status: 'pending', message: 'Preparing your vote transaction…' });
      const unsignedTx = await buildVoteTransaction(publicKey, optionIndex);

      // Step 2: Ask wallet to sign — Error 2 (user rejection) handled here
      setTxState({ status: 'pending', message: 'Waiting for wallet signature…' });
      const signedXDR = await signTransaction(unsignedTx.toXDR(), publicKey);

      // Step 3: Submit to network — Error 3 (insufficient balance) handled here
      setTxState({ status: 'pending', message: 'Submitting transaction to Stellar…' });
      const hash = await submitTransaction(signedXDR);
      txSuccess = true;

      setTxState({
        status: 'success',
        message: 'Vote recorded on-chain! 🎉',
        hash,
      });
      setHasVoted(true);

      // Refresh results immediately after voting
      await refresh();

    } catch (err: any) {
  if (txSuccess) {
    console.warn("Ignoring error after success:", err);
    return;
  }

  const msg = err?.message || "";

  if (
    msg.toLowerCase().includes("bad union switch") ||
    msg.toLowerCase().includes("invalidaction")
  ) {
    console.warn("Ignoring known Soroban parsing error:", err);
    return;
  }

  const appErr = classifyError(err);
  setError(appErr);
  setTxState({
    status: 'error',
    message: appErr.message,
    error: appErr.message,
  });
}
  }, [publicKey, refresh]);

  const clearTx = useCallback(() => {
    setTxState({ status: 'idle', message: '' });
    setError(null);
  }, []);

  return { poll, isLoading, hasVoted, txState, error, vote, refresh, clearTx };
}
