#[test_only]
module Pulse::pulse_tests {
    use std::string;
    use std::signer;
    use std::vector;
    use std::option;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::timestamp;
    use Pulse::market;
    use Pulse::position;
    use Pulse::treasury;

    // Setup helper - initializes framework and modules
    fun setup_test(aptos_framework: &signer, admin: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(aptos_framework);

        // Initialize AptosCoin
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        // Create admin account and fund it
        account::create_account_for_test(signer::address_of(admin));
        coin::register<AptosCoin>(admin);

        // Initialize all modules
        market::initialize(admin);
        treasury::initialize(admin);
        position::initialize(admin);

        // Cleanup caps
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    // ============ Market Tests ============

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    fun test_initialize_market(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);
        // Verify market count is 0
        assert!(market::get_markets_count() == 0, 1);
    }

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    fun test_create_market(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);

        // Create a market
        market::create_market(
            admin,
            string::utf8(b"Will BTC hit $100k?"),
            0, // Crypto category
            timestamp::now_seconds() + 3600, // 1 hour from now
        );

        // Verify market was created
        assert!(market::get_markets_count() == 1, 1);
        let market_data = market::get_market(0);
        assert!(market::get_market_id(&market_data) == 0, 2);
        assert!(market::get_market_settled(&market_data) == false, 3);
    }

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    fun test_create_multiple_markets(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);

        // Create 3 markets
        let i = 0;
        while (i < 3) {
            market::create_market(
                admin,
                string::utf8(b"Test Market"),
                0,
                timestamp::now_seconds() + 3600,
            );
            i = i + 1;
        };

        assert!(market::get_markets_count() == 3, 1);
    }

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    fun test_resolve_market(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);

        // Create market
        market::create_market(
            admin,
            string::utf8(b"Test market"),
            0,
            timestamp::now_seconds() + 3600,
        );

        // Fast forward time past resolution
        timestamp::fast_forward_seconds(3700);

        // Resolve market as YES
        market::resolve_market(admin, 0, true);

        // Verify
        let market_data = market::get_market(0);
        assert!(market::get_market_settled(&market_data) == true, 1);
        let outcome = market::get_market_outcome_field(&market_data);
        assert!(option::is_some(&outcome), 2);
        assert!(*option::borrow(&outcome) == true, 3);
    }

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    #[expected_failure(abort_code = market::E_MARKET_NOT_FOUND)]
    fun test_get_nonexistent_market(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);
        market::get_market(999);
    }

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    #[expected_failure(abort_code = market::E_MARKET_ALREADY_SETTLED)]
    fun test_resolve_already_settled(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);

        market::create_market(
            admin,
            string::utf8(b"Test"),
            0,
            timestamp::now_seconds() + 3600,
        );

        timestamp::fast_forward_seconds(3700);
        market::resolve_market(admin, 0, true);
        // Try to resolve again - should fail
        market::resolve_market(admin, 0, false);
    }

    // ============ Treasury Tests ============

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    fun test_treasury_stats(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);

        let (deposits, payouts, fee_bps, fees) = treasury::get_treasury_stats();
        assert!(deposits == 0, 1);
        assert!(payouts == 0, 2);
        assert!(fee_bps == 500, 3); // 5% default
        assert!(fees == 0, 4);
    }

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    fun test_update_fee(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);

        // Update fee to 3%
        treasury::update_fee(admin, 300);

        assert!(treasury::get_fee_basis_points() == 300, 1);
    }

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    #[expected_failure(abort_code = treasury::E_INVALID_FEE)]
    fun test_update_fee_too_high(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);
        // Try to set fee to 15% (above 10% max)
        treasury::update_fee(admin, 1500);
    }

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    fun test_calculate_fee(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);

        // With 5% fee, fee on 1000000 should be 50000
        let fee = treasury::calculate_fee(1000000);
        assert!(fee == 50000, 1);
    }

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    fun test_calculate_net_payout(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);

        // With 5% fee, net payout on 1000000 should be 950000
        let net = treasury::calculate_net_payout(1000000);
        assert!(net == 950000, 1);
    }

    // ============ Position Tests ============

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    fun test_position_registry_init(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);
        assert!(position::get_total_positions() == 0, 1);
    }

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    fun test_get_active_markets(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);

        // Create 2 markets
        market::create_market(admin, string::utf8(b"Market 1"), 0, timestamp::now_seconds() + 3600);
        market::create_market(admin, string::utf8(b"Market 2"), 0, timestamp::now_seconds() + 3600);

        // Should have 2 active markets
        let active = market::get_active_markets();
        assert!(vector::length(&active) == 2, 1);

        // Resolve one
        timestamp::fast_forward_seconds(3700);
        market::resolve_market(admin, 0, true);

        // Should have 0 active markets (both past resolution time)
        let active_after = market::get_active_markets();
        assert!(vector::length(&active_after) == 0, 2);
    }

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    fun test_calculate_payout(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);

        market::create_market(admin, string::utf8(b"Test"), 0, timestamp::now_seconds() + 3600);

        // With no stakes, payout should equal amount
        let payout = market::calculate_payout(0, true, 100);
        assert!(payout == 100, 1);
    }

    // ============ Pagination Tests ============

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    fun test_paginated_markets(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);

        // Create 5 markets
        let i = 0;
        while (i < 5) {
            market::create_market(admin, string::utf8(b"Market"), 0, timestamp::now_seconds() + 3600);
            i = i + 1;
        };

        // Get first 2
        let page1 = market::get_markets_paginated(0, 2);
        assert!(vector::length(&page1) == 2, 1);

        // Get next 2
        let page2 = market::get_markets_paginated(2, 2);
        assert!(vector::length(&page2) == 2, 2);

        // Get last 1
        let page3 = market::get_markets_paginated(4, 2);
        assert!(vector::length(&page3) == 1, 3);
    }

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    fun test_treasury_is_initialized(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);
        assert!(treasury::is_initialized() == true, 1);
    }

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    fun test_market_categories(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);

        // Create markets with different categories
        market::create_market(admin, string::utf8(b"Crypto"), 0, timestamp::now_seconds() + 3600);
        market::create_market(admin, string::utf8(b"Sports"), 1, timestamp::now_seconds() + 3600);
        market::create_market(admin, string::utf8(b"Politics"), 2, timestamp::now_seconds() + 3600);

        assert!(market::get_markets_count() == 3, 1);
    }

    #[test(aptos_framework = @0x1, admin = @Pulse)]
    #[expected_failure(abort_code = market::E_INVALID_CATEGORY)]
    fun test_invalid_category(aptos_framework: &signer, admin: &signer) {
        setup_test(aptos_framework, admin);
        // Category 10 is invalid (max is 5)
        market::create_market(admin, string::utf8(b"Invalid"), 10, timestamp::now_seconds() + 3600);
    }
}
