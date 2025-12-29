# PRD: Pulse — Social Prediction Markets

## Track: Best Consumer App on Movement

---

## Executive Summary

Pulse is a Tinder-style binary prediction game where users swipe right (bullish) or left (bearish) on real-time events. Movement's sub-second finality enables instant result settlement. Privy embedded wallets provide seamless Web 2.5 onboarding — users never see seed phrases.

---

## Problem Statement

Prediction markets suffer from:
- **High friction:** Complex UIs, deposit requirements, gas fees
- **Slow resolution:** Hours or days to settle outcomes
- **Poor mobile UX:** Desktop-first designs
- **Social isolation:** No community, no viral mechanics

**Target User:** Gen-Z/Millennial mobile-first users who enjoy casual gaming but find DeFi intimidating.

---

## Solution Overview

### Core Loop
1. Open app → See prediction card
2. Swipe right = "Yes" / Swipe left = "No"
3. Stake amount (micro-bets: $0.10 - $10)
4. Wait for outcome (seconds to hours)
5. Win → Payout credited instantly
6. Share results → Earn referral bonuses

### Key Differentiators

| Feature | Pulse | Polymarket | Kalshi |
|---------|-------------|------------|--------|
| Mobile-first | ✅ | ❌ | ❌ |
| Instant settlement | ✅ (FFS) | ❌ | ❌ |
| No KYC for small bets | ✅ | ❌ | ❌ |
| Social/viral mechanics | ✅ | ❌ | ❌ |
| Embedded wallet | ✅ (Privy) | ❌ | ❌ |

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile/Web App                            │
│         (React Native + Privy SDK + Gesture Handler)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                              │
│              (Next.js API Routes / Express)                 │
│  - Prediction feed curation                                  │
│  - Social features (leaderboards, follows)                  │
│  - Oracle integration                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Movement Smart Contracts                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Markets     │  │  Positions   │  │  Settlement  │     │
│  │  Module      │  │  Module      │  │  Module      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  - Create markets   - Store bets     - Oracle verify      │
│  - Set outcomes     - Track users    - Payout calc        │
│  - Fee collection   - Leaderboard    - Instant settle     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Oracle Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Pyth      │  │   Custom     │  │   Admin      │     │
│  │  (Prices)    │  │  (Events)    │  │  (Manual)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Move Contract Structure

```move
module Pulse::market {

    struct Market has key, store {
        id: u64,
        question: String,
        category: Category,
        resolution_time: u64,
        oracle_source: OracleSource,
        total_yes_stake: u64,
        total_no_stake: u64,
        outcome: Option<bool>,
        settled: bool,
        creator: address,
        created_at: u64
    }

    enum Category has store, drop, copy {
        Crypto,      // "Will BTC hit $100k today?"
        Sports,      // "Will Lakers win tonight?"
        Politics,    // "Will bill X pass?"
        Entertainment, // "Will movie X gross $1B?"
        Weather,     // "Will it rain in NYC tomorrow?"
        Custom       // Community-created
    }

    enum OracleSource has store, drop, copy {
        PythPrice { feed_id: vector<u8>, threshold: u64 },
        AdminResolution { admin: address },
        CommunityVote { quorum: u64 }
    }

    struct Position has key, store {
        market_id: u64,
        user: address,
        is_yes: bool,
        amount: u64,
        created_at: u64,
        claimed: bool
    }

    // Core functions
    public entry fun create_market(...) { ... }
    public entry fun place_bet(market_id: u64, is_yes: bool, amount: u64) { ... }
    public entry fun resolve_market(market_id: u64, outcome: bool) { ... }
    public entry fun claim_winnings(market_id: u64) { ... }
}

module Pulse::social {

    struct UserProfile has key {
        address: address,
        username: String,
        avatar_url: String,
        total_bets: u64,
        total_won: u64,
        win_rate: u64,  // basis points (5000 = 50%)
        streak: u64,
        referral_code: String,
        referred_by: Option<address>,
        followers: vector<address>,
        following: vector<address>
    }

    struct Leaderboard has key {
        daily: vector<LeaderboardEntry>,
        weekly: vector<LeaderboardEntry>,
        all_time: vector<LeaderboardEntry>
    }

    struct LeaderboardEntry has store, drop, copy {
        user: address,
        profit: i64,  // can be negative
        win_rate: u64,
        total_volume: u64
    }
}
```

---

## Feature Specifications

### MVP Features (Hackathon)

| Feature | Description | Priority |
|---------|-------------|----------|
| Swipe UI | Tinder-style card swiping | P0 |
| Crypto markets | BTC/ETH price predictions (1hr, 24hr) | P0 |
| Privy login | Email/social sign-in, embedded wallet | P0 |
| Micro-bets | $0.10 - $10 per prediction | P0 |
| Instant payout | Auto-claim on resolution | P0 |
| Basic leaderboard | Top winners today | P0 |

### Post-MVP Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Social graph | Follow users, copy bets | P1 |
| Streaks & achievements | Gamification layer | P1 |
| Custom markets | Community-created predictions | P1 |
| Group predictions | Bet with friends | P2 |
| Live events | Real-time sports/esports | P2 |
| NFT rewards | Collectible winning cards | P2 |

---

## User Experience Flow

### Onboarding (First-Time User)
```
1. Download app / Open PWA
2. "Sign in with Google" (Privy)
3. ← Privy creates embedded wallet silently
4. Tutorial: "Swipe right if you think YES"
5. Free $1 credit to start
6. First prediction card appears
7. User swipes → Bet placed
8. "You're in! Result in 1 hour"
```

### Core Loop (Returning User)
```
1. Open app → Feed of prediction cards
2. Swipe through cards (skip or bet)
3. Check "My Bets" tab for pending/results
4. Claim winnings (or auto-claimed)
5. Check leaderboard position
6. Share winning prediction → Referral link
```

### Card UI Design

```
┌─────────────────────────────────┐
│  🔥 TRENDING                    │
│                                 │
│  Will BTC hit $100,000          │
│  in the next 24 hours?          │
│                                 │
│  Current: $98,450               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  YES: 65%        NO: 35%        │
│  (1,234 predictions)            │
│                                 │
│  ┌─────────┐    ┌─────────┐    │
│  │  ← NO   │    │  YES →  │    │
│  │  1.5x   │    │  2.8x   │    │
│  └─────────┘    └─────────┘    │
│                                 │
│  Resolves: Dec 25, 2025 5:00PM │
└─────────────────────────────────┘
```

---

## Revenue Model

### Primary Revenue: Rake
- 5% fee on winning payouts
- Example: User wins $100 → Receives $95

### Secondary Revenue: Premium Features
- Ad-free experience: $2.99/month
- Custom markets: $0.99 per market
- Analytics dashboard: $4.99/month

### Projected Revenue

| Monthly Active Users | Avg Volume/User | Total Volume | Revenue (5%) |
|---------------------|-----------------|--------------|--------------|
| 1,000 | $50 | $50,000 | $2,500 |
| 10,000 | $50 | $500,000 | $25,000 |
| 100,000 | $50 | $5,000,000 | $250,000 |

---

## Technical Requirements

### Frontend Stack
- **Framework:** React Native (Expo) for iOS/Android + Web
- **Wallet:** Privy React Native SDK
- **Gestures:** react-native-gesture-handler
- **Animations:** react-native-reanimated
- **State:** Zustand + React Query

### Backend Stack
- **API:** Next.js API routes or Express
- **Database:** PostgreSQL (user profiles, market metadata)
- **Cache:** Redis (leaderboards, hot markets)
- **Indexer:** Movement GraphQL indexer

### Smart Contract Stack
- **Language:** Move 2.0
- **Testing:** Movement CLI + Aptos Move testing framework
- **Deployment:** Movement Testnet → Mainnet

### Oracle Integration
- **Price feeds:** Pyth Network on Movement
- **Event resolution:** Admin multisig initially, DAO later

---

## Success Metrics

### Hackathon Demo Metrics
| Metric | Target |
|--------|--------|
| Working swipe UI | ✅ |
| 3+ market types | ✅ |
| Privy integration | ✅ |
| Live on testnet | ✅ |
| Demo video | ✅ |

### Growth Metrics (Post-Launch)

| Metric | Week 1 | Month 1 | Month 3 |
|--------|--------|---------|---------|
| Downloads/signups | 500 | 5,000 | 25,000 |
| DAU | 100 | 1,000 | 5,000 |
| Predictions/day | 500 | 5,000 | 50,000 |
| Volume/day | $500 | $10,000 | $100,000 |
| Retention (D7) | 20% | 30% | 40% |

---

## Go-To-Market Strategy

### Phase 1: Crypto Natives (Hackathon + 2 weeks)
- Movement community (Discord, Twitter)
- Crypto Twitter influencers
- Airdrop hunters (integrate with MoveDrop)

### Phase 2: Crypto-Curious (Month 1-2)
- TikTok/Instagram ads targeting prediction game fans
- Sports betting crossover audience
- College campuses (NCAA predictions)

### Phase 3: Mainstream (Month 3+)
- App Store featuring
- Partnerships with sports leagues
- Celebrity/influencer predictions

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Regulatory (gambling) | High | High | Geo-restrict, small bet limits, skill framing |
| Oracle manipulation | Medium | High | Multiple oracle sources, admin override |
| Low liquidity | Medium | Medium | House-backed markets initially |
| Privy downtime | Low | High | Fallback to native wallet |

---

## Development Timeline

### Week 1: Core Infrastructure
- [ ] Move contracts: Market, Position, Settlement
- [ ] Privy integration
- [ ] Basic API endpoints
- [ ] Database schema

### Week 2: Mobile UI
- [ ] Swipe card component
- [ ] Prediction feed
- [ ] Bet placement flow
- [ ] My bets screen

### Week 3: Social + Polish
- [ ] Leaderboard
- [ ] User profiles
- [ ] Animations & haptics
- [ ] Testnet deployment

### Week 4: Demo Prep
- [ ] Bug fixes
- [ ] Demo video
- [ ] Pitch deck
- [ ] Submission

---

## Appendix

### Market Categories for MVP

1. **Crypto (Auto-resolved via Pyth)**
   - "BTC above $X in 1 hour?"
   - "ETH above $X in 24 hours?"
   - "MOVE above $X by end of day?"

2. **Quick Picks (Admin-resolved)**
   - "Will it snow in NYC tomorrow?"
   - "Will [movie] gross $100M opening weekend?"
   - "Will [team] win tonight?"

3. **Movement Ecosystem**
   - "Will Movement TVL hit $500M this week?"
   - "Will MOVE hit new ATH this month?"

### Compliance Considerations
- Not available in US (initially)
- Bet limits: $10 max per prediction
- No real-money withdrawal first 7 days
- Age verification via Privy KYC (optional upgrade)

### Team Requirements
- 1 Mobile developer (React Native)
- 1 Move developer (contracts)
- 1 Backend developer (API + indexer)
- 1 Designer (UI/UX)
