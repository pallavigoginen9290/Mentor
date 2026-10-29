import React, { useState } from 'react';
import { DailyChallenge, MysteryScenario, FeedbackReport, AppSettings, UserProfile } from '../../types';
import {
  DAILY_CHALLENGES,
  MYSTERY_SCENARIOS,
  getTodayChallenge,
  getTodayMysteryScenario,
} from '../../data/scenarios';
import { aiService } from '../../services/aiService';
import { storageService } from '../../services/storageService';
import {
  Flame,
  HelpCircle,
  Clock,
  Sparkles,
  Send,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface ChallengesViewProps {
  settings: AppSettings;
  user: UserProfile;
  initialOpenMystery?: boolean;
  onCompleteDailyChallenge: (xp: number) => void;
  onOpenFeedback: (feedback: FeedbackReport, xp: number) => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  settings,
  user: _user,
  initialOpenMystery = false,
  onCompleteDailyChallenge,
  onOpenFeedback,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'mystery'>(
    initialOpenMystery ? 'mystery' : 'daily'
  );

  // Daily Challenge state - automatically defaults to today's rotating challenge
  const [selectedChallenge, setSelectedChallenge] = useState<DailyChallenge>(() => getTodayChallenge());
  const [challengeInput, setChallengeInput] = useState('');
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState(false);

  // Mystery Scenario state - automatically defaults to today's rotating mystery crisis
  const [mysteryIdx, setMysteryIdx] = useState(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    return dayOfYear % MYSTERY_SCENARIOS.length;
  });
  const currentMystery: MysteryScenario = MYSTERY_SCENARIOS[mysteryIdx % MYSTERY_SCENARIOS.length];
  const [mysteryResponse, setMysteryResponse] = useState('');
  const [isSubmittingMystery, setIsSubmittingMystery] = useState(false);

  const handleDailySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeInput.trim() || isSubmittingChallenge) return;

    setIsSubmittingChallenge(true);
    try {
      const feedback = await aiService.evaluateSession(
        {
          mode: 'daily',
          scenarioTitle: selectedChallenge.title,
          userResponses: [challengeInput],
          allMessages: [],
          persona: settings.mentorPersona,
          difficulty: 'Intermediate',
        },
        settings
      );

      onCompleteDailyChallenge(selectedChallenge.rewardXp);
      onOpenFeedback(feedback, selectedChallenge.rewardXp);
      setChallengeInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingChallenge(false);
    }
  };

  const handleMysterySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mysteryResponse.trim() || isSubmittingMystery) return;

    setIsSubmittingMystery(true);
    try {
      const feedback = await aiService.evaluateSession(
        {
          mode: 'workplace',
          scenarioTitle: currentMystery.title,
          userResponses: [mysteryResponse],
          allMessages: [],
          persona: settings.mentorPersona,
          difficulty: 'Advanced',
        },
        settings
      );

      storageService.recordPracticeActivity();
      storageService.addXp(35);
      onOpenFeedback(feedback, 35);
      setMysteryResponse('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingMystery(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Tabs */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Challenges & Mystery Arenas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Push your boundary with daily timed prompts and unexpected workplace curveballs.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'daily'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Daily Challenge</span>
          </button>
          <button
            onClick={() => setActiveTab('mystery')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'mystery'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <span>🕵️ Mystery Scenario</span>
          </button>
        </div>
      </div>

      {/* 1. DAILY CHALLENGE TAB */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{selectedChallenge.badgeText}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {selectedChallenge.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Focus Area: <strong className="text-indigo-600">{selectedChallenge.targetFocus}</strong>
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-extrabold text-teal-600 block">
                  +{selectedChallenge.rewardXp} XP Reward
                </span>
                {selectedChallenge.timeLimitSeconds && (
                  <span className="text-xs text-slate-400 flex items-center justify-end space-x-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{selectedChallenge.timeLimitSeconds}s Target</span>
                  </span>
                )}
              </div>
            </div>

            {/* Scenario Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              <span className="block text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300 mb-1">
                The Prompt:
              </span>
              "{selectedChallenge.scenario}"
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <strong>Instructions:</strong> {selectedChallenge.instructions}
            </div>

            {/* Response Form */}
            <form onSubmit={handleDailySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Your Spontaneous Response:
                </label>
                <textarea
                  value={challengeInput}
                  onChange={(e) => setChallengeInput(e.target.value)}
                  placeholder={`Start with something like: "${selectedChallenge.sampleStarter}"...`}
                  rows={4}
                  className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {challengeInput.split(/\s+/).filter(Boolean).length} words formulated
                </span>

                <button
                  type="submit"
                  disabled={!challengeInput.trim() || isSubmittingChallenge}
                  className="py-3 px-6 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center space-x-1.5"
                >
                  {isSubmittingChallenge ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Evaluating Response...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit for Evaluation & Claim XP</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Other Daily Challenges Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              More Daily Challenges:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DAILY_CHALLENGES.map((dc) => (
                <div
                  key={dc.id}
                  onClick={() => {
                    setSelectedChallenge(dc);
                    setChallengeInput('');
                  }}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    selectedChallenge.id === dc.id
                      ? 'bg-indigo-50/50 border-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {dc.title}
                    </span>
                    <span className="text-[10px] font-bold text-teal-600">+{dc.rewardXp} XP</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{dc.scenario}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MYSTERY SCENARIO TAB (Section 19: "🕵️ What Would You Do?") */}
      {activeTab === 'mystery' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-800/40 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Unannounced Mystery Dilemma</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {currentMystery.title}
                </h2>
                <span className="text-xs text-indigo-300 block mt-1">
                  Type: {currentMystery.type} • Urgency: <strong className="text-amber-400 uppercase">{currentMystery.urgency}</strong>
                </span>
              </div>

              <button
                onClick={() => setMysteryIdx((prev) => prev + 1)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center space-x-1"
                title="Roll another mystery scenario"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Mystery</span>
              </button>
            </div>

            {/* Dilemma Story */}
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
              <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Situation:</span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-medium">
                "{currentMystery.situation}"
              </p>
              <p className="text-xs text-slate-300 border-t border-white/10 pt-2 italic">
                Context: {currentMystery.context}
              </p>
            </div>

            {/* Mentor Question */}
            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold text-teal-300 tracking-wider">
                Mentor Challenge:
              </span>
              <p className="text-sm font-semibold text-white">
                "{currentMystery.mentorPrompt}"
              </p>
            </div>

            {/* Decision Guidelines */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-indigo-200">
              <span className="font-bold text-white block">Key Considerations:</span>
              {currentMystery.decisionPoints.map((pt, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            {/* Response Form */}
            <form onSubmit={handleMysterySubmit} className="space-y-4">
              <textarea
                value={mysteryResponse}
                onChange={(e) => setMysteryResponse(e.target.value)}
                placeholder="What exactly would you write or say? Formulate your best professional answer..."
                rows={4}
                className="w-full p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-purple-400 outline-none resize-none leading-relaxed placeholder:text-slate-400"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {mysteryResponse.split(/\s+/).filter(Boolean).length} words formulated
                </span>

                <button
                  type="submit"
                  disabled={!mysteryResponse.trim() || isSubmittingMystery}
                  className="py-3 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-40 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center space-x-1.5"
                >
                  {isSubmittingMystery ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Analyzing Soft-Skills Reaction...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Response & Evaluate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
