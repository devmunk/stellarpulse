'use client';

import { shortAddress } from '@/lib/stellar';
import type { WalletState } from '@/types';

interface HeaderProps {
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function Header({ wallet, onConnect, onDisconnect }: HeaderProps) {
  const { publicKey, walletName, isConnecting } = wallet;

  return (
    <header className="relative z-10 w-full px-6 py-5">
      <div className="max-w-4xl mx-auto flex items-center justify-between">

        {/* ── Logo / Brand ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Animated pulse logo mark */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="relative w-9 h-9 rounded-full border border-cyan-500/50 bg-cosmos-800 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="3" fill="#06b6d4" />
                <circle cx="10" cy="10" r="6" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
                <circle cx="10" cy="10" r="9" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="1 3" opacity="0.3" />
              </svg>
            </div>
          </div>

          {/* Name + tagline */}
          <div>
            <h1 className="font-display text-xl font-bold text-white leading-none tracking-wide">
              Stellar<span className="text-cyan-400">Pulse</span>
            </h1>
            <p className="text-xs text-slate-400 font-body mt-0.5 tracking-widest uppercase">
              On-Chain Polling
            </p>
          </div>
        </div>

        {/* ── Wallet Connect ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {publicKey ? (
            /* Connected state */
            <div className="flex items-center gap-2">
              {/* Wallet info chip */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-cosmos-700/60 border border-cyan-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="font-mono text-xs text-slate-300">
                  {walletName && (
                    <span className="text-cyan-400 mr-1">{walletName}</span>
                  )}
                  {shortAddress(publicKey)}
                </span>
              </div>

              {/* Disconnect button */}
              <button
                onClick={onDisconnect}
                className="px-3 py-2 rounded-xl text-xs font-body font-medium text-slate-400 border border-slate-600/40 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
              >
                Disconnect
              </button>
            </div>
          ) : (
            /* Disconnected state */
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="btn-stellar flex items-center gap-2 text-sm"
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connecting…
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                  </svg>
                  Connect Wallet
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
    </header>
  );
}
