#!/usr/bin/env bash
# =============================================================================
# StellarPulse — Contract Deployment Script (Stellar Testnet)
# =============================================================================
# Prerequisites:
#   - Rust + cargo installed: https://rustup.rs/
#   - Soroban CLI installed: cargo install --locked soroban-cli
#   - stellar CLI alias (soroban-cli v21+ uses `stellar` command)
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
# =============================================================================

set -euo pipefail

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log()   { echo -e "${CYAN}[StellarPulse]${NC} $*"; }
ok()    { echo -e "${GREEN}[✓]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
error() { echo -e "${RED}[✗]${NC} $*"; exit 1; }

# ── Configuration ─────────────────────────────────────────────────────────────
NETWORK="testnet"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
RPC_URL="https://soroban-testnet.stellar.org"
ACCOUNT_NAME="stellarpulse-deployer"
CONTRACT_WASM="target/wasm32-unknown-unknown/release/stellar_pulse_contract.wasm"
OPTIMIZED_WASM="target/wasm32-unknown-unknown/release/stellar_pulse_contract.optimized.wasm"

# Poll configuration
POLL_QUESTION="Which technology excites you more?"
OPTION_1="Web3"
OPTION_2="AI"

# ── Step 1: Build ─────────────────────────────────────────────────────────────
log "Building Soroban contract..."
cargo build --target wasm32-unknown-unknown --release

# Optimize WASM binary
if command -v soroban &> /dev/null; then
  CLI_CMD="soroban"
elif command -v stellar &> /dev/null; then
  CLI_CMD="stellar"
else
  error "Neither 'soroban' nor 'stellar' CLI found. Install with: cargo install --locked soroban-cli"
fi

log "Optimizing WASM with $CLI_CMD..."
$CLI_CMD contract optimize --wasm "$CONTRACT_WASM"
ok "Build complete: $OPTIMIZED_WASM"

# ── Step 2: Configure Network ─────────────────────────────────────────────────
log "Configuring Stellar testnet..."
$CLI_CMD network add \
  --global testnet \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" 2>/dev/null || true
ok "Network configured"

# ── Step 3: Generate / Load Account ──────────────────────────────────────────
log "Setting up deployer account: $ACCOUNT_NAME"
if ! $CLI_CMD keys show "$ACCOUNT_NAME" &>/dev/null; then
  log "Generating new keypair..."
  $CLI_CMD keys generate --global "$ACCOUNT_NAME" --network "$NETWORK"
fi

DEPLOYER_ADDRESS=$($CLI_CMD keys address "$ACCOUNT_NAME")
ok "Deployer address: $DEPLOYER_ADDRESS"

# ── Step 4: Fund Account via Friendbot ────────────────────────────────────────
log "Funding account via testnet Friendbot..."
curl -s "https://friendbot.stellar.org?addr=${DEPLOYER_ADDRESS}" \
  | python3 -m json.tool > /dev/null 2>&1 || \
  curl -s "https://friendbot.stellar.org?addr=${DEPLOYER_ADDRESS}" > /dev/null
ok "Account funded"

# ── Step 5: Deploy Contract ───────────────────────────────────────────────────
log "Deploying contract to Stellar testnet..."
CONTRACT_ID=$($CLI_CMD contract deploy \
  --wasm "$OPTIMIZED_WASM" \
  --source "$ACCOUNT_NAME" \
  --network "$NETWORK")

ok "Contract deployed!"
echo -e "  ${GREEN}Contract ID:${NC} $CONTRACT_ID"

# ── Step 6: Initialize Poll ───────────────────────────────────────────────────
log "Initializing poll..."
$CLI_CMD contract invoke \
  --id "$CONTRACT_ID" \
  --source "$ACCOUNT_NAME" \
  --network "$NETWORK" \
  -- \
  initialize \
  --question "$POLL_QUESTION" \
  --options "[\"$OPTION_1\",\"$OPTION_2\"]"

ok "Poll initialized with question: \"$POLL_QUESTION\""

# ── Step 7: Verify ────────────────────────────────────────────────────────────
log "Verifying deployment..."
RESULT=$($CLI_CMD contract invoke \
  --id "$CONTRACT_ID" \
  --network "$NETWORK" \
  -- \
  get_question)
ok "Poll question: $RESULT"

# ── Step 8: Output Config ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🚀 StellarPulse Contract Deployed Successfully!   ${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "  Network:      ${CYAN}$NETWORK${NC}"
echo -e "  Contract ID:  ${CYAN}$CONTRACT_ID${NC}"
echo -e "  Deployer:     ${CYAN}$DEPLOYER_ADDRESS${NC}"
echo ""
echo -e "  Explorer URL:"
echo -e "  ${CYAN}https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID${NC}"
echo ""
echo -e "${YELLOW}  ➜ Copy the Contract ID and paste it into:${NC}"
echo -e "     frontend/.env.local  →  NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo ""

# Write contract ID to a local file for easy access
echo "CONTRACT_ID=$CONTRACT_ID" > .deployment.env
echo "DEPLOYER=$DEPLOYER_ADDRESS" >> .deployment.env
ok "Deployment info saved to contract/.deployment.env"
