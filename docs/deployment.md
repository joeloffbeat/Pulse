# Pulse Deployment Information

## Network

| Property | Value |
|----------|-------|
| **Network** | Movement Testnet |
| **RPC URL** | https://testnet.movementnetwork.xyz/v1 |
| **Faucet URL** | https://faucet.testnet.movementnetwork.xyz |
| **Explorer** | https://explorer.movementnetwork.xyz |

---

## Smart Contracts

### Module Address
```
0x78a349ed835712bb5056761595110896ccf3497de4ef8af46acf8cc719b32e8e
```

### Deployed Modules

| Module | Lines | Description |
|--------|-------|-------------|
| `market.move` | 256 | Market creation, resolution, stake tracking |
| `position.move` | 276 | Bet placement, claiming, user positions |
| `treasury.move` | 218 | Token deposits/payouts, 5% fee handling |
| `oracle.move` | 120 | Pyth Network integration (BTC, ETH, MOVE feeds) |
| `referral.move` | 147 | Referral tracking, 5% first-bet bonus |
| `bonus.move` | 141 | Welcome $1 credit system |
| `market_views.move` | 69 | Paginated market queries |

### Explorer Links

- **Module**: [View on Explorer](https://explorer.movementnetwork.xyz/account/0x78a349ed835712bb5056761595110896ccf3497de4ef8af46acf8cc719b32e8e?network=testnet)

---

## Dependencies

| Dependency | Address |
|------------|---------|
| **Pyth** | `0x7e783b349d3e89cf5931af376ebeadbfab855b3fa239b7ada8f5a92fbea6b387` |
| **Wormhole** | `0x5bc11445584a763c1fa7ed39081f1b920954da14e04b32440cba863d03e19625` |

---

## Backend API

| Property | Value |
|----------|-------|
| **Location** | `mobile/expo-backend/` |
| **Port** | 3000 (default) |
| **Health Check** | `GET /health` |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/markets` | GET | List active markets |
| `/markets/:id` | GET | Get market details |
| `/markets/:id/resolve-oracle` | POST | Resolve with Pyth oracle |
| `/positions/:address` | GET | User's positions |
| `/positions/:address/claimable` | GET | Claimable winnings |
| `/stats/:address` | GET | User statistics |
| `/leaderboard` | GET | Daily/weekly/all-time rankings |
| `/bonus/:address` | GET | User's bonus balance |
| `/bonus/claim` | POST | Claim welcome bonus |
| `/faucet` | POST | Request testnet tokens |

---

## Mobile App

| Property | Value |
|----------|-------|
| **Framework** | React Native (Expo) |
| **Location** | `mobile/` |
| **Wallet** | Privy Embedded Wallets |

### Environment Variables

```bash
# mobile/.env.development or .env.production
EXPO_PUBLIC_PRIVY_APP_ID=your_privy_app_id
EXPO_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_MODULE_ADDRESS=0x78a349ed835712bb5056761595110896ccf3497de4ef8af46acf8cc719b32e8e
```

---

## Resolution Worker

| Property | Value |
|----------|-------|
| **Location** | `mobile/expo-backend/workers/resolution-worker.js` |
| **Poll Interval** | 60 seconds |
| **Purpose** | Auto-resolve Pyth oracle markets |

### Start Worker
```bash
cd mobile/expo-backend
node workers/resolution-worker.js
```

---

## Admin Scripts

Located in `scripts/`:

| Script | Purpose |
|--------|---------|
| `create-btc-market.sh` | Create BTC price prediction |
| `create-eth-market.sh` | Create ETH price prediction |
| `create-custom-market.sh` | Create admin-resolved market |
| `resolve-market.sh` | Manually resolve a market |
| `list-markets.sh` | Query market count |

---

## Deployment Checklist

- [x] Contracts deployed to Movement testnet
- [x] All 7 modules verified on-chain
- [x] Backend API running
- [x] Resolution worker functional
- [x] Mobile app builds successfully
- [x] Privy integration configured
- [x] Admin scripts tested

---

## Pyth Price Feeds

| Asset | Feed ID |
|-------|---------|
| **BTC/USD** | `0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43` |
| **ETH/USD** | `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace` |
| **MOVE/USD** | `0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5` |

---

## Troubleshooting

### Contract calls failing
- Verify module address matches in `Move.toml` and environment
- Check wallet has sufficient MOVE for gas
- Ensure treasury is initialized with `initialize.sh`

### Oracle resolution not working
- Verify resolution worker is running
- Check Pyth feed IDs are correct
- Ensure market has `oracle_config` set

### Mobile app not connecting
- Verify Privy app ID and client ID
- Check API_URL is accessible
- Ensure network is Movement testnet
