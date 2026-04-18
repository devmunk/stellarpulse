//! StellarPulse Voting Contract
//! 
//! A Soroban smart contract for on-chain polling on the Stellar network.
//! Features:
//!   - Stores poll question and options
//!   - Tracks vote counts per option
//!   - Prevents double voting (one vote per wallet address)

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Env, String, Vec, Map,
    symbol_short,
};

// ─── Storage Keys ────────────────────────────────────────────────────────────

/// Top-level storage keys for contract state
#[contracttype]
pub enum DataKey {
    /// The poll question string
    Question,
    /// Vec<String> of option labels
    Options,
    /// Map<u32, u64> option_index → vote_count
    VoteCounts,
    /// Map<Address, bool> voter → has_voted
    Voters,
    /// Whether the poll is still active
    Active,
}

// ─── Contract ────────────────────────────────────────────────────────────────

#[contract]
pub struct PollContract;

#[contractimpl]
impl PollContract {

    // ── Initialization ───────────────────────────────────────────────────────

    /// Initialize the poll with a question and a list of option labels.
    /// Can only be called once (will panic if already initialized).
    ///
    /// # Arguments
    /// * `env`      – Soroban environment
    /// * `question` – The poll question shown to voters
    /// * `options`  – A vector of option labels (e.g. ["Web3", "AI"])
    pub fn initialize(
        env: Env,
        question: String,
        options: Vec<String>,
    ) {
        // Prevent re-initialization
        if env.storage().instance().has(&DataKey::Active) {
            panic!("Contract already initialized");
        }

        // Require at least 2 options
        if options.len() < 2 {
            panic!("At least 2 options required");
        }

        // Build initial vote-count map (all zeros)
        let mut vote_counts: Map<u32, u64> = Map::new(&env);
        for i in 0..options.len() {
            vote_counts.set(i, 0u64);
        }

        // Persist state
        env.storage().instance().set(&DataKey::Question, &question);
        env.storage().instance().set(&DataKey::Options, &options);
        env.storage().instance().set(&DataKey::VoteCounts, &vote_counts);
        env.storage().instance().set(&DataKey::Voters, &Map::<Address, bool>::new(&env));
        env.storage().instance().set(&DataKey::Active, &true);

        // Emit initialization event
        env.events().publish(
            (symbol_short!("poll"), symbol_short!("init")),
            question,
        );
    }

    // ── Voting ───────────────────────────────────────────────────────────────

    /// Cast a vote for the given option index.
    /// Reverts if:
    ///   - Poll not initialized / inactive
    ///   - The voter has already voted
    ///   - The option index is out of range
    ///
    /// # Arguments
    /// * `env`          – Soroban environment
    /// * `voter`        – Address of the wallet casting the vote (must sign)
    /// * `option_index` – Zero-based index of the chosen option
    pub fn vote(env: Env, voter: Address, option_index: u32) {
        // Require the voter to authorize this call
        voter.require_auth();

        // Ensure poll is active
        let active: bool = env.storage().instance()
            .get(&DataKey::Active)
            .unwrap_or(false);
        if !active {
            panic!("Poll is not active");
        }

        // Check for double-voting
        let mut voters: Map<Address, bool> = env.storage().instance()
            .get(&DataKey::Voters)
            .unwrap();
        if voters.get(voter.clone()).unwrap_or(false) {
            panic!("Address has already voted");
        }

        // Validate option index
        let options: Vec<String> = env.storage().instance()
            .get(&DataKey::Options)
            .unwrap();
        if option_index >= options.len() {
            panic!("Invalid option index");
        }

        // Increment vote count
        let mut vote_counts: Map<u32, u64> = env.storage().instance()
            .get(&DataKey::VoteCounts)
            .unwrap();
        let current: u64 = vote_counts.get(option_index).unwrap_or(0);
        vote_counts.set(option_index, current + 1);

        // Mark voter as having voted
        voters.set(voter.clone(), true);

        // Persist updated state
        env.storage().instance().set(&DataKey::VoteCounts, &vote_counts);
        env.storage().instance().set(&DataKey::Voters, &voters);

        // Emit vote event
        env.events().publish(
            (symbol_short!("poll"), symbol_short!("vote")),
            (voter, option_index),
        );
    }

    // ── Queries ──────────────────────────────────────────────────────────────

    /// Returns the poll question.
    pub fn get_question(env: Env) -> String {
        env.storage().instance()
            .get(&DataKey::Question)
            .expect("Poll not initialized")
    }

    /// Returns all option labels as a Vec<String>.
    pub fn get_options(env: Env) -> Vec<String> {
        env.storage().instance()
            .get(&DataKey::Options)
            .expect("Poll not initialized")
    }

    /// Returns a Map of option_index → vote_count.
    pub fn get_results(env: Env) -> Map<u32, u64> {
        env.storage().instance()
            .get(&DataKey::VoteCounts)
            .expect("Poll not initialized")
    }

    /// Returns true if the given address has already voted.
    pub fn has_voted(env: Env, voter: Address) -> bool {
        let voters: Map<Address, bool> = env.storage().instance()
            .get(&DataKey::Voters)
            .unwrap_or(Map::new(&env));
        voters.get(voter).unwrap_or(false)
    }

    /// Returns whether the poll is currently active.
    pub fn is_active(env: Env) -> bool {
        env.storage().instance()
            .get(&DataKey::Active)
            .unwrap_or(false)
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    /// Closes the poll (no further votes accepted).
    /// NOTE: In production you'd restrict this to a specific admin address.
    pub fn close_poll(env: Env) {
        env.storage().instance().set(&DataKey::Active, &false);
        env.events().publish(
            (symbol_short!("poll"), symbol_short!("closed")),
            true,
        );
    }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, vec, Env};

    fn setup_contract() -> (Env, PollContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, PollContract);
        let client = PollContractClient::new(&env, &contract_id);

        let question = String::from_str(&env, "Which technology excites you more?");
        let options = vec![
            &env,
            String::from_str(&env, "Web3"),
            String::from_str(&env, "AI"),
        ];
        client.initialize(&question, &options);
        (env, client)
    }

    #[test]
    fn test_initialize() {
        let (env, client) = setup_contract();
        assert_eq!(
            client.get_question(),
            String::from_str(&env, "Which technology excites you more?")
        );
        assert!(client.is_active());
    }

    #[test]
    fn test_vote() {
        let (env, client) = setup_contract();
        let voter = Address::generate(&env);
        client.vote(&voter, &0u32);

        let results = client.get_results();
        assert_eq!(results.get(0u32).unwrap(), 1u64);
        assert_eq!(results.get(1u32).unwrap(), 0u64);
        assert!(client.has_voted(&voter));
    }

    #[test]
    #[should_panic(expected = "Address has already voted")]
    fn test_double_vote_prevented() {
        let (env, client) = setup_contract();
        let voter = Address::generate(&env);
        client.vote(&voter, &0u32);
        client.vote(&voter, &1u32); // Should panic
    }

    #[test]
    fn test_multiple_voters() {
        let (env, client) = setup_contract();
        let v1 = Address::generate(&env);
        let v2 = Address::generate(&env);
        let v3 = Address::generate(&env);

        client.vote(&v1, &0u32); // Web3
        client.vote(&v2, &1u32); // AI
        client.vote(&v3, &0u32); // Web3

        let results = client.get_results();
        assert_eq!(results.get(0u32).unwrap(), 2u64);
        assert_eq!(results.get(1u32).unwrap(), 1u64);
    }
}
