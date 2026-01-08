import { Ed25519PrivateKey, Account } from '@aptos-labs/ts-sdk';
import { getPriceUpdateData, PRICE_FEEDS } from './pyth.js';
import { getSharedAptosClient, PULSE_ADDRESS } from './config.js';

const aptos = getSharedAptosClient();

/**
 * Get markets pending resolution (resolution_time passed but not settled)
 */
export async function getPendingResolutionMarkets() {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::market_views::get_pending_resolution_markets`,
                typeArguments: [],
                functionArguments: [],
            },
        });
        return result[0] || [];
    } catch (error) {
        console.error('Error fetching pending resolution markets:', error);
        // If view function doesn't exist, fallback to filtering active markets
        return [];
    }
}

/**
 * Get oracle config for a market
 */
export async function getMarketOracleConfig(marketId) {
    try {
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::market_views::get_market`,
                typeArguments: [],
                functionArguments: [marketId.toString()],
            },
        });
        const market = result[0];
        if (market && market.oracle_config && market.oracle_config.vec && market.oracle_config.vec.length > 0) {
            return market.oracle_config.vec[0];
        }
        return null;
    } catch (error) {
        console.error('Error fetching market oracle config:', error);
        return null;
    }
}

/**
 * Resolve a market using oracle price
 */
export async function resolveMarketWithOracle(marketId, feedId) {
    const privateKey = process.env.RESOLVER_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('RESOLVER_PRIVATE_KEY not configured');
    }

    try {
        // Get price update data from Pyth
        const priceUpdateData = await getPriceUpdateData([feedId]);

        // Create account from private key
        const pk = new Ed25519PrivateKey(privateKey);
        const resolver = Account.fromPrivateKey({ privateKey: pk });

        // Build and submit transaction
        const transaction = await aptos.transaction.build.simple({
            sender: resolver.accountAddress,
            data: {
                function: `${PULSE_ADDRESS}::market::resolve_market_with_oracle`,
                typeArguments: [],
                functionArguments: [marketId.toString(), priceUpdateData],
            },
        });

        const pendingTxn = await aptos.signAndSubmitTransaction({
            signer: resolver,
            transaction,
        });

        const executedTxn = await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });

        return {
            success: executedTxn.success,
            transactionHash: executedTxn.hash,
            vmStatus: executedTxn.vm_status,
        };
    } catch (error) {
        console.error(`Error resolving market ${marketId}:`, error);
        throw error;
    }
}

/**
 * Map feed ID to symbol
 */
export function feedIdToSymbol(feedId) {
    const feedIdLower = feedId.toLowerCase();
    for (const [symbol, id] of Object.entries(PRICE_FEEDS)) {
        if (id.toLowerCase() === feedIdLower || id.toLowerCase() === '0x' + feedIdLower) {
            return symbol;
        }
    }
    return null;
}
