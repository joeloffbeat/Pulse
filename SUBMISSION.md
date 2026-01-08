# Pulse - Hackathon Submission

## Swipe. Predict. Win. The Future of Social Prediction Markets.

---

## 🎯 Problem Statement

### The Prediction Market Paradox

Prediction markets are one of the most powerful tools for aggregating collective intelligence—yet they remain inaccessible to 99% of potential users.

**Current Pain Points:**

| Problem | Impact |
|---------|--------|
| **Complex UX** | Polymarket requires understanding order books, limit orders, and liquidity pools |
| **Wallet Friction** | Users must install MetaMask, secure seed phrases, bridge assets across chains |
| **High Barriers** | Minimum bets of $10-50 exclude casual participants |
| **Slow Settlement** | Ethereum L1 transactions take minutes and cost $5-20 in gas |
| **Desktop-First** | 73% of internet users are mobile-first, yet prediction markets are built for desktop |

### The Missed Opportunity

- **Polymarket** did $1B+ volume in 2024—but only ~50,000 active traders
- **Billions of people** make predictions daily on social media (Twitter polls, sports debates)
- **Gen Z** spends 4+ hours/day on mobile apps with swipe-based interfaces (TikTok, Tinder)

> **The gap:** No one has built a prediction market native to how modern users actually behave.

---

## 💡 Solution: Pulse

**Pulse reimagines prediction markets as a mobile-first, swipe-based game.**

### Core Innovation

```
Traditional Prediction Market          Pulse
─────────────────────────────         ─────
Complex order book UI          →      Swipe right = YES, left = NO
Wallet setup + seed phrases    →      Email login (Privy embedded wallet)
$10-50 minimum bets           →      Start with $0.10
15-second Ethereum txs        →      Sub-second Movement finality
Desktop web app               →      Native mobile experience
```

### How It Works

1. **Open App** → Login with email (no crypto knowledge required)
2. **See Prediction** → "Will BTC hit $100k this week?"
3. **Swipe Right** → You think YES (bullish)
4. **Swipe Left** → You think NO (bearish)
5. **Bet $0.10 - $10** → Confirm with one tap
6. **Win** → Claim your payout instantly

### The "Aha" Moment

> "It's Tinder for predictions"

Users already understand swiping. We just connected it to real-money outcomes on the fastest blockchain.

---

## 🏗️ Technical Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                         MOBILE APP                              │
│                    (React Native + Expo)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Predict    │  │   My Bets    │  │   Profile    │          │
│  │  (Gestures)  │  │  (Positions) │  │   (Stats)    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         └─────────────────┼─────────────────┘                   │
│                           ▼                                     │
│                  ┌─────────────────┐                            │
│                  │  Privy Wallet   │ ← Email Auth               │
│                  │ (Embedded, MPC) │   No seed phrase           │
│                  └────────┬────────┘                            │
└───────────────────────────┼────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                       BACKEND API                               │
│                    (Next.js + Vercel)                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐            │
│  │  Markets   │  │ Positions  │  │ Tx Generation  │            │
│  │   CRUD     │  │  Tracking  │  │  + Submission  │            │
│  └────────────┘  └────────────┘  └────────────────┘            │
│                           │                                     │
│                  ┌────────┴────────┐                            │
│                  │ Shinami Gas     │ ← Gasless transactions     │
│                  │    Station      │   Users never pay gas      │
│                  └────────┬────────┘                            │
└───────────────────────────┼────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                   MOVEMENT BLOCKCHAIN                           │
│              (Porto Testnet → Mainnet)                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    MOVE SMART CONTRACTS                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │   │
│  │  │  market  │  │ position │  │ treasury │  │  bonus  │  │   │
│  │  │  .move   │  │  .move   │  │  .move   │  │  .move  │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                  ┌────────┴────────┐                            │
│                  │   Pyth Oracle   │ ← Real-time price feeds    │
│                  │  (Price Feeds)  │   BTC, ETH, SOL, MOVE      │
│                  └─────────────────┘                            │
└────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Mobile** | React Native + Expo | Cross-platform, 60fps animations |
| **Gestures** | react-native-gesture-handler + Reanimated 3 | Butter-smooth Tinder swipes |
| **Auth** | Privy Embedded Wallets | Email → wallet in 10 seconds |
| **Backend** | Next.js API Routes | Serverless, auto-scaling |
| **Gas Sponsorship** | Shinami Gas Station | Users never see gas fees |
| **Blockchain** | Movement (Move VM) | Sub-second finality, low fees |
| **Smart Contracts** | Move Language | Type-safe, resource-oriented |
| **Oracle** | Pyth Network | Real-time crypto price feeds |
| **State** | Zustand + React Query | Optimistic updates, caching |

### Why Movement?

| Feature | Benefit for Pulse |
|---------|-------------------|
| **Sub-second finality** | Instant bet confirmation UX |
| **~$0.001 gas fees** | Micro-bets ($0.10) economically viable |
| **Move language** | Resource safety prevents double-claims |
| **EVM + Move** | Future interop with Ethereum liquidity |
| **Parallel execution** | Handle viral load (1000s concurrent bets) |

---

## 📱 Product Features

### Core Features (Implemented)

| Feature | Description |
|---------|-------------|
| **Swipe Betting** | Right = YES, Left = NO, Up = Skip |
| **Email Onboarding** | Privy creates wallet silently |
| **Micro-stakes** | Bet as low as $0.10 MOVE |
| **Live Odds** | AMM-style pricing updates in real-time |
| **Gasless Transactions** | Shinami sponsors all gas |
| **Position Tracking** | Active, Won, Lost tabs |
| **One-tap Claims** | Batch claim all winnings |
| **Live Price Feeds** | Pyth oracle integration |

### User Experience

```
┌─────────────────────────────────────┐
│  Will Bitcoin hit $100k by Friday? │
│                                     │
│         ┌───────────────┐          │
│         │     📈 BTC    │          │
│         │   $97,432.50  │          │
│         └───────────────┘          │
│                                     │
│    YES 62%  ████████░░░░  NO 38%   │
│                                     │
│    Win 1.6x          Win 2.6x      │
│                                     │
│    ← SWIPE LEFT    SWIPE RIGHT →   │
│         (NO)            (YES)       │
└─────────────────────────────────────┘
```

---

## 💰 Business Model

### Revenue Streams

| Stream | Mechanism | Projected % |
|--------|-----------|-------------|
| **Platform Fee** | 5% of winning payouts | 70% |
| **Premium Markets** | Exclusive prediction access | 15% |
| **B2B Licensing** | White-label for brands/creators | 10% |
| **Data Insights** | Aggregate prediction analytics | 5% |

### Unit Economics

```
Example: $100,000 total market volume

Total Pool:           $100,000
Winners Payout:       $95,000  (after settlement)
Platform Fee (5%):    $4,750
Net to Winners:       $90,250

Monthly Projections (at scale):
─────────────────────────────────
10,000 DAU × $5 avg bet × 3 bets/day = $150,000/day
Monthly Volume: $4.5M
Monthly Revenue (5%): $225,000
```

### Go-to-Market Strategy

**Phase 1: Crypto Native (Month 1-3)**
- Launch on Movement mainnet
- Target crypto Twitter, prediction market enthusiasts
- Integrate trending crypto price markets (BTC, ETH, MOVE)
- Partnerships with Movement ecosystem projects

**Phase 2: Sports & Events (Month 4-6)**
- Add sports predictions (NBA, NFL, Soccer)
- Real-world event markets (elections, awards)
- Influencer partnerships (sports bettors, analysts)

**Phase 3: Social Expansion (Month 7-12)**
- Creator-generated markets
- Social features (follow, compete, chat)
- Referral program with MOVE rewards
- Regional expansion (LATAM, SEA)

---

## 🎯 Target Market

### Primary Audience

| Segment | Size | Why They'll Use Pulse |
|---------|------|----------------------|
| **Crypto Natives** | 50M globally | Already understand markets, want mobile UX |
| **Sports Bettors** | 200M globally | Familiar with odds, want lower stakes |
| **Gen Z Mobile Users** | 2B globally | Swipe-native, micro-transaction friendly |
| **Prediction Enthusiasts** | 10M globally | Love being right, want to prove it |

### Competitive Landscape

| Platform | Strength | Pulse Advantage |
|----------|----------|-----------------|
| Polymarket | Liquidity, credibility | 10x simpler UX, mobile-first |
| Kalshi | Regulated, US-legal | Lower stakes, faster settlement |
| PredictIt | Academic credibility | Modern UX, crypto-native |
| FanDuel | Brand, sports focus | Prediction markets, not just sports |

---

## 🚀 Future Roadmap

### Q1 2025: Foundation
- [x] Core swipe mechanics
- [x] Privy wallet integration
- [x] Movement smart contracts
- [x] Gasless transactions (Shinami)
- [ ] Movement mainnet launch
- [ ] First 1,000 users

### Q2 2025: Growth
- [ ] Social features (profiles, following, leaderboards)
- [ ] Creator-generated markets
- [ ] Push notifications for market resolution
- [ ] iOS App Store + Google Play launch
- [ ] Referral program with MOVE rewards

### Q3 2025: Expansion
- [ ] Sports betting markets
- [ ] Real-world event predictions
- [ ] Multi-language support
- [ ] Fiat on-ramp integration
- [ ] 100,000 MAU target

### Q4 2025: Scale
- [ ] B2B white-label SDK
- [ ] Cross-chain expansion (Ethereum L2s)
- [ ] Prediction DAOs (community-resolved markets)
- [ ] AI-powered market creation
- [ ] 1M MAU target

---

## 🔐 Security & Trust

### Smart Contract Security

| Measure | Implementation |
|---------|----------------|
| **Resource Safety** | Move's linear types prevent double-spending |
| **Access Control** | Admin functions require multi-sig |
| **Bet Limits** | Min 0.1 MOVE, Max 10 MOVE per bet |
| **Fee Caps** | Maximum 10% fee rate (currently 5%) |
| **Oracle Validation** | Pyth price staleness checks |

### User Protection

- **Non-custodial**: Users control their own wallets (via Privy MPC)
- **No Seed Phrases**: Embedded wallets eliminate phishing risk
- **Transparent Odds**: All calculations on-chain and verifiable
- **Instant Settlement**: No withdrawal delays or lock-ups

---

## 👥 Team

| Role | Background |
|------|------------|
| **Founder/Dev** | Full-stack developer, Move/Solidity experience |
| **Advisors** | Movement ecosystem contributors |

*Built during Movement Hackathon 2025*

---

## 📊 Traction & Metrics

### Current Status

| Metric | Value |
|--------|-------|
| **Development Stage** | MVP Complete |
| **Network** | Movement Porto Testnet |
| **Smart Contracts** | 6 modules deployed |
| **Mobile App** | iOS + Android ready |

### Demo Metrics (Testnet)

- Markets created: Active
- Transactions processed: Sub-second confirmation
- Gas per transaction: ~$0.001 (sponsored)

---

## 🔗 Links & Resources

| Resource | Link |
|----------|------|
| **GitHub** | [Repository](https://github.com/JoelOffBeat/Pulse) |
| **Demo Video** | [Coming Soon] |
| **Deployed Contracts** | Movement Porto Testnet |
| **Mobile App** | Expo Build |

---

## 📝 Technical Highlights for Judges

### 1. Seamless Web2.5 Onboarding
```typescript
// User signs in with email, wallet created automatically
const { login } = useLogin();
await login({ loginMethods: ["email"] });
// Privy creates MPC wallet - user never sees seed phrase
```

### 2. Gasless UX with Shinami
```typescript
// Backend sponsors all gas fees
POST /submit-transaction
{
  rawTxnHex: "...",
  signature: "...",
  sponsored: true  // Shinami pays gas
}
```

### 3. Sub-second Settlement on Movement
```move
// Instant bet placement with Move safety
public entry fun place_bet(
    user: &signer,
    market_id: u64,
    is_yes: bool,
    amount: u64,
) {
    // Resource-safe, type-checked, instant finality
}
```

### 4. Real-time Oracle Integration
```move
// Pyth price feeds for automated resolution
public entry fun resolve_market_with_oracle(
    resolver: &signer,
    market_id: u64,
    pyth_price_update: vector<vector<u8>>
) {
    // Trustless, verifiable price data
}
```

---

## 🏆 Why Pulse Should Win

1. **Novel UX**: First swipe-based prediction market ever built
2. **Movement Native**: Leverages sub-second finality for real-time betting
3. **Complete Product**: End-to-end flow from login to claiming winnings
4. **Mass Market Potential**: Designed for billions, not thousands
5. **Technical Excellence**: Move contracts, gasless UX, embedded wallets

---

## 💬 One-Liner

> **Pulse is Tinder for predictions—swipe right if you're bullish, left if you're bearish, and win real money on Movement blockchain.**

---

*Built with ❤️ on Movement*
