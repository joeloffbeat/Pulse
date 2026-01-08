/**
 * Centralized configuration for Aptos/Movement SDK
 * Uses Shinami Node Service when API key is available
 */

import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Shinami API Configuration
const SHINAMI_API_KEY = process.env.SHINAMI_API_KEY;
const SHINAMI_NODE_SERVICE_URL = 'https://api.shinami.com/aptos/node/v1';
const MOVEMENT_TESTNET_RPC = 'https://testnet.movementnetwork.xyz/v1';

/**
 * Get the RPC URL (Shinami Node Service or fallback)
 */
export function getRpcUrl() {
    if (SHINAMI_API_KEY) {
        return `${SHINAMI_NODE_SERVICE_URL}/${SHINAMI_API_KEY}`;
    }
    return MOVEMENT_TESTNET_RPC;
}

/**
 * Get a configured Aptos client instance
 */
export function getAptosClient() {
    const aptosConfig = new AptosConfig({
        network: Network.CUSTOM,
        fullnode: getRpcUrl(),
    });
    return new Aptos(aptosConfig);
}

// Shared Aptos client instance
let _aptosClient = null;

/**
 * Get the shared Aptos client (singleton)
 */
export function getSharedAptosClient() {
    if (!_aptosClient) {
        _aptosClient = getAptosClient();
    }
    return _aptosClient;
}

// Contract address
export const PULSE_ADDRESS = '0x78a349ed835712bb5056761595110896ccf3497de4ef8af46acf8cc719b32e8e';

export default {
    getRpcUrl,
    getAptosClient,
    getSharedAptosClient,
    PULSE_ADDRESS,
};
