import React, { useState, useEffect } from 'react';
import { UserProfile, PracticeSession, NavigationTab, ScoresBreakdown } from '../../types';
import { getRecommendations } from '../../services/recommendationEngine';
import { speechService } from '../../services/speechService';
import { storageService } from '../../services/storageService';
import {
  getDailyInspiration,
  VOCAL_WARM_UP_STEPS,
} from '../../data/dailyInspiration';
import { getTodayChallenge, SCENARIOS } from '../../data/scenarios';
import confetti from 'canvas-confetti';
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
  Volume2,
  VolumeX,
  RefreshCw,
  Copy,
  Check,
  BookOpen,
  Lightbulb,
  Mic,
  Compass,
  PhoneCall,
  Languages,
  X,
} from 'lucide-react';

interface DashboardViewProps {
  user: UserProfile;
  recentSessions: PracticeSession[];
  onNavigate: (tab: NavigationTab) => void;
  onStartScenarioById: (scenarioId: string) => void;
  onStartMystery: () => void;
  onOpenFeedback: (session: PracticeSession) => void;
  onRefreshState?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  recentSessions,
  onNavigate,
  onStartScenarioById,
  onStartMystery,
  onOpenFeedback,
  onRefreshState,
}) => {
  // Determine greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Daily Inspiration & Quote State
  const [quoteOffset, setQuoteOffset] = useState(0);
  const [isSpeakingQuote, setIsSpeakingQuote] = useState(false);
  const [isSpeakingWord, setIsSpeakingWord] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [hasClaimedQuoteXp, setHasClaimedQuoteXp] = useState(() => {
    if (typeof window === 'undefined') return false;
    const today = new Date().toISOString().split('T')[0];
    return localStorage.getItem(`ai_mentor_quote_claimed_${today}`) === 'true';
  });
  const [hasSavedWord, setHasSavedWord] = useState(false);

  // 60-Second Vocal Warm-Up Modal State
  const [isWarmUpModalOpen, setIsWarmUpModalOpen] = useState(false);
  const [warmUpStepIdx, setWarmUpStepIdx] = useState(0);
  const [warmUpTimer, setWarmUpTimer] = useState(VOCAL_WARM_UP_STEPS[0].durationSeconds);
  const [isWarmUpTimerActive, setIsWarmUpTimerActive] = useState(false);
  const [warmUpCompleted, setWarmUpCompleted] = useState(false);

  const { quote: dailyQuote, word: dailyWord, habit: dailyHabit, dayString } = getDailyInspiration(quoteOffset);

  // Timer effect for vocal warm-up
  useEffect(() => {
    if (!isWarmUpTimerActive || warmUpTimer <= 0) return;
    const interval = setInterval(() => {
      setWarmUpTimer((t) => {
        if (t <= 1) {
          setIsWarmUpTimerActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isWarmUpTimerActive, warmUpTimer]);

  const handleNextQuote = () => {
    speechService.stopSpeaking();
    setIsSpeakingQuote(false);
    setQuoteOffset((prev) => prev + 1);
  };

  const handleToggleSpeechQuote = () => {
    if (isSpeakingQuote) {
      speechService.stopSpeaking();
      setIsSpeakingQuote(false);
    } else {
      setIsSpeakingQuote(true);
      speechService.speak(
        `${dailyQuote.quote}. By ${dailyQuote.author}. ${dailyQuote.energyBoostReason}`,
        0.95,
        undefined,
        () => setIsSpeakingQuote(false),
        () => setIsSpeakingQuote(false)
      );
    }
  };

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`"${dailyQuote.quote}" — ${dailyQuote.author}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClaimQuoteXp = () => {
    if (hasClaimedQuoteXp) return;
    storageService.addXp(10);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`ai_mentor_quote_claimed_${today}`, 'true');
    setHasClaimedQuoteXp(true);
    onRefreshState?.();
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.25 } });
    } catch (e) {}
  };

  const handlePronounceWord = () => {
    if (isSpeakingWord) {
      speechService.stopSpeaking();
      setIsSpeakingWord(false);
    } else {
      setIsSpeakingWord(true);
      speechService.speak(
        `${dailyWord.word}. ${dailyWord.partOfSpeech}. ${dailyWord.meaning}. For example: ${dailyWord.workplaceExample}`,
        0.9,
        undefined,
        () => setIsSpeakingWord(false),
        () => setIsSpeakingWord(false)
      );
    }
  };

  const handleSaveWordToVault = () => {
    if (hasSavedWord) return;
    storageService.addVocabularyItems([
      {
        word: dailyWord.word,
        meaning: dailyWord.meaning,
        simpleExample: dailyWord.casualExample,
        professionalExample: dailyWord.workplaceExample,
      },
    ]);
    storageService.addXp(10);
    setHasSavedWord(true);
    onRefreshState?.();
    try {
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.45 } });
    } catch (e) {}
  };

  const startWarmUpStep = (idx: number) => {
    setWarmUpStepIdx(idx);
    setWarmUpTimer(VOCAL_WARM_UP_STEPS[idx].durationSeconds);
    setIsWarmUpTimerActive(true);
  };

  const handleFinishWarmUp = () => {
    setWarmUpCompleted(true);
    setIsWarmUpTimerActive(false);
    storageService.recordPracticeActivity();
    storageService.addXp(15);
    onRefreshState?.();
    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
    } catch (e) {}
    setTimeout(() => {
      setIsWarmUpModalOpen(false);
    }, 1500);
  };

  const todayChallenge = getTodayChallenge();

  // Dynamically compute recommendation based on user's real session performance or daily rotating focus
  const recommendation = React.useMemo(() => {
    if (recentSessions.length > 0 && recentSessions[0].feedback) {
      return getRecommendations(recentSessions[0].feedback.scores, user.weakestSkill);
    }
    const dayOfWeek = new Date().getDay();
    const dailyFocusMap: (keyof ScoresBreakdown)[] = [
      'confidence',        // Sunday: Confidence & Assertiveness
      'naturalness',       // Monday: Spontaneous Speaking & Quick Thinking
      'professionalTone',  // Tuesday: Workplace Diplomacy & Status Reports
      'relevance',         // Wednesday: STAR Interview Questions
      'vocabulary',        // Thursday: Executive Vocabulary & Word Choice
      'clarity',           // Friday: Structured Communication & Brevity
      'grammar',           // Saturday: Grammar & Sentence Polish
    ];
    const focusKey = dailyFocusMap[dayOfWeek];
    const baselineScores: ScoresBreakdown = {
      grammar: 7.5,
      vocabulary: 7.5,
      clarity: 7.5,
      confidence: 7.5,
      professionalTone: 7.5,
      relevance: 7.5,
      naturalness: 7.5,
      sentenceStructure: 7.5,
    };
    baselineScores[focusKey] = 6.0;
    return getRecommendations(baselineScores, focusKey);
  }, [recentSessions, user.weakestSkill]);

  // Dynamically select today's featured practice scenario
  const todayFeaturedScenario = React.useMemo(() => {
    const featuredList = SCENARIOS.filter(
      (s) => s.category === 'workplace' || s.itSpecific || s.category === 'difficult'
    );
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000
    );
    return featuredList[dayOfYear % featuredList.length] || SCENARIOS[0];
  }, []);

  const goalPercentage = Math.min(100, Math.round((user.todayXp / user.dailyXpGoal) * 100));

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 0. COMPACT DAILY QUOTATION BANNER (2-3 lines height, full horizontal width) */}
      <div className="w-full relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 shadow-md px-4 sm:px-6 py-3 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: Quote Icon + Quote Text + Author */}
        <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold text-slate-100 tracking-tight leading-snug">
              <span className="text-amber-400 font-serif text-base mr-1">“</span>
              {dailyQuote.quote}
              <span className="text-amber-400 font-serif text-base ml-1">”</span>
              <span className="text-teal-300 font-bold ml-2 text-xs inline-block">
                — {dailyQuote.author}
              </span>
            </p>
          </div>
        </div>

        {/* Right: Compact Action Buttons (Listen, Next, Copy) */}
        <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
          <button
            onClick={handleToggleSpeechQuote}
            title={isSpeakingQuote ? 'Stop reading' : 'Listen to quote'}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center space-x-1 ${
              isSpeakingQuote
                ? 'bg-teal-500 text-white border-teal-400 shadow animate-pulse'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-indigo-200'
            }`}
          >
            {isSpeakingQuote ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{isSpeakingQuote ? 'Stop' : 'Listen'}</span>
          </button>

          <button
            onClick={handleNextQuote}
            title="Next inspirational quote"
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-indigo-200 text-xs font-semibold transition flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-[11px]">Next</span>
          </button>

          <button
            onClick={handleCopyQuote}
            title="Copy quote"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-indigo-200 text-xs font-semibold transition"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

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
              {user.streakDays} {user.streakDays === 1 ? 'Day' : 'Days'}
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

      {/* 2.2 PRODUCTION CORE PILLARS: Voice Partner, Duolingo Learning Path, Telugu Bridge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: AI Voice Partner */}
        <div
          onClick={() => onNavigate('voice_partner')}
          className="group cursor-pointer rounded-3xl p-6 bg-gradient-to-br from-indigo-900/90 via-indigo-950 to-slate-900 border border-indigo-500/30 hover:border-indigo-400 shadow-xl text-white relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center">
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-teal-400/20 text-teal-200 border border-teal-400/30">
                Live 2-Way Audio
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold group-hover:text-teal-300 transition-colors">
                AI Voice Partner
              </h3>
              <p className="text-xs text-indigo-200/80 leading-relaxed mt-1">
                Real-time telephone call simulation with natural turn-taking, spoken replies & voice interruption.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-teal-300 group-hover:translate-x-1 transition-transform">
              <span>Start Voice Call</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>

        {/* Card 2: Duolingo-Style Structured Path */}
        <div
          onClick={() => onNavigate('learn')}
          className="group cursor-pointer rounded-3xl p-6 bg-gradient-to-br from-indigo-900/90 via-slate-900 to-indigo-950 border border-indigo-500/30 hover:border-indigo-400 shadow-xl text-white relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-indigo-400/20 text-indigo-200 border border-indigo-400/30">
                Levels 1 - 7
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold group-hover:text-indigo-300 transition-colors">
                Structured Learning Path
              </h3>
              <p className="text-xs text-indigo-200/80 leading-relaxed mt-1">
                Bite-sized interactive exercises, sentence builders, grammar polish, and personal mistake revision.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-indigo-300 group-hover:translate-x-1 transition-transform">
              <span>Explore Curriculum</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>

        {/* Card 3: Telugu to English Bridge */}
        <div
          onClick={() => onNavigate('telugu_translate')}
          className="group cursor-pointer rounded-3xl p-6 bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 border border-teal-500/30 hover:border-teal-400 shadow-xl text-white relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center">
                <Languages className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-teal-400/20 text-teal-200 border border-teal-400/30">
                Bilingual Bridge
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold group-hover:text-teal-300 transition-colors">
                Telugu to English Engine
              </h3>
              <p className="text-xs text-teal-100/80 leading-relaxed mt-1">
                Think in Telugu? Type script or transliteration (e.g. "nenu office ki late"), get executive English!
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-teal-300 group-hover:translate-x-1 transition-transform">
              <span>Translate & Practice</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 DAILY LEARNING VAULT: Word of the Day & Executive Micro-Habit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Word of the Day */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Daily Word of the Day</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {dailyWord.category}
              </span>
            </div>

            {/* Word Banner with Audio Pronunciation */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <div>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {dailyWord.word}
                  </h3>
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                    {dailyWord.phonetic}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500 italic">
                  {dailyWord.partOfSpeech}
                </span>
              </div>

              <button
                onClick={handlePronounceWord}
                title="Hear correct pronunciation"
                className={`p-3 rounded-2xl transition shadow-sm flex items-center justify-center ${
                  isSpeakingWord
                    ? 'bg-teal-600 text-white animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Plain English Meaning */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Meaning:
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                {dailyWord.meaning}
              </p>
            </div>

            {/* Workplace and Casual Sentences */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <strong className="text-indigo-900 dark:text-indigo-300 block mb-0.5">
                  💼 Executive Workplace Example:
                </strong>
                <p className="text-slate-700 dark:text-slate-300 italic">
                  "{dailyWord.workplaceExample}"
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">
                  💬 Everyday Casual Example:
                </strong>
                <p className="text-slate-600 dark:text-slate-400 italic">
                  "{dailyWord.casualExample}"
                </p>
              </div>
            </div>

            {/* Synonyms */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-semibold text-slate-400 mr-1">Synonyms:</span>
              {dailyWord.synonyms.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Action to Save to Vocab Vault */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={handleSaveWordToVault}
              disabled={hasSavedWord}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                hasSavedWord
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 cursor-default'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{hasSavedWord ? 'Saved to Vocab Vault (+10 XP)' : 'Save to Vocab Vault (+10 XP)'}</span>
            </button>

            <button
              onClick={() => onNavigate('practice')}
              className="py-2.5 px-3 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition flex items-center space-x-1"
            >
              <span>Practice Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Executive Micro-Habit & Power Warm-Up */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Executive Micro-Habit of the Day</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {dailyHabit.category}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {dailyHabit.title}
            </h3>

            {/* Avoid vs. Power Alternative Comparison */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-xs">
                <div className="flex items-center space-x-1.5 text-rose-700 dark:text-rose-400 font-bold mb-1">
                  <span>✕ Avoid / Weak Habit:</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  "{dailyHabit.problemPhrase}"
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-xs">
                <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                  <span>✓ Executive Power Alternative:</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-bold">
                  "{dailyHabit.powerAlternative}"
                </p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <strong className="text-slate-500 block">Why this transforms your impact:</strong>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {dailyHabit.whyItWorks}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <strong className="text-amber-600 dark:text-amber-400 block mb-0.5">
                🎯 Today's Quick Challenge:
              </strong>
              <span>{dailyHabit.quickChallenge}</span>
            </div>
          </div>

          {/* Quick Launch Power Vocal Warm-Up */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setIsWarmUpModalOpen(true);
                startWarmUpStep(0);
              }}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-2 active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>🎤 60s Vocal Warm-Up (+15 XP)</span>
            </button>

            <span className="text-[11px] text-slate-400 font-medium">
              3 steps • 60 seconds
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
              <span className="truncate">Today: {todayChallenge.title} (+{todayChallenge.rewardXp} XP)</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
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

          {/* Daily Rotating Curated Arena */}
          <div
            onClick={() => onStartScenarioById(todayFeaturedScenario.id)}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  Featured Today
                </span>
                <span className="text-[11px] text-slate-400 font-semibold truncate">
                  {todayFeaturedScenario.role}
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-amber-600 transition-colors">
                {todayFeaturedScenario.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {todayFeaturedScenario.description}
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>{todayFeaturedScenario.difficulty} • +20 XP</span>
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

      {/* 6. 60-SECOND POWER VOCAL & CONFIDENCE WARM-UP MODAL */}
      {isWarmUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    60s Vocal & Confidence Warm-Up
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Step {warmUpStepIdx + 1} of {VOCAL_WARM_UP_STEPS.length} • {VOCAL_WARM_UP_STEPS[warmUpStepIdx].title}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsWarmUpModalOpen(false);
                  setIsWarmUpTimerActive(false);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Pills */}
            <div className="flex items-center space-x-2">
              {VOCAL_WARM_UP_STEPS.map((s, idx) => (
                <div
                  key={s.id}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    idx === warmUpStepIdx
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-600'
                      : idx < warmUpStepIdx
                      ? 'bg-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Active Warm-Up Content */}
            {(() => {
              const currentStep = VOCAL_WARM_UP_STEPS[warmUpStepIdx];
              return (
                <div className="space-y-4 text-center">
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                      Step {currentStep.stepNumber}: {currentStep.title}
                    </span>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                      {currentStep.instructions}
                    </p>

                    {currentStep.drillText && (
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-dashed border-indigo-300 dark:border-indigo-700 text-base font-bold text-slate-900 dark:text-white italic font-mono mt-3">
                        {currentStep.drillText}
                      </div>
                    )}
                  </div>

                  {/* Timer Display */}
                  <div className="py-2">
                    <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-mono text-3xl font-black text-slate-900 dark:text-white">
                      <span>{warmUpTimer}s</span>
                    </div>
                    <span className="block text-xs text-slate-400 mt-1">
                      {isWarmUpTimerActive ? 'Engaged in drill...' : warmUpTimer === 0 ? 'Step Complete!' : 'Press start to engage'}
                    </span>
                  </div>

                  {/* Benefit */}
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold italic">
                    ✨ Benefit: {currentStep.benefit}
                  </p>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsWarmUpTimerActive((a) => !a);
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition flex items-center space-x-1.5"
              >
                <span>{isWarmUpTimerActive ? 'Pause' : 'Start Timer'}</span>
              </button>

              {warmUpStepIdx < VOCAL_WARM_UP_STEPS.length - 1 ? (
                <button
                  onClick={() => startWarmUpStep(warmUpStepIdx + 1)}
                  className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
                >
                  <span>Next Step →</span>
                </button>
              ) : (
                <button
                  onClick={handleFinishWarmUp}
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finish & Claim +15 XP</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
