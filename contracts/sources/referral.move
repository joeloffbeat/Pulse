/// Referral tracking for Pulse
module Pulse::referral {
    use std::signer;
    use std::option::{Self, Option};
    use aptos_framework::simple_map::{Self, SimpleMap};
    use aptos_framework::event;

    // Error codes
    const E_ALREADY_INITIALIZED: u64 = 1;
    const E_NOT_INITIALIZED: u64 = 2;
    const E_ALREADY_REFERRED: u64 = 3;
    const E_SELF_REFERRAL: u64 = 4;

    // Referral bonus (5% of first bet in basis points)
    const REFERRAL_BONUS_BPS: u64 = 500;

    /// Tracks referral relationships
    struct ReferralRegistry has key {
        // User -> Referrer mapping
        referrals: SimpleMap<address, address>,
        // Referrer -> Total referred users count
        referral_counts: SimpleMap<address, u64>,
        // Referrer -> Total bonus earned
        referral_earnings: SimpleMap<address, u64>,
    }

    #[event]
    struct ReferralRegistered has drop, store {
        user: address,
        referrer: address,
    }

    #[event]
    struct ReferralBonusPaid has drop, store {
        referrer: address,
        user: address,
        amount: u64,
    }

    /// Initialize referral registry
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<ReferralRegistry>(admin_addr), E_ALREADY_INITIALIZED);

        move_to(admin, ReferralRegistry {
            referrals: simple_map::new(),
            referral_counts: simple_map::new(),
            referral_earnings: simple_map::new(),
        });
    }

    /// Register a referral (called when user signs up with referral code)
    public entry fun register_referral(
        user: &signer,
        referrer: address,
    ) acquires ReferralRegistry {
        let user_addr = signer::address_of(user);
        assert!(user_addr != referrer, E_SELF_REFERRAL);

        let registry = borrow_global_mut<ReferralRegistry>(@Pulse);

        // Check if user already has a referrer
        assert!(!simple_map::contains_key(&registry.referrals, &user_addr), E_ALREADY_REFERRED);

        // Register the referral
        simple_map::add(&mut registry.referrals, user_addr, referrer);

        // Increment referrer's count
        if (simple_map::contains_key(&registry.referral_counts, &referrer)) {
            let count = simple_map::borrow_mut(&mut registry.referral_counts, &referrer);
            *count = *count + 1;
        } else {
            simple_map::add(&mut registry.referral_counts, referrer, 1);
        };

        event::emit(ReferralRegistered { user: user_addr, referrer });
    }

    /// Called by position module when user places first bet
    /// Returns bonus amount to credit referrer
    public fun process_first_bet_bonus(
        user_addr: address,
        bet_amount: u64,
    ): (address, u64) acquires ReferralRegistry {
        let registry = borrow_global_mut<ReferralRegistry>(@Pulse);

        // Check if user has a referrer
        if (!simple_map::contains_key(&registry.referrals, &user_addr)) {
            return (@0x0, 0)
        };

        let referrer = *simple_map::borrow(&registry.referrals, &user_addr);

        // Calculate bonus (5% of bet amount)
        let bonus = (bet_amount * REFERRAL_BONUS_BPS) / 10000;

        // Track earnings
        if (simple_map::contains_key(&registry.referral_earnings, &referrer)) {
            let earnings = simple_map::borrow_mut(&mut registry.referral_earnings, &referrer);
            *earnings = *earnings + bonus;
        } else {
            simple_map::add(&mut registry.referral_earnings, referrer, bonus);
        };

        event::emit(ReferralBonusPaid { referrer, user: user_addr, amount: bonus });

        (referrer, bonus)
    }

    // View functions

    #[view]
    public fun get_referrer(user: address): Option<address> acquires ReferralRegistry {
        let registry = borrow_global<ReferralRegistry>(@Pulse);
        if (simple_map::contains_key(&registry.referrals, &user)) {
            option::some(*simple_map::borrow(&registry.referrals, &user))
        } else {
            option::none()
        }
    }

    #[view]
    public fun get_referral_count(referrer: address): u64 acquires ReferralRegistry {
        let registry = borrow_global<ReferralRegistry>(@Pulse);
        if (simple_map::contains_key(&registry.referral_counts, &referrer)) {
            *simple_map::borrow(&registry.referral_counts, &referrer)
        } else {
            0
        }
    }

    #[view]
    public fun get_referral_earnings(referrer: address): u64 acquires ReferralRegistry {
        let registry = borrow_global<ReferralRegistry>(@Pulse);
        if (simple_map::contains_key(&registry.referral_earnings, &referrer)) {
            *simple_map::borrow(&registry.referral_earnings, &referrer)
        } else {
            0
        }
    }

    #[view]
    public fun has_referrer(user: address): bool acquires ReferralRegistry {
        let registry = borrow_global<ReferralRegistry>(@Pulse);
        simple_map::contains_key(&registry.referrals, &user)
    }
}
