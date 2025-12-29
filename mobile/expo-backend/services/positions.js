import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { PULSE_ADDRESS } from './markets.js';

const MOVEMENT_TESTNET_FULLNODE = 'https://testnet.movementnetwork.xyz/v1';

const aptosConfig = new AptosConfig({
    network: Network.CUSTOM,
    fullnode: MOVEMENT_TESTNET_FULLNODE,
});
const aptos = new Aptos(aptosConfig);

// Get user's positions
export async function getUserPositions(userAddress) {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::position::get_user_positions`,
                typeArguments: [],
                functionArguments: [userAddress],
            },
        });
        return result[0] || [];
    } catch (error) {
        console.error('Error fetching user positions:', error);
        throw error;
    }
}

// Get user's active (unsettled) positions
export async function getUserActivePositions(userAddress) {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::position::get_user_active_positions`,
                typeArguments: [],
                functionArguments: [userAddress],
            },
        });
        return result[0] || [];
    } catch (error) {
        console.error('Error fetching active positions:', error);
        throw error;
    }
}

// Get user's claimable (won but not claimed) positions
export async function getUserClaimablePositions(userAddress) {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::position::get_user_claimable_positions`,
                typeArguments: [],
                functionArguments: [userAddress],
            },
        });
        return result[0] || [];
    } catch (error) {
        console.error('Error fetching claimable positions:', error);
        throw error;
    }
}

// Get user stats
export async function getUserStats(userAddress) {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::position::get_user_stats`,
                typeArguments: [],
                functionArguments: [userAddress],
            },
        });
        const [totalBets, totalWon, totalVolume] = result;
        return { totalBets, totalWon, totalVolume };
    } catch (error) {
        console.error('Error fetching user stats:', error);
        throw error;
    }
}
