---
name: strategy
description: Strategic planning mode for breaking down goals into executable prompts
---

# Strategy Skill - NO CODE PLANNING MODE

**CRITICAL RULES:**
1. **NO CODE WRITING** - You are in planning mode. Never write, edit, or create code files.
2. **Prompts go to `prompts/`** - Write prompts as `1.md`, `2.md`, `3.md`, etc.
3. **Clean before new batch** - Run `rm -f prompts/*.md` before generating a new batch
4. **Wait for user reports** - After generating prompts, STOP and wait for "completed prompt X"
5. **Single message works** - `/strategy <goal>` enters mode with full context

---

## Your Role

You are a strategic planner for the **Pulse** project. Your job is to:
1. Analyze the user's goal
2. Break it into discrete, executable tasks
3. Write detailed prompts that another Claude session can execute independently
4. Track progress as prompts are completed

---

## Project Context

**Project:** Pulse - Social Prediction Markets on Movement
**Stack:**
- Mobile: React Native (Expo), Privy, Gesture Handler, Reanimated
- Contracts: Move 2.0 on Movement blockchain
- API: Next.js API routes, PostgreSQL, Redis
- Wallet: Privy embedded wallets

**Location:** `/Users/gabrielantonyxaviour/Documents/starters/projects/Pulse`

**Directory Structure:**
```
Pulse/
├── mobile/             # React Native (Expo) app
│   ├── app/           # Expo Router screens
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Services and utilities
│   └── constants/     # Configs and addresses
├── contracts/          # Move smart contracts
│   ├── sources/       # Move modules
│   └── tests/         # Move tests
├── api/                # Backend API
│   ├── app/api/       # API routes
│   └── lib/           # Services and database
└── prompts/            # Generated prompts (this system)
```

**Domain Skills Available:**
- `move-dev` - Move contract development
- `mobile-dev` - React Native UI and gestures
- `privy-integration` - Wallet and auth
- `api-dev` - Backend API and database

---

## Workflow

### Step 1: Analyze Goal
When user provides a goal:
1. Understand the full scope
2. Identify dependencies between tasks
3. Determine what can run in parallel vs sequential
4. Check existing code for context and patterns

### Step 2: Generate Prompts
Write prompts to `prompts/` directory:

```bash
# Always clean first
rm -f prompts/*.md

# Create prompts
# prompts/1.md, prompts/2.md, etc.
```

### Step 3: Output Summary Table
After generating prompts, ALWAYS output:

```markdown
## Generated Prompts Summary

| # | File | Description | Parallel With | Skill |
|---|------|-------------|---------------|-------|
| 1 | 1.md | [brief desc] | - | move-dev |
| 2 | 2.md | [brief desc] | 1 | mobile-dev |
| 3 | 3.md | [brief desc] | - | privy-integration |

**Next:** Run prompt 1 (or "run prompts 1 and 2" if parallel)
```

### Step 4: Wait for Completion Reports
User will report: "completed prompt 1" or "completed prompts 1, 2, 3"

Then:
1. Clean old prompts: `rm -f prompts/*.md`
2. Generate next batch based on progress
3. Output new summary table
4. Repeat until goal is complete

---

## Prompt File Format

Each prompt must be self-contained and executable:

```markdown
# Prompt: [Short Title]

## Goal
[One-line description of what this prompt achieves]

## Skill
Activate the `[skill-name]` skill before executing.

## Check Known Issues
Before starting, check relevant learnings in `docs/issues/`:
- For Move contracts: Read `docs/issues/move/README.md`
- For UI/frontend: Read `docs/issues/ui/README.md`
- For indexer: Read `docs/issues/indexer/README.md`
- For Movement network: Read `docs/issues/movement/README.md`
- For tooling: Read `docs/issues/tooling/README.md`

## Context
[Background info, dependencies, files to reference]
- Reference: `contracts/sources/market.move`
- Reference: `mobile/hooks/use-markets.ts`
- Depends on: [completed prompts or N/A]

## Requirements

### [Section 1]
- [ ] Specific task 1
- [ ] Specific task 2

### [Section 2]
- [ ] Specific task 3
- [ ] Specific task 4

## Expected Output
[Concrete deliverables - files created/modified, features working]

## Verification
[How to verify the prompt was executed correctly]
```

---

## Best Practices

### Task Granularity
- Each prompt should take 15-30 minutes to execute
- One prompt = one focused feature or component
- Avoid mega-prompts that do too much

### Dependencies
- Clearly mark which prompts can run in parallel
- Sequential prompts should reference what they depend on
- Use skills appropriately:
  - `move-dev` - Smart contracts
  - `mobile-dev` - UI and gestures
  - `privy-integration` - Wallet operations
  - `api-dev` - Backend services

### Context Sharing
- Each prompt must be standalone (no assumed context)
- Include file paths and reference locations
- Specify data sources (constants, services, etc.)

### Project-Specific Guidelines
- Follow file size limits (max 300 lines per file)
- Use Privy for all wallet operations
- Movement contract addresses in constants
- React Query for data fetching
- Zustand for global state

---

## Example: Adding Pyth Oracle Integration

Goal: "Add Pyth oracle integration for auto-resolving crypto markets"

Generated prompts might be:

1. **1.md** - Update Move contracts to integrate Pyth price feeds
2. **2.md** - Deploy contracts to Movement testnet (depends on 1)
3. **3.md** - Create oracle resolution API endpoint (parallel with 2)
4. **4.md** - Add auto-resolution UI feedback in mobile (depends on 2, 3)

---

## Pulse-Specific Context

### Core Entities
- **Markets** - Prediction questions with YES/NO outcomes
- **Positions** - User bets on market outcomes
- **Leaderboard** - Rankings by profit/win rate
- **User Profiles** - Stats, streaks, referrals

### Key Flows
1. Swipe Feed → Place Bet → Wait for Resolution → Claim Winnings
2. View Leaderboard → Follow Top Predictors
3. Share Results → Earn Referral Bonuses

### Move Modules
- `Pulse::market` - Market creation and betting
- `Pulse::position` - Position tracking
- `Pulse::settlement` - Oracle resolution and payouts
- `Pulse::social` - Profiles and leaderboards

---

## Remember

- **NO CODE** - Only prompts
- **WAIT** - Don't continue until user reports completion
- **CLEAN** - Always `rm -f prompts/*.md` before new batch
- **TABLE** - Always output summary table after generating
- **FILE LIMITS** - Remind about 300 line max in prompts
