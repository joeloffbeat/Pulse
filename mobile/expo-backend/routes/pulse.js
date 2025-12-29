import express from 'express';
import * as markets from '../services/markets.js';
import * as positions from '../services/positions.js';
import * as leaderboard from '../services/leaderboard.js';
import * as pyth from '../services/pyth.js';
import * as referral from '../services/referral.js';
import * as resolution from '../services/resolution.js';
import * as bonus from '../services/bonus.js';

const router = express.Router();

// ======================================
// MARKETS ROUTES
// ======================================

// Get active markets
router.get('/markets', async (req, res) => {
    try {
        const activeMarkets = await markets.getActiveMarkets();
        res.json({ success: true, markets: activeMarkets });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch markets' });
    }
});

// Get single market
router.get('/markets/:id', async (req, res) => {
    try {
        const market = await markets.getMarket(req.params.id);
        res.json({ success: true, market });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch market' });
    }
});

// Calculate payout
router.post('/markets/:id/payout', async (req, res) => {
    const { isYes, amount } = req.body;
    try {
        const payout = await markets.calculatePayout(
            req.params.id,
            isYes,
            amount
        );
        res.json({ success: true, payout });
    } catch (error) {
        res.status(500).json({ error: 'Failed to calculate payout' });
    }
});

// ======================================
// POSITIONS ROUTES
// ======================================

// Get user positions
router.get('/positions/:address', async (req, res) => {
    try {
        const userPositions = await positions.getUserPositions(req.params.address);
        res.json({ success: true, positions: userPositions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch positions' });
    }
});

// Get user active positions
router.get('/positions/:address/active', async (req, res) => {
    try {
        const activePositions = await positions.getUserActivePositions(req.params.address);
        res.json({ success: true, positions: activePositions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch active positions' });
    }
});

// Get user claimable positions
router.get('/positions/:address/claimable', async (req, res) => {
    try {
        const claimable = await positions.getUserClaimablePositions(req.params.address);
        res.json({ success: true, positions: claimable });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch claimable positions' });
    }
});

// Get user stats
router.get('/stats/:address', async (req, res) => {
    try {
        const stats = await positions.getUserStats(req.params.address);
        leaderboard.addKnownUser(req.params.address);
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});

// ======================================
// LEADERBOARD ROUTES
// ======================================

router.get('/leaderboard', async (req, res) => {
    const period = req.query.period || 'daily';
    try {
        const data = await leaderboard.getLeaderboard(period);
        res.json({ success: true, leaderboard: data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// ======================================
// PRICE ROUTES
// ======================================

// Get available price feeds
router.get('/prices/feeds', (req, res) => {
    res.json({
        success: true,
        feeds: Object.entries(pyth.PRICE_FEEDS).map(([symbol, feedId]) => ({
            symbol,
            feedId,
        })),
    });
});

// Get all current prices
router.get('/prices', async (req, res) => {
    try {
        const prices = await pyth.getLatestPrices();
        res.json({ success: true, prices });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

// Get specific price
router.get('/prices/:symbol', async (req, res) => {
    try {
        const price = await pyth.getPrice(req.params.symbol.toUpperCase());
        if (!price) {
            return res.status(404).json({ error: 'Price feed not found' });
        }
        res.json({ success: true, ...price });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch price' });
    }
});

// Get price update data for contract calls
router.post('/prices/update-data', async (req, res) => {
    const { feedIds } = req.body;
    if (!feedIds || !Array.isArray(feedIds)) {
        return res.status(400).json({ error: 'feedIds array required' });
    }
    try {
        const updateData = await pyth.getPriceUpdateData(feedIds);
        res.json({ success: true, updateData });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch update data' });
    }
});

// ======================================
// REFERRAL ROUTES
// ======================================

// Get referral stats for user
router.get('/referrals/:address', async (req, res) => {
    try {
        const stats = await referral.getReferralStats(req.params.address);
        res.json({ success: true, ...stats });
    } catch (error) {
        res.json({ success: true, referralCount: 0, totalEarnings: 0 });
    }
});

// Check if user has referrer
router.get('/referrals/:address/has-referrer', async (req, res) => {
    try {
        const hasReferrer = await referral.hasReferrer(req.params.address);
        res.json({ success: true, hasReferrer });
    } catch (error) {
        res.json({ success: true, hasReferrer: false });
    }
});

// ======================================
// RESOLUTION ROUTES
// ======================================

// Get markets pending resolution
router.get('/markets/pending-resolution', async (req, res) => {
    try {
        const pendingMarkets = await resolution.getPendingResolutionMarkets();
        res.json({ success: true, markets: pendingMarkets });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending markets' });
    }
});

// Resolve a market using oracle
router.post('/markets/:id/resolve-oracle', async (req, res) => {
    const marketId = req.params.id;
    try {
        const oracleConfig = await resolution.getMarketOracleConfig(marketId);
        if (!oracleConfig) {
            return res.status(400).json({
                success: false,
                error: 'Market does not have oracle configuration',
            });
        }

        const feedId = '0x' + Buffer.from(oracleConfig.feed_id).toString('hex');
        const result = await resolution.resolveMarketWithOracle(marketId, feedId);

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to resolve market',
        });
    }
});

// ======================================
// BONUS ROUTES
// ======================================

// Get user bonus balance
router.get('/bonus/:address', async (req, res) => {
    try {
        const balance = await bonus.getBonusBalance(req.params.address);
        const hasClaimed = await bonus.hasClaimedWelcomeBonus(req.params.address);
        res.json({
            success: true,
            balance,
            hasClaimed,
            balanceFormatted: (balance / 1e8).toFixed(2),
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bonus balance' });
    }
});

// Get welcome bonus amount
router.get('/bonus/welcome-amount', async (req, res) => {
    try {
        const amount = await bonus.getWelcomeBonusAmount();
        res.json({
            success: true,
            amount,
            amountFormatted: (amount / 1e8).toFixed(2),
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bonus amount' });
    }
});

// Get global bonus stats
router.get('/bonus-stats', async (req, res) => {
    try {
        const stats = await bonus.getBonusStats();
        res.json({ success: true, ...stats });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bonus stats' });
    }
});

export default router;
