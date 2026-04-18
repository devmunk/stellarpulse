import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// ── Fonts ─────────────────────────────────────────────────────────────────────

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'StellarPulse — Real-time On-Chain Polling',
  description: 'Vote on live polls powered by Stellar Soroban smart contracts. Results update in real-time across all participants.',
  keywords: ['Stellar', 'Soroban', 'blockchain', 'polling', 'Web3', 'dApp'],
  openGraph: {
    title: 'StellarPulse',
    description: 'Real-time on-chain polling powered by Stellar',
    type: 'website',
  },
};

// ── Layout ────────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
