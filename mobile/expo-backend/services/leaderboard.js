import { getUserStats } from './positions.js';

// In-memory cache for leaderboard (in production, use Redis)
let leaderboardCache = {
    daily: [],
    weekly: [],
    allTime: [],
    lastUpdated: 0,
};

const CACHE_TTL = 60 * 1000; // 1 minute

// For MVP, we'll track users who have interacted
// In production, this would be an indexer
const knownUsers = new Set();

export function addKnownUser(address) {
    knownUsers.add(address);
}

export async function updateLeaderboard() {
    const now = Date.now();
    if (now - leaderboardCache.lastUpdated < CACHE_TTL) {
        return leaderboardCache;
    }

    const entries = [];
    for (const address of knownUsers) {
        try {
            const stats = await getUserStats(address);
            const winRate = stats.totalBets > 0
                ? (stats.totalWon / stats.totalBets) * 100
                : 0;

            entries.push({
                address,
                totalBets: stats.totalBets,
                totalWon: stats.totalWon,
                totalVolume: stats.totalVolume,
                winRate,
                // Profit calculation would need historical data
                profit: 0,
            });
        } catch (error) {
            console.error(`Error fetching stats for ${address}:`, error);
        }
    }

    // Sort by win rate, then by total volume
    entries.sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.totalVolume - a.totalVolume;
    });

    leaderboardCache = {
        daily: entries.slice(0, 10),
        weekly: entries.slice(0, 10),
        allTime: entries.slice(0, 10),
        lastUpdated: now,
    };

    return leaderboardCache;
}

export async function getLeaderboard(period = 'daily') {
    const cache = await updateLeaderboard();
    return cache[period] || cache.daily;
}
