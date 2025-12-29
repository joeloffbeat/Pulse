---
description: Implement new Move module or add features to existing contracts
argument: <what to implement - new module or feature>
---

# Move Contract Implementation

Create new Move modules or add features to existing ones, with proper tests.

**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- Load `move-dev` skill
- **Read `docs/issues/move/README.md`** for known pitfalls
- Read `contracts/sources/` for existing implementations
- Check `contracts/Move.toml` for dependencies

### Context7 Lookups (if unsure about syntax)

Before implementing, look up current patterns if needed:
- Move syntax: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/aptos-labs/aptos-core", topic: "move modules" })`
- Coin/Token: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/aptos-labs/aptos-core", topic: "coin" })`
- Events: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/aptos-labs/aptos-core", topic: "events" })`

## Input

User provides:
- What to implement (new module or feature for existing)
- Requirements and expected behavior
- Any specific constraints

## Steps

### 1. Analyze Request

Determine if this is:
- **New Module:** Create from scratch in `contracts/sources/`
- **New Feature:** Add to existing module

### 2. Design Before Coding

Plan the implementation:
- Structs needed (with abilities)
- Entry functions
- View functions
- Events for indexing
- Error codes
- Access control requirements

### 3. Implement

**For New Module (`contracts/sources/new_module.move`):**
```move
module Pulse::new_module {
    use std::string::String;
    use std::signer;
    use aptos_framework::event;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INVALID_STATE: u64 = 2;

    /// Structs
    struct MyStruct has key, store {
        field: u64,
    }

    /// Events
    #[event]
    struct MyEvent has drop, store {
        user: address,
        value: u64,
    }

    /// Entry functions
    public entry fun my_function(
        sender: &signer,
        arg: u64,
    ) acquires MyStruct {
        let sender_addr = signer::address_of(sender);
        // Implementation
        event::emit(MyEvent { user: sender_addr, value: arg });
    }

    /// View functions
    #[view]
    public fun get_value(addr: address): u64 acquires MyStruct {
        borrow_global<MyStruct>(addr).field
    }
}
```

### 4. Write Tests

Location: `contracts/tests/new_module_tests.move`

```move
#[test_only]
module Pulse::new_module_tests {
    use Pulse::new_module;
    use std::signer;

    #[test(account = @0x1)]
    fun test_happy_path(account: &signer) {
        new_module::my_function(account, 100);
        let value = new_module::get_value(signer::address_of(account));
        assert!(value == 100, 0);
    }

    #[test(account = @0x1)]
    #[expected_failure(abort_code = new_module::E_INVALID_STATE)]
    fun test_invalid_state(account: &signer) {
        // Test that triggers error
    }
}
```

### 5. Build & Test

```bash
cd contracts
movement move build
movement move test -v
```

## Success Checklist

- [ ] Module compiles: `movement move build` exits without errors
- [ ] All tests pass: `movement move test` shows green
- [ ] Events added for state changes (needed for indexing)
- [ ] Error codes for all failure cases
- [ ] View functions for reading state

## Example Usage

```
/contract-implement Create a position module that tracks user bets.
Need structs for Position (market_id, user, is_yes, amount, claimed).
Entry functions: place_bet, claim_winnings.
View functions: get_position, get_user_positions.
```

```
/contract-implement Add Pyth oracle integration to market module.
Need to import Pyth price feeds and verify prices before settlement.
```

---

## If This Fails

### Error: "type ability mismatch"
**Cause:** Struct missing required ability (key, store, drop, copy)
**Fix:** Add appropriate abilities based on usage

### Error: "resource does not exist"
**Cause:** Trying to borrow global that wasn't initialized
**Fix:** Check move_to was called first, add initialization function

### Error: "test failure"
**Fix:** Run `movement move test -v` for detailed output
