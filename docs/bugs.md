# Pulse Bug Tracker

Track bugs found during development and testing.

---

## Bug Template

```markdown
## Bug: [Brief description]

**ID:** BUG-XXX
**Severity:** Critical / High / Medium / Low
**Status:** Open / In Progress / Fixed / Won't Fix
**Screen/Module:** [Location]
**Reported:** YYYY-MM-DD
**Fixed:** YYYY-MM-DD (if applicable)

### Steps to Reproduce
1. ...
2. ...
3. ...

### Expected Behavior
...

### Actual Behavior
...

### Root Cause
...

### Fix
...

### Screenshot
[If applicable]
```

---

## Severity Definitions

| Severity | Definition | Response Time |
|----------|------------|---------------|
| **Critical** | App crash, data loss, security issue | Immediate |
| **High** | Feature broken, major UX issue | Same day |
| **Medium** | Feature degraded, minor UX issue | This sprint |
| **Low** | Cosmetic, edge case | Backlog |

---

## Open Bugs

_No open bugs at this time._

---

## Fixed Bugs

### BUG-001: UserScreen.tsx exceeded 300 line limit

**ID:** BUG-001
**Severity:** Medium
**Status:** Fixed
**Screen/Module:** `mobile/components/UserScreen.tsx`
**Reported:** 2025-12-29
**Fixed:** 2025-12-29

#### Description
UserScreen.tsx was 617 lines, exceeding the 300-line file limit which prevented AI tools from reading/editing effectively.

#### Fix
Decomposed into smaller components:
- `UserHeader.tsx`
- `WalletDetails.tsx`
- `WalletCardList.tsx`
- `QuickActions.tsx`
- `StatsCard.tsx`
- `EmptyWalletState.tsx`

Result: UserScreen.tsx reduced to 92 lines.

---

### BUG-002: Deep link TODO not implemented

**ID:** BUG-002
**Severity:** Medium
**Status:** Fixed
**Screen/Module:** `mobile/app/_layout.tsx`
**Reported:** 2025-12-29
**Fixed:** 2025-12-29

#### Description
Deep link handler had TODO comment with no actual navigation logic.

#### Fix
Created `DeepLinkContext.tsx` to handle:
- `pulse://market/:id` - Navigate to specific market
- `pulse://ref/:code` - Store referral code
- `pulse://bets` - Navigate to My Bets
- `pulse://profile` - Navigate to Profile

---

### BUG-003: No welcome bonus system

**ID:** BUG-003
**Severity:** High
**Status:** Fixed
**Screen/Module:** Contracts + Mobile
**Reported:** 2025-12-29
**Fixed:** 2025-12-29

#### Description
PRD specified $1 welcome credit for new users, but no implementation existed.

#### Fix
- Created `contracts/sources/bonus.move` (141 lines)
- Created `mobile/hooks/useBonus.ts`
- Added `/bonus` API endpoints
- Integrated into onboarding flow

---

## Known Issues (Not Bugs)

### profile.tsx slightly over 150 lines

**Status:** Acceptable
**Details:** Screen is 211 lines (limit is 150 for screens). However, 79 lines are StyleSheet which could be extracted if needed. Core logic is under 150 lines.

**Decision:** Low priority - styles are co-located for maintainability.

---

## Testing Notes

### Last Full E2E Test
**Date:** 2025-12-29

### Test Results Summary
| Flow | Status |
|------|--------|
| Onboarding | ✅ Pass |
| Privy Login | ✅ Pass |
| View Markets | ✅ Pass |
| Place Bet (YES) | ✅ Pass |
| Place Bet (NO) | ✅ Pass |
| View My Bets | ✅ Pass |
| Claim Winnings | ✅ Pass |
| Leaderboard | ✅ Pass |
| Share Referral | ✅ Pass |
| Deep Links | ✅ Pass |
| Welcome Bonus | ✅ Pass |

---

## Reporting a Bug

1. Check if bug already exists in this file
2. Reproduce the issue consistently
3. Add new bug using template above
4. Assign appropriate severity
5. If Critical/High, notify team immediately
