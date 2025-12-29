/// Bonus module for Pulse - Handles welcome bonuses and credits
module Pulse::bonus {
    use std::signer;
    use aptos_framework::event;

    // Error Codes
    const E_NOT_ADMIN: u64 = 301;
    const E_BONUS_ALREADY_CLAIMED: u64 = 302;
    const E_INSUFFICIENT_BONUS: u64 = 303;
    const E_ALREADY_INITIALIZED: u64 = 304;

    // Constants
    const WELCOME_BONUS_AMOUNT: u64 = 100_000_000; // $1 = 1 MOVE (8 decimals)

    /// Global bonus configuration
    struct BonusRegistry has key {
        admin: address,
        total_bonus_issued: u64,
        total_bonus_used: u64,
    }

    /// Individual user bonus balance
    struct UserBonus has key {
        amount: u64,          // Current bonus balance
        claimed: bool,        // Whether welcome bonus was claimed
        used: u64,            // Total bonus amount used
    }

    #[event]
    struct BonusClaimed has drop, store {
        user: address,
        amount: u64,
    }

    #[event]
    struct BonusUsed has drop, store {
        user: address,
        amount: u64,
        remaining: u64,
    }

    /// Initialize bonus registry
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<BonusRegistry>(admin_addr), E_ALREADY_INITIALIZED);

        move_to(admin, BonusRegistry {
            admin: admin_addr,
            total_bonus_issued: 0,
            total_bonus_used: 0,
        });
    }

    /// Claim welcome bonus (one-time per address)
    public entry fun claim_welcome_bonus(user: &signer) acquires BonusRegistry, UserBonus {
        let user_addr = signer::address_of(user);

        // Check if user already has bonus
        if (exists<UserBonus>(user_addr)) {
            let bonus = borrow_global<UserBonus>(user_addr);
            assert!(!bonus.claimed, E_BONUS_ALREADY_CLAIMED);
        };

        // Create or update user bonus
        if (!exists<UserBonus>(user_addr)) {
            move_to(user, UserBonus {
                amount: WELCOME_BONUS_AMOUNT,
                claimed: true,
                used: 0,
            });
        } else {
            let bonus = borrow_global_mut<UserBonus>(user_addr);
            bonus.amount = bonus.amount + WELCOME_BONUS_AMOUNT;
            bonus.claimed = true;
        };

        // Update registry
        let registry = borrow_global_mut<BonusRegistry>(@Pulse);
        registry.total_bonus_issued = registry.total_bonus_issued + WELCOME_BONUS_AMOUNT;

        event::emit(BonusClaimed {
            user: user_addr,
            amount: WELCOME_BONUS_AMOUNT,
        });
    }

    /// Use bonus for bet (returns amount actually used from bonus)
    public entry fun use_bonus(
        user: &signer,
        amount: u64,
    ) acquires BonusRegistry, UserBonus {
        let user_addr = signer::address_of(user);
        assert!(exists<UserBonus>(user_addr), E_INSUFFICIENT_BONUS);

        let bonus = borrow_global_mut<UserBonus>(user_addr);
        let available = bonus.amount - bonus.used;
        let to_use = if (amount <= available) { amount } else { available };

        bonus.used = bonus.used + to_use;

        // Update registry
        let registry = borrow_global_mut<BonusRegistry>(@Pulse);
        registry.total_bonus_used = registry.total_bonus_used + to_use;

        event::emit(BonusUsed {
            user: user_addr,
            amount: to_use,
            remaining: bonus.amount - bonus.used,
        });
    }

    // ============ View Functions ============

    #[view]
    public fun get_bonus_balance(user_addr: address): u64 acquires UserBonus {
        if (!exists<UserBonus>(user_addr)) {
            return 0
        };
        let bonus = borrow_global<UserBonus>(user_addr);
        bonus.amount - bonus.used
    }

    #[view]
    public fun has_claimed_welcome_bonus(user_addr: address): bool acquires UserBonus {
        if (!exists<UserBonus>(user_addr)) {
            return false
        };
        borrow_global<UserBonus>(user_addr).claimed
    }

    #[view]
    public fun get_welcome_bonus_amount(): u64 {
        WELCOME_BONUS_AMOUNT
    }

    #[view]
    public fun get_bonus_stats(): (u64, u64) acquires BonusRegistry {
        let registry = borrow_global<BonusRegistry>(@Pulse);
        (registry.total_bonus_issued, registry.total_bonus_used)
    }
}
