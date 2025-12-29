# Pulse - Social Prediction Markets on Movement

Tinder-style binary prediction game where you swipe right (bullish) or left (bearish) on real-time events.

## Quick Start

### Prerequisites
- Node.js 18+
- Movement CLI
- Expo CLI

### Backend
```bash
cd mobile/expo-backend
npm install
cp .env.example .env
# Update PULSE_ADDRESS in .env if needed
npm run dev
```

### Mobile App
```bash
cd mobile
npm install
# Update Privy credentials in app.json (privyAppId, privyClientId)
npx expo start --dev-client
```

### Contracts
```bash
cd contracts
movement move build
movement move test
./scripts/deploy.sh
./scripts/initialize.sh <ADDRESS>
./scripts/create-markets.sh <ADDRESS>
```

## Architecture

- **Mobile**: React Native (Expo) + Privy embedded wallets
- **Backend**: Node.js + Aptos SDK (for Movement)
- **Contracts**: Move smart contracts on Movement

## Project Structure

```
Pulse/
├── mobile/               # React Native app
│   ├── app/             # Expo Router screens
│   ├── components/      # React components
│   ├── hooks/           # Custom hooks
│   ├── constants/       # Configs & addresses
│   └── expo-backend/    # Backend API
├── contracts/            # Move smart contracts
│   ├── sources/         # Move modules
│   └── scripts/         # Deployment scripts
└── prompts/              # Strategy system prompts
```

## Features

- Swipe right (YES) or left (NO) on prediction markets
- Automatic wallet creation via Privy
- Real-time odds calculation
- Position tracking and claiming
- Global leaderboard

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /markets` | List active markets |
| `GET /markets/:id` | Get market details |
| `POST /markets/:id/payout` | Calculate payout |
| `GET /positions/:address` | Get user positions |
| `GET /leaderboard` | Get rankings |

## Environment Variables

### Mobile (`.env.development`)
```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_NETWORK=testnet
```

### Backend (`.env`)
```
PORT=3000
PULSE_ADDRESS=0x...
```

## License

MIT
