/**
 * useWallet — React hook for wallet connection state
 *
 * Provides:
 *   - connect()    — Open wallet modal and connect
 *   - disconnect() — Clear wallet state
 *   - publicKey    — Connected public key or null
 *   - walletName   — Name of the connected wallet
 *   - isConnecting — Loading state
 */

'use client';

import { useState, useCallback } from 'react';
import { connectWallet, disconnectWallet } from '@/lib/wallet';
import { classifyError } from '@/lib/stellar';
import type { WalletState, AppError } from '@/types';

interface UseWalletReturn extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  error: AppError | null;
  clearError: () => void;
}

export function useWallet(): UseWalletReturn {
  const [state, setState] = useState<WalletState>({
    publicKey: null,
    walletName: null,
    isConnecting: false,
  });
  const [error, setError] = useState<AppError | null>(null);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, isConnecting: true }));
    setError(null);
    try {
      const wallet = await connectWallet();
      setState({
        publicKey: wallet.publicKey,
        walletName: wallet.walletName,
        isConnecting: false,
      });
    } catch (err) {
      const appErr = classifyError(err);
      // Don't surface "user cancelled" as an error — it's intentional
      if (appErr.type !== 'USER_REJECTED') {
        setError(appErr);
      }
      setState((s) => ({ ...s, isConnecting: false }));
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectWallet();
    setState({ publicKey: null, walletName: null, isConnecting: false });
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { ...state, connect, disconnect, error, clearError };
}
