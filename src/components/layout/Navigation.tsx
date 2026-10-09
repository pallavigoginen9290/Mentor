import React from 'react';
import { NavigationTab } from '../../types';
import {
  LayoutDashboard,
  MessageSquare,
  Briefcase,
  Mic,
  Users,
  Gamepad2,
  Flame,
  TrendingUp,
  User,
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
    highlight?: boolean;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'practice', label: 'Daily Practice', icon: MessageSquare },
    { id: 'workplace', label: 'Workplace & IT', icon: Briefcase },
    { id: 'interview', label: 'Interview Simulator', icon: Mic },
    { id: 'meeting', label: 'Meeting Simulator', icon: Users },
    { id: 'games', label: 'Games & Puzzles', icon: Gamepad2, highlight: true },
    { id: 'challenges', label: 'Daily Challenges', icon: Flame },
    { id: 'progress', label: 'Progress & Analytics', icon: TrendingUp },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 space-y-6 min-h-[calc(100vh-4rem)]">
        <div className="space-y-1">
          <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 dark:bg-indigo-500'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                    }`}
                  >
                    18 Games
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Mystery Scenario Card in Sidebar */}
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

      {/* Mobile Drawer */}
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
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.highlight && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                          18 Games
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  onCloseMobile();
                  onStartMystery();
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-indigo-600 text-white text-sm font-bold rounded-xl shadow flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Mystery Scenario</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
