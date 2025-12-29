/// Market view functions for Pulse - Read-only queries for market data
module Pulse::market_views {
    use std::option;
    use std::vector;
    use aptos_framework::timestamp;
    use Pulse::market::{Self, Market};

    #[view]
    public fun get_market(market_id: u64): Market {
        market::get_market_internal(market_id)
    }

    #[view]
    public fun get_markets_count(): u64 {
        market::get_markets_count_internal()
    }

    #[view]
    public fun get_markets_paginated(offset: u64, limit: u64): vector<Market> {
        let markets = market::get_all_markets();
        let markets_len = vector::length(&markets);
        let result = vector::empty<Market>();
        let end = if (offset + limit > markets_len) { markets_len } else { offset + limit };
        let i = offset;
        while (i < end) {
            vector::push_back(&mut result, *vector::borrow(&markets, i));
            i = i + 1;
        };
        result
    }

    #[view]
    public fun get_active_markets(): vector<Market> {
        let markets = market::get_all_markets();
        let current_time = timestamp::now_seconds();
        let markets_len = vector::length(&markets);
        let result = vector::empty<Market>();
        let i = 0;
        while (i < markets_len) {
            let m = vector::borrow(&markets, i);
            if (!market::get_market_settled(m) && market::get_market_resolution_time(m) > current_time) {
                vector::push_back(&mut result, *m);
            };
            i = i + 1;
        };
        result
    }

    #[view]
    /// Calculate payout: (amount * total_pool) / winning_side_stake
    public fun calculate_payout(market_id: u64, is_yes: bool, amount: u64): u64 {
        let m = market::get_market_internal(market_id);
        let total_pool = market::get_market_yes_stake(&m) + market::get_market_no_stake(&m);
        if (total_pool == 0) { return amount };
        let side_stake = if (is_yes) { market::get_market_yes_stake(&m) } else { market::get_market_no_stake(&m) };
        if (side_stake == 0) { return total_pool + amount };
        (amount * total_pool) / side_stake
    }

    #[view]
    public fun is_market_settled(market_id: u64): bool {
        market::get_market_settled(&market::get_market_internal(market_id))
    }

    #[view]
    public fun get_market_outcome(market_id: u64): option::Option<bool> {
        market::get_market_outcome_field(&market::get_market_internal(market_id))
    }
}
