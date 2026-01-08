import { getSharedAptosClient, PULSE_ADDRESS } from './config.js';

const aptos = getSharedAptosClient();

/**
 * Get referral stats for an address
 */
export async function getReferralStats(address) {
    try {
        const [countResult, earningsResult] = await Promise.all([
            aptos.view({
                payload: {
                    function: `${PULSE_ADDRESS}::referral::get_referral_count`,
                    typeArguments: [],
                    functionArguments: [address],
                },
            }),
            aptos.view({
                payload: {
                    function: `${PULSE_ADDRESS}::referral::get_referral_earnings`,
                    typeArguments: [],
                    functionArguments: [address],
                },
            }),
        ]);

        return {
            referralCount: parseInt(countResult[0]) || 0,
            totalEarnings: parseInt(earningsResult[0]) || 0,
        };
    } catch (error) {
        console.error('Error fetching referral stats:', error);
        return { referralCount: 0, totalEarnings: 0 };
    }
}

/**
 * Check if user has a referrer
 */
export async function hasReferrer(address) {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::referral::has_referrer`,
                typeArguments: [],
                functionArguments: [address],
            },
        });
        return result[0] || false;
    } catch (error) {
        console.error('Error checking referrer:', error);
        return false;
    }
}

/**
 * Get the referrer address for a user
 */
export async function getReferrer(address) {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::referral::get_referrer`,
                typeArguments: [],
                functionArguments: [address],
            },
        });
        // Result is an Option type, extract the value if present
        if (result[0] && result[0].vec && result[0].vec.length > 0) {
            return result[0].vec[0];
        }
        return null;
    } catch (error) {
        console.error('Error fetching referrer:', error);
        return null;
    }
}
