# Pulse - Social Prediction Markets on Movement

Pulse is a Tinder-style binary prediction game where users swipe right (bullish) or left (bearish) on real-time events. Built on Movement blockchain with Privy embedded wallets for seamless Web 2.5 onboarding.

---

## Git Configuration

**Account:** JoelOffBeat (Joel Off beat)
```
user.name: JoelOffBeat
user.email: joeloffbeat@gmail.com
```

### Auto-Commit Rule
**After completing ANY command/prompt, commit and push your changes to GitHub.**

---

## Critical Rules

**NEVER mock or create placeholder code.** If blocked, STOP and explain why.

- No scope creep - only implement what's requested
- No assumptions - ask for clarification
- Follow existing patterns in codebase
- Verify work before completing
- Use conventional commits (`feat:`, `fix:`, `refactor:`)

---

## File Size Limits (CRITICAL)

**HARD LIMIT: 300 lines per file maximum. NO EXCEPTIONS.**

Files over 300 lines (~25000 tokens) CANNOT be read by AI tools and block development.

### Limits by File Type

| File Type | Max Lines | Purpose |
|-----------|-----------|---------|
| `page.tsx` / `screen.tsx` | 150 | Orchestration only |
| `*-tab.tsx` | 250 | Tab components |
| `use-*.ts` | 200 | Hooks with business logic |
| `types.ts` | 100 | Type definitions |
| `constants.ts` | 150 | Addresses, configs |
| `*-service.ts` | 300 | API services |
| `*.move` | 300 | Move modules |
| `components/*.tsx` | 150 | Reusable UI |

### Required Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Swipe feed (< 150 lines)
│   │   ├── bets.tsx       # My bets (< 150 lines)
│   │   └── profile.tsx    # Profile (< 150 lines)
│   └── _layout.tsx        # Root layout
├── components/
│   ├── prediction/        # Prediction card components
│   │   ├── swipe-card.tsx
│   │   ├── bet-modal.tsx
│   │   └── result-card.tsx
│   └── shared/            # Reusable components
├── hooks/
│   ├── use-markets.ts     # Market data (< 200 lines)
│   ├── use-positions.ts   # User positions (< 200 lines)
│   └── use-privy.ts       # Wallet hooks (< 200 lines)
├── lib/
│   ├── movement/          # Movement SDK integration
│   └── services/          # API services
├── constants/
│   └── contracts.ts       # Contract addresses
└── types/
    └── index.ts           # Type definitions

contracts/
├── sources/
│   ├── market.move        # Market module (< 300 lines)
│   ├── position.move      # Position module (< 300 lines)
│   ├── settlement.move    # Settlement module (< 300 lines)
│   └── social.move        # Social module (< 300 lines)
├── tests/
│   └── market_tests.move
└── Move.toml
```

### When to Decompose

| Trigger | Action |
|---------|--------|
| File > 300 lines | MUST decompose immediately |
| 3+ useState hooks | Extract to custom hook |
| Multiple tabs/sections | Split into separate components |
| Move module > 300 lines | Split into submodules |

---

## Documentation Lookup (MANDATORY)

**ALWAYS use Context7 MCP for documentation. NEVER use WebFetch for docs.**

### How to Use Context7

```
1. First resolve the library ID:
   mcp__context7__resolve-library-id({ libraryName: "aptos" })

2. Then fetch the docs:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/aptos-labs/aptos-core",
     topic: "move modules",
     mode: "code"
   })
```

### Common Libraries in This Project

| Library | Context7 ID |
|---------|-------------|
| Aptos/Move | `/aptos-labs/aptos-core` |
| React Native | `/facebook/react-native` |
| Expo | `/expo/expo` |
| React Query | `/TanStack/query` |
| Zustand | `/pmndrs/zustand` |
| Privy | (check availability) |

### DO NOT

- **NEVER use WebFetch for documentation** - It's unreliable
- **NEVER guess Move syntax** - Always verify with Context7 or docs
- **NEVER assume SDK signatures** - Look them up first

---

## Skills (LOAD BEFORE STARTING TASKS)

**IMPORTANT: Always load the appropriate skill BEFORE starting any task.**

### How to Use Skills

```
skill: "move-dev"
skill: "mobile-dev"
skill: "privy-integration"
```

### Required Skills by Task Type

| Task Type | Required Skill | Examples |
|-----------|----------------|----------|
| **Move Contracts** | `move-dev` | Writing modules, tests, deployment |
| **Mobile UI** | `mobile-dev` | React Native components, gestures, animations |
| **Wallet Integration** | `privy-integration` | Privy SDK, embedded wallets, transactions |
| **API Development** | `api-dev` | Next.js routes, database, caching |
| **Strategic Planning** | `strategy` | Breaking goals into prompts |

---

## Multi-Prompt System

This project uses a multi-session prompt system for complex features.

### How It Works

1. **`/strategy <goal>`** - Enter planning mode, breaks goal into executable prompts
2. **Prompts written to `prompts/`** - As `1.md`, `2.md`, `3.md`, etc.
3. **Run prompts in fresh sessions** - "run prompt 1"
4. **Report completion** - "completed prompt 1"
5. **Strategy session generates next batch** - Until goal is complete

### Running Prompts

When asked to run a prompt:

1. **Read** `prompts/N.md` completely
2. **Activate** the skill specified in the prompt (if any)
3. **Execute** ALL requirements in the prompt
4. **Verify** using the verification steps provided
5. **Delete** the prompt file after successful completion
6. **Report** what was accomplished

---

## Vercel Deployment

### Landing Web (`landing-web/`)
- **Deployed via Vercel CLI** (NOT git auto-deploy)
- Vercel project name: `pulse-movement-demo`
- This is a Next.js landing page that directs users to download the mobile app

**Deployment command:**
```bash
cd landing-web
vercel --prod
```

**Important:** Do NOT assume git push triggers deployment. Always use `vercel --prod` from the `landing-web` directory.

---

## Project Structure

```
Pulse/
├── mobile/                 # React Native (Expo) app
│   ├── app/               # Expo Router screens
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Services and utilities
│   ├── constants/         # Configs and addresses
│   └── types/             # TypeScript types
├── contracts/              # Move smart contracts
│   ├── sources/           # Move modules
│   ├── tests/             # Move tests
│   └── Move.toml          # Package config
├── landing-web/            # Next.js landing page (Vercel CLI deploy)
│   ├── app/               # Next.js app router
│   └── .vercel/           # Vercel project config
├── api/                    # Backend API (Next.js or Express)
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── db/                # Database schema
├── prompts/                # Generated prompts (strategy system)
└── PRD.md                  # Product requirements
```

---

## Move Development

### Module Structure

```move
module Pulse::market {
    use std::string::String;
    use std::option::Option;
    use aptos_framework::timestamp;
    use aptos_framework::coin;

    /// Custom errors
    const E_MARKET_NOT_FOUND: u64 = 1;
    const E_MARKET_ALREADY_SETTLED: u64 = 2;
    const E_INSUFFICIENT_STAKE: u64 = 3;

    /// Market struct
    struct Market has key, store {
        id: u64,
        question: String,
        total_yes_stake: u64,
        total_no_stake: u64,
        outcome: Option<bool>,
        settled: bool,
    }

    /// Events
    struct MarketCreated has drop, store {
        market_id: u64,
        creator: address,
        question: String,
    }

    /// Core functions
    public entry fun create_market(
        creator: &signer,
        question: String,
        resolution_time: u64,
    ) acquires MarketRegistry {
        // Implementation
    }

    public entry fun place_bet(
        user: &signer,
        market_id: u64,
        is_yes: bool,
        amount: u64,
    ) acquires Market, Position {
        // Implementation
    }

    #[view]
    public fun get_market(market_id: u64): Market acquires Market {
        // View function
    }
}
```

### Testing

```move
#[test_only]
module Pulse::market_tests {
    use Pulse::market;
    use std::string;

    #[test(creator = @0x1)]
    fun test_create_market(creator: &signer) {
        market::create_market(
            creator,
            string::utf8(b"Will BTC hit $100k?"),
            1735689600, // timestamp
        );
    }

    #[test(user = @0x1)]
    #[expected_failure(abort_code = market::E_MARKET_NOT_FOUND)]
    fun test_bet_on_nonexistent_market(user: &signer) {
        market::place_bet(user, 999, true, 1000);
    }
}
```

### Movement CLI Commands

```bash
# Build
movement move build

# Test
movement move test

# Deploy to testnet
movement move publish --network testnet

# Call function
movement move run --function-id 'Pulse::market::create_market' \
  --args 'string:Will BTC hit $100k?' 'u64:1735689600'

# View function
movement move view --function-id 'Pulse::market::get_market' \
  --args 'u64:1'
```

---

## Privy Integration

### Setup

```typescript
// lib/privy/provider.tsx
import { PrivyProvider } from '@privy-io/expo';

export function PrivyProviderWrapper({ children }) {
  return (
    <PrivyProvider
      appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
        },
        embeddedWallets: {
          createOnLogin: 'all-users',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
```

### Using Privy Wallet

```typescript
// hooks/use-privy.ts
import { usePrivy, useEmbeddedWallet } from '@privy-io/expo';

export function usePrivyWallet() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useEmbeddedWallet();

  const wallet = wallets[0];

  const sendTransaction = async (tx: TransactionPayload) => {
    if (!wallet) throw new Error('No wallet');
    return wallet.sendTransaction(tx);
  };

  return {
    ready,
    authenticated,
    user,
    wallet,
    address: wallet?.address,
    login,
    logout,
    sendTransaction,
  };
}
```

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `/strategy <goal>` | Enter planning mode, generate prompts |
| `/debug` | Strategic debugging across contracts, mobile, API |
| `/deploy-contracts` | Deploy Move contracts to Movement |
| `/contract-implement` | Implement new Move module or add features |
| `/deploy-api` | Deploy API to Vercel/Railway |

---

## Issues & Learnings System

### Before Starting These Tasks, Read Relevant Issues:

| Task Type | Read First |
|-----------|------------|
| UI/Frontend | `../docs/issues/ui/README.md` |
| Move contracts | `../docs/issues/move/README.md` |
| Indexing/GraphQL | `../docs/issues/indexer/README.md` |
| Movement network | `../docs/issues/movement/README.md` |

### When to Document a New Learning

**DOCUMENT if ALL of these are true:**
1. It caused repeated back-and-forth debugging (wasted user's time)
2. It's non-obvious (you wouldn't naturally avoid it)
3. It will happen again in future projects
4. The fix isn't easily searchable in official docs

**DO NOT document:**
- Basic syntax errors or typos
- Standard patterns you already know
- One-off edge cases unlikely to repeat
- Things covered in official documentation

### How to Add a Learning

1. Determine category: `ui/`, `move/`, `indexer/`, or `movement/`
2. Read the existing README.md in that folder
3. Add new issue following the template format (increment ID)
4. Keep it focused: problem → root cause → solution → prevention

---

## DO NOT

- **Create files over 300 lines** - They cannot be read by AI tools
- **Put everything in one screen** - Decompose into components/hooks
- **Use WebFetch for documentation** - ALWAYS use Context7 MCP
- **Skip loading skills** - Always load appropriate skill first
- **Guess Move syntax** - Look it up via Context7 or docs
- Create mock data for production features
- Skip transaction error handling
- Hardcode contract addresses in components

## DO

- **Keep files under 300 lines** - Decompose early and often
- **Load skills FIRST** - Before any task
- **Use Context7 for ALL documentation**
- **Test Move contracts thoroughly** - Before deployment
- **Use Privy for all wallet operations** - No raw key handling
- Extract business logic to hooks
- Keep screens as pure orchestration
- Put contract addresses in constants
- Handle loading/error states
- Use optimistic updates for UX
