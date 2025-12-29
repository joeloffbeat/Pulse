#!/bin/bash
# Create an ETH prediction market with Pyth oracle resolution
# Usage: ./create-eth-market.sh <price_threshold> <hours_until_resolution>
# Example: ./create-eth-market.sh 4000 24

set -e

CONTRACT_ADDRESS="0x78a349ed835712bb5056761595110896ccf3497de4ef8af46acf8cc719b32e8e"
ETH_FEED_ID="ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
CATEGORY_CRYPTO=0

# Check arguments
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./create-eth-market.sh <price_threshold> <hours_until_resolution>"
    echo "Example: ./create-eth-market.sh 4000 24"
    echo "  Creates: 'Will ETH be above \$4,000 in 24 hours?'"
    exit 1
fi

THRESHOLD=$1
HOURS=$2

# Calculate resolution time (current time + hours in seconds)
RESOLUTION_TIME=$(($(date +%s) + HOURS * 3600))

# Convert threshold to 8 decimals (Pyth format)
# $4,000 = 4000 * 10^8 = 400000000000
THRESHOLD_8_DECIMALS="${THRESHOLD}00000000"

# Format price with commas for display
FORMATTED_PRICE=$(printf "%'d" $THRESHOLD)

QUESTION="Will ETH be above \$${FORMATTED_PRICE} in ${HOURS} hours?"

echo "Creating ETH market..."
echo "  Question: $QUESTION"
echo "  Threshold: \$${FORMATTED_PRICE} (${THRESHOLD_8_DECIMALS} in 8 decimals)"
echo "  Resolution time: $(date -r $RESOLUTION_TIME)"
echo ""

movement move run \
  --function-id "${CONTRACT_ADDRESS}::market::create_market_with_oracle" \
  --args \
    "string:${QUESTION}" \
    "u8:${CATEGORY_CRYPTO}" \
    "u64:${RESOLUTION_TIME}" \
    "hex:${ETH_FEED_ID}" \
    "u64:${THRESHOLD_8_DECIMALS}" \
    "bool:true" \
  --network testnet

echo ""
echo "Market created successfully!"
echo "Run ./list-markets.sh to see all markets"
