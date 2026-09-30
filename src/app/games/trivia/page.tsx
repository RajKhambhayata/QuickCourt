'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Timer,
  Trophy,
  Coins,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  Award,
} from 'lucide-react';

interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
}

interface ReviewItem {
  questionId: string;
  question: string;
  category: string;
  correct: boolean;
  userAnswer: number;
  correctAnswer: number;
  explanation: string;
}

interface TriviaResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  coinsEarned: number;
  review: ReviewItem[];
  nextPlayAt: string;
}

const QUESTION_TIME = 15; // 15 seconds per question

export default function SportsTriviaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [canPlay, setCanPlay] = useState(true);
  const [nextPlayAt, setNextPlayAt] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; selectedIndex: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<TriviaResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load questions or cooldown status
  useEffect(() => {
    fetch('/api/games/trivia')
      .then((r) => {
        if (r.status === 401) {
          router.push('/login');
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setCanPlay(data.canPlay);
          setNextPlayAt(data.nextPlayAt);
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  // Question Timer
  useEffect(() => {
    if (!canPlay || result || isSubmitting || questions.length === 0) return;

    if (timeLeft <= 0) {
      handleNext(selectedOption ?? -1);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, canPlay, result, isSubmitting, questions.length, selectedOption]);

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return; // already picked
    setSelectedOption(index);
  };

  const handleNext = async (choiceIndex = selectedOption) => {
    const finalChoice = choiceIndex !== null && choiceIndex !== undefined ? choiceIndex : -1;
    const currentQ = questions[currentIndex];
    const newAnswers = [...answers, { questionId: currentQ.id, selectedIndex: finalChoice }];
    setAnswers(newAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTimeLeft(QUESTION_TIME);
    } else {
      // Finished all questions -> submit to server
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/games/trivia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers }),
        });
        const resData = await res.json();
        if (res.ok) {
          setResult(resData);
        } else {
          setError(resData.error || 'Failed to submit trivia answers');
        }
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto animate-pulse">
            <span className="text-2xl">🧠</span>
          </div>
          <p className="text-slate-400 font-semibold text-sm">Preparing Sports Trivia Blitz...</p>
        </div>
      </div>
    );
  }

  // Already played cooldown screen
  if (!canPlay && !result) {
    const formattedNext = nextPlayAt ? new Date(nextPlayAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'tomorrow';
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col">
        <div className="max-w-xl mx-auto px-4 py-10 w-full flex-1 flex flex-col justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-blue-500/10">
            🧠
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Daily Trivia Completed!</h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              You have already completed today&apos;s Sports Trivia challenge. Come back around <strong className="text-blue-400">{formattedNext}</strong> for 5 new questions and more Court Coins!
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-4">
            <Link
              href="/games"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              Back to Arcade
            </Link>
            <Link
              href="/games/smash-rally"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-violet-600/20"
            >
              Play Smash Rally <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Result Screen
  if (result) {
    const percentage = Math.round((result.correctCount / result.totalQuestions) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header Card */}
          <div className="bg-slate-900/90 border border-blue-800/40 rounded-3xl p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center mx-auto shadow-xl shadow-blue-600/30">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            <div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Trivia Blitz Complete</p>
              <h2 className="text-3xl font-black text-white mt-1">
                {result.correctCount === result.totalQuestions
                  ? 'Flawless Victory! 🌟'
                  : result.correctCount >= 3
                  ? 'Great Sports Knowledge! 👏'
                  : 'Good Effort! Keep Training 🎯'}
              </h2>
            </div>

            {/* Score & Coins Badge */}
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Score</p>
                <p className="text-2xl font-black text-white mt-1">
                  {result.correctCount} / {result.totalQuestions}
                </p>
                <p className="text-[10px] text-blue-400 font-bold mt-0.5">{percentage}% Accuracy</p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                <p className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">Court Coins Won</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span className="text-2xl font-black text-amber-300">+{result.coinsEarned}</span>
                </div>
                <p className="text-[10px] text-amber-400 font-bold mt-0.5">Credited to Wallet</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Link
                href="/rewards"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20"
              >
                View in Rewards Wallet
              </Link>
              <Link
                href="/games"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                Back to Arcade
              </Link>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Answer Explanations
            </h3>

            <div className="space-y-3">
              {result.review.map((item, idx) => (
                <div
                  key={item.questionId}
                  className={`bg-slate-900/80 border rounded-2xl p-5 space-y-2 transition ${
                    item.correct ? 'border-emerald-500/40' : 'border-rose-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        Q{idx + 1} • {item.category}
                      </span>
                    </div>
                    {item.correct ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Correct (+10 coins)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400 text-xs font-bold">
                        <XCircle className="w-4 h-4" /> Missed
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-white">{item.question}</p>
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                    💡 <strong className="text-slate-300">Explanation:</strong> {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex) / questions.length) * 100;
  const timerPercent = (timeLeft / QUESTION_TIME) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 py-4 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/games"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-black text-white flex items-center gap-1.5">
                <span>🧠</span> Sports Trivia Blitz
              </h1>
              <p className="text-[11px] text-slate-400">
                Question {currentIndex + 1} of {questions.length} • 10 Coins each
              </p>
            </div>
          </div>

          {/* Timer Display */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black ${
            timeLeft <= 5
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
              : 'bg-blue-500/20 border-blue-500/40 text-blue-300'
          }`}>
            <Timer className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Linear Timer Bar */}
        <div className="max-w-2xl mx-auto mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400'
            }`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Container */}
      <div className="max-w-2xl mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-between">
        {currentQ && (
          <div className="space-y-6">
            {/* Category Pill */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {currentQ.category}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Streak: {answers.filter((a) => a.selectedIndex >= 0).length} answered
              </span>
            </div>

            {/* Question Text */}
            <div className="bg-slate-900/80 border border-blue-900/30 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {currentQ.question}
              </h2>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-2xl border text-left font-bold text-sm transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? 'bg-blue-600/30 border-blue-400 text-white shadow-lg shadow-blue-500/20 scale-[1.01]'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-blue-400 bg-blue-400' : 'border-slate-700'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-8">
          <button
            onClick={() => handleNext(selectedOption ?? -1)}
            disabled={selectedOption === null || isSubmitting}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl ${
              selectedOption === null || isSubmitting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white shadow-blue-600/25 hover:scale-[1.01]'
            }`}
          >
            {isSubmitting ? (
              <span>Evaluating Answers...</span>
            ) : currentIndex + 1 === questions.length ? (
              <span>Finish & Claim Coins</span>
            ) : (
              <>
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
