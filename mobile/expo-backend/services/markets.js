import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const MOVEMENT_TESTNET_FULLNODE = 'https://testnet.movementnetwork.xyz/v1';
export const PULSE_ADDRESS = process.env.PULSE_ADDRESS || '0x78a349ed835712bb5056761595110896ccf3497de4ef8af46acf8cc719b32e8e';

const aptosConfig = new AptosConfig({
    network: Network.CUSTOM,
    fullnode: MOVEMENT_TESTNET_FULLNODE,
});
const aptos = new Aptos(aptosConfig);

// Get all active markets
export async function getActiveMarkets() {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::market_views::get_active_markets`,
                typeArguments: [],
                functionArguments: [],
            },
        });
        return result[0] || [];
    } catch (error) {
        console.error('Error fetching active markets:', error);
        throw error;
    }
}

// Get single market by ID
export async function getMarket(marketId) {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::market_views::get_market`,
                typeArguments: [],
                functionArguments: [marketId.toString()],
            },
        });
        return result[0];
    } catch (error) {
        console.error('Error fetching market:', error);
        throw error;
    }
}

// Get paginated markets
export async function getMarketsPaginated(offset = 0, limit = 10) {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::market_views::get_markets_paginated`,
                typeArguments: [],
                functionArguments: [offset.toString(), limit.toString()],
            },
        });
        return result[0] || [];
    } catch (error) {
        console.error('Error fetching paginated markets:', error);
        throw error;
    }
}

// Calculate potential payout
export async function calculatePayout(marketId, isYes, amount) {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::market_views::calculate_payout`,
                typeArguments: [],
                functionArguments: [
                    marketId.toString(),
                    isYes,
                    amount.toString(),
                ],
            },
        });
        return result[0];
    } catch (error) {
        console.error('Error calculating payout:', error);
        throw error;
    }
}
