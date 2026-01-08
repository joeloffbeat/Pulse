/**
 * Shinami Gas Station & Node Service Integration
 *
 * Provides:
 * - Gas Station: Sponsor transactions for gasless UX
 * - Node Service: Reliable RPC endpoints for Movement
 */

import fetch from 'node-fetch';

// Shinami API Configuration
const SHINAMI_API_KEY = process.env.SHINAMI_API_KEY;
const SHINAMI_GAS_STATION_URL = 'https://api.shinami.com/aptos/gas/v1';
const SHINAMI_NODE_SERVICE_URL = 'https://api.shinami.com/aptos/node/v1';

// Fallback to Movement testnet if Shinami not configured
const MOVEMENT_TESTNET_RPC = 'https://testnet.movementnetwork.xyz/v1';

/**
 * Get the RPC URL to use (Shinami Node Service or fallback)
 */
export function getRpcUrl() {
    if (SHINAMI_API_KEY) {
        return `${SHINAMI_NODE_SERVICE_URL}/${SHINAMI_API_KEY}`;
    }
    console.warn('⚠️ SHINAMI_API_KEY not set, using Movement testnet RPC');
    return MOVEMENT_TESTNET_RPC;
}

/**
 * Check if Shinami Gas Station is configured
 */
export function isGasStationEnabled() {
    return !!SHINAMI_API_KEY;
}

/**
 * Sponsor a transaction using Shinami Gas Station
 *
 * @param {Object} params - Sponsorship parameters
 * @param {string} params.sender - Sender address
 * @param {string} params.transactionBytes - BCS-serialized transaction (hex)
 * @returns {Promise<Object>} Sponsored transaction data
 */
export async function sponsorTransaction({ sender, transactionBytes }) {
    if (!SHINAMI_API_KEY) {
        throw new Error('Shinami API key not configured');
    }

    const response = await fetch(SHINAMI_GAS_STATION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': SHINAMI_API_KEY,
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'gas_sponsorTransaction',
            params: {
                sender,
                transaction: transactionBytes,
            },
        }),
    });

    const result = await response.json();

    if (result.error) {
        console.error('Shinami sponsorship error:', result.error);
        throw new Error(result.error.message || 'Gas sponsorship failed');
    }

    return result.result;
}

/**
 * Get sponsorship status for a transaction
 *
 * @param {string} transactionHash - Transaction hash to check
 * @returns {Promise<string>} Status: IN_FLIGHT, INVALID, or COMPLETE
 */
export async function getSponsorshipStatus(transactionHash) {
    if (!SHINAMI_API_KEY) {
        throw new Error('Shinami API key not configured');
    }

    const response = await fetch(SHINAMI_GAS_STATION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': SHINAMI_API_KEY,
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'gas_getSponsoredTransactionStatus',
            params: {
                transactionHash,
            },
        }),
    });

    const result = await response.json();

    if (result.error) {
        throw new Error(result.error.message || 'Failed to get status');
    }

    return result.result;
}

/**
 * Get Gas Station fund info
 *
 * @returns {Promise<Object>} Fund balance and metadata
 */
export async function getGasFundInfo() {
    if (!SHINAMI_API_KEY) {
        throw new Error('Shinami API key not configured');
    }

    const response = await fetch(SHINAMI_GAS_STATION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': SHINAMI_API_KEY,
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'gas_getFund',
            params: {},
        }),
    });

    const result = await response.json();

    if (result.error) {
        throw new Error(result.error.message || 'Failed to get fund info');
    }

    return result.result;
}

/**
 * List of functions that should be sponsored (gasless for users)
 * P0: Core user actions
 * P1: Onboarding & growth
 */
const SPONSORED_FUNCTIONS = [
    // P0 - Core user actions
    '::position::place_bet',
    '::position::claim_winnings',
    // P1 - Onboarding & growth
    '::bonus::claim_welcome_bonus',
    '::referral::register_referral',
];

/**
 * Check if a function should be sponsored
 *
 * @param {string} functionName - Full function identifier
 * @returns {boolean} Whether to sponsor this transaction
 */
export function shouldSponsor(functionName) {
    if (!isGasStationEnabled()) {
        return false;
    }

    return SPONSORED_FUNCTIONS.some(pattern => functionName.includes(pattern));
}

export default {
    getRpcUrl,
    isGasStationEnabled,
    sponsorTransaction,
    getSponsorshipStatus,
    getGasFundInfo,
    shouldSponsor,
};
