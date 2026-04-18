// ─────────────────────────────────────────────────────────────────────────────
//  StellarPulse — Shared TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────

// ── Wallet ────────────────────────────────────────────────────────────────────

export interface WalletState {
  /** Currently connected public key, or null if disconnected */
  publicKey: string | null;
  /** Human-readable wallet name (e.g. "Freighter") */
  walletName: string | null;
  /** Whether the wallet connection is being established */
  isConnecting: boolean;
}

// ── Poll ──────────────────────────────────────────────────────────────────────

export interface PollOption {
  /** Display label for this option (e.g. "Web3") */
  label: string;
  /** Number of votes this option has received */
  votes: number;
  /** Zero-based index in the contract */
  index: number;
}

export interface PollData {
  /** The poll question */
  question: string;
  /** Available voting options with current tallies */
  options: PollOption[];
  /** Whether the poll is currently accepting votes */
  isActive: boolean;
  /** Total votes cast across all options */
  totalVotes: number;
}

// ── Transaction ───────────────────────────────────────────────────────────────

/** All possible transaction states */
export type TxStatus =
  | 'idle'        // No transaction in progress
  | 'pending'     // Transaction submitted, waiting for confirmation
  | 'success'     // Transaction confirmed on-chain
  | 'error';      // Transaction failed or was rejected

export interface TxState {
  status: TxStatus;
  /** Human-readable message to display to the user */
  message: string;
  /** The Stellar transaction hash (when confirmed) */
  hash?: string;
  /** Error details if status === 'error' */
  error?: string;
}

// ── Error Types ───────────────────────────────────────────────────────────────

/** The three required error categories */
export type ErrorType =
  | 'WALLET_NOT_CONNECTED'
  | 'USER_REJECTED'
  | 'INSUFFICIENT_BALANCE'
  | 'ALREADY_VOTED'
  | 'POLL_INACTIVE'
  | 'CONTRACT_ERROR'
  | 'UNKNOWN';

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
}

// ── Contract ──────────────────────────────────────────────────────────────────

export interface ContractCallResult<T> {
  data?: T;
  error?: AppError;
}
