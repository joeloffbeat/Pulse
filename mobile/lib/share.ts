import * as Linking from 'expo-linking';
import { Share, Platform } from 'react-native';

interface ShareContent {
  marketId: string;
  question: string;
  prediction: 'YES' | 'NO';
  payout: number;
  winRate?: number;
}

/**
 * Generate shareable content for a winning prediction
 */
export function generateShareContent(content: ShareContent): {
  title: string;
  message: string;
  url: string;
} {
  const { marketId, question, prediction, payout, winRate } = content;

  const emoji = prediction === 'YES' ? '📈' : '📉';
  const payoutStr = (payout / 100_000_000).toFixed(2); // Convert from Octas

  const title = `I won on Pulse! ${emoji}`;
  const message = winRate
    ? `${emoji} I predicted ${prediction} on "${question}" and won ${payoutStr} MOVE!\n\nMy win rate: ${winRate}%\n\nJoin me on Pulse!`
    : `${emoji} I predicted ${prediction} on "${question}" and won ${payoutStr} MOVE!\n\nJoin me on Pulse!`;

  // Deep link URL (configure in app.json scheme)
  const url = Linking.createURL(`/market/${marketId}`);

  return { title, message, url };
}

/**
 * Share winning prediction
 */
export async function shareWin(content: ShareContent): Promise<boolean> {
  const { title, message, url } = generateShareContent(content);

  try {
    if (Platform.OS === 'web') {
      // Web share API
      if (navigator.share) {
        await navigator.share({ title, text: message, url });
        return true;
      }
      return false;
    }

    // Native share
    const result = await Share.share({
      title,
      message: `${message}\n\n${url}`,
      url, // iOS only
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Error sharing:', error);
    return false;
  }
}

/**
 * Generate referral link
 */
export function generateReferralLink(address: string): string {
  return Linking.createURL(`/ref/${address.slice(0, 8)}`);
}

/**
 * Share referral link
 */
export async function shareReferral(address: string, winRate?: number): Promise<boolean> {
  const referralLink = generateReferralLink(address);

  const message = winRate && winRate > 50
    ? `🎯 I'm crushing it on Pulse with a ${winRate}% win rate!\n\nJoin me and start predicting:`
    : `🔥 Join me on Pulse - the swipe-to-predict app!\n\nMake predictions and win rewards:`;

  try {
    const result = await Share.share({
      title: 'Join Pulse',
      message: `${message}\n\n${referralLink}`,
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Error sharing referral:', error);
    return false;
  }
}
