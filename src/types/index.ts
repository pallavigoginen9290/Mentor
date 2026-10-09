export type NavigationTab =
  | 'dashboard'
  | 'practice'
  | 'workplace'
  | 'interview'
  | 'meeting'
  | 'games'
  | 'challenges'
  | 'progress'
  | 'profile'
  | 'settings';

export type PracticeMode =
  | 'daily'
  | 'workplace'
  | 'interview'
  | 'difficult'
  | 'meeting'
  | 'presentation'
  | 'think_speak';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type MentorPersona = 'friendly' | 'professional' | 'motivating' | 'executive';

export interface ScoresBreakdown {
  grammar: number; // 1-10
  vocabulary: number; // 1-10
  clarity: number; // 1-10
  confidence: number; // 1-10
  professionalTone: number; // 1-10
  relevance: number; // 1-10
  naturalness: number; // 1-10
  sentenceStructure: number; // 1-10
}

export interface MistakeDetail {
  original: string;
  better: string;
  explanation: string;
}

export interface VocabularyItem {
  word: string;
  meaning: string;
  simpleExample: string;
  professionalExample: string;
}

export interface FeedbackReport {
  overallScore: number;
  scores: ScoresBreakdown;
  whatYouDidWell: string[]; // 3 points
  whatToImprove: string[]; // 2-4 points
  commonMistakes: MistakeDetail[];
  betterVersion: string;
  retryPrompt: string;
  vocabulary: VocabularyItem[];
  encouragement: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user' | 'system';
  text: string;
  timestamp: string;
  audioDuration?: number;
  isThinking?: boolean;
}

export interface PracticeSession {
  id: string;
  date: string; // ISO
  mode: PracticeMode;
  categoryTitle: string;
  topic: string;
  personaTitle?: string;
  messages: ChatMessage[];
  userResponses: string[];
  feedback?: FeedbackReport;
  xpEarned: number;
  durationSeconds: number;
  completed: boolean;
}

export interface GameRecord {
  id: string;
  gameType: GameType;
  title: string;
  score: number; // e.g. 8/10
  maxScore: number;
  xpEarned: number;
  difficulty: DifficultyLevel;
  date: string;
  details?: string;
}

export type GameType =
  | 'typing_practice'
  | 'word_connect'
  | 'word_builder'
  | 'sentence_scramble'
  | 'better_response'
  | 'what_would_you_say'
  | 'thirty_seconds'
  | 'forbidden_word'
  | 'story_builder'
  | 'word_association'
  | 'vocabulary_match'
  | 'spot_mistake'
  | 'professional_casual'
  | 'interview_quickfire'
  | 'guess_word'
  | 'situation_puzzle'
  | 'emoji_story'
  | 'explain_without'
  | 'conversation_choices'
  | 'daily_mystery';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requirement: string;
  category: 'practice' | 'streak' | 'mastery' | 'games';
}

export interface UserProfile {
  id: string;
  name: string;
  currentLevel: number;
  levelTitle: string;
  currentScore: number; // Overall communication score e.g. 7.4
  xp: number;
  todayXp: number;
  dailyXpGoal: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  sessionsCompleted: number;
  gamesCompleted: number;
  goals: string[];
  focusAreas: string[];
  preferredDurationMinutes: number;
  strongestSkill: keyof ScoresBreakdown;
  weakestSkill: keyof ScoresBreakdown;
}

export interface AppSettings {
  aiProvider: 'intelligent_builtin' | 'gemini' | 'openai';
  geminiApiKey: string;
  openaiApiKey: string;
  mentorPersona: MentorPersona;
  difficulty: DifficultyLevel;
  soundEffects: boolean;
  textToSpeech: boolean;
  voiceRate: number;
  voiceGender: 'default' | 'female' | 'male';
  dailyXpGoal: number;
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  role: string;
  category: 'workplace' | 'it' | 'interview' | 'difficult' | 'meeting' | 'presentation' | 'daily';
  description: string;
  initialMessage: string;
  contextHint: string;
  suggestedGoal: string;
  difficulty: DifficultyLevel;
  itSpecific?: boolean;
}

export interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  badgeText: string;
  scenario: string;
  instructions: string;
  sampleStarter: string;
  targetFocus: string;
  rewardXp: number;
  completed: boolean;
  timeLimitSeconds?: number;
}

export interface MysteryScenario {
  id: string;
  title: string;
  type: string;
  situation: string;
  urgency: 'medium' | 'high' | 'critical';
  context: string;
  mentorPrompt: string;
  decisionPoints: string[];
}
