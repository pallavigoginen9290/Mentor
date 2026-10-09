import { UserProfile, PracticeSession, GameRecord, Badge, VocabularyItem } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'user_default',
  name: 'Pallavi',
  currentLevel: 1,
  levelTitle: 'Beginner',
  currentScore: 0,
  xp: 0,
  todayXp: 0,
  dailyXpGoal: 100,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  sessionsCompleted: 0,
  gamesCompleted: 0,
  goals: [
    'Improve spoken English fluency',
    'Clear corporate tech & client meetings',
    'Excel at behavioral IT interviews',
    'Eliminate filler words and hesitation',
  ],
  focusAreas: [
    'Spontaneous responses',
    'Workplace tact & diplomacy',
    'Precise technical articulation',
  ],
  preferredDurationMinutes: 10,
  strongestSkill: 'clarity',
  weakestSkill: 'naturalness',
};

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_practice',
    title: 'First Practice',
    description: 'Complete your very first AI practice conversation.',
    icon: '🏆',
    requirement: 'Complete 1 practice session',
    category: 'practice',
  },
  {
    id: 'streak_7',
    title: '7 Day Streak',
    description: 'Practice consistently for seven consecutive days.',
    icon: '🔥',
    requirement: 'Maintain a 7-day streak',
    category: 'streak',
  },
  {
    id: 'conversation_starter',
    title: 'Conversation Starter',
    description: 'Initiate and sustain 5 daily or workplace dialogues.',
    icon: '💬',
    requirement: 'Complete 5 daily or workplace chats',
    category: 'practice',
  },
  {
    id: 'quick_thinker',
    title: 'Quick Thinker',
    description: 'Successfully conquer the 30-Second Speaking Challenge.',
    icon: '🧠',
    requirement: 'Score 8+ in 30-Second Challenge',
    category: 'games',
  },
  {
    id: 'workplace_pro',
    title: 'Workplace Pro',
    description: 'Master difficult manager and client status updates with 8+ tone.',
    icon: '👔',
    requirement: 'Complete 3 Workplace or IT scenarios with 8+ tone',
    category: 'mastery',
  },
  {
    id: 'interview_ready',
    title: 'Interview Ready',
    description: 'Complete full HR & Technical interview simulations.',
    icon: '🎤',
    requirement: 'Complete 3 interview simulations',
    category: 'practice',
  },
  {
    id: 'vocabulary_builder',
    title: 'Vocabulary Builder',
    description: 'Collect and review over 15 high-impact workplace words.',
    icon: '📚',
    requirement: 'Master 15 vocabulary words',
    category: 'games',
  },
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Achieve a 9.5+ rating in any practice or presentation simulation.',
    icon: '🎯',
    requirement: 'Score 9.5 or higher in any session',
    category: 'mastery',
  },
  {
    id: 'fast_responder',
    title: 'Fast Responder',
    description: 'Respond spontaneously in Think → Speak within 5 seconds.',
    icon: '⚡',
    requirement: 'Complete Think → Speak with high spontaneous score',
    category: 'games',
  },
  {
    id: 'comm_master',
    title: 'Communication Master',
    description: 'Reach Level 7 with over 5,000 XP and elite eloquence.',
    icon: '🏅',
    requirement: 'Reach Level 7',
    category: 'mastery',
  },
];

export const INITIAL_VOCABULARY: VocabularyItem[] = [
  {
    word: 'Clarify',
    meaning: 'To make something easier to understand or remove confusion.',
    simpleExample: 'Can you please clarify what time our call begins?',
    professionalExample: 'I would like to clarify the acceptance criteria for this automated data pipeline before deployment.',
  },
  {
    word: 'Delegate',
    meaning: 'To entrust a task or responsibility to another person.',
    simpleExample: 'She delegated the slide design to her teammate.',
    professionalExample: 'To meet the sprint deadline, we should delegate the PDF parsing module to the backend team.',
  },
  {
    word: 'Resolve',
    meaning: 'To settle, solve or find a solution to a problem.',
    simpleExample: 'They resolved the argument quickly.',
    professionalExample: 'We successfully resolved the SQL deadlock error by optimizing the query indexing.',
  },
];

// Clean initial sessions - populated as the user completes actual practice
export const INITIAL_SESSIONS: PracticeSession[] = [];

// Clean initial games - populated as the user actually plays games
export const INITIAL_GAMES: GameRecord[] = [];
