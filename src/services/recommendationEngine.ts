import { ScoresBreakdown, GameType, PracticeMode } from '../types';

export interface Recommendation {
  focusSkill: string;
  focusTitle: string;
  reason: string;
  recommendedPracticeMode: PracticeMode;
  recommendedPracticeTitle: string;
  recommendedGameType: GameType;
  recommendedGameTitle: string;
  actionPrompt: string;
}

export function getRecommendations(
  scores: ScoresBreakdown,
  weakestKey?: keyof ScoresBreakdown
): Recommendation {
  // If no weakestKey explicitly passed, evaluate minimum score
  let targetSkill = weakestKey;
  if (!targetSkill) {
    const keys = Object.keys(scores) as (keyof ScoresBreakdown)[];
    targetSkill = keys.reduce((min, k) => (scores[k] < scores[min] ? k : min), keys[0]);
  }

  switch (targetSkill) {
    case 'vocabulary':
      return {
        focusSkill: 'vocabulary',
        focusTitle: 'Vocabulary & Word Choice',
        reason: 'Your vocabulary score indicates opportunities to swap informal terms for precise business language.',
        recommendedPracticeMode: 'presentation',
        recommendedPracticeTitle: 'Presentation: Technical Concept',
        recommendedGameType: 'word_builder',
        recommendedGameTitle: 'Word Builder & Vocabulary Match',
        actionPrompt: 'Master corporate vocabulary and elevate your sentence impact with active word practice.',
      };

    case 'grammar':
    case 'sentenceStructure':
      return {
        focusSkill: 'grammar',
        focusTitle: 'Grammar & Syntax Formation',
        reason: 'Strengthening verb tenses and clause structure will make your speaking clean and effortless.',
        recommendedPracticeMode: 'daily',
        recommendedPracticeTitle: 'Daily Conversation',
        recommendedGameType: 'sentence_scramble',
        recommendedGameTitle: 'Sentence Scramble & Spot The Mistake',
        actionPrompt: 'Rearrange complex sentences and spot subtle workplace grammar slip-ups.',
      };

    case 'confidence':
      return {
        focusSkill: 'confidence',
        focusTitle: 'Assertiveness & Confidence',
        reason: 'Build presence and eliminate self-doubt when speaking under observation.',
        recommendedPracticeMode: 'interview',
        recommendedPracticeTitle: 'HR & Behavioral Interview',
        recommendedGameType: 'thirty_seconds',
        recommendedGameTitle: '30-Second Speaking Challenge',
        actionPrompt: 'Speak continuously without overthinking to unlock natural confidence.',
      };

    case 'naturalness':
    case 'clarity':
      return {
        focusSkill: 'spontaneous',
        focusTitle: 'Spontaneous Responses & Quick Thinking',
        reason: 'Your clarity is solid, but responding spontaneously under unexpected pressure will take you to Level 5.',
        recommendedPracticeMode: 'think_speak',
        recommendedPracticeTitle: 'Think → Speak Spontaneous Mode',
        recommendedGameType: 'thirty_seconds',
        recommendedGameTitle: '30-Second Speaking Challenge',
        actionPrompt: 'Train your brain to structure thoughts quickly before speaking.',
      };

    case 'professionalTone':
      return {
        focusSkill: 'workplace',
        focusTitle: 'Workplace Diplomacy & Executive Tone',
        reason: 'Enhance your ability to disagree professionally, report setbacks, and communicate with stakeholders.',
        recommendedPracticeMode: 'workplace',
        recommendedPracticeTitle: 'IT Workplace Simulation',
        recommendedGameType: 'better_response',
        recommendedGameTitle: 'Choose the Better Response',
        actionPrompt: 'Practice diplomatic nuances with managers, clients, and cross-functional teams.',
      };

    case 'relevance':
    default:
      return {
        focusSkill: 'interview',
        focusTitle: 'Conciseness & Directness',
        reason: 'Sharpen your responses so every sentence directly answers the prompt without filler or wandering.',
        recommendedPracticeMode: 'interview',
        recommendedPracticeTitle: 'Technical & Project Interview',
        recommendedGameType: 'interview_quickfire',
        recommendedGameTitle: 'Interview Quick Fire',
        actionPrompt: 'Deliver concise STAR-format answers to direct questions.',
      };
  }
}
