import { HermesClient } from '@pythnetwork/hermes-client';

// Pyth Hermes endpoint
const HERMES_ENDPOINT = 'https://hermes.pyth.network';
const client = new HermesClient(HERMES_ENDPOINT);

// Price feed IDs (with 0x prefix for API)
export const PRICE_FEEDS = {
    BTC_USD: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    ETH_USD: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    MOVE_USD: '0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5', // APT proxy
    SOL_USD: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
};

// Cache for prices (1 second TTL)
let priceCache = {};
let lastFetch = 0;
const CACHE_TTL = 1000; // 1 second

/**
 * Get latest prices for all supported feeds
 */
export async function getLatestPrices() {
    const now = Date.now();
    if (now - lastFetch < CACHE_TTL && Object.keys(priceCache).length > 0) {
        return priceCache;
    }

    try {
        const feedIds = Object.values(PRICE_FEEDS);
        const priceUpdates = await client.getLatestPriceUpdates(feedIds);

        const prices = {};
        for (const update of priceUpdates.parsed) {
            const feedId = '0x' + update.id;
            const price = parseFloat(update.price.price) * Math.pow(10, update.price.expo);
            const conf = parseFloat(update.price.conf) * Math.pow(10, update.price.expo);

            // Map feed ID to symbol
            const symbol = Object.keys(PRICE_FEEDS).find(k => PRICE_FEEDS[k] === feedId);
            if (symbol) {
                prices[symbol] = {
                    price: price,
                    confidence: conf,
                    timestamp: update.price.publish_time,
                    feedId: feedId,
                };
            }
        }

        priceCache = prices;
        lastFetch = now;
        return prices;
    } catch (error) {
        console.error('Error fetching Pyth prices:', error);
        throw error;
    }
}

/**
 * Get price for specific feed
 */
export async function getPrice(symbol) {
    const prices = await getLatestPrices();
    return prices[symbol] || null;
}

/**
 * Get price update VAA for contract calls
 * This is needed for on-chain price verification
 */
export async function getPriceUpdateData(feedIds) {
    try {
        const priceUpdates = await client.getLatestPriceUpdates(feedIds);
        // Return the binary update data for contract calls
        return priceUpdates.binary.data;
    } catch (error) {
        console.error('Error fetching price update data:', error);
        throw error;
    }
}

/**
 * Get price at specific timestamp (for historical)
 */
export async function getPriceAtTime(feedId, timestamp) {
    try {
        const priceUpdate = await client.getPriceUpdatesAtTimestamp(timestamp, [feedId]);
        if (priceUpdate.parsed.length > 0) {
            const update = priceUpdate.parsed[0];
            return {
                price: parseFloat(update.price.price) * Math.pow(10, update.price.expo),
                timestamp: update.price.publish_time,
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching historical price:', error);
        throw error;
    }
}
