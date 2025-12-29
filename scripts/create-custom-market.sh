#!/bin/bash
# Create a custom prediction market (admin resolved, no oracle)
# Usage: ./create-custom-market.sh <question> <hours_until_resolution> [category]
# Example: ./create-custom-market.sh "Will it rain in NYC tomorrow?" 24 4

set -e

CONTRACT_ADDRESS="0x78a349ed835712bb5056761595110896ccf3497de4ef8af46acf8cc719b32e8e"

# Categories:
# 0 = CRYPTO
# 1 = SPORTS
# 2 = POLITICS
# 3 = ENTERTAINMENT
# 4 = WEATHER
# 5 = CUSTOM

# Check arguments
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./create-custom-market.sh <question> <hours_until_resolution> [category]"
    echo ""
    echo "Categories:"
    echo "  0 = CRYPTO"
    echo "  1 = SPORTS"
    echo "  2 = POLITICS"
    echo "  3 = ENTERTAINMENT"
    echo "  4 = WEATHER"
    echo "  5 = CUSTOM (default)"
    echo ""
    echo "Examples:"
    echo "  ./create-custom-market.sh \"Will Lakers win tonight?\" 12 1"
    echo "  ./create-custom-market.sh \"Will Bitcoin dominance exceed 60%?\" 168 0"
    exit 1
fi

QUESTION=$1
HOURS=$2
CATEGORY=${3:-5}  # Default to CUSTOM category

# Calculate resolution time (current time + hours in seconds)
RESOLUTION_TIME=$(($(date +%s) + HOURS * 3600))

# Get category name for display
case $CATEGORY in
    0) CATEGORY_NAME="CRYPTO" ;;
    1) CATEGORY_NAME="SPORTS" ;;
    2) CATEGORY_NAME="POLITICS" ;;
    3) CATEGORY_NAME="ENTERTAINMENT" ;;
    4) CATEGORY_NAME="WEATHER" ;;
    5) CATEGORY_NAME="CUSTOM" ;;
    *) echo "Invalid category. Must be 0-5."; exit 1 ;;
esac

echo "Creating custom market..."
echo "  Question: $QUESTION"
echo "  Category: $CATEGORY_NAME ($CATEGORY)"
echo "  Resolution time: $(date -r $RESOLUTION_TIME)"
echo "  Resolution type: Admin (manual)"
echo ""

movement move run \
  --function-id "${CONTRACT_ADDRESS}::market::create_market" \
  --args \
    "string:${QUESTION}" \
    "u8:${CATEGORY}" \
    "u64:${RESOLUTION_TIME}" \
  --network testnet

echo ""
echo "Market created successfully!"
echo "This market requires manual resolution using ./resolve-market.sh"
echo "Run ./list-markets.sh to see all markets"
