/**
 * Contract error codes and their user-friendly messages
 */

// Market module errors (0-99)
const MARKET_ERRORS: Record<number, string> = {
  1: 'You don\'t have permission to perform this action',
  2: 'Market not found',
  3: 'Market has already been settled',
  4: 'Market has not been settled yet',
  5: 'Invalid category',
  6: 'Market has expired',
  8: 'Already initialized',
  9: 'No oracle configuration found',
  10: 'Market has not expired yet',
};

// Position module errors (100-199)
const POSITION_ERRORS: Record<number, string> = {
  101: 'Position not found',
  102: 'Winnings already claimed',
  103: 'Market has not been settled yet',
  104: 'You did not win this bet',
  106: 'Bet amount too small (minimum $0.10)',
  107: 'Bet amount too large (maximum $10)',
  108: 'Market has expired - no more bets allowed',
  109: 'You don\'t own this position',
  110: 'Already initialized',
};

// Treasury module errors (200-299)
const TREASURY_ERRORS: Record<number, string> = {
  201: 'You don\'t have permission to perform this action',
  202: 'Insufficient treasury balance',
  203: 'Invalid fee percentage',
  204: 'Already initialized',
  205: 'Treasury not initialized',
};

// Bonus module errors (300-399)
const BONUS_ERRORS: Record<number, string> = {
  301: 'You don\'t have permission to perform this action',
  302: 'Welcome bonus already claimed',
  303: 'Insufficient bonus balance',
  304: 'Already initialized',
};

// Combined error map
const CONTRACT_ERRORS: Record<number, string> = {
  ...MARKET_ERRORS,
  ...POSITION_ERRORS,
  ...TREASURY_ERRORS,
  ...BONUS_ERRORS,
};

/**
 * Parse a contract error code into a user-friendly message
 */
export function parseContractError(code: number): string {
  return CONTRACT_ERRORS[code] ?? `Unknown error (code: ${code})`;
}

/**
 * Extract error code from VM status string
 * e.g., "Move abort in 0x...::market: 0x6" -> 6
 */
export function extractErrorCode(vmStatus: string): number | null {
  // Match patterns like "0x6" at the end
  const hexMatch = vmStatus.match(/0x([0-9a-fA-F]+)$/);
  if (hexMatch) {
    return parseInt(hexMatch[1], 16);
  }

  // Match patterns like "abort code: 6"
  const decMatch = vmStatus.match(/abort code:\s*(\d+)/i);
  if (decMatch) {
    return parseInt(decMatch[1], 10);
  }

  return null;
}

/**
 * Parse VM status into user-friendly error message
 */
export function parseVmStatus(vmStatus: string): string {
  if (vmStatus === 'Executed successfully') {
    return 'Transaction successful';
  }

  const errorCode = extractErrorCode(vmStatus);
  if (errorCode !== null) {
    return parseContractError(errorCode);
  }

  // Common VM errors
  if (vmStatus.includes('INSUFFICIENT_BALANCE')) {
    return 'Insufficient balance for this transaction';
  }
  if (vmStatus.includes('OUT_OF_GAS')) {
    return 'Transaction ran out of gas';
  }
  if (vmStatus.includes('SEQUENCE_NUMBER')) {
    return 'Transaction sequence error - please try again';
  }

  return 'Transaction failed. Please try again.';
}

export { CONTRACT_ERRORS };
