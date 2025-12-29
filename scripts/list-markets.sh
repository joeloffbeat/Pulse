#!/bin/bash
# List all markets or active markets
# Usage: ./list-markets.sh [active]
# Example: ./list-markets.sh         # List market count
# Example: ./list-markets.sh active  # List active markets

set -e

CONTRACT_ADDRESS="0x78a349ed835712bb5056761595110896ccf3497de4ef8af46acf8cc719b32e8e"

MODE=${1:-"count"}

if [ "$MODE" = "active" ]; then
    echo "Fetching active markets..."
    echo ""
    movement move view \
      --function-id "${CONTRACT_ADDRESS}::market::get_active_markets" \
      --network testnet
elif [ "$MODE" = "all" ]; then
    echo "Fetching all markets (first 100)..."
    echo ""
    movement move view \
      --function-id "${CONTRACT_ADDRESS}::market::get_markets_paginated" \
      --args "u64:0" "u64:100" \
      --network testnet
else
    echo "Fetching market count..."
    echo ""
    movement move view \
      --function-id "${CONTRACT_ADDRESS}::market::get_markets_count" \
      --network testnet
    echo ""
    echo "Use './list-markets.sh active' to see active markets"
    echo "Use './list-markets.sh all' to see all markets"
fi
