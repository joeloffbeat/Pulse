# Pulse Admin Scripts

Admin scripts for managing prediction markets on Movement testnet.

## Prerequisites

1. Install Movement CLI: https://docs.movementlabs.xyz/
2. Configure wallet: `movement init`
3. Ensure wallet has testnet MOVE tokens

## Scripts

| Script | Description |
|--------|-------------|
| `create-btc-market.sh` | Create BTC price prediction market (oracle-resolved) |
| `create-eth-market.sh` | Create ETH price prediction market (oracle-resolved) |
| `create-custom-market.sh` | Create any custom market (admin-resolved) |
| `resolve-market.sh` | Manually resolve a market |
| `list-markets.sh` | View market count/list |

## Usage Examples

### Create BTC Market
```bash
# Will BTC be above $100,000 in 24 hours?
./create-btc-market.sh 100000 24

# Will BTC be above $95,000 in 1 hour?
./create-btc-market.sh 95000 1
```

### Create ETH Market
```bash
# Will ETH be above $4,000 in 24 hours?
./create-eth-market.sh 4000 24
```

### Create Custom Market
```bash
# Sports market
./create-custom-market.sh "Will Lakers win tonight?" 12 1

# Weather market
./create-custom-market.sh "Will it snow in NYC tomorrow?" 24 4
```

### List Markets
```bash
./list-markets.sh          # Show market count
./list-markets.sh active   # Show active markets
./list-markets.sh all      # Show all markets (paginated)
```

### Resolve Market
```bash
./resolve-market.sh 0 true   # Resolve market 0 as YES
./resolve-market.sh 1 false  # Resolve market 1 as NO
```

## Contract Address

`0x78a349ed835712bb5056761595110896ccf3497de4ef8af46acf8cc719b32e8e`

## Categories

| ID | Name |
|----|------|
| 0 | CRYPTO |
| 1 | SPORTS |
| 2 | POLITICS |
| 3 | ENTERTAINMENT |
| 4 | WEATHER |
| 5 | CUSTOM |

## Pyth Feed IDs

| Asset | Feed ID |
|-------|---------|
| BTC/USD | `e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43` |
| ETH/USD | `ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace` |
| APT/USD | `03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5` |
