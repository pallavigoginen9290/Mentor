import React from 'react';
import { UserProfile, AppSettings, NavigationTab } from '../../types';
import {
  Flame,
  Award,
  Sparkles,
  Volume2,
  VolumeX,
  Menu,
  X,
  Compass,
} from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  settings: AppSettings;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onToggleSound: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  settings,
  activeTab: _activeTab,
  onSelectTab: _onSelectTab,
  onToggleSound,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const xpPercentage = Math.min(100, Math.round((user.todayXp / user.dailyXpGoal) * 100));

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/90 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold">
              <Compass className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg">
                  AI Communication Mentor
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 rounded-full">
                  PRO COACH
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Soft-Skills • Workplace Simulations • Interview Partner
              </p>
            </div>
          </div>

          {/* Gamification Stats: Streak, Level, XP */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Streak */}
            <div
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-sm font-semibold shadow-sm"
              title="Consecutive Days Practiced"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce-soft" />
              <span>{user.streakDays} Day Streak</span>
            </div>

            {/* Level */}
            <div
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-sm font-semibold shadow-sm"
              title={`Level ${user.currentLevel}: ${user.levelTitle}`}
            >
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Lvl {user.currentLevel} — {user.levelTitle}</span>
            </div>

            {/* XP Goal Progress */}
            <div
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm"
              title={`${user.todayXp}/${user.dailyXpGoal} Daily XP`}
            >
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span>{user.xp.toLocaleString()} XP</span>
              <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-indigo-600 transition-all duration-500 rounded-full"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl transition-all border ${
                settings.textToSpeech
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300'
                  : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
              }`}
              title={settings.textToSpeech ? 'Audio Speech Enabled (click to mute)' : 'Audio Speech Muted (click to enable)'}
            >
              {settings.textToSpeech ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile Menu & Quick Audio Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={onToggleSound}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              title="Toggle Audio"
            >
              {settings.textToSpeech ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onToggleMobileMenu}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
