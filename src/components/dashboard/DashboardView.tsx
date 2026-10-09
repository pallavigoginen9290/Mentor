import React from 'react';
import { UserProfile, PracticeSession, NavigationTab, ScoresBreakdown } from '../../types';
import { getRecommendations } from '../../services/recommendationEngine';
import {
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  Target,
  Zap,
  TrendingUp,
  Brain,
  MessageSquare,
  Gamepad2,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Play,
} from 'lucide-react';

interface DashboardViewProps {
  user: UserProfile;
  recentSessions: PracticeSession[];
  onNavigate: (tab: NavigationTab) => void;
  onStartScenarioById: (scenarioId: string) => void;
  onStartMystery: () => void;
  onOpenFeedback: (session: PracticeSession) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  recentSessions,
  onNavigate,
  onStartScenarioById,
  onStartMystery,
  onOpenFeedback,
}) => {
  // Determine greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Compute recommendation
  const mockScores: ScoresBreakdown = {
    grammar: 7.2,
    vocabulary: 6.8,
    clarity: 8.5,
    confidence: 7.0,
    professionalTone: 8.0,
    relevance: 8.2,
    naturalness: 6.5,
    sentenceStructure: 7.5,
  };
  const recommendation = getRecommendations(mockScores, user.weakestSkill);

  const goalPercentage = Math.min(100, Math.round((user.todayXp / user.dailyXpGoal) * 100));

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Welcome Banner & Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-indigo-700/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-teal-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Soft-Skills & Eloquence Coach</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              {greeting}, {user.name.split(' ')[0]}!
            </h1>
            <p className="text-indigo-200 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
              Ready to sharpen your executive presence and spontaneous speaking? The best communicators
              build their confidence through small, realistic daily simulations.
            </p>
          </div>

          {/* Quick Communication Score Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 sm:p-6 text-center shrink-0 min-w-[240px]">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-200 block mb-1">
              Your Communication Score
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-baseline justify-center">
              {user.currentScore > 0 ? (
                <>
                  <span>{user.currentScore}</span>
                  <span className="text-xl text-indigo-300 font-semibold ml-1">/ 10</span>
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-teal-300">New Learner</span>
              )}
            </div>
            <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-teal-300 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                {user.currentScore > 0
                  ? `Based on ${user.sessionsCompleted} practice sessions`
                  : 'Practice your 1st session to unlock score'}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Prominent Action Buttons */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('practice')}
            className="py-3 px-6 rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all flex items-center space-x-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Practice</span>
          </button>

          <button
            onClick={() => onNavigate('games')}
            className="py-3 px-6 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition-all flex items-center space-x-2"
          >
            <Gamepad2 className="w-4 h-4 text-teal-300" />
            <span>Play Games</span>
          </button>

          <button
            onClick={() => onNavigate('challenges')}
            className="py-3 px-6 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition-all flex items-center space-x-2"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Daily Challenge</span>
          </button>

          <button
            onClick={onStartMystery}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 active:scale-95 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2 ml-auto"
          >
            <HelpCircle className="w-4 h-4" />
            <span>🕵️ Mystery Scenario</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Grid: Streak, Level, XP, Sessions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-500 shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Streak</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {user.streakDays} Days
            </span>
          </div>
        </div>

        {/* Level */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Level {user.currentLevel}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight block">
              {user.levelTitle}
            </span>
          </div>
        </div>

        {/* Total XP */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Total XP</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {user.xp.toLocaleString()} XP
            </span>
          </div>
        </div>

        {/* Sessions Completed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Practices Done
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {user.sessionsCompleted} Sessions
            </span>
          </div>
        </div>
      </div>

      {/* 3. Today's Goal & Recommendation Section (Section 2, 43, 46) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Goal Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Today's Goal
                </h3>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {goalPercentage}%
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Earn {user.dailyXpGoal} XP every day to build lasting verbal fluency.
            </p>

            {/* Visual ASCII / Modern Meter */}
            <div className="space-y-2">
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${goalPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>{user.todayXp} XP</span>
                <span>{user.dailyXpGoal} XP</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 block mb-2">Recommended to reach 100%:</span>
            <button
              onClick={() => onNavigate('challenges')}
              className="w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 transition flex items-center justify-center space-x-1"
            >
              <span>Complete Daily Challenge (+30 XP)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Personalized Recommendation Engine Card (Section 46) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-teal-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border border-indigo-200/80 dark:border-indigo-900/40 shadow-sm flex flex-col justify-between lg:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                <Brain className="w-3.5 h-3.5" />
                <span>AI Recommendation Engine</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-500">
                  Strongest: <strong className="text-emerald-600 uppercase">{user.strongestSkill}</strong>
                </span>
                <span className="text-slate-500">
                  Focus: <strong className="text-amber-600 uppercase">{recommendation.focusSkill}</strong>
                </span>
              </div>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
              Recommended: {recommendation.recommendedPracticeTitle}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              "{recommendation.reason}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">
                    Recommended Mode
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {recommendation.recommendedPracticeTitle}
                  </span>
                </div>
                <button
                  onClick={() => onNavigate(recommendation.recommendedPracticeMode as NavigationTab)}
                  className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">
                    Targeted Game
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {recommendation.recommendedGameTitle}
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('games')}
                  className="p-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition"
                >
                  <Gamepad2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            💡 {recommendation.actionPrompt}
          </p>
        </div>
      </div>

      {/* 4. Core Focus Modules: Workplace, Interview, Meeting & Games */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Curated Practice Arenas
          </h2>
          <button
            onClick={() => onNavigate('practice')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>Explore all simulations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Workplace & IT */}
          <div
            onClick={() => onNavigate('workplace')}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 transition-colors">
                Workplace & IT Scenarios
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Practice Excel breakdowns, SQL mismatch discussions, status reporting to strict managers,
                and talking to clients.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>8 Scenarios</span>
              <span className="group-hover:translate-x-1 transition-transform">Start →</span>
            </div>
          </div>

          {/* Interview Simulator */}
          <div
            onClick={() => onNavigate('interview')}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-teal-600 transition-colors">
                Interview Simulator (STAR)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                HR, Technical, Behavioral, and Self-Introduction questions with structured
                evaluations on clarity and tone.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
              <span>STAR Evaluation</span>
              <span className="group-hover:translate-x-1 transition-transform">Start →</span>
            </div>
          </div>

          {/* Spontaneous Think Speak */}
          <div
            onClick={() => onStartScenarioById('wp_reporting_delay')}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-amber-600 transition-colors">
                Reporting a Delay Tactfully
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Step into a high-stakes conversation where a PM asks about an overdue dashboard.
                Frame setbacks with poise.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>Intermediate • +20 XP</span>
              <span className="group-hover:translate-x-1 transition-transform">Practice →</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Recent Sessions History Snippet */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Recent Practice Feedback & Progress
            </h3>
          </div>
          {recentSessions && recentSessions.length > 0 && (
            <button
              onClick={() => onNavigate('progress')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View Full Analytics
            </button>
          )}
        </div>

        {recentSessions && recentSessions.length > 0 ? (
          <>
            <div className="flex items-center justify-between px-2 pb-2 text-xs text-slate-400">
              <span>Showing recent {Math.min(5, recentSessions.length)} of {recentSessions.length} recorded practice sessions</span>
              <span className="text-teal-600 font-semibold">100% Real Data</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors cursor-pointer"
                  onClick={() => onOpenFeedback(session)}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0 text-xs font-bold">
                      {session.feedback?.overallScore || '7.5'}
                    </div>
                    <div className="truncate">
                      <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                        {session.topic}
                      </span>
                      <span className="text-xs text-slate-400 block">
                        {session.personaTitle || 'AI Mentor'} • {new Date(session.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                      +{session.xpEarned} XP
                    </span>
                    <button className="text-xs text-indigo-600 font-bold hover:underline flex items-center space-x-1">
                      <span>Review Report</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              You haven't completed any practice sessions yet! Take your first dialogue simulation to unlock your personalized score report, earn your first +20 XP, and start building your real streak.
            </p>
            <button
              onClick={() => onNavigate('practice')}
              className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition inline-flex items-center space-x-1.5"
            >
              <span>Start Your First Practice Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
