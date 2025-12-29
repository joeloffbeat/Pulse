#!/bin/bash

set -e

PULSE_ADDRESS=${1:-"0x78a349ed835712bb5056761595110896ccf3497de4ef8af46acf8cc719b32e8e"}

echo "Creating sample markets..."

# Get current timestamp + 24 hours
TOMORROW=$(( $(date +%s) + 86400 ))

# Create BTC prediction market
echo "Creating BTC market..."
movement move run \
    --function-id "${PULSE_ADDRESS}::market::create_market" \
    --args "string:Will BTC hit \$100,000 in the next 24 hours?" "u8:0" "u64:${TOMORROW}" \
    --network testnet

# Create ETH prediction market
echo "Creating ETH market..."
movement move run \
    --function-id "${PULSE_ADDRESS}::market::create_market" \
    --args "string:Will ETH hit \$4,000 in the next 24 hours?" "u8:0" "u64:${TOMORROW}" \
    --network testnet

# Create MOVE prediction market
NEXT_WEEK=$(( $(date +%s) + 604800 ))
echo "Creating MOVE market..."
movement move run \
    --function-id "${PULSE_ADDRESS}::market::create_market" \
    --args "string:Will MOVE reach new ATH this week?" "u8:0" "u64:${NEXT_WEEK}" \
    --network testnet

# Create sports market
echo "Creating sports market..."
movement move run \
    --function-id "${PULSE_ADDRESS}::market::create_market" \
    --args "string:Will the Lakers win their next game?" "u8:1" "u64:${TOMORROW}" \
    --network testnet

# Create weather market
echo "Creating weather market..."
movement move run \
    --function-id "${PULSE_ADDRESS}::market::create_market" \
    --args "string:Will it snow in NYC tomorrow?" "u8:4" "u64:${TOMORROW}" \
    --network testnet

echo ""
echo "Sample markets created!"
echo ""
echo "Verify markets with:"
echo "movement move view --function-id ${PULSE_ADDRESS}::market::get_markets_count --network testnet"
