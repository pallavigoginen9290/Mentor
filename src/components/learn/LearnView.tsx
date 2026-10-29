import React, { useState } from 'react';
import {
  UserProfile,
  AppSettings,
  UserLearningProgress,
  LearningLevel,
  Lesson,
  Exercise,
} from '../../types';
import { LEARNING_LEVELS } from '../../data/learningPathData';
import { storageService } from '../../services/storageService';
import { speechService } from '../../services/speechService';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Lock,
  Sparkles,
  Volume2,
  Trophy,
  Flame,
  Star,
  RefreshCw,
  ArrowRight,
  BookOpen,
  Check,
  X,
  Languages,
  RotateCcw,
} from 'lucide-react';

interface LearnViewProps {
  user: UserProfile;
  settings: AppSettings;
  onRefreshState: () => void;
  onNavigateToVoice?: () => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  user,
  settings,
  onRefreshState,
}) => {
  const [progress, setProgress] = useState<UserLearningProgress>(() =>
    storageService.getLearningProgress()
  );
  const [selectedLevelId, setSelectedLevelId] = useState<number>(() => {
    const saved = storageService.getLearningProgress();
    return saved.currentLevel || 1;
  });

  // Active Lesson Player Modal
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scrambleAnswer, setScrambleAnswer] = useState<string[]>([]);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<{
    title: string;
    explanation: string;
    tip: string;
    correctAnswer: string;
  } | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [reviewMistakesMode, setReviewMistakesMode] = useState(false);

  const currentLevel = LEARNING_LEVELS.find((l) => l.id === selectedLevelId) || LEARNING_LEVELS[0];

  const handleSelectLevel = (levelId: number) => {
    setSelectedLevelId(levelId);
  };

  const handleStartLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setCurrentExerciseIndex(0);
    setSelectedOption(null);
    setScrambleAnswer([]);
    setFeedbackState('idle');
    setFeedbackMessage(null);
    setLessonCompleted(false);
  };

  const handleStartReviewMistakes = () => {
    const mistakes = progress.mistakesQueue;
    if (!mistakes || mistakes.length === 0) return;

    // Create a virtual review lesson
    const reviewLesson: Lesson = {
      id: 'review_mistakes_session',
      unitId: 'review',
      title: 'Mistake Revision Vault',
      description: 'Revisit and conquer previous errors to solidify mastery.',
      xpReward: 30,
      exercises: mistakes.map((m) => m.exercise),
    };
    setReviewMistakesMode(true);
    handleStartLesson(reviewLesson);
  };

  const handlePlayAudio = (text: string) => {
    if (settings.textToSpeech) {
      speechService.speak(text, {
        rate: settings.voiceRate || 1.0,
        voiceGender: settings.voiceGender || 'default',
      });
    }
  };

  const handleSelectWordInScramble = (word: string, index: number, availableWords: string[]) => {
    setScrambleAnswer((prev) => [...prev, word]);
    // remove from available words conceptually
  };

  const handleRemoveWordFromScramble = (index: number) => {
    setScrambleAnswer((prev) => prev.filter((_, i) => i !== index));
  };

  const currentExercise: Exercise | undefined = activeLesson?.exercises[currentExerciseIndex];

  const handleCheckAnswer = () => {
    if (!currentExercise || !activeLesson) return;

    let isCorrect = false;
    let submittedAnswer = '';

    if (currentExercise.type === 'sentence_scramble') {
      submittedAnswer = scrambleAnswer.join(' ').trim();
      const target = (currentExercise.correctAnswer as string).trim();
      isCorrect =
        submittedAnswer.toLowerCase().replace(/[.,!?'"]/g, '') ===
        target.toLowerCase().replace(/[.,!?'"]/g, '');
    } else {
      submittedAnswer = selectedOption || '';
      if (Array.isArray(currentExercise.correctAnswer)) {
        isCorrect = currentExercise.correctAnswer.includes(submittedAnswer);
      } else {
        isCorrect = submittedAnswer === currentExercise.correctAnswer;
      }
    }

    if (isCorrect) {
      setFeedbackState('correct');
      setFeedbackMessage({
        title: 'Outstanding! Exactly right.',
        explanation: currentExercise.explanation,
        tip: currentExercise.keyTip,
        correctAnswer: Array.isArray(currentExercise.correctAnswer)
          ? currentExercise.correctAnswer[0]
          : currentExercise.correctAnswer,
      });

      if (reviewMistakesMode) {
        storageService.resolveMistake(currentExercise.id);
        const updated = storageService.getLearningProgress();
        setProgress(updated);
      }
    } else {
      setFeedbackState('incorrect');
      setFeedbackMessage({
        title: 'Not quite. Here is how native speakers say it:',
        explanation: currentExercise.explanation,
        tip: currentExercise.keyTip,
        correctAnswer: Array.isArray(currentExercise.correctAnswer)
          ? currentExercise.correctAnswer[0]
          : currentExercise.correctAnswer,
      });

      // Record mistake for later review
      storageService.recordMistake(activeLesson.id, currentExercise, submittedAnswer);
      const updated = storageService.getLearningProgress();
      setProgress(updated);
    }
  };

  const handleNextExercise = () => {
    if (!activeLesson) return;

    if (currentExerciseIndex + 1 < activeLesson.exercises.length) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setSelectedOption(null);
      setScrambleAnswer([]);
      setFeedbackState('idle');
      setFeedbackMessage(null);
    } else {
      // Completed lesson
      setLessonCompleted(true);
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {
        // ignore
      }

      if (!reviewMistakesMode) {
        const result = storageService.recordLessonCompleted(
          activeLesson.id,
          selectedLevelId,
          activeLesson.xpReward
        );
        const updated = storageService.getLearningProgress();
        setProgress(updated);
      }
      onRefreshState();
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.completedLessonIds.includes(lessonId);
  };

  const isLessonLocked = (unitIndex: number, lessonIndex: number) => {
    if (selectedLevelId === 1 && unitIndex === 0 && lessonIndex === 0) return false;
    // Allow previous or first of each unlocked unit
    return false; // Friendly open access so user can practice any topic anytime
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-8">
      {/* Top Learning Header Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Structured Progression Path • Levels 1 - 7</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentLevel.title}
            </h1>
            <p className="text-sm text-indigo-200/90 max-w-xl">
              {currentLevel.description}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Streak</p>
                <p className="text-xs font-bold text-white">{user.streakDays || 0} Days</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10">
              <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Stars</p>
                <p className="text-xs font-bold text-white">{progress.totalStars || 0}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10">
              <Trophy className="w-4 h-4 text-indigo-300" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Level</p>
                <p className="text-xs font-bold text-white">Tier {currentLevel.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Level Selector Pills */}
        <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {LEARNING_LEVELS.map((lvl) => {
            const isSelected = lvl.id === selectedLevelId;
            return (
              <button
                key={lvl.id}
                onClick={() => handleSelectLevel(lvl.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-white text-indigo-900 shadow-md scale-105'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span>Level {lvl.id}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-black/20 text-white/70'}`}>
                  {lvl.cefrLevel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mistake Vault Banner (if user has mistakes to review) */}
      {progress.mistakesQueue && progress.mistakesQueue.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Personalized Mistake Revision Queue
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                You have {progress.mistakesQueue.length} {progress.mistakesQueue.length === 1 ? 'expression' : 'expressions'} to master. Revisit them now for +30 XP!
              </p>
            </div>
          </div>
          <button
            onClick={handleStartReviewMistakes}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practice Mistakes ({progress.mistakesQueue.length})</span>
          </button>
        </div>
      )}

      {/* Visual Learning Path (Duolingo Style Stepping Stones) */}
      <div className="space-y-10">
        {currentLevel.units.map((unit, unitIdx) => (
          <div key={unit.id} className="space-y-6">
            {/* Unit Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-2xl flex items-center justify-center shadow-inner shrink-0">
                  {unit.icon}
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400">
                    Unit {unit.unitNumber}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {unit.title}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {unit.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Stepping Stones Path */}
            <div className="flex flex-col items-center py-4 space-y-6 relative">
              {/* Path connector line */}
              <div className="absolute top-6 bottom-6 w-1.5 bg-slate-200 dark:bg-slate-800 rounded-full -z-0" />

              {unit.lessons.map((lesson, lessonIdx) => {
                const completed = isLessonCompleted(lesson.id);
                const locked = isLessonLocked(unitIdx, lessonIdx);

                // Alternating layout offsets for playful winding path
                const offsetClass =
                  lessonIdx % 3 === 0
                    ? 'translate-x-0'
                    : lessonIdx % 3 === 1
                    ? 'translate-x-12 sm:translate-x-20'
                    : '-translate-x-12 sm:-translate-x-20';

                return (
                  <div
                    key={lesson.id}
                    className={`relative z-10 flex flex-col items-center transition-transform ${offsetClass}`}
                  >
                    <button
                      onClick={() => !locked && handleStartLesson(lesson)}
                      disabled={locked}
                      className={`group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-300 transform active:scale-95 ${
                        completed
                          ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-amber-500/30 ring-4 ring-amber-100 dark:ring-amber-900/50 hover:scale-105'
                          : locked
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/30 ring-4 ring-indigo-100 dark:ring-indigo-900/50 animate-pulse hover:animate-none hover:scale-105'
                      }`}
                    >
                      {completed ? (
                        <Check className="w-8 h-8 stroke-[3]" />
                      ) : locked ? (
                        <Lock className="w-6 h-6 text-slate-400" />
                      ) : (
                        <BookOpen className="w-7 h-7" />
                      )}
                    </button>

                    {/* Lesson Label Pill */}
                    <div className="mt-2 text-center max-w-[160px]">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {lesson.title}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        +{lesson.xpReward} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* INTERACTIVE LESSON MODAL PLAYER */}
      {activeLesson && currentExercise && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header & Progress */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setActiveLesson(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Progress bar */}
              <div className="flex-1 mx-4">
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentExerciseIndex + (feedbackState === 'correct' ? 1 : 0)) / activeLesson.exercises.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                {currentExerciseIndex + 1}/{activeLesson.exercises.length}
              </span>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {!lessonCompleted ? (
                <>
                  {/* Type Badge */}
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {currentExercise.type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Telugu Source Box (If applicable) */}
                  {currentExercise.teluguSource && (
                    <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 space-y-2">
                      <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        <Languages className="w-4 h-4" />
                        <span>Telugu Thought to Express:</span>
                      </div>
                      <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                        {currentExercise.teluguSource}
                      </p>
                      {currentExercise.teluguTransliteration && (
                        <p className="text-xs italic text-indigo-600 dark:text-indigo-400">
                          "{currentExercise.teluguTransliteration}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Question Prompt */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {currentExercise.prompt}
                    </h3>
                    {currentExercise.contextHint && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        💡 Hint: {currentExercise.contextHint}
                      </p>
                    )}
                  </div>

                  {/* Exercise Interactive Content */}
                  {/* Multiple Choice & Fill in the Blank Options */}
                  {(currentExercise.type === 'multiple_choice' ||
                    currentExercise.type === 'fill_in_the_blank' ||
                    currentExercise.type === 'grammar_fix' ||
                    currentExercise.type === 'telugu_to_english') &&
                    currentExercise.options && (
                      <div className="space-y-3 pt-2">
                        {currentExercise.options.map((option, idx) => {
                          const isSelected = selectedOption === option;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                if (feedbackState === 'idle') setSelectedOption(option);
                              }}
                              disabled={feedbackState !== 'idle'}
                              className={`w-full p-4 rounded-2xl text-left text-sm font-semibold border-2 transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 dark:bg-indigo-950/50 dark:border-indigo-500 dark:text-white shadow-sm'
                                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span>{option}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayAudio(option);
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </button>
                          );
                        })}
                      </div>
                    )}

                  {/* Sentence Scramble Exercise */}
                  {currentExercise.type === 'sentence_scramble' && (
                    <div className="space-y-6 pt-2">
                      {/* Assembled Tray */}
                      <div className="min-h-[70px] p-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 bg-slate-50 dark:bg-slate-800/40 flex flex-wrap gap-2 items-center">
                        {scrambleAnswer.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">
                            Tap words below in the correct order to construct the sentence...
                          </span>
                        ) : (
                          scrambleAnswer.map((word, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (feedbackState === 'idle') handleRemoveWordFromScramble(idx);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm hover:bg-indigo-700 transition-all"
                            >
                              {word}
                            </button>
                          ))
                        )}
                      </div>

                      {/* Word Bank */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {currentExercise.scrambleWords?.map((word, idx) => {
                          const countInAnswer = scrambleAnswer.filter((w) => w === word).length;
                          const countInAvailable = currentExercise.scrambleWords?.filter((w) => w === word).length || 1;
                          const isUsed = countInAnswer >= countInAvailable;

                          return (
                            <button
                              key={idx}
                              disabled={isUsed || feedbackState !== 'idle'}
                              onClick={() => handleSelectWordInScramble(word, idx, currentExercise.scrambleWords || [])}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                                isUsed
                                  ? 'bg-slate-100 dark:bg-slate-800 text-transparent border-transparent cursor-not-allowed'
                                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-500 active:scale-95'
                              }`}
                            >
                              {word}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Celebration Completion Screen */
                <div className="text-center py-8 space-y-5">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Trophy className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      Lesson Conquered!
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Fantastic perseverance, Pallavi! Your natural flow is sharpening with every turn.
                    </p>
                  </div>
                  <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-sm font-extrabold">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>+{activeLesson.xpReward} XP Earned</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Modal Actions & Feedback Banner */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              {feedbackState !== 'idle' && feedbackMessage && (
                <div
                  className={`p-4 rounded-2xl mb-4 space-y-2 ${
                    feedbackState === 'correct'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                      : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    {feedbackState === 'correct' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <X className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    )}
                    <span>{feedbackMessage.title}</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {feedbackMessage.explanation}
                  </p>
                  <div className="text-[11px] font-semibold pt-1 border-t border-current/10 flex items-center space-x-1.5">
                    <span>💡 Pro Tip:</span>
                    <span>{feedbackMessage.tip}</span>
                  </div>
                </div>
              )}

              {lessonCompleted ? (
                <button
                  onClick={() => setActiveLesson(null)}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>Continue Learning Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : feedbackState === 'idle' ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={
                    currentExercise.type === 'sentence_scramble'
                      ? scrambleAnswer.length === 0
                      : !selectedOption
                  }
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>Check Answer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleNextExercise}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
