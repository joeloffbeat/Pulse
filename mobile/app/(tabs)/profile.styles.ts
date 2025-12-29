import { StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.textPrimary },
  logoutButton: { padding: SPACING.sm },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  walletIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletInfo: { flex: 1, marginLeft: SPACING.md },
  walletLabel: { fontSize: 14, color: COLORS.textMuted },
  walletAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'monospace'
  },
  balanceContainer: { alignItems: 'flex-end' },
  balanceLabel: { fontSize: 12, color: COLORS.textMuted },
  balanceValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.success },
  shareReferralButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  shareReferralText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  referralCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  referralStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  referralStat: {
    alignItems: 'center',
  },
  referralValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  referralLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
