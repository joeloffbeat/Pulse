---
description: Strategic debugging across Move contracts, mobile app, and API
argument: <error description or unexpected behavior>
---

# Full-Stack Debug

Strategic debugging system that identifies issues across: **contracts <-> mobile <-> API**.

**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- **Check `docs/issues/` for known issues** based on layer:
  - Move contracts → `docs/issues/move/README.md`
  - UI/Mobile → `docs/issues/ui/README.md`
  - Movement network → `docs/issues/movement/README.md`
  - Tooling → `docs/issues/tooling/README.md`
- Read `mobile/constants/contracts.ts` for addresses
- Identify which layer(s) the error originates from
- Load relevant skill (`move-dev`, `mobile-dev`, `api-dev`)

## Debug Strategy

### Phase 1: Classify the Issue

| Symptom | Primary Layer | Check Also |
|---------|---------------|------------|
| Transaction aborts | Contracts | Mobile (wrong args) |
| UI shows wrong data | Mobile | API (stale cache), Contracts (view function) |
| Wallet won't connect | Mobile | Privy config |
| API returns error | API | Database, Contracts |
| "Function not found" | Mobile | Contract address mismatch |

### Phase 2: Cross-Layer Verification

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Contracts  │────▶│     API     │────▶│   Mobile    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
   Move.toml         .env files          constants/
   (addresses)       (config)            contracts.ts
```

**Address Consistency Check:**
```bash
# Check contract address in Move.toml
cat contracts/Move.toml | grep "Pulse"

# Check frontend constants
cat mobile/constants/contracts.ts
```

### Phase 3: Layer-Specific Debugging

#### Contract Issues

1. **Transaction Aborts:**
   ```bash
   # Test the function locally
   cd contracts
   movement move test --filter test_function_name -v
   ```

2. **View Function Issues:**
   ```bash
   # Call view function directly
   movement move view --function-id 'ADDRESS::module::function' --args 'u64:1'
   ```

#### Mobile Issues

1. **Privy Connection:**
   - Check EXPO_PUBLIC_PRIVY_APP_ID in .env
   - Verify Privy dashboard settings
   - Check network logs in Metro

2. **Transaction Failures:**
   - Log transaction payload before sending
   - Check function signature matches contract
   - Verify argument types

#### API Issues

1. **Database:**
   - Check connection string
   - Verify schema matches queries

2. **Caching:**
   - Clear Redis cache if stale data
   - Check TTL settings

### Phase 4: Common Integration Bugs

| Bug Pattern | Cause | Fix |
|-------------|-------|-----|
| Mobile works, contract fails | Wrong module address | Update constants |
| Tests pass, mobile fails | Testnet vs mainnet address | Check network config |
| Transaction succeeds, no update | Missing event indexing | Add event listener |
| Privy login fails | Invalid app ID | Check Privy dashboard |

## Debug Checklist

```
□ Reproduced the issue
□ Identified which layer (contracts/mobile/API)
□ Checked address consistency
□ Checked network configuration
□ Read error messages carefully
□ Fixed and verified resolution
```

## Example Usage

```
/debug Transaction aborts when calling place_bet from mobile but works in Move tests
```

```
/debug Privy login succeeds but embedded wallet shows no balance
```

```
/debug Leaderboard shows stale data even after new bets
```
