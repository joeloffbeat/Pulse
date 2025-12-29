/// Position module for Pulse - Handles user bets, stake tracking, and winnings claims
module Pulse::position {
    use std::signer;
    use std::vector;
    use aptos_std::simple_map::{Self, SimpleMap};
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use Pulse::market;
    use Pulse::market_views;
    use Pulse::treasury;

    // Error Codes
    const E_POSITION_NOT_FOUND: u64 = 101;
    const E_ALREADY_CLAIMED: u64 = 102;
    const E_MARKET_NOT_SETTLED: u64 = 103;
    const E_NOT_WINNER: u64 = 104;
    const E_BET_TOO_SMALL: u64 = 106;
    const E_BET_TOO_LARGE: u64 = 107;
    const E_MARKET_EXPIRED: u64 = 108;
    const E_NOT_POSITION_OWNER: u64 = 109;
    const E_ALREADY_INITIALIZED: u64 = 110;

    // Constants
    const MIN_BET: u64 = 10_000_000;      // 0.1 MOVE
    const MAX_BET: u64 = 1_000_000_000;   // 10 MOVE

    /// User's bet on a market
    struct Position has store, copy, drop {
        id: u64,
        market_id: u64,
        user: address,
        is_yes: bool,
        amount: u64,
        created_at: u64,
        claimed: bool,
    }

    /// Registry of all positions
    struct PositionRegistry has key {
        positions: vector<Position>,
        next_id: u64,
        user_positions: SimpleMap<address, vector<u64>>,
    }

    #[event]
    struct BetPlaced has drop, store {
        position_id: u64,
        market_id: u64,
        user: address,
        is_yes: bool,
        amount: u64,
    }

    #[event]
    struct WinningsClaimed has drop, store {
        position_id: u64,
        market_id: u64,
        user: address,
        payout: u64,
    }

    /// Initialize position registry
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<PositionRegistry>(admin_addr), E_ALREADY_INITIALIZED);

        move_to(admin, PositionRegistry {
            positions: vector::empty<Position>(),
            next_id: 0,
            user_positions: simple_map::new<address, vector<u64>>(),
        });
    }

    /// Place a bet on a market
    public entry fun place_bet(
        user: &signer,
        market_id: u64,
        is_yes: bool,
        amount: u64,
    ) acquires PositionRegistry {
        // Validate bet amount
        assert!(amount >= MIN_BET, E_BET_TOO_SMALL);
        assert!(amount <= MAX_BET, E_BET_TOO_LARGE);

        // Validate market
        let market_data = market_views::get_market(market_id);
        assert!(!market_views::is_market_settled(market_id), E_MARKET_NOT_SETTLED);
        let current_time = timestamp::now_seconds();
        assert!(current_time < market::get_market_resolution_time(&market_data), E_MARKET_EXPIRED);

        let user_addr = signer::address_of(user);

        // Deposit funds to treasury
        treasury::deposit(user, amount, market_id);

        // Create position
        let registry = borrow_global_mut<PositionRegistry>(@Pulse);
        let position_id = registry.next_id;
        let position = Position {
            id: position_id,
            market_id,
            user: user_addr,
            is_yes,
            amount,
            created_at: current_time,
            claimed: false,
        };

        vector::push_back(&mut registry.positions, position);
        registry.next_id = position_id + 1;

        // Track user positions
        if (!simple_map::contains_key(&registry.user_positions, &user_addr)) {
            simple_map::add(&mut registry.user_positions, user_addr, vector::empty<u64>());
        };
        let user_pos_ids = simple_map::borrow_mut(&mut registry.user_positions, &user_addr);
        vector::push_back(user_pos_ids, position_id);

        // Update market stakes
        market::update_stakes(market_id, is_yes, amount);

        event::emit(BetPlaced { position_id, market_id, user: user_addr, is_yes, amount });
    }

    /// Claim winnings for a settled market
    public entry fun claim_winnings(
        user: &signer,
        position_id: u64,
    ) acquires PositionRegistry {
        let user_addr = signer::address_of(user);
        let registry = borrow_global_mut<PositionRegistry>(@Pulse);

        // Validate position
        let positions_len = vector::length(&registry.positions);
        assert!(position_id < positions_len, E_POSITION_NOT_FOUND);

        let position = vector::borrow_mut(&mut registry.positions, position_id);
        assert!(position.user == user_addr, E_NOT_POSITION_OWNER);
        assert!(!position.claimed, E_ALREADY_CLAIMED);

        // Validate market is settled
        assert!(market_views::is_market_settled(position.market_id), E_MARKET_NOT_SETTLED);
        let outcome_opt = market_views::get_market_outcome(position.market_id);
        assert!(std::option::is_some(&outcome_opt), E_MARKET_NOT_SETTLED);

        // Check if winner
        let outcome = *std::option::borrow(&outcome_opt);
        assert!(position.is_yes == outcome, E_NOT_WINNER);

        // Calculate and issue payout through treasury
        let payout = market_views::calculate_payout(position.market_id, position.is_yes, position.amount);
        position.claimed = true;

        // Payout via treasury (includes fee deduction)
        treasury::payout(user_addr, payout, position.market_id);

        event::emit(WinningsClaimed {
            position_id,
            market_id: position.market_id,
            user: user_addr,
            payout,
        });
    }

    // ============ View Functions ============

    #[view]
    public fun get_position(position_id: u64): Position acquires PositionRegistry {
        let registry = borrow_global<PositionRegistry>(@Pulse);
        assert!(position_id < vector::length(&registry.positions), E_POSITION_NOT_FOUND);
        *vector::borrow(&registry.positions, position_id)
    }

    #[view]
    public fun get_user_positions(user: address): vector<Position> acquires PositionRegistry {
        let registry = borrow_global<PositionRegistry>(@Pulse);
        if (!simple_map::contains_key(&registry.user_positions, &user)) {
            return vector::empty<Position>()
        };
        let user_pos_ids = simple_map::borrow(&registry.user_positions, &user);
        let result = vector::empty<Position>();
        let i = 0;
        let len = vector::length(user_pos_ids);
        while (i < len) {
            let pos_id = *vector::borrow(user_pos_ids, i);
            vector::push_back(&mut result, *vector::borrow(&registry.positions, pos_id));
            i = i + 1;
        };
        result
    }

    #[view]
    public fun get_user_active_positions(user: address): vector<Position> acquires PositionRegistry {
        let all_positions = get_user_positions(user);
        let result = vector::empty<Position>();
        let i = 0;
        let len = vector::length(&all_positions);
        while (i < len) {
            let position = *vector::borrow(&all_positions, i);
            if (!market_views::is_market_settled(position.market_id)) {
                vector::push_back(&mut result, position);
            };
            i = i + 1;
        };
        result
    }

    #[view]
    public fun get_user_claimable_positions(user: address): vector<Position> acquires PositionRegistry {
        let all_positions = get_user_positions(user);
        let result = vector::empty<Position>();
        let i = 0;
        let len = vector::length(&all_positions);
        while (i < len) {
            let position = *vector::borrow(&all_positions, i);
            if (!position.claimed && market_views::is_market_settled(position.market_id)) {
                let outcome_opt = market_views::get_market_outcome(position.market_id);
                if (std::option::is_some(&outcome_opt)) {
                    let outcome = *std::option::borrow(&outcome_opt);
                    if (position.is_yes == outcome) {
                        vector::push_back(&mut result, position);
                    };
                };
            };
            i = i + 1;
        };
        result
    }

    #[view]
    public fun get_market_positions(market_id: u64): vector<Position> acquires PositionRegistry {
        let registry = borrow_global<PositionRegistry>(@Pulse);
        let result = vector::empty<Position>();
        let i = 0;
        let len = vector::length(&registry.positions);
        while (i < len) {
            let position = vector::borrow(&registry.positions, i);
            if (position.market_id == market_id) {
                vector::push_back(&mut result, *position);
            };
            i = i + 1;
        };
        result
    }

    #[view]
    public fun get_user_stats(user: address): (u64, u64, u64) acquires PositionRegistry {
        let all_positions = get_user_positions(user);
        let total_bets: u64 = 0;
        let total_won: u64 = 0;
        let total_volume: u64 = 0;
        let i = 0;
        let len = vector::length(&all_positions);
        while (i < len) {
            let position = vector::borrow(&all_positions, i);
            total_bets = total_bets + 1;
            total_volume = total_volume + position.amount;
            if (market_views::is_market_settled(position.market_id)) {
                let outcome_opt = market_views::get_market_outcome(position.market_id);
                if (std::option::is_some(&outcome_opt)) {
                    let outcome = *std::option::borrow(&outcome_opt);
                    if (position.is_yes == outcome) {
                        total_won = total_won + 1;
                    };
                };
            };
            i = i + 1;
        };
        (total_bets, total_won, total_volume)
    }

    #[view]
    public fun get_total_positions(): u64 acquires PositionRegistry {
        vector::length(&borrow_global<PositionRegistry>(@Pulse).positions)
    }
}
