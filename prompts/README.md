# Pulse MVP Completion - Prompt Sequence

Generated: 2025-12-29

## Current State Analysis

**Completion: ~90%**

### What's Done
- ✅ Mobile UI - Feed, Bets, Profile screens
- ✅ Smart contracts - 6 modules deployed (market, position, treasury, oracle, referral, market_views)
- ✅ Backend API - All endpoints functional at `mobile/expo-backend/`
- ✅ Privy embedded wallet integration
- ✅ Onboarding flow with tutorial
- ✅ Leaderboard and referral system
- ✅ Admin scripts for market creation/resolution
- ✅ ClaimableBanner component

### Critical Issues Found
1. **UserScreen.tsx is 617 lines** - MUST decompose (limit: 300)
2. **Deep link routing incomplete** - TODO in `_layout.tsx:30`
3. **Pyth auto-resolution not integrated** - Service exists but not triggered
4. **E2E testing not done** - Need verification of full flow

---

## Prompts Overview

| # | Title | Priority | Focus Area | Est. Time |
|---|-------|----------|------------|-----------|
| 1 | Decompose UserScreen.tsx | P0 | UI | 2-3 hours |
| 2 | Deep Link Navigation | P1 | Mobile | 1-2 hours |
| 3 | Pyth Auto-Resolution Worker | P1 | Backend | 3-4 hours |
| 4 | Free $1 Credit System | P0 | Full-stack | 2-3 hours |
| 5 | Error Handling & Edge Cases | P1 | Full-stack | 2-3 hours |
| 6 | E2E Testing & Bug Fixes | P0 | Testing | 4-6 hours |
| 7 | Polish & Animations | P2 | UI | 2-3 hours |
| 8 | Deployment Verification | P0 | DevOps | 2-3 hours |

---

## Execution Order

**Phase 1 (Can run in parallel):**
- Prompt 1, 2 - UI/Mobile fixes

**Phase 2 (Can run in parallel):**
- Prompt 3, 4 - Backend/Full-stack features

**Phase 3:**
- Prompt 5 - Error handling (after features complete)

**Phase 4:**
- Prompt 6 - E2E testing (requires all features)

**Phase 5 (Optional polish):**
- Prompt 7 - Polish

**Final:**
- Prompt 8 - Deployment verification

---

## How to Run Prompts

1. Start a fresh Claude session
2. Say: "run prompt N" (e.g., "run prompt 1")
3. Claude reads `prompts/N.md` and executes all steps
4. After completion, report: "completed prompt N"
5. If blocked, document issue in `docs/issues/` before moving on

---

## Success Criteria (MVP Complete When)

- [ ] All files under 300 lines
- [ ] User can login with Privy
- [ ] User can view 3+ active markets
- [ ] User can swipe to place YES/NO bets
- [ ] User can view positions in "My Bets"
- [ ] User can claim winnings (individual + all)
- [ ] New users get $1 welcome bonus
- [ ] Deep links work for market/referral sharing
- [ ] Oracle-based markets auto-resolve
- [ ] Leaderboard displays correctly
- [ ] No critical bugs in happy path

---

## Issues Documentation

Before starting each prompt, check relevant issues:
- UI tasks → `docs/issues/ui/README.md`
- Move tasks → `docs/issues/move/README.md`
- Movement/Wallet → `docs/issues/movement/README.md`
- Indexer/API → `docs/issues/indexer/README.md`
- Tooling → `docs/issues/tooling/README.md`

Document any new issues discovered during execution!
