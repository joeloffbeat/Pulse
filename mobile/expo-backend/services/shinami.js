/**
 * Shinami Gas Station & Node Service Integration
 *
 * Provides:
 * - Gas Station: Sponsor transactions for gasless UX
 * - Node Service: Reliable RPC endpoints for Movement
 */

import fetch from 'node-fetch';

const SHINAMI_GAS_STATION_URL = 'https://api.shinami.com/aptos/gas/v1';
const SHINAMI_NODE_SERVICE_URL = 'https://api.shinami.com/aptos/node/v1';
const MOVEMENT_TESTNET_RPC = 'https://testnet.movementnetwork.xyz/v1';

/**
 * Get Shinami API key (read at call time, after dotenv loads)
 */
function getShinamiKey() {
    return process.env.SHINAMI_KEY;
}

/**
 * Get the RPC URL to use (Shinami Node Service or fallback)
 */
export function getRpcUrl() {
    const key = getShinamiKey();
    if (key) {
        return `${SHINAMI_NODE_SERVICE_URL}/${key}`;
    }
    console.warn('⚠️ SHINAMI_KEY not set, using Movement testnet RPC');
    return MOVEMENT_TESTNET_RPC;
}

/**
 * Check if Shinami Gas Station is configured
 */
export function isGasStationEnabled() {
    return !!getShinamiKey();
}

/**
 * Sponsor a transaction using Shinami Gas Station
 */
export async function sponsorTransaction({ sender, transactionBytes }) {
    const key = getShinamiKey();
    if (!key) {
        throw new Error('Shinami API key not configured');
    }

    const response = await fetch(SHINAMI_GAS_STATION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': key,
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'gas_sponsorTransaction',
            params: { sender, transaction: transactionBytes },
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
 */
export async function getSponsorshipStatus(transactionHash) {
    const key = getShinamiKey();
    if (!key) {
        throw new Error('Shinami API key not configured');
    }

    const response = await fetch(SHINAMI_GAS_STATION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': key,
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'gas_getSponsoredTransactionStatus',
            params: { transactionHash },
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
 */
export async function getGasFundInfo() {
    const key = getShinamiKey();
    if (!key) {
        throw new Error('Shinami API key not configured');
    }

    const response = await fetch(SHINAMI_GAS_STATION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': key,
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
 * Functions to sponsor (gasless for users)
 * P0: Core user actions
 * P1: Onboarding & growth
 */
const SPONSORED_FUNCTIONS = [
    '::position::place_bet',
    '::position::claim_winnings',
    '::bonus::claim_welcome_bonus',
    '::referral::register_referral',
];

/**
 * Check if a function should be sponsored
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
