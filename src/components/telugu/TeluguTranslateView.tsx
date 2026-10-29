import React, { useState } from 'react';
import { UserProfile, AppSettings } from '../../types';
import { teluguService, TeluguTranslationResult } from '../../services/teluguService';
import { speechService } from '../../services/speechService';
import { storageService } from '../../services/storageService';
import confetti from 'canvas-confetti';
import {
  Languages,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Headphones,
  Award,
  Zap,
} from 'lucide-react';

interface TeluguTranslateViewProps {
  user: UserProfile;
  settings: AppSettings;
  onRefreshState: () => void;
  onNavigateToVoice?: () => void;
}

const COMMON_SITUATIONS = [
  {
    title: 'Late to Office / Standup',
    telugu: 'నాకు ఈరోజు ఆఫీస్ కి లేట్ గా వస్తాను అని మేనేజర్ కి చెప్పాలి.',
    translit: 'Naaku eeroju office ki late ga vasthanu ani manager ki cheppali.',
  },
  {
    title: 'Task Finished / Status Update',
    telugu: 'నేను నా టాస్క్ పూర్తి చేశాను, అప్‌డేట్ ఇవ్వాలనుకుంటున్నాను.',
    translit: 'Nenu na task poorthi chesanu, update ivvalanukuntunnanu.',
  },
  {
    title: 'Asking For Clarification',
    telugu: 'నాకు రిక్వైర్మెంట్ గురించి ఒక ప్రశ్న ఉంది, వివరించగలరా?',
    translit: 'Naaku requirement gurinchi oka prashna undi, vivarinchagalara?',
  },
  {
    title: 'Requesting More Time / Buffer',
    telugu: 'ఈ టాస్క్ పూర్తి చేయడానికి నాకు కొంచెం ఎక్కువ సమయం కావాలి.',
    translit: 'Ee task poorthi cheyadaniki naaku konchem ekkuva samayam kaavali.',
  },
  {
    title: 'Politely Disagreeing in Meeting',
    telugu: 'మీరు చెప్పింది నాకు అర్థమైంది, కానీ వేరే మార్గం కూడా ఉంది.',
    translit: 'Meeru cheppindi naaku ardhamaindi, kani vere maargam kooda undi.',
  },
  {
    title: 'Sharing Screen / Technical Glitch',
    telugu: 'నా స్క్రీన్ కనిపిస్తుందా? నా ఆడియో క్లియర్ గా ఉందా?',
    translit: 'Na screen kanipisthunda? Na audio clear ga unda?',
  },
];

export const TeluguTranslateView: React.FC<TeluguTranslateViewProps> = ({
  user,
  settings,
  onRefreshState,
  onNavigateToVoice,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListeningTelugu, setIsListeningTelugu] = useState(false);
  const [translationResult, setTranslationResult] = useState<TeluguTranslationResult | null>(() =>
    teluguService.translateTelugu('Naaku eeroju office ki late ga vasthanu ani manager ki cheppali.')
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Pronunciation Practice Mode
  const [practiceActive, setPracticeActive] = useState(false);
  const [practiceSpokenText, setPracticeSpokenText] = useState('');
  const [practiceScore, setPracticeScore] = useState<number | null>(null);
  const [isScoringMicActive, setIsScoringMicActive] = useState(false);

  const handleTranslate = (textToTranslate?: string) => {
    const query = (textToTranslate || inputText).trim();
    if (!query) return;

    const res = teluguService.translateTelugu(query);
    setTranslationResult(res);
    setPracticeActive(false);
    setPracticeScore(null);
    setPracticeSpokenText('');

    // Reward XP for bilingual learning
    storageService.addXp(15);
    storageService.recordPracticeActivity();
    onRefreshState();
  };

  const handleStartTeluguVoice = () => {
    if (isListeningTelugu) {
      speechService.stopListening();
      setIsListeningTelugu(false);
      return;
    }

    setIsListeningTelugu(true);
    speechService.startListening({
      lang: 'te-IN', // Telugu Speech Recognition
      continuous: false,
      interimResults: true,
      onResult: (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsListeningTelugu(false);
          speechService.stopListening();
          handleTranslate(transcript);
        }
      },
      onError: () => {
        setIsListeningTelugu(false);
      },
      onEnd: () => {
        setIsListeningTelugu(false);
      },
    });
  };

  const handleSpeakText = (text: string, rate = 1.0) => {
    speechService.speak(text, {
      rate: (settings.voiceRate || 1.0) * rate,
      voiceGender: settings.voiceGender || 'default',
    });
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // --- Pronunciation Practice Scoring ---
  const handleStartPronunciationPractice = (targetSentence: string) => {
    setPracticeActive(true);
    setPracticeScore(null);
    setPracticeSpokenText('');
    setIsScoringMicActive(true);

    speechService.startListening({
      lang: 'en-US',
      continuous: false,
      interimResults: true,
      onResult: (spoken, isFinal) => {
        setPracticeSpokenText(spoken);
        if (isFinal) {
          setIsScoringMicActive(false);
          speechService.stopListening();
          // Calculate similarity score
          const cleanTarget = targetSentence.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
          const cleanSpoken = spoken.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
          let matches = 0;
          cleanTarget.forEach((word) => {
            if (cleanSpoken.includes(word)) matches++;
          });
          const calculatedScore = Math.min(100, Math.round((matches / cleanTarget.length) * 100));
          setPracticeScore(calculatedScore);

          if (calculatedScore >= 75) {
            try {
              confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
            } catch (e) {
              // ignore
            }
            storageService.addXp(20);
            onRefreshState();
          }
        }
      },
      onError: () => {
        setIsScoringMicActive(false);
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-teal-200">
              <Languages className="w-3.5 h-3.5 text-teal-300" />
              <span>Bilingual Fluency Bridge • Telugu to English</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Express Your Telugu Thoughts in Natural English
            </h1>
            <p className="text-sm text-teal-100/90 max-w-xl">
              Type in Telugu script or Romanized Telugu (e.g. "nenu repu leave teesukovali"). Get natural spoken and executive English with instant audio!
            </p>
          </div>

          {onNavigateToVoice && (
            <button
              onClick={onNavigateToVoice}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/25 transition-all flex items-center space-x-2 shrink-0 self-start md:self-auto"
            >
              <Headphones className="w-4 h-4" />
              <span>Practice in Voice Call</span>
            </button>
          )}
        </div>
      </div>

      {/* INPUT CONTAINER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
            <span>Speak or Type in Telugu / Transliteration:</span>
          </label>
          <span className="text-[11px] text-slate-400">
            Supports Telugu script & English letters (nenu, office, doubt, etc.)
          </span>
        </div>

        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type here in Telugu or Latin transliteration: e.g. 'Naaku ee requirement gurinchi oka doubt undi, manager tho ela matladali?'"
            className="w-full h-28 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none transition-all"
          />

          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            {/* Telugu Mic Recognition */}
            <button
              type="button"
              onClick={handleStartTeluguVoice}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 ${
                isListeningTelugu
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
              }`}
              title="Speak in Telugu"
            >
              {isListeningTelugu ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
              <span>{isListeningTelugu ? 'Listening Telugu...' : 'Telugu Mic'}</span>
            </button>

            {/* Translate Button */}
            <button
              type="button"
              onClick={() => handleTranslate()}
              disabled={!inputText.trim()}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-teal-600/25 transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Translate & Learn</span>
            </button>
          </div>
        </div>

        {/* Common Situational Quick Chips */}
        <div className="space-y-2 pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Workplace Situations:
          </p>
          <div className="flex flex-wrap gap-2">
            {COMMON_SITUATIONS.map((sit, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(sit.translit);
                  handleTranslate(sit.translit);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:hover:bg-teal-950/40 dark:hover:text-teal-300 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all border border-slate-200/60 dark:border-slate-700/60"
              >
                {sit.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TRANSLATION & EDUCATIONAL BREAKDOWN */}
      {translationResult && (
        <div className="space-y-6">
          {/* Dual Translation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Natural Conversational English */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Natural Conversational</span>
                </div>
                <button
                  onClick={() => handleCopyText(translationResult.naturalEnglish, 'natural')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Copy Text"
                >
                  {copiedKey === 'natural' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <blockquote className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                "{translationResult.naturalEnglish}"
              </blockquote>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  onClick={() => handleSpeakText(translationResult.naturalEnglish, 1.0)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen (1.0x)</span>
                </button>

                <button
                  onClick={() => handleSpeakText(translationResult.naturalEnglish, 0.75)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                >
                  <span>Slow (0.75x)</span>
                </button>

                <button
                  onClick={() => handleStartPronunciationPractice(translationResult.naturalEnglish)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Practice Pronunciation</span>
                </button>
              </div>
            </div>

            {/* 2. Executive Workplace English */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Executive Workplace</span>
                </div>
                <button
                  onClick={() => handleCopyText(translationResult.professionalEnglish, 'professional')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Copy Text"
                >
                  {copiedKey === 'professional' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <blockquote className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                "{translationResult.professionalEnglish}"
              </blockquote>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  onClick={() => handleSpeakText(translationResult.professionalEnglish, 1.0)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen (1.0x)</span>
                </button>

                <button
                  onClick={() => handleStartPronunciationPractice(translationResult.professionalEnglish)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Practice Pronunciation</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pronunciation Practice Real-Time Feedback Modal/Box */}
          {practiceActive && (
            <div className="bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-3xl p-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold text-sm text-indigo-900 dark:text-indigo-200">
                  <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Pronunciation Accuracy Coach</span>
                </div>
                {practiceScore !== null && (
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    practiceScore >= 80
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {practiceScore}% Accuracy
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 text-center space-y-2">
                {isScoringMicActive ? (
                  <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 animate-pulse">
                    🎙️ Listening... Speak the sentence clearly now!
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    You said: "{practiceSpokenText || 'No speech captured yet'}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Simple Explanation & Cultural Nuance */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
              <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Why This Works & Cultural Nuances:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {translationResult.explanation}
            </p>
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-900 dark:text-teal-200 font-semibold flex items-center space-x-2">
              <span>💡 Grammar Note:</span>
              <span>{translationResult.grammarNote}</span>
            </div>
          </div>

          {/* Key Vocabulary Breakdown */}
          {translationResult.keyVocabulary && translationResult.keyVocabulary.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Key Vocabulary & Phrasal Verbs:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {translationResult.keyVocabulary.map((vocab, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <span>{vocab.english}</span>
                      <button
                        onClick={() => handleSpeakText(vocab.english)}
                        className="text-slate-400 hover:text-indigo-500"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                      {vocab.telugu} ({vocab.transliteration})
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {vocab.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
