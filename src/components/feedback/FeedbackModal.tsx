import React, { useState } from 'react';
import { FeedbackReport, ScoresBreakdown } from '../../types';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  X,
  Send,
  MessageSquare,
} from 'lucide-react';

interface FeedbackModalProps {
  feedback: FeedbackReport;
  xpEarned: number;
  onClose: () => void;
  onRetry: (revisedText: string) => void;
  onNavigateToGame?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  feedback,
  xpEarned,
  onClose,
  onRetry,
  onNavigateToGame,
}) => {
  const [retryInput, setRetryInput] = useState('');
  const [showRetryInput, setShowRetryInput] = useState(false);
  const [retrySubmitted, setRetrySubmitted] = useState(false);

  React.useEffect(() => {
    if (feedback.overallScore >= 7.5) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }
  }, [feedback.overallScore]);

  const scoreLabels: Record<keyof ScoresBreakdown, string> = {
    grammar: 'Grammar',
    vocabulary: 'Vocabulary',
    clarity: 'Clarity',
    confidence: 'Confidence',
    professionalTone: 'Professional Tone',
    relevance: 'Relevance',
    naturalness: 'Naturalness',
    sentenceStructure: 'Sentence Structure',
  };

  const handleRetrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retryInput.trim()) return;
    setRetrySubmitted(true);
    onRetry(retryInput);
  };

  const getScoreColor = (val: number) => {
    if (val >= 8.0) return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40';
    if (val >= 6.5) return 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/40';
    return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-teal-600 text-white p-6 sm:p-8 flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mentor Evaluation & Report</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Session Communication Score
            </h2>
            <p className="text-indigo-100 text-sm mt-1">{feedback.encouragement}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20">
              <div className="text-3xl sm:text-4xl font-black tracking-tight">
                {feedback.overallScore}
                <span className="text-lg font-medium text-indigo-200">/10</span>
              </div>
              <div className="text-[11px] font-semibold text-teal-200 mt-0.5">
                +{xpEarned} XP Earned
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto">
          {/* 8-Dimensional Metric Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Performance Breakdown (1 - 10)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(feedback.scores) as (keyof ScoresBreakdown)[]).map((key) => {
                const val = feedback.scores[key];
                return (
                  <div
                    key={key}
                    className={`p-3 rounded-2xl border ${getScoreColor(val)} flex flex-col justify-between`}
                  >
                    <span className="text-xs font-semibold">{scoreLabels[key]}</span>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-xl font-bold">{val}</span>
                      <span className="text-[11px] opacity-70">/ 10</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: What You Did Well & What To Improve */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What you did well (3 points) */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40">
              <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-base">What You Did Well</h4>
              </div>
              <ul className="space-y-2.5">
                {feedback.whatYouDidWell.map((pt, i) => (
                  <li key={i} className="flex items-start space-x-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What to improve (2-4 points) */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40">
              <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h4 className="text-base">What To Improve</h4>
              </div>
              <ul className="space-y-2.5">
                {feedback.whatToImprove.map((pt, i) => (
                  <li key={i} className="flex items-start space-x-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section: Common Mistakes with Before/After Diff */}
          {feedback.commonMistakes && feedback.commonMistakes.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Identified Refinements & Better Phrasing
              </h3>
              <div className="space-y-3">
                {feedback.commonMistakes.map((mistake, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-2">
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 dark:bg-rose-950/30 dark:border-rose-800/40 text-rose-900 dark:text-rose-200">
                        <span className="block text-[11px] font-bold uppercase text-rose-600 dark:text-rose-400 mb-1">
                          Original / Suboptimal:
                        </span>
                        <span>"{mistake.original}"</span>
                      </div>
                      <div className="p-3 rounded-xl bg-teal-50 border border-teal-200/80 dark:bg-teal-950/30 dark:border-teal-800/40 text-teal-900 dark:text-teal-200">
                        <span className="block text-[11px] font-bold uppercase text-teal-600 dark:text-teal-400 mb-1">
                          Polished Business Alternative:
                        </span>
                        <span>"{mistake.better}"</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      💡 {mistake.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Better Version */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-teal-50 dark:from-indigo-950/30 dark:to-teal-950/30 border border-indigo-200 dark:border-indigo-800/50">
            <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-200 font-bold mb-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h4 className="text-base">Model Exemplar (Better Version)</h4>
            </div>
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 font-medium leading-relaxed italic bg-white/70 dark:bg-slate-900/60 p-4 rounded-xl border border-indigo-100 dark:border-slate-800">
              "{feedback.betterVersion}"
            </p>
          </div>

          {/* Section: Retry Loop (Section 14 & Core Learning Cycle) */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-teal-400" />
                <h4 className="font-bold text-base text-white">Interactive Retry Cycle</h4>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300">
                +15 XP Bonus
              </span>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              "{feedback.retryPrompt}"
            </p>

            {!showRetryInput ? (
              <button
                onClick={() => setShowRetryInput(true)}
                className="py-2.5 px-5 bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Answering Again Now</span>
              </button>
            ) : retrySubmitted ? (
              <div className="p-3.5 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-200 text-sm flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                <span>Great job practicing your retry! Your effort has been recorded to your progress XP.</span>
              </div>
            ) : (
              <form onSubmit={handleRetrySubmit} className="space-y-3">
                <textarea
                  value={retryInput}
                  onChange={(e) => setRetryInput(e.target.value)}
                  placeholder="Type your improved response in your own words..."
                  rows={3}
                  className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                />
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRetryInput(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Improved Answer</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Section: Today's Vocabulary (Section 15) */}
          {feedback.vocabulary && feedback.vocabulary.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold mb-3">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h4 className="text-base">Vocabulary Builder (High-Impact Workplace Words)</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {feedback.vocabulary.map((v, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-base">
                          {v.word}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Word #{i + 1}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{v.meaning}</p>
                    </div>
                    <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-2 text-xs">
                      <div>
                        <span className="font-semibold text-slate-500 block text-[10px] uppercase">
                          Simple:
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">"{v.simpleExample}"</span>
                      </div>
                      <div>
                        <span className="font-semibold text-teal-600 dark:text-teal-400 block text-[10px] uppercase">
                          Professional:
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          "{v.professionalExample}"
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <TrendingUp className="w-4 h-4 text-teal-500" />
            <span>Scores synced to your weekly analytics</span>
          </div>

          <div className="flex items-center space-x-3">
            {onNavigateToGame && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToGame();
                }}
                className="py-2.5 px-4 rounded-xl border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all flex items-center space-x-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Practice Weak Areas in Games</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <span>Done & Back to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
