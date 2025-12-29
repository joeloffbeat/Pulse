/// Market module for Pulse - Handles market creation, stake tracking, and resolution
module Pulse::market {
    use std::string::String;
    use std::option::{Self, Option};
    use std::vector;
    use std::signer;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use Pulse::oracle;

    // Error Codes
    const E_NOT_ADMIN: u64 = 1;
    const E_MARKET_NOT_FOUND: u64 = 2;
    const E_MARKET_ALREADY_SETTLED: u64 = 3;
    const E_MARKET_NOT_SETTLED: u64 = 4;
    const E_INVALID_CATEGORY: u64 = 5;
    const E_MARKET_EXPIRED: u64 = 6;
    const E_ALREADY_INITIALIZED: u64 = 8;
    const E_NO_ORACLE_CONFIG: u64 = 9;
    const E_MARKET_NOT_EXPIRED: u64 = 10;

    // Category Constants
    const CATEGORY_CRYPTO: u8 = 0;
    const CATEGORY_SPORTS: u8 = 1;
    const CATEGORY_POLITICS: u8 = 2;
    const CATEGORY_ENTERTAINMENT: u8 = 3;
    const CATEGORY_WEATHER: u8 = 4;
    const CATEGORY_CUSTOM: u8 = 5;

    /// Oracle resolution configuration
    struct OracleConfig has store, copy, drop {
        feed_id: vector<u8>,      // Pyth feed ID
        threshold: u64,           // Price threshold (8 decimals)
        is_above: bool,           // true = resolve YES if price >= threshold
    }

    /// Individual prediction market
    struct Market has store, copy, drop {
        id: u64,
        question: String,
        category: u8,
        resolution_time: u64,
        total_yes_stake: u64,
        total_no_stake: u64,
        outcome: Option<bool>,
        settled: bool,
        creator: address,
        created_at: u64,
        oracle_config: Option<OracleConfig>,
    }

    /// Global registry for all markets
    struct MarketRegistry has key {
        markets: vector<Market>,
        next_id: u64,
        admin: address,
    }

    #[event]
    struct MarketCreated has drop, store {
        market_id: u64,
        creator: address,
        question: String,
        category: u8,
        resolution_time: u64,
    }

    #[event]
    struct MarketResolved has drop, store {
        market_id: u64,
        outcome: bool,
        total_yes_stake: u64,
        total_no_stake: u64,
    }

    /// Initialize the market registry
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<MarketRegistry>(admin_addr), E_ALREADY_INITIALIZED);
        move_to(admin, MarketRegistry {
            markets: vector::empty<Market>(),
            next_id: 0,
            admin: admin_addr,
        });
    }

    /// Create a new prediction market
    public entry fun create_market(
        creator: &signer,
        question: String,
        category: u8,
        resolution_time: u64,
    ) acquires MarketRegistry {
        assert!(category <= CATEGORY_CUSTOM, E_INVALID_CATEGORY);
        let current_time = timestamp::now_seconds();
        assert!(resolution_time > current_time, E_MARKET_EXPIRED);
        let creator_addr = signer::address_of(creator);
        let registry = borrow_global_mut<MarketRegistry>(@Pulse);
        let market_id = registry.next_id;
        let market = Market {
            id: market_id,
            question,
            category,
            resolution_time,
            total_yes_stake: 0,
            total_no_stake: 0,
            outcome: option::none(),
            settled: false,
            creator: creator_addr,
            created_at: current_time,
            oracle_config: option::none(),
        };
        vector::push_back(&mut registry.markets, market);
        registry.next_id = market_id + 1;
        event::emit(MarketCreated { market_id, creator: creator_addr, question, category, resolution_time });
    }

    /// Create a new prediction market with oracle resolution
    public entry fun create_market_with_oracle(
        creator: &signer,
        question: String,
        category: u8,
        resolution_time: u64,
        feed_id: vector<u8>,
        threshold: u64,
        is_above: bool,
    ) acquires MarketRegistry {
        assert!(category <= CATEGORY_CUSTOM, E_INVALID_CATEGORY);
        let current_time = timestamp::now_seconds();
        assert!(resolution_time > current_time, E_MARKET_EXPIRED);
        let creator_addr = signer::address_of(creator);
        let registry = borrow_global_mut<MarketRegistry>(@Pulse);
        let market_id = registry.next_id;
        let oracle_config = OracleConfig { feed_id, threshold, is_above };
        let market = Market {
            id: market_id,
            question,
            category,
            resolution_time,
            total_yes_stake: 0,
            total_no_stake: 0,
            outcome: option::none(),
            settled: false,
            creator: creator_addr,
            created_at: current_time,
            oracle_config: option::some(oracle_config),
        };
        vector::push_back(&mut registry.markets, market);
        registry.next_id = market_id + 1;
        event::emit(MarketCreated { market_id, creator: creator_addr, question, category, resolution_time });
    }

    /// Resolve a market (admin only)
    public entry fun resolve_market(
        admin: &signer,
        market_id: u64,
        outcome: bool,
    ) acquires MarketRegistry {
        let registry = borrow_global_mut<MarketRegistry>(@Pulse);
        assert!(signer::address_of(admin) == registry.admin, E_NOT_ADMIN);
        let markets_len = vector::length(&registry.markets);
        assert!(market_id < markets_len, E_MARKET_NOT_FOUND);
        let market = vector::borrow_mut(&mut registry.markets, market_id);
        assert!(!market.settled, E_MARKET_ALREADY_SETTLED);
        market.outcome = option::some(outcome);
        market.settled = true;
        event::emit(MarketResolved {
            market_id,
            outcome,
            total_yes_stake: market.total_yes_stake,
            total_no_stake: market.total_no_stake,
        });
    }

    /// Resolve market using Pyth oracle price
    public entry fun resolve_market_with_oracle(
        resolver: &signer,
        market_id: u64,
        pyth_price_update: vector<vector<u8>>,
    ) acquires MarketRegistry {
        let registry = borrow_global_mut<MarketRegistry>(@Pulse);
        let markets_len = vector::length(&registry.markets);
        assert!(market_id < markets_len, E_MARKET_NOT_FOUND);
        let market = vector::borrow_mut(&mut registry.markets, market_id);
        assert!(!market.settled, E_MARKET_ALREADY_SETTLED);
        assert!(option::is_some(&market.oracle_config), E_NO_ORACLE_CONFIG);
        let current_time = timestamp::now_seconds();
        assert!(current_time >= market.resolution_time, E_MARKET_NOT_EXPIRED);
        let config = option::borrow(&market.oracle_config);
        let feed_id = config.feed_id;
        let threshold = config.threshold;
        let is_above = config.is_above;
        let is_price_above = oracle::is_price_above_threshold(resolver, pyth_price_update, feed_id, threshold);
        let outcome = if (is_above) { is_price_above } else { !is_price_above };
        market.outcome = option::some(outcome);
        market.settled = true;
        event::emit(MarketResolved {
            market_id,
            outcome,
            total_yes_stake: market.total_yes_stake,
            total_no_stake: market.total_no_stake,
        });
    }

    /// Update stakes for a market (called by position module)
    public fun update_stakes(market_id: u64, is_yes: bool, amount: u64) acquires MarketRegistry {
        let registry = borrow_global_mut<MarketRegistry>(@Pulse);
        let markets_len = vector::length(&registry.markets);
        assert!(market_id < markets_len, E_MARKET_NOT_FOUND);
        let market = vector::borrow_mut(&mut registry.markets, market_id);
        assert!(!market.settled, E_MARKET_ALREADY_SETTLED);
        let current_time = timestamp::now_seconds();
        assert!(current_time < market.resolution_time, E_MARKET_EXPIRED);
        if (is_yes) {
            market.total_yes_stake = market.total_yes_stake + amount;
        } else {
            market.total_no_stake = market.total_no_stake + amount;
        }
    }

    // ============ Internal accessors for view module ============

    /// Get a single market by ID (used by market_views)
    public fun get_market_internal(market_id: u64): Market acquires MarketRegistry {
        let registry = borrow_global<MarketRegistry>(@Pulse);
        assert!(market_id < vector::length(&registry.markets), E_MARKET_NOT_FOUND);
        *vector::borrow(&registry.markets, market_id)
    }

    /// Get total markets count (used by market_views)
    public fun get_markets_count_internal(): u64 acquires MarketRegistry {
        vector::length(&borrow_global<MarketRegistry>(@Pulse).markets)
    }

    /// Get all markets vector (used by market_views for filtering)
    public fun get_all_markets(): vector<Market> acquires MarketRegistry {
        borrow_global<MarketRegistry>(@Pulse).markets
    }

    // ============ Market accessor functions ============
    public fun get_market_id(market: &Market): u64 { market.id }
    public fun get_market_question(market: &Market): String { market.question }
    public fun get_market_resolution_time(market: &Market): u64 { market.resolution_time }
    public fun get_market_yes_stake(market: &Market): u64 { market.total_yes_stake }
    public fun get_market_no_stake(market: &Market): u64 { market.total_no_stake }
    public fun get_market_outcome_field(market: &Market): Option<bool> { market.outcome }
    public fun get_market_settled(market: &Market): bool { market.settled }
    public fun get_market_creator(market: &Market): address { market.creator }
    public fun get_market_created_at(market: &Market): u64 { market.created_at }
    public fun get_market_oracle_config(market: &Market): Option<OracleConfig> { market.oracle_config }

    // ============ OracleConfig accessor functions ============
    public fun get_oracle_feed_id(config: &OracleConfig): vector<u8> { config.feed_id }
    public fun get_oracle_threshold(config: &OracleConfig): u64 { config.threshold }
    public fun get_oracle_is_above(config: &OracleConfig): bool { config.is_above }
}
