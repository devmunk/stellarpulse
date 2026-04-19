/**
 * StellarPulse — StellarWalletsKit Integration
 *
 * Wraps @stellar/stellar-wallets-kit to provide:
 *   - Singleton kit instance
 *   - Wallet connection helpers
 *   - Transaction signing
 *   - Support for Freighter, Albedo, xBull, and more
 */

// import type { ISupportedWallet } from '@creit.tech/stellar-wallets-kit';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ConnectedWallet {
  publicKey: string;
  walletId: string;
  walletName: string;
}

// ── Lazy-loaded kit singleton ─────────────────────────────────────────────────
// StellarWalletsKit is browser-only; we import it lazily to avoid SSR issues.

let _kitPromise: Promise<any> | null = null;

async function getKit() {
  if (!_kitPromise) {
    _kitPromise = (async () => {
      const {
        StellarWalletsKit,
        WalletNetwork,
        XBULL_ID,
        FreighterModule,
        AlbedoModule,
        xBullModule,
      } = await import('@creit.tech/stellar-wallets-kit');

      const networkEnv = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet';
      const network =
        networkEnv === 'mainnet'
          ? WalletNetwork.PUBLIC
          : WalletNetwork.TESTNET;

      const kit = new StellarWalletsKit({
        network,
        selectedWalletId: XBULL_ID,
        modules: [
          new FreighterModule(),
          new AlbedoModule(),
          new xBullModule(),
        ],
      });

      return { kit, XBULL_ID };
    })();
  }
  return _kitPromise;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Opens the wallet selection modal and resolves with the connected wallet info.
 * Rejects with a user-friendly error if the user cancels.
 */
export async function connectWallet(): Promise<ConnectedWallet> {
  const { kit } = await getKit();

  return new Promise((resolve, reject) => {
    kit.openModal({
      onWalletSelected: async (option: any) => {
        try {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();

          if (!address) {
            reject(new Error('Wallet connected but no address returned.'));
            return;
          }

          resolve({
            publicKey: address,
            walletId: option.id,
            walletName: option.name,
          });
        } catch (err) {
          reject(err);
        }
      },
      onClosed: () => {
        reject(new Error('User cancelled wallet selection'));
      },
    });
  });
}

/**
 * Signs a transaction XDR with the currently selected wallet.
 *
 * @param txXDR    - Base64-encoded unsigned transaction XDR
 * @param publicKey - The signer's public key
 * @returns         - Base64-encoded signed transaction XDR
 */
export async function signTransaction(
  txXDR: string,
  publicKey: string,
): Promise<string> {
  const { kit } = await getKit();

  const networkPassphrase =
    process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? 'Test SDF Network ; September 2015';

  const { signedTxXdr } = await kit.signTransaction(txXDR, {
    address: publicKey,
    networkPassphrase,
  });

  return signedTxXdr;
}

/**
 * Returns available wallet modules for display in the UI.
 */
export async function getAvailableWallets(): Promise<any[]> {
  const { kit } = await getKit();
  return kit.getSupportedWallets();
}

/**
 * Disconnects the current wallet (clears local state).
 */
export async function disconnectWallet(): Promise<void> {
  // StellarWalletsKit doesn't maintain server-side sessions;
  // disconnection is handled purely on the client by clearing state.
  // This function exists for clarity in calling code.
}
