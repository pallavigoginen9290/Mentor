import React, { useState } from 'react';
import { PracticeSession, GameRecord, Badge, VocabularyItem, UserProfile } from '../../types';
import {
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Flame,
} from 'lucide-react';

interface ProgressViewProps {
  user: UserProfile;
  sessions: PracticeSession[];
  games: GameRecord[];
  badges: Badge[];
  vocabulary: VocabularyItem[];
  onSelectSession: (session: PracticeSession) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  user,
  sessions,
  games,
  badges,
  vocabulary,
  onSelectSession,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'history' | 'vocabulary' | 'badges'>('analytics');
  const [vocabSearch, setVocabSearch] = useState('');

  // Weekly trend data mockup
  const weeklyTrends = [
    { week: 'Week 1', score: 5.8, sessions: 3 },
    { week: 'Week 2', score: 6.3, sessions: 5 },
    { week: 'Week 3', score: 6.8, sessions: 6 },
    { week: 'Week 4', score: 7.2, sessions: 4 },
  ];

  const skillBars = [
    { name: 'Clarity & Articulation', score: 8.5, max: 10, color: 'bg-emerald-500' },
    { name: 'Professional Tone & Tact', score: 8.0, max: 10, color: 'bg-indigo-500' },
    { name: 'Relevance & Directness', score: 8.0, max: 10, color: 'bg-teal-500' },
    { name: 'Grammar & Syntax', score: 7.4, max: 10, color: 'bg-blue-500' },
    { name: 'Confidence & Assertiveness', score: 7.2, max: 10, color: 'bg-cyan-500' },
    { name: 'Vocabulary Diversity', score: 6.8, max: 10, color: 'bg-amber-500' },
    { name: 'Spontaneous Responses', score: 6.5, max: 10, color: 'bg-rose-500' },
  ];

  const filteredVocab = vocabulary.filter(
    (v) =>
      v.word.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      v.meaning.toLowerCase().includes(vocabSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* View Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Progress Tracking & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Measure your measurable growth in fluency, grammar, executive tone, and vocabulary.
          </p>
        </div>

        <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl gap-1">
          {[
            { id: 'analytics', label: 'Score Trends', icon: TrendingUp },
            { id: 'history', label: 'Session Log', icon: Calendar },
            { id: 'vocabulary', label: 'Vocab Vault', icon: BookOpen },
            { id: 'badges', label: 'Badges', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. SCORE TRENDS & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Overall Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Current Rating</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline">
                {user.currentScore > 0 ? (
                  <>
                    <span>{user.currentScore}</span>
                    <span className="text-sm font-semibold text-slate-400 ml-1">/ 10</span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-teal-600 dark:text-teal-400">New Learner</span>
                )}
              </div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">Level {user.currentLevel}: {user.levelTitle}</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Practices Done</span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-baseline">
                <span>{user.sessionsCompleted}</span>
                <span className="text-sm font-semibold text-slate-400 ml-1">Sessions</span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                {user.sessionsCompleted > 0 ? 'Recorded in history log' : 'Start your 1st practice'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Practice Streak</span>
              <div className="text-3xl font-black text-amber-500 flex items-baseline space-x-1">
                <Flame className="w-6 h-6 fill-amber-500 inline mr-1" />
                <span>{user.streakDays}</span>
                <span className="text-sm font-semibold text-slate-400 ml-1">days</span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">Consistent active cadence</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Total Activities</span>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 flex items-baseline">
                <span>{sessions.length + games.length}</span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                {sessions.length} practices • {games.length} games
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Progress Progression Chart */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Weekly Progress Trend (1 - 10)
                  </h3>
                  <p className="text-xs text-slate-400">Progression over the last 4 weeks</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  +1.4 pt Overall
                </span>
              </div>

              {/* Vertical Bars representation */}
              <div className="flex items-end justify-between h-48 pt-6 px-4 border-b border-slate-100 dark:border-slate-800">
                {weeklyTrends.map((w, i) => {
                  const heightPercent = Math.round((w.score / 10) * 100);
                  return (
                    <div key={i} className="flex flex-col items-center space-y-2 flex-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {w.score}
                      </span>
                      <div className="w-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-end overflow-hidden h-32">
                        <div
                          className="w-full bg-gradient-to-t from-indigo-600 to-teal-400 rounded-2xl transition-all duration-700"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 font-semibold">{w.week}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span>Start: 5.8 / 10</span>
                <span>Current: 7.2 / 10</span>
              </div>
            </div>

            {/* 8-Dimensional Skill Balance */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Skill Breakdown Spectrum
                </h3>
                <p className="text-xs text-slate-400">Evaluated across all sessions and challenges</p>
              </div>

              <div className="space-y-3 pt-2">
                {skillBars.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="text-slate-900 dark:text-white font-bold">{item.score} / 10</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${(item.score / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SESSION LOG & HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Recorded Practice Sessions ({sessions.length})
            </span>
          </div>

          <div className="space-y-3">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                onClick={() => onSelectSession(sess)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 transition cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 uppercase">
                      {sess.mode}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(sess.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    {sess.topic}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Interlocutor: <strong>{sess.personaTitle || 'AI Mentor'}</strong> • Duration: {sess.durationSeconds}s
                  </p>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {sess.feedback?.overallScore || '7.5'}/10
                    </div>
                    <span className="text-[11px] font-semibold text-teal-600">
                      +{sess.xpEarned} XP
                    </span>
                  </div>
                  <button className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600 transition">
                    View Report
                  </button>
                </div>
              </div>
            ))}

            {sessions.length === 0 && (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
                No sessions completed yet. Start your first practice conversation!
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. VOCABULARY VAULT (Section 15) */}
      {activeTab === 'vocabulary' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                My Learned Vocabulary ({vocabulary.length} Words)
              </span>
              <p className="text-xs text-slate-500">
                Words extracted directly from your mentor feedback sessions.
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={vocabSearch}
                onChange={(e) => setVocabSearch(e.target.value)}
                placeholder="Search vocabulary..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVocab.map((v, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-base font-black text-indigo-600 dark:text-indigo-400">
                      {v.word}
                    </h4>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Learned</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {v.meaning}
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Everyday:
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 italic">"{v.simpleExample}"</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 block">
                      Executive:
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

      {/* 4. BADGES SHOWCASE (Section 41) */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Achievement Badges
            </span>
            <p className="text-xs text-slate-500">
              Unlocked through consistent practice, high scores, and games mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((b) => {
              const isUnlocked = Boolean(b.unlockedAt);
              return (
                <div
                  key={b.id}
                  className={`p-5 rounded-2xl border transition-all flex items-start space-x-4 ${
                    isUnlocked
                      ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/60 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                      isUnlocked
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200'
                        : 'bg-slate-200 dark:bg-slate-800 grayscale'
                    }`}
                  >
                    {b.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {b.title}
                      </h4>
                      {isUnlocked && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {b.description}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-400 block mt-2">
                      {isUnlocked
                        ? `Unlocked on ${new Date(b.unlockedAt!).toLocaleDateString()}`
                        : `Requirement: ${b.requirement}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
