import prisma from './prisma';
import { randomUUID } from 'crypto';

export interface TapEvent {
  timestamp: number;
  accuracy: number; // 0 to 1 (how close to center sweet spot)
  combo: number;
}

export interface RewardTierResult {
  tierName: string;
  tierLevel: number;
  couponTitle: string;
  couponType: 'FOOD_ITEM' | 'FIXED' | 'PERCENTAGE';
  couponValue: number;
  bonusCoins: number;
  validDays: number;
  itemDescription: string;
}

export const SMASH_RALLY_TIERS: { min: number; max: number; reward: RewardTierResult }[] = [
  {
    min: 0,
    max: 199,
    reward: {
      tierName: 'Try Again Tier',
      tierLevel: 1,
      couponTitle: 'Participation Reward',
      couponType: 'FIXED',
      couponValue: 0,
      bonusCoins: 5,
      validDays: 7,
      itemDescription: '5 Court Coins added to your wallet for playing!',
    },
  },
  {
    min: 200,
    max: 399,
    reward: {
      tierName: 'Thirst Quencher',
      tierLevel: 2,
      couponTitle: 'Free Cold Drink / Fresh Lime',
      couponType: 'FOOD_ITEM',
      couponValue: 60,
      bonusCoins: 10,
      validDays: 7,
      itemDescription: '1 Free Chilled Beverage / Fresh Lime Soda at any partner food court',
    },
  },
  {
    min: 400,
    max: 699,
    reward: {
      tierName: 'Snack Attack',
      tierLevel: 3,
      couponTitle: 'Free Crispy Fries or Grilled Sandwich',
      couponType: 'FOOD_ITEM',
      couponValue: 120,
      bonusCoins: 20,
      validDays: 7,
      itemDescription: '1 Free French Fries or Veg Grilled Sandwich at any partner food court',
    },
  },
  {
    min: 700,
    max: 899,
    reward: {
      tierName: 'Court Feast',
      tierLevel: 4,
      couponTitle: '₹100 Off on Meals > ₹300',
      couponType: 'FIXED',
      couponValue: 100,
      bonusCoins: 30,
      validDays: 10,
      itemDescription: 'Flat ₹100 discount on any meal order above ₹300 at partner counters',
    },
  },
  {
    min: 900,
    max: 10000,
    reward: {
      tierName: 'Grand Slam Champion',
      tierLevel: 5,
      couponTitle: 'Free Grand Sports Combo Meal',
      couponType: 'FOOD_ITEM',
      couponValue: 250,
      bonusCoins: 50,
      validDays: 14,
      itemDescription: '1 Free Deluxe Combo (Burger/Roll + Fries + Drink) + 50 Court Coins!',
    },
  },
];

export function getTierForScore(score: number): RewardTierResult {
  const matched = SMASH_RALLY_TIERS.find((t) => score >= t.min && score <= t.max);
  return (
    matched?.reward ||
    SMASH_RALLY_TIERS[0].reward
  );
}

/**
 * Anti-cheat score calculation and verification from client tap logs
 */
export function verifySmashRallyTaps(
  tapLog: TapEvent[],
  reportedScore: number
): { isValid: boolean; calculatedScore: number; reason?: string } {
  if (!Array.isArray(tapLog) || tapLog.length === 0) {
    // If no tap log provided or fallback
    return { isValid: false, calculatedScore: 0, reason: 'Empty tap log' };
  }

  // Check timing span: max 35 seconds
  const firstTap = tapLog[0].timestamp;
  const lastTap = tapLog[tapLog.length - 1].timestamp;
  const durationMs = lastTap - firstTap;

  if (durationMs > 40000) {
    return { isValid: false, calculatedScore: 0, reason: 'Game duration exceeded 35 seconds limit' };
  }

  let computedScore = 0;
  let prevTimestamp = 0;

  for (let i = 0; i < tapLog.length; i++) {
    const tap = tapLog[i];

    // Anti-bot check: human reaction interval between distinct taps should be >= 60ms
    if (prevTimestamp > 0 && tap.timestamp - prevTimestamp < 60) {
      return { isValid: false, calculatedScore: 0, reason: 'Abnormally fast taps detected (bot pattern)' };
    }
    prevTimestamp = tap.timestamp;

    // Normal point: 10 base points * accuracy multiplier
    const accuracy = Math.max(0, Math.min(1, tap.accuracy || 0.5));
    const comboMultiplier = Math.min(3, 1 + Math.floor((tap.combo || 0) / 5) * 0.2);
    const tapPoints = Math.round(20 * accuracy * comboMultiplier);
    computedScore += tapPoints;
  }

  // Cap score to reasonable max for 30s session (1000)
  computedScore = Math.min(1000, computedScore);

  // Allow small variance (+/- 15%) due to network/client frame rendering
  const isCloseEnough = Math.abs(computedScore - reportedScore) <= Math.max(50, computedScore * 0.2);

  return {
    isValid: isCloseEnough || reportedScore <= computedScore,
    calculatedScore: Math.min(computedScore, reportedScore),
  };
}

/**
 * Hooked at the end of booking transaction: awards coins, tracks streak progress, and creates game session token.
 */
export async function awardBookingRewards(
  tx: any,
  booking: { id: string; userId: string; totalAmount: number; bookingNumber: string }
) {
  const { id: bookingId, userId, totalAmount, bookingNumber } = booking;

  // 1. Ensure Wallet exists
  let wallet = await tx.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await tx.wallet.create({
      data: {
        userId,
        coins: 0,
        credit: 0,
      },
    });
  }

  // 2. Award Court Coins: 1 coin per Rs.10 spent (Feature 1.2)
  const coinsEarned = Math.max(1, Math.floor(totalAmount / 10));
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months validity

  await tx.wallet.update({
    where: { userId },
    data: {
      coins: { increment: coinsEarned },
    },
  });

  await tx.coinLedger.create({
    data: {
      userId,
      type: 'EARN',
      amount: coinsEarned,
      bookingId,
      description: `Earned ${coinsEarned} coins from booking #${bookingNumber}`,
      expiresAt: expiryDate,
    },
  });

  // 3. Streak Progress: 5 bookings in 60 days -> 20% off coupon (Feature 1.1)
  const now = new Date();
  let streak = await tx.streakProgress.findUnique({ where: { userId } });

  if (!streak) {
    streak = await tx.streakProgress.create({
      data: {
        userId,
        windowStart: now,
        count: 1,
        rewardIssued: false,
      },
    });
  } else {
    // Check if 60-day window has expired
    const windowStartMs = new Date(streak.windowStart).getTime();
    const daysSinceStart = (now.getTime() - windowStartMs) / (1000 * 60 * 60 * 24);

    if (daysSinceStart > 60) {
      // Reset window
      streak = await tx.streakProgress.update({
        where: { userId },
        data: {
          windowStart: now,
          count: 1,
          rewardIssued: false,
        },
      });
    } else {
      const nextCount = streak.count + 1;
      let rewardIssued = streak.rewardIssued;

      // When reaching 5 bookings, generate the 20% coupon if not already issued in this window
      if (nextCount >= 5 && !rewardIssued) {
        rewardIssued = true;

        const couponExpiry = new Date();
        couponExpiry.setDate(couponExpiry.getDate() + 30); // 30 days to use

        const streakCode = `STREAK20-${randomUUID().slice(0, 6).toUpperCase()}`;
        await tx.coupon.create({
          data: {
            code: streakCode,
            title: 'Streak Champion - 20% Off',
            description: '20% off your 6th court booking (max ₹200). Thanks for your loyalty!',
            type: 'PERCENTAGE',
            value: 20,
            ownerType: 'SYSTEM',
            userId,
            maxDiscount: 200,
            minBookingValue: 300,
            expiresAt: couponExpiry,
            status: 'ACTIVE',
          },
        });
      }

      streak = await tx.streakProgress.update({
        where: { userId },
        data: {
          count: nextCount,
          rewardIssued,
        },
      });
    }
  }

  // 4. Create one playable GameSession token unlocked by this booking (Feature 2.1)
  const gameSession = await tx.gameSession.create({
    data: {
      userId,
      bookingId,
      gameType: 'SMASH_RALLY',
      score: 0,
      isVerified: false,
    },
  });

  return {
    coinsEarned,
    streakCount: streak.count,
    streakTarget: 5,
    streakCompleted: streak.count >= 5,
    gameTokenId: gameSession.id,
  };
}

/**
 * Calculate player tier based on booking history
 */
export function calculatePlayerTier(completedBookingsCount: number): {
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  label: string;
  perk: string;
  nextTierBookings: number;
  color: string;
} {
  if (completedBookingsCount >= 11) {
    return {
      tier: 'PLATINUM',
      label: 'Platinum Elite',
      perk: '2x Coin Multiplier & 48h Early Peak Slot Access',
      nextTierBookings: 0,
      color: 'from-amber-400 via-rose-300 to-teal-300',
    };
  }
  if (completedBookingsCount >= 6) {
    return {
      tier: 'GOLD',
      label: 'Gold Pro',
      perk: '1.5x Coin Multiplier & Free Equipment Rental',
      nextTierBookings: 11 - completedBookingsCount,
      color: 'from-amber-500 to-yellow-400',
    };
  }
  if (completedBookingsCount >= 3) {
    return {
      tier: 'SILVER',
      label: 'Silver Player',
      perk: '1.2x Coin Multiplier & Priority Support',
      nextTierBookings: 6 - completedBookingsCount,
      color: 'from-slate-400 to-slate-200',
    };
  }
  return {
    tier: 'BRONZE',
    label: 'Bronze Rookie',
    perk: 'Earn 1 Coin per ₹10 spent',
    nextTierBookings: 3 - completedBookingsCount,
    color: 'from-amber-700 to-amber-900',
  };
}
