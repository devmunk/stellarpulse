/**
 * StellarPulse — Contract Interaction Utilities
 *
 * Handles all communication with the Soroban voting contract:
 *   - Fetching poll data (question, options, vote counts)
 *   - Submitting votes
 *   - Checking whether an address has voted
 *
 * Uses @stellar/stellar-sdk for contract invocation and transaction building.
 */

import {
  Contract,
  Networks,
  rpc as StellarRpc,
  Transaction,
  TransactionBuilder,
  BASE_FEE,
  xdr,
  Address,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';
import type { PollData, PollOption, AppError } from '@/types';

// ── Config ────────────────────────────────────────────────────────────────────

const RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org';

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID ?? '';

const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? Networks.TESTNET;

/** Soroban RPC server client */
export const server = new StellarRpc.Server(RPC_URL, { allowHttp: false });

// ── Error Helpers ─────────────────────────────────────────────────────────────

/**
 * Classifies a raw error into one of our AppError types.
 * Handles the 3 required error categories:
 *   1. Wallet not connected
 *   2. User rejects transaction
 *   3. Insufficient balance
 */
export function classifyError(err: unknown): AppError {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (lower.includes('wallet') && lower.includes('connect')) {
    return { type: 'WALLET_NOT_CONNECTED', message: 'Please connect your wallet first.', originalError: err };
  }

  // User rejection patterns (Freighter, Albedo, xBull all use different strings)
  if (
    lower.includes('user declined') ||
    lower.includes('user rejected') ||
    lower.includes('transaction rejected') ||
    lower.includes('denied') ||
    lower.includes('cancel') ||
    lower.includes('abort')
  ) {
    return { type: 'USER_REJECTED', message: 'Transaction was rejected in your wallet.', originalError: err };
  }

  if (
    lower.includes('insufficient') ||
    lower.includes('balance') ||
    lower.includes('underfunded')
  ) {
    return { type: 'INSUFFICIENT_BALANCE', message: 'Insufficient XLM balance. Please fund your account via Friendbot.', originalError: err };
  }

  if (lower.includes('already voted') || lower.includes('has already voted')) {
    return { type: 'ALREADY_VOTED', message: 'You have already voted in this poll.', originalError: err };
  }

  if (lower.includes('poll is not active')) {
    return { type: 'POLL_INACTIVE', message: 'The poll is no longer accepting votes.', originalError: err };
  }

  return { type: 'UNKNOWN', message: msg || 'An unexpected error occurred.', originalError: err };
}

// ── Read-only Helpers ─────────────────────────────────────────────────────────

/**
 * Simulate a read-only contract call and return the decoded result.
 */
// async function simulateReadOnly<T>(
//   methodName: string,
//   args: xdr.ScVal[] = [],
// ): Promise<T> {
//   if (!CONTRACT_ID || CONTRACT_ID === 'YOUR_CONTRACT_ID_HERE') {
//     throw new Error('Contract ID not configured. Set NEXT_PUBLIC_CONTRACT_ID in .env.local');
//   }

//   const contract = new Contract(CONTRACT_ID);

//   // Use a dummy source account for simulation (no auth needed for reads)
//   const dummySource = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN';

//   const account = await server.getAccount(dummySource).catch(() => ({
//     accountId: () => dummySource,
//     sequenceNumber: () => '0',
//     incrementSequenceNumber: () => {},
//   } as any));

//   const tx = new TransactionBuilder(account, {
//     fee: BASE_FEE,
//     networkPassphrase: NETWORK_PASSPHRASE,
//   })
//     .addOperation(contract.call(methodName, ...args))
//     .setTimeout(30)
//     .build();

//   const sim = await server.simulateTransaction(tx);

//   if (StellarRpc.Api.isSimulationError(sim)) {
//     throw new Error(`Simulation error: ${sim.error}`);
//   }

//   if (!sim.result) {
//     throw new Error('No result from simulation');
//   }

//   return scValToNative(sim.result.retval);
// }

async function simulateReadOnly<T>(methodName: string, args: any[] = []): Promise<T> {
  const contract = new Contract(CONTRACT_ID);

  const tx = new TransactionBuilder(
    await server.getAccount("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"),
    {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    }
  )
    .addOperation(contract.call(methodName, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);

  if ("error" in sim) {
    throw new Error(sim.error);
  }

  // ✅ THIS IS THE IMPORTANT LINE
  return scValToNative(sim.result.retval) as T;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetches the full poll state from the contract:
 *   - question
 *   - options with vote counts
 *   - active status
 *   - total vote count
 */
// export async function fetchPollData(): Promise<PollData> {
//   const question = await simulateReadOnly<string>('get_question');

//   const optionLabels = await simulateReadOnly<string[]>('get_options');

//   const rawResults = await simulateReadOnly<any>('get_results');

//   const voteCounts = new Map<number, number>();

//   if (rawResults && typeof rawResults === "object") {
//     for (const [key, value] of Object.entries(rawResults)) {
//       voteCounts.set(Number(key), Number(value));
//     }
//   }

//   const isActive = await simulateReadOnly<boolean>('is_active');

//   const options: PollOption[] = optionLabels.map((label, index) => ({
//     label,
//     votes: voteCounts.get(index) ?? 0,
//     index,
//   }));

//   const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

//   return { question, options, isActive, totalVotes };
// }
export async function fetchPollData(): Promise<PollData> {
  const question = await simulateReadOnly<string>('get_question');

  const optionLabels = await simulateReadOnly<string[]>('get_options');

  const rawResults = await simulateReadOnly<Map<number, bigint>>('get_results');

  const isActive = await simulateReadOnly<boolean>('is_active');

  const options: PollOption[] = optionLabels.map((label, index) => ({
    label,
    votes: Number(
      rawResults instanceof Map
        ? rawResults.get(index) ?? 0n
        : rawResults?.[index] ?? 0
    ),
    index,
  }));

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  return { question, options, isActive, totalVotes };
}

/**
 * Checks whether the given Stellar address has already voted.
 */
export async function checkHasVoted(publicKey: string): Promise<boolean> {
  try {
    const addrVal = new Address(publicKey).toScVal();
    return await simulateReadOnly<boolean>('has_voted', [addrVal]);
  } catch {
    return false;
  }
}

/**
 * Builds an unsigned vote transaction ready for wallet signing.
 *
 * @param voterPublicKey  - The voter's Stellar public key
 * @param optionIndex     - Zero-based index of the chosen option
 * @returns               - An unsigned Transaction object
 */
export async function buildVoteTransaction(
  voterPublicKey: string,
  optionIndex: number,
): Promise<Transaction> {
  const contract = new Contract(CONTRACT_ID);



  const account = await server.getAccount(voterPublicKey);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(
  'vote',
  new Address(voterPublicKey).toScVal(),
  nativeToScVal(optionIndex, { type: "u32" })
))
    .setTimeout(30)
    .build();

  // Simulate to get the authorization footprint
  const sim = await server.simulateTransaction(tx);

  if (StellarRpc.Api.isSimulationError(sim)) {
    const errStr = sim.error?.toLowerCase() ?? '';
    if (errStr.includes('already voted')) throw new Error('Address has already voted');
    if (errStr.includes('not active'))   throw new Error('Poll is not active');
    throw new Error(`Simulation failed: ${sim.error}`);
  }

  // Assemble the transaction with auth footprint filled in
  const assembled = StellarRpc.assembleTransaction(tx, sim);
  return assembled.build();
}

/**
 * Submits a signed transaction XDR to the network and waits for confirmation.
 *
 * @param signedXDR - Base64-encoded signed transaction envelope XDR
 * @returns         - The transaction hash on success
 */
export async function submitTransaction(signedXDR: string): Promise<string> {
  const tx = TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE);
  const sendResult = await server.sendTransaction(tx);

  if (sendResult.status === 'ERROR') {
    const errText = JSON.stringify(sendResult.errorResult ?? 'Unknown error');
    if (errText.toLowerCase().includes('balance')) throw new Error('Insufficient XLM balance to submit transaction');
    throw new Error(`Transaction submission failed: ${errText}`);
  }

  // Poll until transaction is confirmed or times out
  const hash = sendResult.hash;
  const deadline = Date.now() + 30_000; // 30 second timeout

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 1500));
    const result = await server.getTransaction(hash);

    if (result.status === 'SUCCESS') return hash;
    if (result.status === 'FAILED')  throw new Error('Transaction failed on-chain');
    // status === 'NOT_FOUND' means still pending — keep polling
  }

  throw new Error('Transaction confirmation timed out after 30 seconds');
}

/**
 * Convenience: format a public key as a short display string.
 * e.g. "GAAZI...CCWN"
 */
export function shortAddress(pubkey: string): string {
  if (pubkey.length < 12) return pubkey;
  return `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`;
}

/**
 * Returns the Stellar Expert explorer URL for a transaction.
 */
export function explorerTxUrl(hash: string, network = 'testnet'): string {
  return `https://stellar.expert/explorer/${network}/tx/${hash}`;
}

/**
 * Returns the Stellar Expert explorer URL for a contract.
 */
export function explorerContractUrl(network = 'testnet'): string {
  return `https://stellar.expert/explorer/${network}/contract/${CONTRACT_ID}`;
}
