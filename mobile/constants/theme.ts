export const COLORS = {
  // Brand
  primary: '#8B5CF6',      // Purple
  secondary: '#EC4899',    // Pink

  // Swipe indicators
  yes: '#10B981',          // Green
  no: '#EF4444',           // Red
  skip: '#6B7280',         // Gray

  // Backgrounds
  background: '#0F172A',   // Dark blue
  surface: '#1E293B',      // Slate
  card: '#334155',         // Card bg

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
