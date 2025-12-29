---
description: Deploy Move contracts to Movement network
---

# Move Contract Deployment

Deploy Move contracts to Movement testnet/mainnet.

**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- Load `move-dev` skill
- Ensure `contracts/Move.toml` is configured
- Have Movement CLI installed and wallet configured

### Context7 Lookups (if unsure about syntax)

Before executing, look up current syntax if needed:
- Movement deployment: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/aptos-labs/aptos-core", topic: "move publish" })`

## Steps

### 1. Build & Test

```bash
cd contracts
movement move build
movement move test
```

**STOP if tests fail.** Fix issues before deploying.

### 2. Deploy to Testnet

```bash
movement move publish --network testnet --assume-yes
```

### 3. Record Deployment

After successful deployment, record:
- Module address
- Transaction hash
- Network (testnet/mainnet)

### 4. Update Frontend Constants

Update `mobile/constants/contracts.ts`:
```typescript
export const CONTRACTS = {
  testnet: {
    market: '0x...',
    social: '0x...',
  },
  mainnet: {
    market: '0x...',
    social: '0x...',
  },
}
```

### 5. Verify Deployment

```bash
# Call a view function to verify
movement move view --function-id 'MODULE_ADDRESS::market::get_market_count'
```

## Success Checklist

- [ ] All tests pass (`movement move test`)
- [ ] Contracts deployed successfully
- [ ] Frontend constants updated with new addresses
- [ ] View function call succeeds

---

## If This Fails

### Error: "insufficient funds"
**Fix:** Get testnet tokens from Movement faucet

### Error: "module does not exist"
**Fix:** Check module address in Move.toml

### Error: "type mismatch"
**Fix:** Verify function arguments match expected types
