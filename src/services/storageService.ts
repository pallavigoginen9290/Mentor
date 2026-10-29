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

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(d: Date = new Date()): string {
  const yesterday = new Date(d);
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
}

export function calculateStreakFromDates(dates: string[]): number {
  if (!dates || dates.length === 0) return 0;
  const uniqueDates = new Set(dates);
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  let checkDateStr = '';
  if (uniqueDates.has(today)) {
    checkDateStr = today;
  } else if (uniqueDates.has(yesterday)) {
    checkDateStr = yesterday;
  } else {
    return 0; // Streak broken because neither today nor yesterday had practice
  }

  let streak = 0;
  const [y, m, d] = checkDateStr.split('-').map(Number);
  const curr = new Date(y, m - 1, d);

  while (uniqueDates.has(getLocalDateString(curr))) {
    streak += 1;
    curr.setDate(curr.getDate() - 1);
  }

  return streak;
}

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

        // Initialize and synchronize activePracticeDates
        if (!user.activePracticeDates) {
          user.activePracticeDates = [];
          modified = true;
        }

        const sessionDates = sessions
          .map((s) => (s.date ? getLocalDateString(new Date(s.date)) : ''))
          .filter(Boolean);
        const gameDates = games
          .map((g) => (g.date ? getLocalDateString(new Date(g.date)) : ''))
          .filter(Boolean);
        const allRecordedDates = Array.from(
          new Set([...user.activePracticeDates, ...sessionDates, ...gameDates])
        );

        if (allRecordedDates.length !== user.activePracticeDates.length) {
          user.activePracticeDates = allRecordedDates;
          modified = true;
        }

        // Calculate and sync exact streak
        const realStreak = calculateStreakFromDates(user.activePracticeDates);
        if (user.streakDays !== realStreak) {
          user.streakDays = realStreak;
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
    const freshUser: UserProfile = {
      ...INITIAL_USER,
      name: 'Pallavi',
      streakDays: 0,
      activePracticeDates: [],
      lastActiveDate: getLocalDateString(),
    };
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
    this.recordPracticeActivity();

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
    this.recordPracticeActivity();

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

  recordPracticeActivity(): { streak: number; streakExtended: boolean; isFirstToday: boolean } {
    const user = this.getUser();
    const today = getLocalDateString();

    if (!user.activePracticeDates) {
      user.activePracticeDates = [];
    }

    const alreadyPracticedToday = user.activePracticeDates.includes(today);
    if (!alreadyPracticedToday) {
      user.activePracticeDates.push(today);
    }

    user.lastPracticeDate = today;
    user.lastActiveDate = today;

    const oldStreak = user.streakDays || 0;
    const newStreak = calculateStreakFromDates(user.activePracticeDates);
    user.streakDays = newStreak;

    this.saveUser(user);

    if (newStreak >= 7) {
      this.unlockBadge('streak_7');
    }
    if (newStreak >= 30) {
      this.unlockBadge('streak_30');
    }

    return {
      streak: newStreak,
      streakExtended: newStreak > oldStreak,
      isFirstToday: !alreadyPracticedToday,
    };
  },

  checkStreak(): { streak: number; recovered: boolean; broken: boolean } {
    const user = this.getUser();
    const today = getLocalDateString();
    let broken = false;
    let recovered = false;

    // Reset daily XP if day changed
    if (user.lastActiveDate !== today) {
      user.todayXp = 0;
      user.lastActiveDate = today;
    }

    const realStreak = calculateStreakFromDates(user.activePracticeDates || []);
    if (user.streakDays !== realStreak) {
      if (user.streakDays > realStreak && realStreak === 0) {
        broken = true;
      }
      user.streakDays = realStreak;
    }

    this.saveUser(user);
    return { streak: user.streakDays, recovered, broken };
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
