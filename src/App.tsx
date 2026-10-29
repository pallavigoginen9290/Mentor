import { useState, useEffect } from 'react';
import {
  NavigationTab,
  PracticeMode,
  PracticeSession,
  GameRecord,
  FeedbackReport,
  AppSettings,
  UserProfile,
  Badge,
  VocabularyItem,
} from './types';
import { storageService } from './services/storageService';
import {
  INITIAL_USER,
  INITIAL_SESSIONS,
  INITIAL_GAMES,
  INITIAL_BADGES,
  INITIAL_VOCABULARY,
} from './data/initialData';
import { SCENARIOS } from './data/scenarios';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { DashboardView } from './components/dashboard/DashboardView';
import { PracticeView } from './components/practice/PracticeView';
import { GamesView } from './components/games/GamesView';
import { ChallengesView } from './components/challenges/ChallengesView';
import { ProgressView } from './components/progress/ProgressView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { FeedbackModal } from './components/feedback/FeedbackModal';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Flame } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [user, setUser] = useState<UserProfile>(() => storageService.getUser());
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [sessions, setSessions] = useState<PracticeSession[]>(() => storageService.getSessions());
  const [games, setGames] = useState<GameRecord[]>(() => storageService.getGames());
  const [badges, setBadges] = useState<Badge[]>(() => storageService.getBadges());
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(() => storageService.getVocabulary());

  // Deep linking to scenario
  const [targetScenarioId, setTargetScenarioId] = useState<string | undefined>(undefined);
  const [targetMode, setTargetMode] = useState<PracticeMode>('workplace');
  const [initialOpenMystery, setInitialOpenMystery] = useState(false);

  // Modal states
  const [activeFeedback, setActiveFeedback] = useState<{
    feedback: FeedbackReport;
    xpEarned: number;
  } | null>(null);

  // Notification banners (Level up, Badges, Streak recovery)
  const [bannerNotice, setBannerNotice] = useState<{
    title: string;
    message: string;
    icon: string;
  } | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize and check streak on startup
  useEffect(() => {
    const streakResult = storageService.checkStreak();
    refreshState();
    const currUser = storageService.getUser();
    if (streakResult.broken && currUser.sessionsCompleted > 0) {
      setBannerNotice({
        title: 'New Day, Fresh Start!',
        message: "No worries! Complete any quick practice drill today to ignite a new streak.",
        icon: '🌱',
      });
    }
  }, []);

  const refreshState = () => {
    setUser(storageService.getUser());
    setSessions(storageService.getSessions());
    setGames(storageService.getGames());
    setBadges(storageService.getBadges());
    setVocabulary(storageService.getVocabulary());
  };

  const handleFinishSession = (session: PracticeSession) => {
    storageService.recordSession(session);
    refreshState();

    const updatedUser = storageService.getUser();
    setBannerNotice({
      title: `🔥 ${updatedUser.streakDays} ${updatedUser.streakDays === 1 ? 'Day' : 'Days'} Streak! (+${session.xpEarned || 20} XP)`,
      message: updatedUser.streakDays > 1
        ? `Incredible consistency! You have extended your streak to ${updatedUser.streakDays} days.`
        : `Day 1 complete! Practice again tomorrow to keep your flame blazing.`,
      icon: '🔥',
    });
    if (updatedUser.currentLevel > user.currentLevel) {
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      } catch (e) {
        // ignore
      }
      setBannerNotice({
        title: `⭐ Level Up: Level ${updatedUser.currentLevel}!`,
        message: `Congratulations! You unlocked the title "${updatedUser.levelTitle}".`,
        icon: '🏆',
      });
    }
  };

  const handleRecordGame = (gameRecord: GameRecord) => {
    storageService.recordGame(gameRecord);
    refreshState();
  };

  const handleOpenFeedback = (feedback: FeedbackReport, xp: number) => {
    setActiveFeedback({ feedback, xpEarned: xp });
  };

  const handleRetrySessionFromFeedback = (_revisedText: string) => {
    storageService.addXp(15);
    refreshState();
    setBannerNotice({
      title: '+15 XP Retry Bonus Awarded!',
      message: 'Great perseverance! Practicing your improved version seals learning in your memory.',
      icon: '✨',
    });
  };

  const handleToggleSound = () => {
    const updated: AppSettings = { ...settings, textToSpeech: !settings.textToSpeech };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  const handleUpdateUser = (updatedProps: Partial<UserProfile>) => {
    const updated = { ...user, ...updatedProps };
    setUser(updated);
    storageService.saveUser(updated);
  };

  const handleResetData = () => {
    storageService.resetAllData();
    window.location.reload();
  };

  const [navNonce, setNavNonce] = useState(0);

  const handleStartScenarioById = (scenarioId: string) => {
    const sc = SCENARIOS.find((s) => s.id === scenarioId);
    setTargetScenarioId(scenarioId);
    if (sc) {
      if (sc.category === 'workplace' || sc.itSpecific) {
        setTargetMode('workplace');
        setActiveTab('workplace');
      } else if (sc.category === 'interview') {
        setTargetMode('interview');
        setActiveTab('interview');
      } else if (sc.category === 'meeting') {
        setTargetMode('meeting');
        setActiveTab('meeting');
      } else {
        setTargetMode('daily');
        setActiveTab('practice');
      }
    } else {
      setTargetMode('daily');
      setActiveTab('practice');
    }
    setNavNonce((prev) => prev + 1);
  };

  const handleStartMysteryScenario = () => {
    setInitialOpenMystery(true);
    setActiveTab('challenges');
  };

  const handleCompleteDailyChallenge = (xpReward: number) => {
    storageService.recordPracticeActivity();
    storageService.addXp(xpReward);
    refreshState();
    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch (e) {
      // ignore
    }
    const updated = storageService.getUser();
    setBannerNotice({
      title: `🔥 Daily Challenge Mastered! (+${xpReward} XP)`,
      message: `Streak active: ${updated.streakDays} ${updated.streakDays === 1 ? 'Day' : 'Days'}! Your spontaneous communication is noticeably improving.`,
      icon: '🔥',
    });
  };

  // Switch navigation tabs with contextual mode and instant refresh
  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setTargetScenarioId(undefined);
    setNavNonce((prev) => prev + 1);
    if (tab === 'practice') {
      setTargetMode('daily');
    } else if (tab === 'workplace') {
      setTargetMode('workplace');
    } else if (tab === 'interview') {
      setTargetMode('interview');
    } else if (tab === 'meeting') {
      setTargetMode('meeting');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <Header
        user={user}
        settings={settings}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onToggleSound={handleToggleSound}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Encouragement / Level Up Toast Banner */}
      {bannerNotice && (
        <div className="bg-gradient-to-r from-teal-600 to-indigo-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between z-30 transition-all">
          <div className="max-w-7xl mx-auto flex items-center space-x-3 text-xs sm:text-sm font-semibold">
            <span className="text-xl">{bannerNotice.icon}</span>
            <span>
              <strong>{bannerNotice.title}</strong> — {bannerNotice.message}
            </span>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-white/80 hover:text-white font-bold text-xs px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Container with Sidebar Navigation */}
      <div className="flex-1 flex w-full">
        <Navigation
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onStartMystery={handleStartMysteryScenario}
        />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              user={user}
              recentSessions={sessions}
              onNavigate={handleSelectTab}
              onStartScenarioById={handleStartScenarioById}
              onStartMystery={handleStartMysteryScenario}
              onOpenFeedback={(s) => {
                if (s.feedback) {
                  setActiveFeedback({ feedback: s.feedback, xpEarned: s.xpEarned });
                }
              }}
              onRefreshState={refreshState}
            />
          )}

          {(activeTab === 'practice' ||
            activeTab === 'workplace' ||
            activeTab === 'interview' ||
            activeTab === 'meeting') && (
            <PracticeView
              key={`${activeTab}-${navNonce}`}
              initialScenarioId={targetScenarioId}
              initialMode={
                activeTab === 'workplace'
                  ? 'workplace'
                  : activeTab === 'interview'
                  ? 'interview'
                  : activeTab === 'meeting'
                  ? 'meeting'
                  : 'daily'
              }
              settings={settings}
              user={user}
              onFinishSession={handleFinishSession}
              onOpenFeedback={handleOpenFeedback}
            />
          )}

          {activeTab === 'games' && (
            <GamesView
              settings={settings}
              user={user}
              onRecordGame={handleRecordGame}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'challenges' && (
            <ChallengesView
              settings={settings}
              user={user}
              initialOpenMystery={initialOpenMystery}
              onCompleteDailyChallenge={handleCompleteDailyChallenge}
              onOpenFeedback={handleOpenFeedback}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressView
              user={user}
              sessions={sessions}
              games={games}
              badges={badges}
              vocabulary={vocabulary}
              onSelectSession={(sess) => {
                if (sess.feedback) {
                  setActiveFeedback({ feedback: sess.feedback, xpEarned: sess.xpEarned });
                }
              }}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView user={user} badges={badges} onUpdateUser={handleUpdateUser} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Feedback & Score Modal (Sections 13, 14, 15) */}
      {activeFeedback && (
        <FeedbackModal
          feedback={activeFeedback.feedback}
          xpEarned={activeFeedback.xpEarned}
          onClose={() => setActiveFeedback(null)}
          onRetry={handleRetrySessionFromFeedback}
          onNavigateToGame={() => {
            setActiveFeedback(null);
            setActiveTab('games');
          }}
        />
      )}
    </div>
  );
}

export default App;
