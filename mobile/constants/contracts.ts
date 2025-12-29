// Contract addresses - Deployed to Movement Testnet
export const PULSE_ADDRESS = '0x78a349ed835712bb5056761595110896ccf3497de4ef8af46acf8cc719b32e8e';

// Contract module names
export const MODULES = {
  MARKET: `${PULSE_ADDRESS}::market`,
  POSITION: `${PULSE_ADDRESS}::position`,
  TREASURY: `${PULSE_ADDRESS}::treasury`,
  REFERRAL: `${PULSE_ADDRESS}::referral`,
} as const;

// Bet limits (in Octas - 1 MOVE = 100,000,000 Octas)
export const BET_LIMITS = {
  MIN: 10_000_000,      // 0.1 MOVE (~$0.10)
  MAX: 1_000_000_000,   // 10 MOVE (~$10.00)
  DEFAULT: 100_000_000, // 1 MOVE (~$1.00)
} as const;

// Preset bet amounts
export const BET_PRESETS = [
  { label: '$0.10', value: 10_000_000 },
  { label: '$0.50', value: 50_000_000 },
  { label: '$1.00', value: 100_000_000 },
  { label: '$5.00', value: 500_000_000 },
  { label: '$10.00', value: 1_000_000_000 },
] as const;

// API endpoints
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://privy-backend-1.onrender.com';
