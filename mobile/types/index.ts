// Market types
export interface Market {
  id: string;
  question: string;
  category: MarketCategory;
  resolutionTime: number;
  totalYesStake: number;
  totalNoStake: number;
  outcome: boolean | null;
  settled: boolean;
  creator: string;
  createdAt: number;
}

export type MarketCategory =
  | 'crypto'
  | 'sports'
  | 'politics'
  | 'entertainment'
  | 'weather'
  | 'custom';

// Position types
export interface Position {
  id: string;
  marketId: string;
  user: string;
  isYes: boolean;
  amount: number;
  createdAt: number;
  claimed: boolean;
}

// User types
export interface UserProfile {
  address: string;
  username?: string;
  avatarUrl?: string;
  totalBets: number;
  totalWon: number;
  winRate: number;
  streak: number;
  totalVolume?: number;
}

// UI types
export interface SwipeDirection {
  direction: 'left' | 'right' | 'up';
  velocity: number;
}

export interface BetConfirmation {
  marketId: string;
  isYes: boolean;
  amount: number;
}
