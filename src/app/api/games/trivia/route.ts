export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export interface TriviaQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const TRIVIA_BANK: TriviaQuestion[] = [
  {
    id: 't1',
    category: 'Badminton',
    question: 'What is the minimum height of a regulation badminton net at the center of the court?',
    options: ['1.524 meters (5 feet)', '1.400 meters (4.6 feet)', '1.600 meters (5.25 feet)', '1.450 meters (4.75 feet)'],
    correctIndex: 0,
    explanation: 'A standard badminton net is 1.524m (5 feet) high at the center and 1.55m (5 ft 1 in) over the doubles sidelines.',
  },
  {
    id: 't2',
    category: 'Cricket',
    question: 'How long is a standard cricket pitch between the two sets of wickets?',
    options: ['20 yards', '22 yards', '24 yards', '18 yards'],
    correctIndex: 1,
    explanation: 'A cricket pitch is exactly 22 yards (66 feet or 20.12 meters) from stump to stump.',
  },
  {
    id: 't3',
    category: 'Tennis',
    question: 'In tennis scoring, what does the score "Deuce" represent?',
    options: ['30-30', '40-40', 'Advantage in', 'Match point'],
    correctIndex: 1,
    explanation: 'Deuce occurs when both players or teams have scored three points each (40-40).',
  },
  {
    id: 't4',
    category: 'Formula 1 & Karting',
    question: 'What flag is waved in racing to signal that the race is finished?',
    options: ['Yellow Flag', 'Green Flag', 'Chequered Flag', 'Red Flag'],
    correctIndex: 2,
    explanation: 'The black-and-white chequered flag signals the end of the race or practice session.',
  },
  {
    id: 't5',
    category: 'Football',
    question: 'What is the maximum duration of regular extra time in knockout football matches?',
    options: ['15 minutes', '20 minutes', '30 minutes (two 15-min halves)', '45 minutes'],
    correctIndex: 2,
    explanation: 'Extra time consists of two 15-minute halves, totaling 30 minutes before a penalty shootout.',
  },
  {
    id: 't6',
    category: 'Pickleball',
    question: 'In Pickleball, what is the 7-foot non-volley zone near the net famously called?',
    options: ['The Bunker', 'The Kitchen', 'The Crease', 'The Alley'],
    correctIndex: 1,
    explanation: 'The non-volley zone is affectionately known as "The Kitchen". Players cannot volley while inside it.',
  },
  {
    id: 't7',
    category: 'Box Cricket',
    question: 'In box cricket, what usually happens if a player hits the ball directly out of the netted arena?',
    options: ['Six runs', 'Declared Out', 'Free hit', 'Two runs penalty'],
    correctIndex: 1,
    explanation: 'In most box cricket rules, hitting the ball directly out of the netting or boundary box results in the batsman being out.',
  },
  {
    id: 't8',
    category: 'Basketball',
    question: 'How many seconds does a team typically have on the shot clock in FIBA rules?',
    options: ['24 seconds', '30 seconds', '20 seconds', '35 seconds'],
    correctIndex: 0,
    explanation: 'FIBA and NBA both enforce a standard 24-second shot clock.',
  },
];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please login to play Trivia' }, { status: 401 });
    }
    if (user.role !== 'USER') return NextResponse.json({ error: 'Player account required' }, { status: 403 });

    // Check if played in last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lastTrivia = await prisma.gameSession.findFirst({
      where: {
        userId: user.id,
        gameType: 'TRIVIA',
        isVerified: true,
        startedAt: { gte: oneDayAgo },
      },
      orderBy: { startedAt: 'desc' },
    });

    const canPlay = !lastTrivia;
    const nextPlayAt = lastTrivia ? new Date(lastTrivia.startedAt.getTime() + 24 * 60 * 60 * 1000) : null;

    // Pick 5 randomized questions
    const shuffled = [...TRIVIA_BANK].sort(() => 0.5 - Math.random()).slice(0, 5);
    const clientQuestions = shuffled.map((q) => ({
      id: q.id,
      category: q.category,
      question: q.question,
      options: q.options,
    }));

    return NextResponse.json({
      canPlay,
      nextPlayAt,
      questions: clientQuestions,
      totalQuestions: clientQuestions.length,
      coinsPerCorrect: 10,
      maxCoins: clientQuestions.length * 10,
    });
  } catch (error) {
    console.error('Error in GET /api/games/trivia:', error);
    return NextResponse.json({ error: 'Failed to load trivia' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please login to submit trivia' }, { status: 401 });
    }
    if (user.role !== 'USER') return NextResponse.json({ error: 'Player account required' }, { status: 403 });

    const body = await req.json();
    const { answers } = body; // Array of { questionId: string, selectedIndex: number }

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Invalid answers submitted' }, { status: 400 });
    }

    // Check 24hr cooldown
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTrivia = await prisma.gameSession.findFirst({
      where: {
        userId: user.id,
        gameType: 'TRIVIA',
        isVerified: true,
        startedAt: { gte: oneDayAgo },
      },
      orderBy: { startedAt: 'desc' },
    });

    if (recentTrivia) {
      const remainingMs = recentTrivia.startedAt.getTime() + 24 * 60 * 60 * 1000 - Date.now();
      const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
      return NextResponse.json(
        { error: `You have already played Sports Trivia today! Next challenge available in ${remainingHours}h.` },
        { status: 429 }
      );
    }

    // Evaluate answers
    let correctCount = 0;
    const review = answers.map((ans) => {
      const question = TRIVIA_BANK.find((q) => q.id === ans.questionId);
      if (!question) {
        return {
          questionId: ans.questionId,
          correct: false,
          userAnswer: ans.selectedIndex,
          correctAnswer: -1,
          explanation: 'Question not found',
        };
      }
      const isCorrect = question.correctIndex === ans.selectedIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: question.id,
        question: question.question,
        category: question.category,
        correct: isCorrect,
        userAnswer: ans.selectedIndex,
        correctAnswer: question.correctIndex,
        explanation: question.explanation,
      };
    });

    const coinsEarned = correctCount * 10;
    const now = new Date();

    // Reward transaction
    await prisma.$transaction(async (tx) => {
      if (coinsEarned > 0) {
        await tx.wallet.upsert({
          where: { userId: user.id },
          create: { userId: user.id, coins: coinsEarned },
          update: { coins: { increment: coinsEarned } },
        });

        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 6);

        await tx.coinLedger.create({
          data: {
            userId: user.id,
            type: 'EARN',
            amount: coinsEarned,
            description: `Sports Trivia: scored ${correctCount}/${answers.length} (+${coinsEarned} coins)`,
            expiresAt: expiry,
          },
        });
      }

      await tx.gameSession.create({
        data: {
          userId: user.id,
          gameType: 'TRIVIA',
          score: correctCount * 200, // 0 - 1000 score
          tier: `${correctCount}/${answers.length} Correct`,
          isVerified: true,
          startedAt: now,
          endedAt: now,
        },
      });
    });

    return NextResponse.json({
      success: true,
      score: correctCount * 200,
      correctCount,
      totalQuestions: answers.length,
      coinsEarned,
      review,
      nextPlayAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error('Error in POST /api/games/trivia:', error);
    return NextResponse.json({ error: 'Failed to evaluate trivia' }, { status: 500 });
  }
}
