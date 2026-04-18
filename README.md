# 🌟 StellarPulse

> **Real-time on-chain polling powered by Stellar Soroban**

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue?logo=stellar)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-blueviolet)](https://soroban.stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)

StellarPulse is a decentralized polling dApp where users vote on live questions and results update in real time across all participants. Every vote is recorded immutably on the Stellar blockchain via a Soroban smart contract.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔗 **Multi-Wallet Support** | Freighter, Albedo, xBull via StellarWalletsKit |
| ⛓️ **On-Chain Voting** | Every vote stored on Stellar Testnet via Soroban |
| 🚫 **Double-Vote Prevention** | Contract enforces 1 vote per wallet address |
| 📡 **Real-Time Results** | Auto-refreshes every 5 seconds |
| ✅ **Transaction Tracking** | Pending / Success / Failed states with toasts |
| 🛡️ **Error Handling** | Wallet not connected · User rejected · Insufficient balance |
| 🎨 **Cosmic Dark UI** | Animated star field, glass morphism, live result bars |

---

## 📁 Project Structure

```
stellarpulse/
├── contract/                    # Soroban smart contract (Rust)
│   ├── src/
│   │   └── lib.rs               # Contract: vote(), get_results(), has_voted()
│   ├── Cargo.toml
│   └── deploy.sh                # Automated testnet deployment script
│
└── frontend/                    # Next.js 14 App Router (TypeScript)
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx        # Root layout with fonts
    │   │   ├── page.tsx          # Main page
    │   │   └── globals.css       # Tailwind + custom CSS
    │   ├── components/
    │   │   ├── Header.tsx        # Top bar with wallet connect button
    │   │   ├── PollCard.tsx      # Poll question + voting UI
    │   │   ├── VoteOption.tsx    # Individual option button with progress bar
    │   │   ├── ResultsChart.tsx  # Animated bar chart results
    │   │   ├── LiveIndicator.tsx # Real-time pulse dot
    │   │   ├── Toast.tsx         # Transaction status notifications
    │   │   ├── StarField.tsx     # Animated canvas background
    │   │   ├── PollSkeleton.tsx  # Loading skeleton
    │   │   └── ContractBanner.tsx# Setup prompt when contract not configured
    │   ├── hooks/
    │   │   ├── useWallet.ts      # Wallet connection state management
    │   │   └── usePoll.ts        # Poll data + voting + real-time polling
    │   ├── lib/
    │   │   ├── stellar.ts        # Contract interaction utilities
    │   │   └── wallet.ts         # StellarWalletsKit integration
    │   └── types/
    │       └── index.ts          # Shared TypeScript interfaces
    ├── .env.local.example
    ├── next.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| npm / yarn | latest | included with Node |
| Rust | stable | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Soroban CLI | 20+ | `cargo install --locked soroban-cli` |
| Freighter Wallet | latest | [freighter.app](https://freighter.app) (browser extension) |

---

## 📦 Step 1 — Clone & Install

```bash
# Clone the repo
git clone https://github.com/your-username/stellarpulse.git
cd stellarpulse

# Install frontend dependencies
cd frontend
npm install
```

---

## ⛓️ Step 2 — Deploy the Smart Contract

### 2a. Add the Wasm target

```bash
rustup target add wasm32-unknown-unknown
```

### 2b. Run the automated deployment script

```bash
cd contract
chmod +x deploy.sh
./deploy.sh
```

The script will:
1. Build and optimize the Wasm binary
2. Configure the Stellar testnet network
3. Generate a deployer keypair
4. Fund it via Friendbot (free testnet XLM)
5. Deploy the contract
6. Initialize the poll with the default question
7. Output your **Contract ID**

> 💡 If you prefer manual steps, see [Manual Deployment](#manual-deployment) below.

### 2c. Save your Contract ID

After deployment you'll see:

```
Contract ID: CABC...XYZ
```

Copy it for the next step.

---

## 🖥️ Step 3 — Configure Frontend

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# Paste your Contract ID here ↓
NEXT_PUBLIC_CONTRACT_ID=CABC...XYZ

NEXT_PUBLIC_POLL_INTERVAL_MS=5000
```

---

## ▶️ Step 4 — Run the Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔗 Wallet Connection Guide

### Option A: Freighter (Recommended)

1. Install the [Freighter browser extension](https://freighter.app)
2. Create or import a wallet
3. Switch network to **Testnet** (Settings → Network → Testnet)
4. Click **Connect Wallet** in StellarPulse → select Freighter
5. Fund your testnet account via [Friendbot](https://friendbot.stellar.org)

### Option B: Albedo

1. No installation needed — Albedo is web-based
2. Click **Connect Wallet** in StellarPulse → select Albedo
3. Approve the connection in the Albedo popup

### Option C: xBull

1. Install [xBull Wallet](https://xbull.app)
2. Set network to Testnet
3. Connect from StellarPulse wallet modal

---

## 🗳️ How Voting Works

1. **Connect** your Stellar wallet
2. **Choose** an option (Web3 or AI)
3. StellarPulse **builds** a Soroban transaction calling `vote(voter, option_index)`
4. Your **wallet signs** the transaction
5. The transaction is **submitted** to Stellar testnet
6. The contract **records** your vote and **prevents** double-voting
7. Results **update automatically** within 5 seconds

---

## 🛠️ Manual Deployment

If you prefer to deploy manually without the script:

```bash
cd contract

# 1. Build
cargo build --target wasm32-unknown-unknown --release

# 2. Optimize
soroban contract optimize \
  --wasm target/wasm32-unknown-unknown/release/stellar_pulse_contract.wasm

# 3. Generate account
soroban keys generate --global deployer --network testnet

# 4. Fund via Friendbot
curl "https://friendbot.stellar.org?addr=$(soroban keys address deployer)"

# 5. Deploy
CONTRACT_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellar_pulse_contract.optimized.wasm \
  --source deployer \
  --network testnet)

# 6. Initialize
soroban contract invoke \
  --id $CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- initialize \
  --question "Which technology excites you more?" \
  --options '["Web3","AI"]'

echo "Contract ID: $CONTRACT_ID"
```

---

## 🧪 Running Contract Tests

```bash
cd contract
cargo test
```

Tests cover:
- Poll initialization
- Successful voting
- Double-vote prevention
- Multiple voters

---

## 📡 Contract Functions

| Function | Type | Description |
|----------|------|-------------|
| `initialize(question, options)` | Write | Sets up the poll (once) |
| `vote(voter, option_index)` | Write | Casts a vote (requires auth) |
| `get_question()` | Read | Returns poll question |
| `get_options()` | Read | Returns option labels |
| `get_results()` | Read | Returns `Map<u32, u64>` vote counts |
| `has_voted(voter)` | Read | Checks if address has voted |
| `is_active()` | Read | Returns poll active status |
| `close_poll()` | Write | Closes the poll |

---

## 🛡️ Error Handling

StellarPulse handles 3 required error types:

| Error | Trigger | User Message |
|-------|---------|--------------|
| **Wallet Not Connected** | Vote clicked without wallet | "Please connect your wallet first." |
| **User Rejected** | User cancels signing in wallet | "Transaction was rejected in your wallet." |
| **Insufficient Balance** | Account has no XLM | "Insufficient XLM balance. Fund via Friendbot." |

Additional errors handled:
- Already voted (contract rejects)
- Poll inactive
- Network / RPC errors

---

## 🔍 Deployment Info

> Fill these in after deployment:

| Field | Value |
|-------|-------|
| **Contract ID** | `YOUR_CONTRACT_ID_HERE` |
| **Deployer Address** | `YOUR_DEPLOYER_ADDRESS_HERE` |
| **Transaction Hash** | `YOUR_DEPLOY_TX_HASH_HERE` |
| **Network** | Stellar Testnet |
| **Explorer** | [View Contract on Stellar Expert](https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID_HERE) |

---

## 🔄 Real-Time Updates

StellarPulse uses a polling strategy to keep results fresh:

- **Interval**: Every 5 seconds (configurable via `NEXT_PUBLIC_POLL_INTERVAL_MS`)
- **Trigger**: Also refreshes immediately after a successful vote transaction
- **Method**: Simulates read-only contract calls (`get_results`, `get_question`) against the Soroban RPC endpoint

---

## 🧱 Git History

```
commit 1 — "Initial project setup"
  - Soroban contract scaffold (vote, get_results, has_voted)
  - Next.js 14 App Router with Tailwind CSS
  - Project structure and type definitions

commit 2 — "Added Stellar wallet integration and contract interaction"
  - StellarWalletsKit integration (Freighter, Albedo, xBull)
  - Contract interaction utilities (stellar.ts, wallet.ts)
  - Real-time polling hook (usePoll)
  - Transaction state management with toasts
  - Error handling for 3 required error types
  - Animated UI with star field background
```

---

## 📚 Resources

- [Stellar Developers](https://developers.stellar.org)
- [Soroban Documentation](https://soroban.stellar.org/docs)
- [StellarWalletsKit](https://github.com/Creit-Tech/Stellar-Wallets-Kit)
- [Stellar Expert Explorer](https://stellar.expert/explorer/testnet)
- [Freighter Wallet](https://freighter.app)
- [Stellar Friendbot](https://friendbot.stellar.org)

---

## 📄 License

MIT © StellarPulse Team
