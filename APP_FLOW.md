# Pulse App Flow & Testing Guide

## Quick Start Testing

### Prerequisites
```bash
# Terminal 1: Start API (if local)
cd api && npm run dev

# Terminal 2: Start Mobile
cd mobile && npx expo start
```

### Test on Device
1. Scan QR code with Expo Go (Android) or Camera (iOS)
2. Or press `i` for iOS simulator / `a` for Android emulator

---

## Complete Test Flow

### 1. Authentication
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.1 | Open app | See login screen with "Connect Wallet" button |
| 1.2 | Tap "Connect Wallet" | Privy email login modal appears |
| 1.3 | Enter email + verify | Wallet created, redirected to main app |

### 2. Prediction Feed (Home Tab)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.1 | View home tab | Stack of prediction cards visible |
| 2.2 | Read card | Shows question, odds bar, multipliers, timer |
| 2.3 | Swipe RIGHT | Green "YES" indicator, bet modal opens |
| 2.4 | Swipe LEFT | Red "NO" indicator, bet modal opens |
| 2.5 | Swipe UP | Card skipped, next card shown |

### 3. Placing a Bet
| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.1 | Swipe right on a card | Bet modal opens with YES selected |
| 3.2 | Adjust bet amount | Slider/buttons: 0.1 - 10 MOVE |
| 3.3 | View potential payout | Calculated based on current odds |
| 3.4 | Tap "Confirm Bet" | Privy sign prompt appears |
| 3.5 | Approve transaction | Loading → Success toast → Modal closes |

### 4. My Bets Tab
| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.1 | Navigate to "My Bets" tab | See tabs: Active / Won / Lost |
| 4.2 | Check Active tab | Shows pending bets with status |
| 4.3 | Check Won tab | Shows winning bets (after resolution) |
| 4.4 | Tap "Claim Winnings" | Transaction signed, MOVE received |

### 5. Profile Tab
| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.1 | Navigate to "Profile" tab | See wallet address + balance |
| 5.2 | View stats | Total bets, win rate displayed |
| 5.3 | View leaderboard | Rankings by profit shown |
| 5.4 | Tap logout | Returns to login screen |

---

## Test Scenarios

### Happy Path: Full Cycle
```
Login → Swipe Right → Bet 1 MOVE → Confirm → Check Active Tab →
[Wait for resolution] → Check Won Tab → Claim → Verify Balance
```

### Edge Cases to Test
| Scenario | How to Test |
|----------|-------------|
| Insufficient balance | Set bet > wallet balance |
| Min bet limit | Try betting < 0.1 MOVE |
| Max bet limit | Try betting > 10 MOVE |
| Network error | Disable wifi mid-transaction |
| Skip all cards | Swipe up on all markets |
| Double claim | Try claiming same position twice |

---

## API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /markets` | Fetch active prediction markets |
| `GET /positions/:address` | Fetch user's bet positions |
| `POST /generate-hash` | Generate transaction hash for signing |
| `POST /submit-transaction` | Submit signed transaction |
| `GET /markets/:id/payout` | Calculate potential payout |

---

## Smart Contract Functions

| Function | Module | Purpose |
|----------|--------|---------|
| `place_bet` | position.move | Place YES/NO bet |
| `claim_winnings` | position.move | Claim winning payout |
| `resolve_market` | market.move | Settle market outcome |
| `get_market` | market_views.move | View market data |

---

## Environment Configuration

### Required Environment Variables
```bash
# mobile/.env
EXPO_PUBLIC_PRIVY_APP_ID=your_privy_app_id
EXPO_PUBLIC_API_URL=https://your-api.com
EXPO_PUBLIC_MOVEMENT_RPC=https://aptos.testnet.porto.movementlabs.xyz/v1

# api/.env (if running locally)
MOVEMENT_PRIVATE_KEY=your_deployer_key
SHINAMI_KEY=your_shinami_key
```

### Contract Addresses (Testnet)
```
PULSE_ADDRESS: Check mobile/constants/contracts.ts
Network: Movement Porto Testnet
```

---

## Debugging Tips

| Issue | Check |
|-------|-------|
| Login fails | Verify PRIVY_APP_ID is set |
| No markets showing | Check API_URL, inspect network tab |
| Transaction fails | Check wallet balance, RPC status |
| Claim not working | Verify market is settled, position is winner |

### Console Logs
```bash
# View React Native logs
npx expo start --clear

# View network requests
Open Expo dev menu → "Debug Remote JS"
```

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE APP                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │
│  │ Predict │  │ My Bets │  │ Profile │                 │
│  │  (Tab)  │  │  (Tab)  │  │  (Tab)  │                 │
│  └────┬────┘  └────┬────┘  └────┬────┘                 │
│       │            │            │                       │
│       └────────────┼────────────┘                       │
│                    ▼                                    │
│            ┌──────────────┐                             │
│            │ Privy Wallet │ ◄─── Email Auth             │
│            └──────┬───────┘                             │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────┐
│                   BACKEND API                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │  Markets   │  │ Positions  │  │    Txs     │       │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘       │
└────────┼───────────────┼───────────────┼──────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         ▼
┌───────────────────────────────────────────────────────┐
│              MOVEMENT BLOCKCHAIN                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ market   │  │ position │  │ treasury │            │
│  │  .move   │  │  .move   │  │  .move   │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└───────────────────────────────────────────────────────┘
```

---

## User Journey Summary

```
1. OPEN APP → Login with email (Privy creates wallet)
                    ↓
2. SWIPE → Right=YES, Left=NO, Up=Skip
                    ↓
3. BET → Select amount (0.1-10 MOVE) → Confirm
                    ↓
4. WAIT → Market resolves (oracle or admin)
                    ↓
5. CLAIM → Winnings deposited (minus 5% fee)
                    ↓
6. REPEAT → Keep predicting!
```
