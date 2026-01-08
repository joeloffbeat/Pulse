/**
 * Resolution Worker
 *
 * Runs every minute to check for markets ready to resolve.
 * For Pyth oracle markets, fetches price and resolves on-chain.
 */

import dotenv from 'dotenv';
dotenv.config();

import * as resolution from '../services/resolution.js';
import { getLatestPrices } from '../services/pyth.js';
import { getSharedAptosClient, PULSE_ADDRESS } from '../services/config.js';

const POLL_INTERVAL = 60_000; // 1 minute
const aptos = getSharedAptosClient();

async function getMarketsToResolve() {
    try {
        // Get all markets and filter locally
        const result = await aptos.view({
            payload: {
                function: `${PULSE_ADDRESS}::market_views::get_active_markets`,
                typeArguments: [],
                functionArguments: [],
            },
        });

        const markets = result[0] || [];
        const now = Math.floor(Date.now() / 1000);

        // Filter markets that are past resolution time but not settled
        return markets.filter(m => {
            const resolutionTime = parseInt(m.resolution_time);
            const hasOracle = m.oracle_config && m.oracle_config.vec && m.oracle_config.vec.length > 0;
            return resolutionTime <= now && !m.settled && hasOracle;
        });
    } catch (error) {
        console.error('Error fetching markets to resolve:', error);
        return [];
    }
}

async function checkAndResolveMarkets() {
    console.log(`[${new Date().toISOString()}] Checking for markets to resolve...`);

    try {
        const pendingMarkets = await getMarketsToResolve();

        if (pendingMarkets.length === 0) {
            console.log('No markets pending resolution.');
            return;
        }

        console.log(`Found ${pendingMarkets.length} markets pending resolution.`);

        // Get latest prices for logging
        const prices = await getLatestPrices();
        console.log('Current prices:', Object.entries(prices).map(([k, v]) => `${k}: $${v.price.toFixed(2)}`).join(', '));

        for (const market of pendingMarkets) {
            const marketId = market.id;
            const oracleConfig = market.oracle_config.vec[0];
            const feedId = '0x' + Buffer.from(oracleConfig.feed_id).toString('hex');

            console.log(`\nResolving market ${marketId}...`);
            console.log(`  Question: ${market.question}`);
            console.log(`  Feed ID: ${feedId}`);
            console.log(`  Threshold: ${oracleConfig.threshold}`);
            console.log(`  Is Above: ${oracleConfig.is_above}`);

            try {
                const result = await resolution.resolveMarketWithOracle(marketId, feedId);
                console.log(`  ✅ Resolved! TX: ${result.transactionHash}`);
            } catch (error) {
                console.error(`  ❌ Failed to resolve market ${marketId}:`, error.message);
            }
        }
    } catch (error) {
        console.error('Error in resolution worker:', error);
    }
}

// Start worker
console.log('Starting Pulse Resolution Worker...');
console.log(`Pulse Address: ${PULSE_ADDRESS}`);
console.log(`Poll Interval: ${POLL_INTERVAL / 1000}s`);
console.log('---');

// Run immediately on start
checkAndResolveMarkets();

// Then run on interval
setInterval(checkAndResolveMarkets, POLL_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down resolution worker...');
    process.exit(0);
});
