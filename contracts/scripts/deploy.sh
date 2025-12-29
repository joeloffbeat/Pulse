#!/bin/bash

set -e

echo "Deploying Pulse contracts to Movement Testnet..."

# Check if Movement CLI is installed
if ! command -v movement &> /dev/null; then
    echo "Movement CLI not found. Please install it first."
    exit 1
fi

# Navigate to contracts directory
cd "$(dirname "$0")/.."

# Build contracts
echo "Building contracts..."
movement move build

# Deploy to testnet
echo "Publishing to testnet..."
movement move publish --network testnet --named-addresses Pulse=default

# Get the deployed address
echo ""
echo "Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Copy the deployed address from above"
echo "2. Update mobile/constants/contracts.ts with the address"
echo "3. Update mobile/expo-backend/.env with PULSE_ADDRESS"
echo ""
