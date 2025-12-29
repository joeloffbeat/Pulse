#!/bin/bash
# Resolve a market manually (admin only)
# Usage: ./resolve-market.sh <market_id> <outcome>
# Example: ./resolve-market.sh 0 true   # Resolve market 0 as YES
# Example: ./resolve-market.sh 1 false  # Resolve market 1 as NO

set -e

CONTRACT_ADDRESS="0x78a349ed835712bb5056761595110896ccf3497de4ef8af46acf8cc719b32e8e"

# Check arguments
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./resolve-market.sh <market_id> <outcome>"
    echo ""
    echo "Arguments:"
    echo "  market_id - The ID of the market to resolve (0, 1, 2, ...)"
    echo "  outcome   - The resolution outcome (true = YES, false = NO)"
    echo ""
    echo "Examples:"
    echo "  ./resolve-market.sh 0 true   # Resolve market 0 as YES"
    echo "  ./resolve-market.sh 1 false  # Resolve market 1 as NO"
    echo ""
    echo "Note: Only the contract admin can resolve markets."
    echo "      Oracle-based markets are resolved automatically."
    exit 1
fi

MARKET_ID=$1
OUTCOME=$2

# Validate outcome
if [ "$OUTCOME" != "true" ] && [ "$OUTCOME" != "false" ]; then
    echo "Error: outcome must be 'true' or 'false'"
    exit 1
fi

if [ "$OUTCOME" = "true" ]; then
    OUTCOME_TEXT="YES"
else
    OUTCOME_TEXT="NO"
fi

echo "Resolving market..."
echo "  Market ID: $MARKET_ID"
echo "  Outcome: $OUTCOME_TEXT ($OUTCOME)"
echo ""

movement move run \
  --function-id "${CONTRACT_ADDRESS}::market::resolve_market" \
  --args \
    "u64:${MARKET_ID}" \
    "bool:${OUTCOME}" \
  --network testnet

echo ""
echo "Market $MARKET_ID resolved as $OUTCOME_TEXT!"
echo "Winners can now claim their rewards."
