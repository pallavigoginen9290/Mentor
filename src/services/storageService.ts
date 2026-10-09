import {
  UserProfile,
  AppSettings,
  PracticeSession,
  GameRecord,
  Badge,
  VocabularyItem,
  ScoresBreakdown,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_BADGES,
  INITIAL_VOCABULARY,
} from '../data/initialData';

const STORAGE_KEYS = {
  USER: 'ai_mentor_user_v4',
  SETTINGS: 'ai_mentor_settings_v4',
  SESSIONS: 'ai_mentor_sessions_v4',
  GAMES: 'ai_mentor_games_v4',
  BADGES: 'ai_mentor_badges_v4',
  VOCABULARY: 'ai_mentor_vocab_v4',
};

// Purge legacy mock keys if present
if (typeof window !== 'undefined') {
  [
    'ai_mentor_user_v1',
    'ai_mentor_settings_v1',
    'ai_mentor_sessions_v1',
    'ai_mentor_games_v1',
    'ai_mentor_badges_v1',
    'ai_mentor_vocab_v1',
    'ai_mentor_user_v2',
    'ai_mentor_settings_v2',
    'ai_mentor_sessions_v2',
    'ai_mentor_games_v2',
    'ai_mentor_badges_v2',
    'ai_mentor_vocab_v2',
    'ai_mentor_user_v3',
    'ai_mentor_settings_v3',
    'ai_mentor_sessions_v3',
    'ai_mentor_games_v3',
    'ai_mentor_badges_v3',
    'ai_mentor_vocab_v3',
  ].forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch (e) {
      // ignore
    }
  });
}

export const LEVEL_TIERS = [
  { level: 1, title: 'Beginner', minXp: 0 },
  { level: 2, title: 'Explorer', minXp: 300 },
  { level: 3, title: 'Communicator', minXp: 700 },
  { level: 4, title: 'Confident Speaker', minXp: 1200 },
  { level: 5, title: 'Professional Communicator', minXp: 2000 },
  { level: 6, title: 'Advanced Communicator', minXp: 3200 },
  { level: 7, title: 'Communication Master', minXp: 5000 },
];

const INITIAL_SETTINGS: AppSettings = {
  aiProvider: 'intelligent_builtin',
  geminiApiKey: '',
  openaiApiKey: '',
  mentorPersona: 'friendly',
  difficulty: 'Beginner',
  soundEffects: true,
  textToSpeech: true,
  voiceRate: 1.0,
  voiceGender: 'default',
  dailyXpGoal: 100,
};

export const storageService = {
  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) {
        const user: UserProfile = JSON.parse(data);
        let modified = false;
        if (!user.name || user.name.toLowerCase().includes('alex')) {
          user.name = 'Pallavi';
          modified = true;
        }
        // Enforce true synchrony with actual stored sessions and games
        const sessions = this.getSessions();
        if (user.sessionsCompleted !== sessions.length) {
          user.sessionsCompleted = sessions.length;
          modified = true;
        }
        const games = this.getGames();
        if (user.gamesCompleted !== games.length) {
          user.gamesCompleted = games.length;
          modified = true;
        }
        if (modified) {
          this.saveUser(user);
        }
        return user;
      }
    } catch (e) {
      console.error(e);
    }
    const freshUser: UserProfile = { ...INITIAL_USER, name: 'Pallavi' };
    this.saveUser(freshUser);
    return freshUser;
  },

  saveUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    this.saveSettings(INITIAL_SETTINGS);
    return INITIAL_SETTINGS;
  },

  saveSettings(settings: AppSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getSessions(): PracticeSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  saveSessions(sessions: PracticeSession[]) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  },

  getGames(): GameRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAMES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  saveGames(games: GameRecord[]) {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
  },

  getBadges(): Badge[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BADGES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    this.saveBadges(INITIAL_BADGES);
    return INITIAL_BADGES;
  },

  saveBadges(badges: Badge[]) {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  },

  getVocabulary(): VocabularyItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOCABULARY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    this.saveVocabulary(INITIAL_VOCABULARY);
    return INITIAL_VOCABULARY;
  },

  saveVocabulary(vocab: VocabularyItem[]) {
    localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(vocab));
  },

  addVocabularyItems(newItems: VocabularyItem[]) {
    const existing = this.getVocabulary();
    const existingWords = new Set(existing.map((v) => v.word.toLowerCase()));
    const toAdd = newItems.filter((i) => !existingWords.has(i.word.toLowerCase()));
    if (toAdd.length > 0) {
      this.saveVocabulary([...toAdd, ...existing]);
    }
  },

  addXp(amount: number): { newTotal: number; levelUp: boolean; newLevelTitle: string } {
    const user = this.getUser();
    const oldLevel = user.currentLevel;
    const newXp = user.xp + amount;
    const newTodayXp = user.todayXp + amount;

    let currentTier = LEVEL_TIERS[0];
    for (const tier of LEVEL_TIERS) {
      if (newXp >= tier.minXp) {
        currentTier = tier;
      }
    }

    const levelUp = currentTier.level > oldLevel;
    user.xp = newXp;
    user.todayXp = newTodayXp;
    user.currentLevel = currentTier.level;
    user.levelTitle = currentTier.title;

    this.saveUser(user);

    if (levelUp && currentTier.level >= 7) {
      this.unlockBadge('comm_master');
    }

    return {
      newTotal: newXp,
      levelUp,
      newLevelTitle: currentTier.title,
    };
  },

  recordSession(session: PracticeSession) {
    const sessions = this.getSessions();
    sessions.unshift(session);
    this.saveSessions(sessions);

    if (session.feedback?.vocabulary && session.feedback.vocabulary.length > 0) {
      this.addVocabularyItems(session.feedback.vocabulary);
    }

    const user = this.getUser();
    user.sessionsCompleted = sessions.length;

    if (session.feedback) {
      const scoreWeight = user.currentScore === 0 ? 1.0 : 0.25;
      user.currentScore = Number(
        (user.currentScore * (1 - scoreWeight) + session.feedback.overallScore * scoreWeight).toFixed(1)
      );

      const scores = session.feedback.scores;
      const keys = Object.keys(scores) as (keyof ScoresBreakdown)[];
      let maxKey = keys[0];
      let minKey = keys[0];
      for (const k of keys) {
        if (scores[k] > scores[maxKey]) maxKey = k;
        if (scores[k] < scores[minKey]) minKey = k;
      }
      user.strongestSkill = maxKey;
      user.weakestSkill = minKey;

      if (session.feedback.overallScore >= 9.5) {
        this.unlockBadge('perfect_score');
      }
    }

    this.saveUser(user);
    this.addXp(session.xpEarned || 20);

    if (user.sessionsCompleted >= 1) {
      this.unlockBadge('first_practice');
    }
    if (user.sessionsCompleted >= 5) {
      this.unlockBadge('conversation_starter');
    }
    if (session.mode === 'workplace' && (session.feedback?.scores.professionalTone ?? 0) >= 8) {
      this.unlockBadge('workplace_pro');
    }
    if (session.mode === 'interview') {
      const interviewCount = sessions.filter((s) => s.mode === 'interview').length;
      if (interviewCount >= 3) {
        this.unlockBadge('interview_ready');
      }
    }
  },

  recordGame(game: GameRecord) {
    const games = this.getGames();
    games.unshift(game);
    this.saveGames(games);

    const user = this.getUser();
    user.gamesCompleted = games.length;
    this.saveUser(user);
    this.addXp(game.xpEarned);

    if (game.gameType === 'thirty_seconds' && game.score >= 8) {
      this.unlockBadge('quick_thinker');
    }
    const vocabCount = this.getVocabulary().length;
    if (vocabCount >= 15) {
      this.unlockBadge('vocabulary_builder');
    }
  },

  unlockBadge(badgeId: string): boolean {
    const badges = this.getBadges();
    const badge = badges.find((b) => b.id === badgeId);
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = new Date().toISOString();
      this.saveBadges(badges);
      return true;
    }
    return false;
  },

  checkStreak(): { streak: number; recovered: boolean } {
    const user = this.getUser();
    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.lastActiveDate;

    if (lastActive === today) {
      return { streak: user.streakDays, recovered: false };
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let recovered = false;

    if (lastActive === yesterday) {
      user.streakDays += 1;
      user.todayXp = 0;
      user.lastActiveDate = today;
    } else {
      user.streakDays = 1;
      user.todayXp = 0;
      user.lastActiveDate = today;
      recovered = true;
    }

    this.saveUser(user);
    return { streak: user.streakDays, recovered };
  },

  exportData(): string {
    const payload = {
      user: this.getUser(),
      settings: this.getSettings(),
      sessions: this.getSessions(),
      games: this.getGames(),
      badges: this.getBadges(),
      vocabulary: this.getVocabulary(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.user) this.saveUser(parsed.user);
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (parsed.sessions) this.saveSessions(parsed.sessions);
      if (parsed.games) this.saveGames(parsed.games);
      if (parsed.badges) this.saveBadges(parsed.badges);
      if (parsed.vocabulary) this.saveVocabulary(parsed.vocabulary);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.GAMES);
    localStorage.removeItem(STORAGE_KEYS.BADGES);
    localStorage.removeItem(STORAGE_KEYS.VOCABULARY);
  },
};
