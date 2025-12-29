/// Oracle module for Pulse - Integrates Pyth Network price feeds for market resolution
module Pulse::oracle {
    use pyth::pyth;
    use pyth::price::Price;
    use pyth::price_identifier;
    use pyth::i64::{Self, I64};
    use aptos_framework::coin;

    // Error codes
    const E_PRICE_TOO_OLD: u64 = 1;
    const E_INVALID_FEED: u64 = 2;

    // Price feed IDs (without 0x prefix)
    // BTC/USD: e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43
    // ETH/USD: ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
    // APT/USD (proxy for MOVE): 03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5

    /// Get BTC price from Pyth
    public fun get_btc_price(
        user: &signer,
        pyth_price_update: vector<vector<u8>>
    ): Price {
        let feed_id = x"e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";
        get_price_internal(user, pyth_price_update, feed_id)
    }

    /// Get ETH price from Pyth
    public fun get_eth_price(
        user: &signer,
        pyth_price_update: vector<vector<u8>>
    ): Price {
        let feed_id = x"ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";
        get_price_internal(user, pyth_price_update, feed_id)
    }

    /// Get MOVE/APT price from Pyth
    public fun get_move_price(
        user: &signer,
        pyth_price_update: vector<vector<u8>>
    ): Price {
        let feed_id = x"03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5";
        get_price_internal(user, pyth_price_update, feed_id)
    }

    /// Get price for any supported feed
    public fun get_price(
        user: &signer,
        pyth_price_update: vector<vector<u8>>,
        feed_id: vector<u8>
    ): Price {
        get_price_internal(user, pyth_price_update, feed_id)
    }

    /// Check if price is above threshold (for resolution)
    /// threshold should be in the same format as Pyth price (with expo applied)
    public fun is_price_above_threshold(
        user: &signer,
        pyth_price_update: vector<vector<u8>>,
        feed_id: vector<u8>,
        threshold: u64
    ): bool {
        let price = get_price_internal(user, pyth_price_update, feed_id);
        let price_i64 = pyth::price::get_price(&price);
        // Convert I64 to u64 for comparison (prices are positive)
        let price_u64 = i64::get_magnitude_if_positive(&price_i64);
        price_u64 >= threshold
    }

    /// Internal price fetching
    fun get_price_internal(
        user: &signer,
        pyth_price_update: vector<vector<u8>>,
        feed_id: vector<u8>
    ): Price {
        // Pay update fee and update prices
        let coins = coin::withdraw(user, pyth::get_update_fee(&pyth_price_update));
        pyth::update_price_feeds(pyth_price_update, coins);

        // Get price from feed
        let price_id = price_identifier::from_byte_vec(feed_id);
        pyth::get_price(price_id)
    }

    /// Extract price value as u64 (magnitude only, for positive prices)
    public fun get_price_as_u64(price: &Price): u64 {
        let price_i64 = pyth::price::get_price(price);
        i64::get_magnitude_if_positive(&price_i64)
    }

    /// Get confidence interval
    public fun get_confidence(price: &Price): u64 {
        pyth::price::get_conf(price)
    }

    /// Get exponent (for price scaling)
    public fun get_expo(price: &Price): I64 {
        pyth::price::get_expo(price)
    }

    /// Get timestamp
    public fun get_timestamp(price: &Price): u64 {
        pyth::price::get_timestamp(price)
    }

    // View functions for feed IDs
    #[view]
    public fun get_btc_feed_id(): vector<u8> {
        x"e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"
    }

    #[view]
    public fun get_eth_feed_id(): vector<u8> {
        x"ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
    }

    #[view]
    public fun get_move_feed_id(): vector<u8> {
        x"03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5"
    }
}
