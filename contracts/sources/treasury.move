/// Treasury module for Pulse - Handles MOVE token flows, fees, and payouts
module Pulse::treasury {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::aptos_account;
    use aptos_framework::event;
    use aptos_framework::account::{Self, SignerCapability};

    friend Pulse::position;

    // Error Codes
    const E_NOT_ADMIN: u64 = 201;
    const E_INSUFFICIENT_TREASURY: u64 = 202;
    const E_INVALID_FEE: u64 = 203;
    const E_ALREADY_INITIALIZED: u64 = 204;
    const E_NOT_INITIALIZED: u64 = 205;

    // Fee Constants
    const DEFAULT_FEE_BPS: u64 = 500;   // 5%
    const MAX_FEE_BPS: u64 = 1000;      // 10% max
    const BASIS_POINTS: u64 = 10000;

    // Treasury seed for resource account
    const TREASURY_SEED: vector<u8> = b"pulse_treasury_v2";

    /// Treasury configuration and capabilities
    struct Treasury has key {
        signer_cap: SignerCapability,
        treasury_address: address,
        total_deposits: u64,
        total_payouts: u64,
        fee_basis_points: u64,
        collected_fees: u64,
        admin: address,
    }

    #[event]
    struct Deposit has drop, store {
        user: address,
        amount: u64,
        market_id: u64,
    }

    #[event]
    struct Payout has drop, store {
        user: address,
        gross_amount: u64,
        fee: u64,
        net_amount: u64,
        market_id: u64,
    }

    #[event]
    struct FeeCollected has drop, store {
        admin: address,
        amount: u64,
    }

    #[event]
    struct FeeUpdated has drop, store {
        old_fee_bps: u64,
        new_fee_bps: u64,
    }

    /// Initialize treasury with resource account
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<Treasury>(admin_addr), E_ALREADY_INITIALIZED);

        // Create resource account for treasury
        let (treasury_signer, signer_cap) = account::create_resource_account(admin, TREASURY_SEED);
        let treasury_address = signer::address_of(&treasury_signer);

        // Register treasury to hold AptosCoin
        coin::register<AptosCoin>(&treasury_signer);

        move_to(admin, Treasury {
            signer_cap,
            treasury_address,
            total_deposits: 0,
            total_payouts: 0,
            fee_basis_points: DEFAULT_FEE_BPS,
            collected_fees: 0,
            admin: admin_addr,
        });
    }

    /// Deposit MOVE tokens into treasury (called by position module)
    public(friend) fun deposit(
        user: &signer,
        amount: u64,
        market_id: u64,
    ) acquires Treasury {
        let treasury = borrow_global_mut<Treasury>(@Pulse);
        let user_addr = signer::address_of(user);

        // Transfer from user to treasury
        aptos_account::transfer(user, treasury.treasury_address, amount);

        // Update stats
        treasury.total_deposits = treasury.total_deposits + amount;

        event::emit(Deposit { user: user_addr, amount, market_id });
    }

    /// Pay out winnings to user (called by position module)
    public(friend) fun payout(
        recipient: address,
        gross_amount: u64,
        market_id: u64,
    ) acquires Treasury {
        let treasury = borrow_global_mut<Treasury>(@Pulse);

        // Calculate fee
        let fee = (gross_amount * treasury.fee_basis_points) / BASIS_POINTS;
        let net_amount = gross_amount - fee;

        // Get treasury signer
        let treasury_signer = account::create_signer_with_capability(&treasury.signer_cap);

        // Transfer net amount to recipient
        aptos_account::transfer(&treasury_signer, recipient, net_amount);

        // Update stats
        treasury.total_payouts = treasury.total_payouts + net_amount;
        treasury.collected_fees = treasury.collected_fees + fee;

        event::emit(Payout {
            user: recipient,
            gross_amount,
            fee,
            net_amount,
            market_id,
        });
    }

    /// Withdraw collected fees (admin only)
    public entry fun withdraw_fees(admin: &signer) acquires Treasury {
        let treasury = borrow_global_mut<Treasury>(@Pulse);
        let admin_addr = signer::address_of(admin);

        assert!(admin_addr == treasury.admin, E_NOT_ADMIN);
        assert!(treasury.collected_fees > 0, E_INSUFFICIENT_TREASURY);

        let amount = treasury.collected_fees;
        treasury.collected_fees = 0;

        // Get treasury signer and transfer fees to admin
        let treasury_signer = account::create_signer_with_capability(&treasury.signer_cap);
        aptos_account::transfer(&treasury_signer, admin_addr, amount);

        event::emit(FeeCollected { admin: admin_addr, amount });
    }

    /// Update fee percentage (admin only)
    public entry fun update_fee(
        admin: &signer,
        new_fee_bps: u64,
    ) acquires Treasury {
        let treasury = borrow_global_mut<Treasury>(@Pulse);
        let admin_addr = signer::address_of(admin);

        assert!(admin_addr == treasury.admin, E_NOT_ADMIN);
        assert!(new_fee_bps <= MAX_FEE_BPS, E_INVALID_FEE);

        let old_fee_bps = treasury.fee_basis_points;
        treasury.fee_basis_points = new_fee_bps;

        event::emit(FeeUpdated { old_fee_bps, new_fee_bps });
    }

    // ============ View Functions ============

    #[view]
    public fun get_treasury_stats(): (u64, u64, u64, u64) acquires Treasury {
        let treasury = borrow_global<Treasury>(@Pulse);
        (
            treasury.total_deposits,
            treasury.total_payouts,
            treasury.fee_basis_points,
            treasury.collected_fees,
        )
    }

    #[view]
    public fun get_treasury_balance(): u64 acquires Treasury {
        let treasury = borrow_global<Treasury>(@Pulse);
        coin::balance<AptosCoin>(treasury.treasury_address)
    }

    #[view]
    public fun get_treasury_address(): address acquires Treasury {
        borrow_global<Treasury>(@Pulse).treasury_address
    }

    #[view]
    public fun calculate_fee(amount: u64): u64 acquires Treasury {
        let treasury = borrow_global<Treasury>(@Pulse);
        (amount * treasury.fee_basis_points) / BASIS_POINTS
    }

    #[view]
    public fun calculate_net_payout(gross_amount: u64): u64 acquires Treasury {
        let fee = calculate_fee(gross_amount);
        gross_amount - fee
    }

    #[view]
    public fun get_fee_basis_points(): u64 acquires Treasury {
        borrow_global<Treasury>(@Pulse).fee_basis_points
    }

    #[view]
    public fun is_initialized(): bool {
        exists<Treasury>(@Pulse)
    }
}
