#!/bin/bash

set -e

PULSE_ADDRESS=${1:-"0x78a349ed835712bb5056761595110896ccf3497de4ef8af46acf8cc719b32e8e"}

echo "Initializing Pulse contracts..."

# Initialize market module
echo "Initializing market registry..."
movement move run \
    --function-id "${PULSE_ADDRESS}::market::initialize" \
    --network testnet

# Initialize position module
echo "Initializing position registry..."
movement move run \
    --function-id "${PULSE_ADDRESS}::position::initialize" \
    --network testnet

# Initialize treasury module
echo "Initializing treasury..."
movement move run \
    --function-id "${PULSE_ADDRESS}::treasury::initialize" \
    --network testnet

echo ""
echo "All modules initialized!"
