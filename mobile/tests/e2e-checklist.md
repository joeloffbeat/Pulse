# Pulse E2E Testing Checklist

## 1. User Onboarding Flow

### First Time User
- [ ] App opens to onboarding screen
- [ ] Swipe through all onboarding slides
- [ ] Complete onboarding
- [ ] Redirected to login screen
- [ ] Onboarding doesn't show again after completion

### Login Flow
- [ ] Login with email/social
- [ ] Wallet auto-created on first login
- [ ] User sees feed screen after login

### Deep Links
- [ ] `pulse://market/1` navigates to feed with market highlighted
- [ ] `pulse://ref/ABC123` stores referral code
- [ ] `pulse://bets` navigates to bets tab
- [ ] `pulse://profile` navigates to profile tab

---

## 2. Market Feed Flow

### Swipe Interactions
- [ ] Swipe right opens YES bet modal
- [ ] Swipe left opens NO bet modal
- [ ] Swipe down skips market
- [ ] Card returns to center if released mid-swipe
- [ ] Next card appears after swipe completes

### Market Display
- [ ] Question displays correctly
- [ ] Category icon/color is correct
- [ ] Time remaining shows accurate countdown
- [ ] Yes/No percentages calculate correctly
- [ ] Skeleton loader shows while loading

### Edge Cases
- [ ] Empty state shows when no markets
- [ ] Pull to refresh works
- [ ] Markets filter out expired ones

---

## 3. Betting Flow

### Bet Modal
- [ ] Opens with correct market info
- [ ] Shows current wallet balance
- [ ] Amount input accepts valid numbers
- [ ] Validates min bet (0.1 MOVE)
- [ ] Validates max bet (10 MOVE)
- [ ] Validates against wallet balance
- [ ] Potential payout calculates correctly

### Transaction
- [ ] Confirm button triggers transaction
- [ ] Loading state shows during tx
- [ ] Success toast on completion
- [ ] Error toast on failure
- [ ] Balance updates after bet
- [ ] Modal closes on success

### Edge Cases
- [ ] Cannot bet on expired market
- [ ] Cannot bet on settled market
- [ ] Handles transaction timeout
- [ ] Handles insufficient balance

---

## 4. My Bets Tab

### Position Display
- [ ] Active bets show in Active tab
- [ ] Settled bets show in Settled tab
- [ ] Claimable banner shows when winnings available
- [ ] Position shows correct amount
- [ ] Position shows correct side (YES/NO)

### Claim Flow
- [ ] Claim All button works
- [ ] Progress shows during batch claim
- [ ] Celebration animation plays
- [ ] Balance updates after claim
- [ ] Claimed positions marked correctly

### Edge Cases
- [ ] Empty state when no bets
- [ ] Handle claim failure gracefully
- [ ] Refetch on pull down

---

## 5. Profile Tab

### Wallet Display
- [ ] Shows wallet address
- [ ] Shows MOVE balance
- [ ] Balance refreshes correctly

### Quick Actions
- [ ] Faucet request works
- [ ] Account info shows
- [ ] Send transaction works

### Logout
- [ ] Logout button works
- [ ] Redirected to login screen
- [ ] Wallet state cleared

---

## 6. Welcome Bonus Flow

### First-Time User
- [ ] Bonus claim available
- [ ] Claim transaction succeeds
- [ ] Balance updates with $1 credit
- [ ] Cannot claim twice

### Bonus Usage
- [ ] Bonus shows in balance display
- [ ] Can place bet with bonus

---

## 7. Error Handling

### Network Errors
- [ ] Offline state detected
- [ ] Retry button works
- [ ] Error toast shows for API failures

### Contract Errors
- [ ] Error code mapped to message
- [ ] User-friendly error shown
- [ ] Transaction failures handled

### App Errors
- [ ] ErrorBoundary catches crashes
- [ ] Retry restores app state

---

## 8. Edge Cases

### Race Conditions
- [ ] Double-tap bet prevented
- [ ] Double-tap claim prevented
- [ ] Stale data refresh handled

### State Persistence
- [ ] App restore maintains login
- [ ] Onboarding state persists
- [ ] Referral code persists

---

## Known Issues to Fix

1. **[FIXED]** UserScreen.tsx was 617 lines - decomposed
2. **[FIXED]** Deep link handling was TODO - implemented
3. **[FIXED]** No error boundary - added
4. **[FIXED]** No toast system - added
5. **[CHECK]** API error responses may not be consistent

---

## Test Commands

```bash
# Run API server
cd mobile/expo-backend && npm run dev

# Run resolution worker
cd mobile/expo-backend && npm run worker:resolution

# Run mobile app
cd mobile && npm run start
```
