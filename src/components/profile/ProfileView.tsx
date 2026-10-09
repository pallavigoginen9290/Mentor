import React, { useState } from 'react';
import { UserProfile, Badge } from '../../types';
import {
  User,
  Award,
  Flame,
  Sparkles,
  Target,
  Clock,
  CheckCircle2,
  Save,
  BookOpen,
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  badges: Badge[];
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, badges, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [preferredDuration, setPreferredDuration] = useState(user.preferredDurationMinutes);
  const [goals, setGoals] = useState<string[]>(user.goals);
  const [focusAreas, setFocusAreas] = useState<string[]>(user.focusAreas);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const availableGoals = [
    'Improve spoken English fluency',
    'Clear corporate tech & client meetings',
    'Excel at behavioral IT interviews',
    'Eliminate filler words and hesitation',
    'Deliver engaging presentations',
    'Negotiate deadlines diplomatically',
  ];

  const availableFocusAreas = [
    'Spontaneous responses',
    'Workplace tact & diplomacy',
    'Precise technical articulation',
    'High-impact executive vocabulary',
    'Assertiveness and confidence',
    'Active listening & summarization',
  ];

  const toggleGoal = (goal: string) => {
    setGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]));
  };

  const toggleFocus = (area: string) => {
    setFocusAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      preferredDurationMinutes: preferredDuration,
      goals,
      focusAreas,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const unlockedBadgesCount = badges.filter((b) => b.unlockedAt).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Learner Profile & Goals
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your soft-skills focus areas, target duration, and learning objectives.
        </p>
      </div>

      {/* User Stats Summary Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border border-indigo-700/50">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 border-2 border-white/20 flex items-center justify-center text-white text-2xl font-black shadow-md">
            {name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-black">{name}</h2>
            <div className="flex items-center space-x-2 text-xs text-indigo-200 mt-1">
              <Award className="w-4 h-4 text-teal-300" />
              <span>Level {user.currentLevel} — {user.levelTitle}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
          <div>
            <span className="text-xs uppercase text-indigo-300 block">Rating</span>
            <span className="text-2xl font-black">{user.currentScore > 0 ? user.currentScore : 'New'}</span>
          </div>
          <div>
            <span className="text-xs uppercase text-indigo-300 block">Streak</span>
            <span className="text-2xl font-black text-amber-400">{user.streakDays}d</span>
          </div>
          <div>
            <span className="text-xs uppercase text-indigo-300 block">Badges</span>
            <span className="text-2xl font-black text-teal-300">{unlockedBadgesCount}</span>
          </div>
        </div>
      </div>

      {/* Form Settings */}
      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Daily Practice Duration
            </label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setPreferredDuration(mins)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                    preferredDuration === mins
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {mins} mins
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Goals Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Primary Learning Goals
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {availableGoals.map((g) => {
              const selected = goals.includes(g);
              return (
                <div
                  key={g}
                  onClick={() => toggleGoal(g)}
                  className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                    selected
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span>{g}</span>
                  {selected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Focus Areas */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Main Focus Areas (Mentor adapts exercises to these)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {availableFocusAreas.map((fa) => {
              const selected = focusAreas.includes(fa);
              return (
                <div
                  key={fa}
                  onClick={() => toggleFocus(fa)}
                  className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                    selected
                      ? 'bg-teal-50 border-teal-300 text-teal-900 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span>{fa}</span>
                  {selected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {savedSuccess ? (
            <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile updated successfully!</span>
            </span>
          ) : (
            <span className="text-xs text-slate-400">Settings persist to your browser profile</span>
          )}

          <button
            type="submit"
            className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
