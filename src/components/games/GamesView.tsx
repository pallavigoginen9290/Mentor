import React, { useState, useEffect } from 'react';
import { GameType, GameRecord, DifficultyLevel, AppSettings, UserProfile } from '../../types';
import {
  WORD_BUILDER_DATA,
  SENTENCE_SCRAMBLE_DATA,
  CHOOSE_BETTER_RESPONSE_DATA,
  SPOT_THE_MISTAKE_DATA,
  VOCAB_MATCH_DATA,
  FORBIDDEN_WORD_DATA,
  CONVERSATION_BRANCH_DATA,
  BRANCHING_TREE,
  SentenceScrambleItem,
  TYPING_PRACTICE_PASSAGES,
  WORD_CONNECT_LEVELS,
} from '../../data/gamesData';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Trophy,
  RotateCcw,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  Search,
  Keyboard,
  Shuffle,
  Lightbulb,
  CheckCircle2,
  Award,
  Zap,
  Check,
  X,
  BookOpen,
} from 'lucide-react';

interface GamesViewProps {
  settings: AppSettings;
  user: UserProfile;
  onRecordGame: (game: GameRecord) => void;
  onNavigateToDashboard: () => void;
}

export const GamesView: React.FC<GamesViewProps> = ({
  settings: _settings,
  user: _user,
  onRecordGame,
  onNavigateToDashboard,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [gameResult, setGameResult] = useState<{
    score: number;
    maxScore: number;
    xpEarned: number;
    strengths: string[];
    improvements: string[];
    newVocabulary: string[];
  } | null>(null);

  // --- GAME 1: WORD BUILDER STATE ---
  const [wbLevelIdx, setWbLevelIdx] = useState(0);
  const [wbInput, setWbInput] = useState('');
  const [wbFoundWords, setWbFoundWords] = useState<Array<{ word: string; tier: string; xp: number }>>([]);
  const [wbScore, setWbScore] = useState(0);

  // --- GAME 2: SENTENCE SCRAMBLE STATE ---
  const [scrambleIdx, setScrambleIdx] = useState(0);
  const [scrambleCurrent, setScrambleCurrent] = useState<SentenceScrambleItem>(SENTENCE_SCRAMBLE_DATA[0]);
  const [scramblePicked, setScramblePicked] = useState<string[]>([]);
  const [scramblePool, setScramblePool] = useState<string[]>([]);
  const [scrambleFeedback, setScrambleFeedback] = useState<string | null>(null);

  // --- GAME 3: CHOOSE BETTER RESPONSE STATE ---
  const [cbrIdx, setCbrIdx] = useState(0);
  const [cbrSelectedOption, setCbrSelectedOption] = useState<string | null>(null);

  // --- GAME 4: WHAT WOULD YOU SAY STATE ---
  const [wwysInput, setWwysInput] = useState('');
  const [wwysEvaluation, setWwysEvaluation] = useState<any | null>(null);

  // --- GAME 5: 30-SECOND CHALLENGE STATE ---
  const [thirtyTimer, setThirtyTimer] = useState(30);
  const [thirtyActive, setThirtyActive] = useState(false);
  const [thirtyInput, setThirtyInput] = useState('');

  // --- GAME 6: FORBIDDEN WORD STATE ---
  const [fwIdx, setFwIdx] = useState(0);
  const [fwInput, setFwInput] = useState('');
  const [fwDetectedViolations, setFwDetectedViolations] = useState<string[]>([]);

  // --- GAME 7: STORY BUILDER STATE ---
  const [storyMessages, setStoryMessages] = useState<Array<{ sender: string; text: string }>>([
    { sender: 'AI Mentor', text: 'I arrived at the office early on Tuesday morning and noticed all the executive meeting rooms were locked...' },
  ]);
  const [storyInput, setStoryInput] = useState('');

  // --- GAME 8: VOCABULARY MATCH STATE ---
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  // --- GAME 9: SPOT THE MISTAKE STATE ---
  const [stmIdx, setStmIdx] = useState(0);
  const [stmUserFix, setStmUserFix] = useState('');
  const [stmFeedback, setStmFeedback] = useState<string | null>(null);

  // --- GAME 10: BRANCHING CONVERSATION CHOICES STATE ---
  const [currentNode, setCurrentNode] = useState(CONVERSATION_BRANCH_DATA);
  const [branchLog, setBranchLog] = useState<Array<{ statement: string; chosen: string; feedback: string }>>([]);
  const [branchEnding, setBranchEnding] = useState<string | null>(null);

  // --- GAME 11: EMOJI STORY STATE ---
  const [emojiInput, setEmojiInput] = useState('');

  // --- GAME 12: GUESS THE WORD STATE ---
  const [gtwGuess, setGtwGuess] = useState('');
  const [gtwClueIdx, setGtwClueIdx] = useState(1);
  const [gtwSolved, setGtwSolved] = useState(false);

  // --- GAME 13: TYPING PRACTICE STATE ---
  const [tpPassageIdx, setTpPassageIdx] = useState(0);
  const [tpInput, setTpInput] = useState('');
  const [tpStarted, setTpStarted] = useState(false);
  const [tpElapsedSeconds, setTpElapsedSeconds] = useState(0);
  const [tpMode, setTpMode] = useState<'free' | '60s' | '30s'>('free');
  const [tpFinished, setTpFinished] = useState(false);

  // --- GAME 14: WORD CONNECT STATE ---
  const [wcLevelIdx, setWcLevelIdx] = useState(0);
  const [wcFoundWords, setWcFoundWords] = useState<string[]>([]);
  const [wcBonusFound, setWcBonusFound] = useState<string[]>([]);
  const [wcCurrentInput, setWcCurrentInput] = useState('');
  const [wcSelectedIndices, setWcSelectedIndices] = useState<number[]>([]);
  const [wcLetterPool, setWcLetterPool] = useState<string[]>(WORD_CONNECT_LEVELS[0].letters);
  const [wcNotice, setWcNotice] = useState<{ text: string; type: 'success' | 'bonus' | 'error' | 'info' } | null>(null);
  const [wcHintsUsed, setWcHintsUsed] = useState<Record<string, number[]>>({});
  const [wcHintsLeft, setWcHintsLeft] = useState(3);

  // Filter game category
  const [gameFilter, setGameFilter] = useState<'all' | 'typing' | 'vocab' | 'grammar' | 'spontaneous' | 'workplace'>('all');

  // Typing practice timer
  useEffect(() => {
    if (!tpStarted || tpFinished) return;
    const interval = setInterval(() => {
      setTpElapsedSeconds((prev) => {
        const next = prev + 1;
        if (tpMode === '30s' && next >= 30) {
          finishTypingPractice(30, tpInput);
          return 30;
        }
        if (tpMode === '60s' && next >= 60) {
          finishTypingPractice(60, tpInput);
          return 60;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [tpStarted, tpFinished, tpMode, tpInput]);

  // Timer effect for 30s challenge
  useEffect(() => {
    if (!thirtyActive || thirtyTimer <= 0) return;
    const interval = setInterval(() => {
      setThirtyTimer((t) => {
        if (t <= 1) {
          setThirtyActive(false);
          finishThirtySecondsChallenge();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [thirtyActive, thirtyTimer]);

  const allGamesList = [
    {
      id: 'typing_practice',
      title: 'Executive Typing Practice',
      category: 'typing',
      description: 'Master fast, confident keyboarding. Real-time WPM, Accuracy %, Speed (CPM), and typo diagnostics on IT & corporate passages.',
      icon: '⌨️',
      xp: 30,
    },
    {
      id: 'word_connect',
      title: 'Alphabet Word Connect',
      category: 'vocab',
      description: 'Connect alphabets on the radial wheel to solve target crossword slots, expand vocabulary, and find bonus words.',
      icon: '🎡',
      xp: 25,
    },
    { id: 'word_builder', title: 'Word Builder', category: 'vocab', description: 'Form common, advanced, and executive words from letter tiles.', icon: '🔤', xp: 25 },
    { id: 'sentence_scramble', title: 'Sentence Scramble', category: 'grammar', description: 'Rearrange mixed-up words into polished professional sentences.', icon: '🧩', xp: 20 },
    { id: 'better_response', title: 'Choose the Better Response', category: 'workplace', description: 'Evaluate realistic workplace answers and choose the most diplomatic one.', icon: '🎯', xp: 20 },
    { id: 'thirty_seconds', title: '30-Second Speaking Challenge', category: 'spontaneous', description: 'Think fast! Explain a topic clearly before the 30-second clock expires.', icon: '⏱️', xp: 30 },
    { id: 'forbidden_word', title: 'Forbidden Word Challenge', category: 'vocab', description: 'Explain your job or a technical issue without using common forbidden words.', icon: '🚫', xp: 25 },
    { id: 'what_would_you_say', title: 'What Would You Say?', category: 'workplace', description: 'Respond to awkward workplace moments; get instant soft-skills scoring.', icon: '🗣️', xp: 25 },
    { id: 'spot_mistake', title: 'Spot the Mistake', category: 'grammar', description: 'Identify and fix subtle English and workplace syntax errors.', icon: '🔍', xp: 20 },
    { id: 'vocabulary_match', title: 'Vocabulary Match', category: 'vocab', description: 'Match high-impact corporate words to their definitions against the clock.', icon: '📚', xp: 20 },
    { id: 'conversation_choices', title: 'Branching Dialogue Tree', category: 'workplace', description: 'Navigate difficult meetings where each statement changes the manager\'s reaction.', icon: '🌳', xp: 35 },
    { id: 'story_builder', title: 'Story Builder', category: 'spontaneous', description: 'Collaborate round-by-round with the AI to craft a cohesive workplace story.', icon: '📖', xp: 25 },
    { id: 'emoji_story', title: 'Emoji Story Challenge', category: 'spontaneous', description: 'Transform a string of emojis into a coherent professional story.', icon: '💻', xp: 20 },
    { id: 'guess_word', title: 'Guess the Word', category: 'vocab', description: 'Uncover mystery business terms from sequential contextual clues.', icon: '💡', xp: 20 },
  ] as const;

  // Initialize Sentence Scramble
  const startScrambleLevel = (idx: number) => {
    setScrambleIdx(idx);
    const item = SENTENCE_SCRAMBLE_DATA[idx % SENTENCE_SCRAMBLE_DATA.length];
    setScrambleCurrent(item);
    setScramblePool([...item.scrambled].sort(() => Math.random() - 0.5));
    setScramblePicked([]);
    setScrambleFeedback(null);
  };

  const handlePickScrambleWord = (word: string, index: number) => {
    setScramblePicked((prev) => [...prev, word]);
    setScramblePool((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUnpickScrambleWord = (word: string, index: number) => {
    setScramblePool((prev) => [...prev, word]);
    setScramblePicked((prev) => prev.filter((_, i) => i !== index));
  };

  const checkScrambleAnswer = () => {
    const isCorrect = scramblePicked.join(' ').toLowerCase() === scrambleCurrent.correctOrder.join(' ').toLowerCase();
    if (isCorrect) {
      setScrambleFeedback('Correct! Outstanding sentence rhythm.');
      completeGame('sentence_scramble', 10, 10, 20, ['Flawless syntax flow', 'Accurate modal positioning'], ['Try hard difficulty mode'], ['Adverbial positioning']);
    } else {
      setScrambleFeedback(`Keep trying! Hint: Notice the natural Subject + Modal + Verb order.`);
    }
  };

  // Word Builder submit
  const handleWbSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const word = wbInput.trim().toUpperCase();
    setWbInput('');
    if (!word || wbFoundWords.some((w) => w.word === word)) return;

    const currentLvl = WORD_BUILDER_DATA[wbLevelIdx];
    let points = 0;
    let tier = '';

    if (currentLvl.validWords.professional.includes(word)) {
      points = 15;
      tier = 'Professional (+15 XP)';
    } else if (currentLvl.validWords.advanced.includes(word)) {
      points = 10;
      tier = 'Advanced (+10 XP)';
    } else if (currentLvl.validWords.common.includes(word)) {
      points = 5;
      tier = 'Common (+5 XP)';
    } else if (word.length >= 3 && word.split('').every((ch) => currentLvl.letters.includes(ch))) {
      points = 5;
      tier = 'Bonus (+5 XP)';
    }

    if (points > 0) {
      setWbFoundWords((prev) => [...prev, { word, tier, xp: points }]);
      setWbScore((s) => s + points);
    }
  };

  // 30-Second Challenge completion
  const finishThirtySecondsChallenge = () => {
    const wordCount = thirtyInput.split(/\s+/).filter(Boolean).length;
    let score = Math.min(10, Math.max(5, Math.round(wordCount / 5)));
    completeGame(
      'thirty_seconds',
      score,
      10,
      30,
      ['Spoke continuously under countdown pressure', `Generated ${wordCount} words within 30 seconds`],
      ['Structure response into Hook → Core → Conclusion'],
      ['Spontaneous pacing', 'Elevated pauses']
    );
  };

  // Generic game completion handler
  const completeGame = (
    gameType: GameType,
    score: number,
    maxScore: number,
    xpEarned: number,
    strengths: string[],
    improvements: string[],
    newVocabulary: string[]
  ) => {
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {
      // ignore
    }

    const rec: GameRecord = {
      id: `game_${Date.now()}`,
      gameType,
      title: gameType.replace('_', ' ').toUpperCase(),
      score,
      maxScore,
      xpEarned,
      difficulty: 'Intermediate',
      date: new Date().toISOString(),
    };

    onRecordGame(rec);
    setGameResult({
      score,
      maxScore,
      xpEarned,
      strengths,
      improvements,
      newVocabulary,
    });
  };

  // --- TYPING PRACTICE HELPERS ---
  const currentTpPassage = TYPING_PRACTICE_PASSAGES[tpPassageIdx];

  const finishTypingPractice = (elapsedSec: number = tpElapsedSeconds, inputVal: string = tpInput) => {
    setTpFinished(true);
    const target = currentTpPassage.text;
    const typed = inputVal;
    let correctChars = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === target[i]) correctChars++;
    }
    const elapsedMinutes = Math.max(elapsedSec / 60, 0.016);
    const wpm = Math.round((correctChars / 5) / elapsedMinutes);
    const accuracy = typed.length === 0 ? 100 : Math.max(0, Math.round((correctChars / typed.length) * 100));
    const cpm = Math.round(correctChars / elapsedMinutes);
    const mistakes = Math.max(0, typed.length - correctChars);

    const score = Math.min(10, Math.max(5, Math.round(wpm / 6) + (accuracy >= 92 ? 2 : 0)));

    completeGame(
      'typing_practice',
      score,
      10,
      35,
      [
        `Measured Speed: ${wpm} WPM (${cpm} CPM) with ${accuracy}% precision`,
        `Passage mastered: "${currentTpPassage.title}" (${currentTpPassage.category})`,
        `Low mistake count: only ${mistakes} errors across ${typed.length} characters`,
      ],
      [
        accuracy < 95
          ? 'Reduce typing speed slightly during punctuation transitions to maintain 98%+ precision'
          : 'Outstanding flow! Challenge yourself to sustain 60+ WPM on complex technical terms',
        'Tip: ' + currentTpPassage.communicationTip,
      ],
      [currentTpPassage.category, 'Incident Escalation', 'STAR Articulation']
    );
  };

  const handleTpChange = (val: string) => {
    if (tpFinished) return;
    if (!tpStarted && val.length > 0) {
      setTpStarted(true);
      setTpElapsedSeconds(0);
    }
    setTpInput(val);

    if (val.length >= currentTpPassage.text.length) {
      finishTypingPractice(Math.max(1, tpElapsedSeconds), val);
    }
  };

  const resetTypingPractice = () => {
    setTpInput('');
    setTpStarted(false);
    setTpElapsedSeconds(0);
    setTpFinished(false);
  };

  // --- WORD CONNECT HELPERS ---
  const currentWcLevel = WORD_CONNECT_LEVELS[wcLevelIdx];

  const handleWcSelectLetter = (letter: string, index: number) => {
    if (wcSelectedIndices.includes(index)) return;
    setWcSelectedIndices((prev) => [...prev, index]);
    setWcCurrentInput((prev) => prev + letter);
  };

  const handleWcBackspace = () => {
    if (wcSelectedIndices.length === 0) return;
    setWcSelectedIndices((prev) => prev.slice(0, -1));
    setWcCurrentInput((prev) => prev.slice(0, -1));
  };

  const handleWcClear = () => {
    setWcSelectedIndices([]);
    setWcCurrentInput('');
  };

  const handleWcShuffle = () => {
    setWcLetterPool((prev) => [...prev].sort(() => Math.random() - 0.5));
    handleWcClear();
  };

  const handleWcHint = () => {
    if (wcHintsLeft <= 0) {
      setWcNotice({ text: 'No hints left for this level!', type: 'info' });
      return;
    }
    const unsolved = currentWcLevel.targetWords.find((w) => !wcFoundWords.includes(w));
    if (!unsolved) {
      setWcNotice({ text: 'All words already solved!', type: 'info' });
      return;
    }

    const currentRevealed = wcHintsUsed[unsolved] || [];
    const unrevealedIdx = unsolved.split('').findIndex((_, i) => !currentRevealed.includes(i));
    if (unrevealedIdx !== -1) {
      setWcHintsUsed((prev) => ({
        ...prev,
        [unsolved]: [...(prev[unsolved] || []), unrevealedIdx],
      }));
      setWcHintsLeft((h) => h - 1);
      setWcNotice({ text: `💡 Hint revealed letter '${unsolved[unrevealedIdx]}'!`, type: 'info' });
    }
  };

  const handleWcSubmitWord = () => {
    const candidate = wcCurrentInput.trim().toUpperCase();
    if (!candidate) return;

    if (wcFoundWords.includes(candidate)) {
      setWcNotice({ text: `"${candidate}" is already solved!`, type: 'info' });
      handleWcClear();
      return;
    }

    if (currentWcLevel.targetWords.includes(candidate)) {
      const updated = [...wcFoundWords, candidate];
      setWcFoundWords(updated);
      setWcNotice({ text: `🎉 Solved "${candidate}"!`, type: 'success' });
      handleWcClear();

      if (updated.length >= currentWcLevel.targetWords.length) {
        completeGame(
          'word_connect',
          10,
          10,
          35,
          [
            `Solved all ${currentWcLevel.targetWords.length} words in Level ${currentWcLevel.levelNumber}: ${currentWcLevel.theme}`,
            `Bonus words uncovered: ${wcBonusFound.length}`,
            `High vocabulary recall and alphabet combination mastery`,
          ],
          ['Proceed to next level to conquer longer workplace vocabulary'],
          currentWcLevel.targetWords.slice(0, 3)
        );
      }
      return;
    }

    if (currentWcLevel.bonusWords.includes(candidate)) {
      if (!wcBonusFound.includes(candidate)) {
        setWcBonusFound((prev) => [...prev, candidate]);
        setWcNotice({ text: `⭐ Bonus Word: "${candidate}" (+5 Bonus XP)!`, type: 'bonus' });
      } else {
        setWcNotice({ text: `Bonus word "${candidate}" already collected!`, type: 'info' });
      }
      handleWcClear();
      return;
    }

    setWcNotice({ text: `"${candidate}" is not in the word grid.`, type: 'error' });
    handleWcClear();
  };

  const handleWcChangeLevel = (idx: number) => {
    setWcLevelIdx(idx);
    setWcFoundWords([]);
    setWcBonusFound([]);
    setWcCurrentInput('');
    setWcSelectedIndices([]);
    setWcLetterPool(WORD_CONNECT_LEVELS[idx]?.letters || WORD_CONNECT_LEVELS[0].letters);
    setWcNotice(null);
    setWcHintsUsed({});
    setWcHintsLeft(3);
  };

  const handleSelectGame = (type: GameType) => {
    setSelectedGame(type);
    setGameResult(null);

    if (type === 'sentence_scramble') {
      startScrambleLevel(0);
    } else if (type === 'thirty_seconds') {
      setThirtyTimer(30);
      setThirtyActive(false);
      setThirtyInput('');
    } else if (type === 'word_builder') {
      setWbFoundWords([]);
      setWbScore(0);
      setWbLevelIdx(0);
    } else if (type === 'conversation_choices') {
      setCurrentNode(CONVERSATION_BRANCH_DATA);
      setBranchLog([]);
      setBranchEnding(null);
    } else if (type === 'typing_practice') {
      setTpInput('');
      setTpStarted(false);
      setTpElapsedSeconds(0);
      setTpFinished(false);
      setTpMode('free');
    } else if (type === 'word_connect') {
      setWcCurrentInput('');
      setWcSelectedIndices([]);
      setWcFoundWords([]);
      setWcBonusFound([]);
      setWcLetterPool(WORD_CONNECT_LEVELS[wcLevelIdx]?.letters || WORD_CONNECT_LEVELS[0].letters);
      setWcNotice(null);
      setWcHintsUsed({});
      setWcHintsLeft(3);
    }
  };

  const filteredGames = allGamesList.filter((g) => {
    if (gameFilter === 'all') return true;
    return g.category === gameFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {!selectedGame ? (
        /* GAMES CATALOGUE */
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 text-xs font-bold mb-2">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Soft-Skills & Vocabulary Playground</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Communication Games & Challenges
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Gamified exercises engineered to build spontaneous thinking, executive vocabulary, keyboard speed, and syntax mastery.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All 14 Games' },
                { id: 'typing', label: '⌨️ Typing Practice & WPM' },
                { id: 'vocab', label: '🎡 Alphabet & Vocab' },
                { id: 'spontaneous', label: '⏱️ Spontaneous & Timers' },
                { id: 'workplace', label: '👔 Workplace Diplomacy' },
                { id: 'grammar', label: '🧩 Grammar & Syntax' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setGameFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    gameFilter === f.id
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                onClick={() => handleSelectGame(game.id as GameType)}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-400 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{game.icon}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                      +{game.xp} XP
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors mb-2">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {game.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                  <span className="uppercase tracking-wider text-[10px] text-slate-400">{game.category}</span>
                  <span className="group-hover:translate-x-1 transition-transform">Play Now →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : gameResult ? (
        /* GAME RESULTS MODAL SCREEN (Section 45) */
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-teal-500/20 text-3xl">
              🎮
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Game Complete!
            </h2>
            <div className="flex items-center justify-center space-x-4 text-base font-bold">
              <span className="text-indigo-600">Score: {gameResult.score} / {gameResult.maxScore}</span>
              <span className="text-teal-600">XP Earned: +{gameResult.xpEarned} XP</span>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1.5">
              <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block mb-1">
                Strengths:
              </span>
              {gameResult.strengths.map((s, i) => (
                <div key={i} className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs space-y-1.5">
              <span className="font-extrabold text-amber-800 dark:text-amber-300 block mb-1">
                Areas to Improve:
              </span>
              {gameResult.improvements.map((im, i) => (
                <div key={i} className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{im}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleSelectGame(selectedGame)}
              className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Again</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedGame(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
              >
                Choose Another Game
              </button>
              <button
                onClick={onNavigateToDashboard}
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
              >
                <span>Back to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* INDIVIDUAL ACTIVE GAME SCREENS */
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Top Bar for Game */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setSelectedGame(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center space-x-1"
            >
              <span>← Back to Games</span>
            </button>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
              {allGamesList.find((g) => g.id === selectedGame)?.title}
            </span>
            <span className="text-xs font-bold text-teal-600">Active Challenge</span>
          </div>

          {/* 1. WORD BUILDER GAME (Section 21) */}
          {selectedGame === 'word_builder' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Build Words from Base Letters
                </span>
                <h3 className="text-2xl font-black tracking-widest text-indigo-600 dark:text-indigo-400">
                  {WORD_BUILDER_DATA[wbLevelIdx].letters.join('  ')}
                </h3>
                <p className="text-xs text-slate-500">
                  Common word = 5 XP • Advanced word = 10 XP • Professional word = 15 XP
                </p>
              </div>

              {/* Input Form */}
              <form onSubmit={handleWbSubmit} className="flex gap-2 max-w-md mx-auto">
                <input
                  type="text"
                  value={wbInput}
                  onChange={(e) => setWbInput(e.target.value.toUpperCase())}
                  placeholder="Type an English word..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-center font-bold tracking-wider text-base focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                />
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow"
                >
                  Submit
                </button>
              </form>

              {/* Found Words Table */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3 text-xs font-bold">
                  <span>Found Words ({wbFoundWords.length})</span>
                  <span className="text-teal-600">Score: {wbScore} XP</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {wbFoundWords.map((item, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center space-x-1"
                    >
                      <span>{item.word}</span>
                      <span className="text-[10px] text-teal-600 font-semibold">{item.tier}</span>
                    </span>
                  ))}
                  {wbFoundWords.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No words discovered yet. Try starting with 3 or 4 letter words!</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    completeGame(
                      'word_builder',
                      Math.min(10, Math.max(5, Math.round(wbScore / 10))),
                      10,
                      wbScore + 10,
                      ['Formed active vocabulary vocabulary', 'Good recognition speed'],
                      ['Look for compound professional prefixes'],
                      ['Confide', 'Definite']
                    )
                  }
                  className="py-2 px-5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow"
                >
                  Finish Round & Claim XP
                </button>
              </div>
            </div>
          )}

          {/* 2. SENTENCE SCRAMBLE (Section 22) */}
          {selectedGame === 'sentence_scramble' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-teal-600 uppercase">
                  Level {scrambleIdx + 1} • {scrambleCurrent.difficulty}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Rearrange Words into the Correct Order
                </h3>
                <p className="text-xs text-slate-500">
                  Tap words from the pool to assemble the natural sentence.
                </p>
              </div>

              {/* Assembled Sentence Line */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 min-h-[64px] flex flex-wrap items-center gap-2">
                {scramblePicked.map((word, i) => (
                  <button
                    key={i}
                    onClick={() => handleUnpickScrambleWord(word, i)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow hover:bg-indigo-700 transition"
                  >
                    {word}
                  </button>
                ))}
                {scramblePicked.length === 0 && (
                  <span className="text-xs text-slate-400 italic">Tap words below to place them here...</span>
                )}
              </div>

              {/* Word Pool */}
              <div className="flex flex-wrap gap-2.5 justify-center p-3">
                {scramblePool.map((word, i) => (
                  <button
                    key={i}
                    onClick={() => handlePickScrambleWord(word, i)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm transition shadow-sm"
                  >
                    {word}
                  </button>
                ))}
              </div>

              {scrambleFeedback && (
                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-xs text-teal-800 dark:text-teal-300 font-medium">
                  {scrambleFeedback}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => startScrambleLevel(scrambleIdx)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Reset Word Order
                </button>
                <button
                  onClick={checkScrambleAnswer}
                  className="py-2.5 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow"
                >
                  Verify Sentence
                </button>
              </div>
            </div>
          )}

          {/* 3. CHOOSE THE BETTER RESPONSE (Section 23) */}
          {selectedGame === 'better_response' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase">Workplace Nuance</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {CHOOSE_BETTER_RESPONSE_DATA[cbrIdx].scenario}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Context: {CHOOSE_BETTER_RESPONSE_DATA[cbrIdx].context}
                </p>
              </div>

              <div className="space-y-3">
                {CHOOSE_BETTER_RESPONSE_DATA[cbrIdx].options.map((opt) => {
                  const isSelected = cbrSelectedOption === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setCbrSelectedOption(opt.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? opt.isBest
                            ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700'
                            : 'bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:border-rose-700'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {opt.text}
                        </span>
                        {isSelected && (
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              opt.isBest ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                            }`}
                          >
                            {opt.isBest ? 'Recommended' : 'Suboptimal'}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <p className="text-xs mt-2 text-slate-600 dark:text-slate-400 italic">
                          💡 {opt.feedback}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {cbrSelectedOption && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      const item = CHOOSE_BETTER_RESPONSE_DATA[cbrIdx];
                      const chosen = item.options.find((o) => o.id === cbrSelectedOption);
                      completeGame(
                        'better_response',
                        chosen?.isBest ? 10 : 6,
                        10,
                        chosen?.isBest ? 25 : 10,
                        [chosen?.isBest ? 'High executive tact' : 'Understood basic prompt'],
                        ['Frame setbacks with constructive ETA'],
                        ['Mitigate', 'Proactive']
                      );
                    }}
                    className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow"
                  >
                    Finish Challenge & Claim XP
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. 30-SECOND CHALLENGE (Section 25) */}
          {selectedGame === 'thirty_seconds' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase text-amber-500">Spontaneous Speaking Sprint</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Topic: "Explain Your Current Work Without Hesitation"
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Hit start, and continuously type or speak your thoughts. Do not stop until the clock hits 0!
                </p>
              </div>

              {/* Countdown Clock Display */}
              <div className="w-24 h-24 rounded-full border-4 border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mx-auto text-3xl font-black text-amber-600">
                {thirtyTimer}s
              </div>

              {!thirtyActive && thirtyTimer === 30 ? (
                <button
                  onClick={() => setThirtyActive(true)}
                  className="py-3 px-8 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-amber-500/30 transition active:scale-95"
                >
                  Start 30-Second Sprint
                </button>
              ) : (
                <div className="space-y-3 max-w-md mx-auto">
                  <textarea
                    value={thirtyInput}
                    onChange={(e) => setThirtyInput(e.target.value)}
                    placeholder="Speak or type continuously here..."
                    rows={4}
                    className="w-full p-4 rounded-2xl border border-amber-300 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                    autoFocus
                  />
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Words: {thirtyInput.split(/\s+/).filter(Boolean).length}</span>
                    <button
                      onClick={finishThirtySecondsChallenge}
                      className="text-amber-600 font-bold hover:underline"
                    >
                      Finish Early
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. FORBIDDEN WORD (Section 26) */}
          {selectedGame === 'forbidden_word' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div>
                <span className="text-xs font-bold text-rose-500 uppercase">Vocabulary Agility</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  Topic: {FORBIDDEN_WORD_DATA[fwIdx].topic}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Explain this topic clearly WITHOUT using any of these forbidden words:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {FORBIDDEN_WORD_DATA[fwIdx].forbiddenWords.map((w, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs"
                    >
                      🚫 {w}
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                value={fwInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setFwInput(val);
                  const violated = FORBIDDEN_WORD_DATA[fwIdx].forbiddenWords.filter((w) =>
                    new RegExp(`\\b${w}\\b`, 'i').test(val)
                  );
                  setFwDetectedViolations(violated);
                }}
                placeholder="Write your explanation using creative alternative vocabulary..."
                rows={4}
                className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
              />

              {fwDetectedViolations.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700 dark:text-rose-300 font-semibold">
                  ⚠️ Forbidden words detected: {fwDetectedViolations.join(', ')}. Try substituting with descriptive action verbs!
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-400">
                  Tip: {FORBIDDEN_WORD_DATA[fwIdx].benefitTip}
                </span>
                <button
                  disabled={!fwInput.trim() || fwDetectedViolations.length > 0}
                  onClick={() =>
                    completeGame(
                      'forbidden_word',
                      9,
                      10,
                      25,
                      ['Successfully avoided all forbidden words', 'Employed vivid descriptive terminology'],
                      ['Keep practicing on technical topics'],
                      ['Orchestrate', 'Facilitate']
                    )
                  }
                  className="py-2.5 px-5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow"
                >
                  Submit & Score
                </button>
              </div>
            </div>
          )}

          {/* 6. SPOT THE MISTAKE (Section 30) */}
          {selectedGame === 'spot_mistake' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase">
                  Grammar Detective • Item {stmIdx + 1}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  Spot & Fix the Sentence Error
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-sm font-semibold text-rose-900 dark:text-rose-200">
                "{SPOT_THE_MISTAKE_DATA[stmIdx].incorrectSentence}"
              </div>

              <input
                type="text"
                value={stmUserFix}
                onChange={(e) => setStmUserFix(e.target.value)}
                placeholder="Type the corrected sentence here..."
                className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              {stmFeedback && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {stmFeedback}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => {
                    const item = SPOT_THE_MISTAKE_DATA[stmIdx];
                    setStmFeedback(`Correct Answer: "${item.correctedSentence}"\n\nExplanation: ${item.explanation}`);
                  }}
                  className="text-xs text-slate-400 hover:text-indigo-600 font-semibold"
                >
                  Reveal Solution & Explanation
                </button>
                <button
                  onClick={() => {
                    completeGame(
                      'spot_mistake',
                      9,
                      10,
                      20,
                      ['Detected tense discrepancy', 'Quick grammatical intuition'],
                      ['Watch for preposition redundancy in emails'],
                      ['Past Tense Consistency']
                    );
                  }}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow"
                >
                  Claim XP
                </button>
              </div>
            </div>
          )}

          {/* 7. BRANCHING DIALOGUE CHOICES (Section 37) */}
          {selectedGame === 'conversation_choices' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase">Interactive Branching Simulator</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  Stakeholder Meeting: {currentNode.character}
                </h3>
              </div>

              {/* Dialogue Bubble */}
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-sm text-teal-950 dark:text-teal-200 font-medium">
                "{currentNode.statement}"
              </div>

              {/* Branch Log */}
              {branchLog.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  {branchLog.map((log, i) => (
                    <div key={i} className="text-xs text-slate-500 italic p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <strong>You said:</strong> "{log.chosen}" → <em>{log.feedback}</em>
                    </div>
                  ))}
                </div>
              )}

              {/* Choices */}
              {!branchEnding ? (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-500 uppercase block">Choose your response:</span>
                  {currentNode.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const newLog = [...branchLog, { statement: currentNode.statement, chosen: opt.text, feedback: opt.feedback }];
                        setBranchLog(newLog);

                        if (opt.isEnding || !opt.nextNodeId) {
                          setBranchEnding(opt.outcomeSummary || 'Scenario concluded successfully.');
                        } else {
                          const nextNode = BRANCHING_TREE[opt.nextNodeId];
                          if (nextNode) {
                            setCurrentNode(nextNode);
                          } else {
                            setBranchEnding('Scenario completed.');
                          }
                        }
                      }}
                      className="w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-teal-500 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-center space-y-3">
                  <h4 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">
                    Simulation Conclusion:
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{branchEnding}</p>
                  <button
                    onClick={() =>
                      completeGame(
                        'conversation_choices',
                        9,
                        10,
                        35,
                        ['Demonstrated strategic stakeholder management', 'Diplomatic composure'],
                        ['Anticipate pushback on timelines in advance'],
                        ['Canary Release', 'Schema Pre-validation']
                      )
                    }
                    className="py-2.5 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow"
                  >
                    View Final Report & Claim XP
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 13. EXECUTIVE TYPING PRACTICE GAME */}
          {selectedGame === 'typing_practice' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Header & Passage Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-1">
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>Real-Time Keyboard Diagnostics</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {currentTpPassage.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-teal-600 dark:text-teal-400">
                      {currentTpPassage.category}
                    </span>
                    <span>•</span>
                    <span>Target: {currentTpPassage.recommendedWpm} WPM</span>
                    <span>•</span>
                    <span>{currentTpPassage.difficulty} Difficulty</span>
                  </div>
                </div>

                {/* Mode Selector (Free / 60s / 30s) */}
                <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shrink-0">
                  {(['free', '60s', '30s'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setTpMode(m);
                        resetTypingPractice();
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        tpMode === m
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {m === 'free' ? 'Full Text' : m === '60s' ? '60s Blitz' : '30s Sprint'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Passage Picker Chips */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-bold text-slate-400 shrink-0">Passage:</span>
                {TYPING_PRACTICE_PASSAGES.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setTpPassageIdx(idx);
                      resetTypingPractice();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                      tpPassageIdx === idx
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}. {p.title}
                  </button>
                ))}
              </div>

              {/* Real-Time Live HUD Stats Grid */}
              {(() => {
                const target = currentTpPassage.text;
                const typed = tpInput;
                let correctChars = 0;
                for (let i = 0; i < typed.length; i++) {
                  if (typed[i] === target[i]) correctChars++;
                }
                const elapsedMin = Math.max(tpElapsedSeconds / 60, 0.016);
                const liveWpm = tpStarted ? Math.round((correctChars / 5) / elapsedMin) : 0;
                const liveAccuracy = typed.length === 0 ? 100 : Math.round((correctChars / typed.length) * 100);
                const liveCpm = tpStarted ? Math.round(correctChars / elapsedMin) : 0;
                const mistakes = Math.max(0, typed.length - correctChars);
                const progressPct = Math.min(100, Math.round((typed.length / target.length) * 100));

                let wpmTier = 'Getting Ready';
                let tierColor = 'text-slate-400';
                if (tpStarted) {
                  if (liveWpm < 35) {
                    wpmTier = 'Developing';
                    tierColor = 'text-amber-500';
                  } else if (liveWpm < 50) {
                    wpmTier = 'Professional';
                    tierColor = 'text-teal-500';
                  } else if (liveWpm < 65) {
                    wpmTier = 'Fluent';
                    tierColor = 'text-indigo-500';
                  } else {
                    wpmTier = 'Executive Master';
                    tierColor = 'text-emerald-500';
                  }
                }

                const remainingSec =
                  tpMode === '30s' ? Math.max(0, 30 - tpElapsedSeconds) :
                  tpMode === '60s' ? Math.max(0, 60 - tpElapsedSeconds) : tpElapsedSeconds;

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* WPM */}
                      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block mb-1">
                          Typing WPM
                        </span>
                        <div className="text-3xl font-black text-indigo-900 dark:text-indigo-100 flex items-baseline">
                          <span>{liveWpm}</span>
                          <span className="text-xs font-semibold text-indigo-500 ml-1">WPM</span>
                        </div>
                        <span className={`text-[11px] font-bold mt-1 block ${tierColor}`}>
                          {wpmTier}
                        </span>
                      </div>

                      {/* Accuracy */}
                      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 block mb-1">
                          Accuracy
                        </span>
                        <div className="text-3xl font-black text-teal-900 dark:text-teal-100 flex items-baseline">
                          <span>{liveAccuracy}%</span>
                        </div>
                        <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 mt-1 block">
                          {mistakes === 0 ? 'Flawless precision' : `${mistakes} typos`}
                        </span>
                      </div>

                      {/* Speed CPM */}
                      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block mb-1">
                          Speed (CPM)
                        </span>
                        <div className="text-3xl font-black text-amber-900 dark:text-amber-100 flex items-baseline">
                          <span>{liveCpm}</span>
                          <span className="text-xs font-semibold text-amber-500 ml-1">CPM</span>
                        </div>
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1 block">
                          {correctChars} / {target.length} chars
                        </span>
                      </div>

                      {/* Timer & Clock */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                          {tpMode === 'free' ? 'Time Elapsed' : 'Time Remaining'}
                        </span>
                        <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline">
                          <span>
                            {Math.floor(remainingSec / 60)}:
                            {(remainingSec % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
                          {progressPct}% completed
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-indigo-600 h-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Text Display Passage with character-by-character live coloration */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 font-mono text-sm sm:text-base leading-relaxed tracking-wide select-none min-h-[140px] max-h-[220px] overflow-y-auto">
                {currentTpPassage.text.split('').map((char, index) => {
                  let charClass = 'text-slate-400 dark:text-slate-500';
                  if (index < tpInput.length) {
                    if (tpInput[index] === char) {
                      charClass = 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 rounded-[2px] font-bold';
                    } else {
                      charClass = 'text-rose-600 bg-rose-200 dark:bg-rose-950/80 rounded-[2px] font-bold underline decoration-rose-500';
                    }
                  } else if (index === tpInput.length) {
                    charClass = 'bg-indigo-600 text-white font-bold px-0.5 rounded animate-pulse';
                  }
                  return (
                    <span key={index} className={charClass}>
                      {char}
                    </span>
                  );
                })}
              </div>

              {/* Active Typing Input Area */}
              <div className="space-y-2">
                <textarea
                  autoFocus
                  rows={3}
                  value={tpInput}
                  onChange={(e) => handleTpChange(e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                  disabled={tpFinished}
                  placeholder={
                    tpFinished
                      ? 'Passage finished! Review your scorecard below.'
                      : 'Type the passage text here to automatically engage timer...'
                  }
                  className="w-full p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm sm:text-base font-mono outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 transition resize-none disabled:opacity-60"
                />
                <span className="text-[11px] text-slate-400 block italic">
                  💡 Tip: Pasting is disabled so your fingers internalize authentic typing rhythm & muscle memory.
                </span>
              </div>

              {/* Controls and Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={resetTypingPractice}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset / Restart</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => finishTypingPractice(Math.max(1, tpElapsedSeconds), tpInput)}
                    disabled={tpInput.length < 15}
                    className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Finish & Claim XP</span>
                  </button>
                </div>
              </div>

              {/* Soft Skills Communication Tip */}
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-start space-x-3 text-xs text-teal-900 dark:text-teal-200">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block mb-0.5">Communication Coaching Insight:</span>
                  <span>{currentTpPassage.communicationTip}</span>
                </div>
              </div>
            </div>
          )}

          {/* 14. ALPHABET WORD CONNECT GAME */}
          {selectedGame === 'word_connect' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Level Header and Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Alphabet Radial Puzzle</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Level {currentWcLevel.levelNumber}: {currentWcLevel.theme}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Connect alphabets on the wheel to solve the target word slots.
                  </p>
                </div>

                {/* Level switcher chips */}
                <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shrink-0">
                  {WORD_CONNECT_LEVELS.map((lvl, idx) => (
                    <button
                      key={lvl.id}
                      onClick={() => handleWcChangeLevel(idx)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        wcLevelIdx === idx
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      L{lvl.levelNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress and Hints Counter */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                <span>
                  Words Found: <strong className="text-teal-600">{wcFoundWords.length}</strong> / {currentWcLevel.targetWords.length}
                </span>
                <span>
                  Bonus Words: <strong className="text-amber-500">{wcBonusFound.length}</strong> (+{wcBonusFound.length * 5} XP)
                </span>
                <span>
                  Hints Remaining: <strong className="text-indigo-600">{wcHintsLeft}</strong>
                </span>
              </div>

              {/* Target Words Crossword Slot Grid */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Crossword Word Slots ({currentWcLevel.targetWords.length} Target Words):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {currentWcLevel.targetWords.map((word) => {
                    const isSolved = wcFoundWords.includes(word);
                    const revealedHints = wcHintsUsed[word] || [];
                    const definition = currentWcLevel.definitions[word];

                    return (
                      <div
                        key={word}
                        className={`p-3 rounded-xl border transition-all ${
                          isSolved
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          {isSolved ? (
                            <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 tracking-wider">
                              {word}
                            </span>
                          ) : (
                            <div className="flex items-center space-x-1">
                              {word.split('').map((ch, idx) => (
                                <span
                                  key={idx}
                                  className={`w-5 h-5 rounded flex items-center justify-center text-xs font-black border ${
                                    revealedHints.includes(idx)
                                      ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                                      : 'bg-slate-100 dark:bg-slate-700 text-transparent border-slate-200 dark:border-slate-600'
                                  }`}
                                >
                                  {revealedHints.includes(idx) ? ch : '_'}
                                </span>
                              ))}
                            </div>
                          )}
                          {isSolved && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </div>
                        {isSolved && definition && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
                            {definition}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Word Building Tray (Current Word Connected) */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border-2 border-teal-300 dark:border-teal-800/80 min-w-[200px] justify-center shadow-sm">
                  {wcCurrentInput ? (
                    <span className="text-2xl font-black text-teal-800 dark:text-teal-200 tracking-widest font-mono">
                      {wcCurrentInput}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold italic">
                      Tap letters below to connect...
                    </span>
                  )}
                </div>

                {/* Notice Banner */}
                {wcNotice && (
                  <div
                    className={`text-xs font-bold py-1.5 px-4 rounded-xl inline-block transition-all ${
                      wcNotice.type === 'success'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : wcNotice.type === 'bonus'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        : wcNotice.type === 'error'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                    }`}
                  >
                    {wcNotice.text}
                  </div>
                )}
              </div>

              {/* Radial Alphabet Wheel Arena */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="relative w-64 h-64 rounded-full bg-slate-100 dark:bg-slate-800/60 border-2 border-dashed border-teal-300 dark:border-teal-900/60 flex items-center justify-center shadow-inner">
                  {/* Center Action Tools */}
                  <div className="flex items-center space-x-2 z-10">
                    <button
                      onClick={handleWcShuffle}
                      title="Shuffle Letter Wheel"
                      className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 active:scale-90 flex items-center justify-center text-slate-600 dark:text-slate-200 shadow-sm transition"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleWcHint}
                      title="Reveal Hint"
                      className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 active:scale-90 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shadow-sm transition"
                    >
                      <Lightbulb className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleWcClear}
                      title="Clear Selection"
                      className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 active:scale-90 flex items-center justify-center text-rose-600 dark:text-rose-300 shadow-sm transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Circular Letter Tiles */}
                  {wcLetterPool.map((letter, index) => {
                    const radius = 86;
                    const angle = (index * 2 * Math.PI) / wcLetterPool.length - Math.PI / 2;
                    const x = Math.round(radius * Math.cos(angle));
                    const y = Math.round(radius * Math.sin(angle));
                    const isSelected = wcSelectedIndices.includes(index);
                    const orderIndex = wcSelectedIndices.indexOf(index);

                    return (
                      <button
                        key={`${letter}-${index}`}
                        onClick={() => handleWcSelectLetter(letter, index)}
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                        }}
                        className={`absolute w-12 h-12 rounded-full font-black text-lg transition-all active:scale-95 flex items-center justify-center shadow-md select-none ${
                          isSelected
                            ? 'bg-teal-600 text-white ring-4 ring-teal-300 dark:ring-teal-700 scale-105'
                            : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-teal-50 hover:border-teal-300 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <span>{letter}</span>
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                            {orderIndex + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Submit & Backspace Action Bar */}
                <div className="flex items-center space-x-3 mt-6">
                  <button
                    onClick={handleWcBackspace}
                    disabled={wcSelectedIndices.length === 0}
                    className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 disabled:opacity-40 transition"
                  >
                    ← Backspace
                  </button>
                  <button
                    onClick={handleWcSubmitWord}
                    disabled={wcCurrentInput.length < 2}
                    className="py-2.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-black text-xs shadow-md transition flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Submit Word</span>
                  </button>
                </div>
              </div>

              {/* Bonus Words Vault Bar */}
              {wcBonusFound.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Bonus Words Vault: <strong>{wcBonusFound.join(', ')}</strong>
                    </span>
                  </div>
                  <span className="font-bold text-amber-700">+{wcBonusFound.length * 5} Bonus XP</span>
                </div>
              )}
            </div>
          )}

          {/* Fallback for other quick mini games */}
          {['what_would_you_say', 'story_builder', 'vocabulary_match', 'emoji_story', 'guess_word'].includes(
            selectedGame
          ) && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {allGamesList.find((g) => g.id === selectedGame)?.title}
              </h3>
              <p className="text-xs text-slate-500">
                {allGamesList.find((g) => g.id === selectedGame)?.description}
              </p>

              <textarea
                rows={4}
                placeholder="Enter your prompt answer..."
                className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
              />

              <div className="flex justify-end">
                <button
                  onClick={() =>
                    completeGame(
                      selectedGame,
                      8,
                      10,
                      20,
                      ['Clear spontaneous ideation', 'Polite workplace register'],
                      ['Practice with higher syntactic complexity'],
                      ['Delegate', 'Articulate']
                    )
                  }
                  className="py-2.5 px-5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow"
                >
                  Submit & Score Game
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
