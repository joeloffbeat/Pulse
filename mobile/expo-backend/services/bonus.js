import { getSharedAptosClient, PULSE_ADDRESS } from './config.js';

const aptos = getSharedAptosClient();

/**
 * Get user's bonus balance
 */
export async function getBonusBalance(address) {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::bonus::get_bonus_balance`,
                typeArguments: [],
                functionArguments: [address],
            },
        });
        return result[0] || 0;
    } catch (error) {
        console.error('Error fetching bonus balance:', error);
        return 0;
    }
}

/**
 * Check if user has claimed welcome bonus
 */
export async function hasClaimedWelcomeBonus(address) {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::bonus::has_claimed_welcome_bonus`,
                typeArguments: [],
                functionArguments: [address],
            },
        });
        return result[0] || false;
    } catch (error) {
        console.error('Error checking bonus claim:', error);
        return false;
    }
}

/**
 * Get welcome bonus amount constant
 */
export async function getWelcomeBonusAmount() {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::bonus::get_welcome_bonus_amount`,
                typeArguments: [],
                functionArguments: [],
            },
        });
        return result[0] || 100_000_000; // Default 1 MOVE
    } catch (error) {
        console.error('Error fetching bonus amount:', error);
        return 100_000_000;
    }
}

/**
 * Get global bonus stats
 */
export async function getBonusStats() {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::bonus::get_bonus_stats`,
                typeArguments: [],
                functionArguments: [],
            },
        });
        return {
            totalIssued: result[0] || 0,
            totalUsed: result[1] || 0,
        };
    } catch (error) {
        console.error('Error fetching bonus stats:', error);
        return { totalIssued: 0, totalUsed: 0 };
    }
}
