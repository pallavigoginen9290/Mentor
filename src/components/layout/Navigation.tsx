import React from 'react';
import { NavigationTab } from '../../types';
import {
  LayoutDashboard,
  BookOpen,
  PhoneCall,
  Languages,
  MessageSquare,
  Briefcase,
  Mic,
  Users,
  Gamepad2,
  Flame,
  TrendingUp,
  UserCheck,
  Settings,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface NavigationProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onStartMystery: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  onStartMystery,
}) => {
  interface NavItem {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
    highlight?: boolean;
    pulse?: boolean;
  }

  // Primary 7 Core Navigation Sections
  const primaryNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'learn', label: 'Learn', icon: BookOpen, badge: 'Levels 1-7' },
    { id: 'voice_partner', label: 'AI Voice Partner', icon: PhoneCall, badge: 'Live 2-Way', pulse: true },
    { id: 'telugu_translate', label: 'Telugu to English', icon: Languages, badge: 'Bilingual' },
    { id: 'practice', label: 'Practice', icon: MessageSquare },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile & Settings', icon: UserCheck },
  ];

  // Secondary Tools & Games
  const secondaryNavItems: NavItem[] = [
    { id: 'games', label: '18 Games & Puzzles', icon: Gamepad2, highlight: true },
    { id: 'challenges', label: 'Daily Challenges', icon: Flame },
    { id: 'workplace', label: 'Workplace & IT', icon: Briefcase },
    { id: 'interview', label: 'Interview Simulator', icon: Mic },
    { id: 'meeting', label: 'Meeting Simulator', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Mobile Bottom Bar Quick Navigation (5 core items)
  const mobileBottomItems: NavItem[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'voice_partner', label: 'Voice Call', icon: PhoneCall, pulse: true },
    { id: 'telugu_translate', label: 'Telugu', icon: Languages },
    { id: 'practice', label: 'Practice', icon: MessageSquare },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 space-y-6 min-h-[calc(100vh-4rem)]">
        {/* Core Navigation (7 Sections) */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Main Navigation
          </p>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 dark:bg-indigo-500'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.pulse ? 'text-teal-500 animate-pulse' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.pulse
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 animate-pulse'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Practice Modes & Games Section */}
        <div className="space-y-1 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Practice Modes & Games
          </p>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white dark:bg-slate-700 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    Popular
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mystery Scenario Card in Sidebar */}
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-indigo-500/10 to-teal-500/10 border border-amber-200/60 dark:border-amber-700/40 relative overflow-hidden">
            <div className="flex items-center space-x-2 mb-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Mystery Scenario</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              Unexpected workplace dilemma. How would you react right now?
            </p>
            <button
              onClick={onStartMystery}
              className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>What Would You Do?</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Fixed 5 Core Tabs) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 py-1.5 shadow-lg">
        {mobileBottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${item.pulse ? 'text-teal-500' : ''}`} />
                {item.pulse && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Drawer (When hamburger menu is opened) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white">Mentor Navigation</span>
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* 7 Core items */}
              <div className="space-y-1 mb-4">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Main Sections
                </p>
                {primaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Secondary items */}
              <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Modes & Games
                </p>
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </div>
                      {item.highlight && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                          18 Games
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  onCloseMobile();
                  onStartMystery();
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-indigo-600 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Mystery Workplace Dilemma</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
