import React, { useState } from 'react';
import { AppSettings, MentorPersona, DifficultyLevel } from '../../types';
import { storageService } from '../../services/storageService';
import {
  Settings,
  Volume2,
  Key,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Save,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExport = () => {
    const data = storageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-mentor-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && storageService.importData(content)) {
        alert('Data imported successfully! The page will now reload.');
        window.location.reload();
      } else {
        alert('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Application & AI Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure mentor personality, AI cloud providers, speech synthesis, and backup your data.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. AI Provider Engine Configuration (Section 52) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Key className="w-5 h-5" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              AI Service Provider Engine
            </h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            The application includes a rich Built-in Intelligent Soft-Skills NLP Engine that works 100% offline without API keys.
            You can optionally connect Google Gemini or OpenAI for cloud LLM reasoning.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'intelligent_builtin',
                title: 'Built-in Intelligent Engine',
                desc: 'Ready out of the box • Fast & zero setup',
              },
              {
                id: 'gemini',
                title: 'Google Gemini AI',
                desc: 'Uses Gemini 1.5/2.0 Flash • Custom key',
              },
              {
                id: 'openai',
                title: 'OpenAI API',
                desc: 'Uses GPT-4o-mini • Custom key',
              },
            ].map((p) => {
              const selected = formData.aiProvider === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setFormData({ ...formData, aiProvider: p.id as any })}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
                    selected
                      ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs">{p.title}</span>
                    {selected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{p.desc}</span>
                </div>
              );
            })}
          </div>

          {/* Conditional API Key inputs */}
          {formData.aiProvider === 'gemini' && (
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={formData.geminiApiKey}
                onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="text-[11px] text-slate-400 block">
                Obtain a free key from Google AI Studio. Your key is kept strictly in your local browser storage.
              </span>
            </div>
          )}

          {formData.aiProvider === 'openai' && (
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={formData.openaiApiKey}
                onChange={(e) => setFormData({ ...formData, openaiApiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="text-[11px] text-slate-400 block">
                Obtain from platform.openai.com. Stored securely in your browser's local storage.
              </span>
            </div>
          )}
        </div>

        {/* 2. Mentor Persona & Difficulty (Section 44 & 49) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            AI Mentor Persona & Difficulty Level
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Mentor Persona Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['friendly', 'professional', 'motivating', 'executive'] as MentorPersona[]).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setFormData({ ...formData, mentorPersona: p })}
                    className={`p-3 rounded-xl text-xs font-bold capitalize transition ${
                      formData.mentorPersona === p
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Adaptive Difficulty
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as DifficultyLevel[]).map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setFormData({ ...formData, difficulty: d })}
                    className={`p-3 rounded-xl text-xs font-bold transition ${
                      formData.difficulty === d
                        ? 'bg-teal-600 text-white shadow'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Audio & Speech Synthesis Settings */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 text-teal-600">
            <Volume2 className="w-5 h-5" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Voice & Audio Experience
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <span className="text-xs font-bold block text-slate-900 dark:text-white">
                  Spoken AI Mentor Voice (Text-to-Speech)
                </span>
                <span className="text-[11px] text-slate-500">
                  Hear the AI interlocutor speak naturally during simulations.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.textToSpeech}
                onChange={(e) => setFormData({ ...formData, textToSpeech: e.target.checked })}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                <span>Speech Speed Rate</span>
                <span>{formData.voiceRate}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={formData.voiceRate}
                onChange={(e) => setFormData({ ...formData, voiceRate: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* 4. Data Management: Export, Import, Reset */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            Data Portability & Backup
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON Backup</span>
            </button>

            <label className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer flex items-center space-x-1.5">
              <Upload className="w-4 h-4" />
              <span>Import Backup</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>

            <button
              type="button"
              onClick={() => setResetModalOpen(true)}
              className="py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-auto flex items-center space-x-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset All Progress</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </span>
          ) : (
            <span className="text-xs text-slate-400">Settings save to browser storage</span>
          )}

          <button
            type="submit"
            className="py-3 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Reset All Progress?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will reset your sessions, XP, level, unlocked badges, and vocabulary back to initial
              factory defaults.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setResetModalOpen(false)}
                className="py-2 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setResetModalOpen(false);
                  onResetData();
                }}
                className="py-2 px-5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow hover:bg-rose-700"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
