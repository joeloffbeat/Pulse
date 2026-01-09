/// Oracle module for Pulse - Simplified version without Pyth dependency
/// Note: For production, integrate actual Pyth oracle when available on Movement
module Pulse::oracle {
    // Error codes
    const E_PRICE_TOO_OLD: u64 = 1;
    const E_INVALID_FEED: u64 = 2;

    // Price feed IDs (without 0x prefix)
    // BTC/USD: e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43
    // ETH/USD: ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
    // APT/USD (proxy for MOVE): 03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5

    /// Check if price is above threshold (for resolution)
    /// Simplified version - returns true for demo purposes
    /// In production, this would call Pyth oracle
    public fun is_price_above_threshold(
        _user: &signer,
        _pyth_price_update: vector<vector<u8>>,
        _feed_id: vector<u8>,
        _threshold: u64
    ): bool {
        // Simplified: always return true for demo
        // TODO: Integrate Pyth when available on Movement testnet
        true
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
