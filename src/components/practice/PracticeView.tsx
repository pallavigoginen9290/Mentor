import React, { useState, useEffect, useRef } from 'react';
import {
  ScenarioDefinition,
  PracticeMode,
  ChatMessage,
  PracticeSession,
  FeedbackReport,
  AppSettings,
  UserProfile,
} from '../../types';
import { SCENARIOS } from '../../data/scenarios';
import { aiService } from '../../services/aiService';
import { speechService } from '../../services/speechService';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Send,
  Sparkles,
  RotateCcw,
  Clock,
  ArrowLeft,
  Briefcase,
  Users,
  MessageSquare,
  Award,
  Zap,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface PracticeViewProps {
  initialScenarioId?: string;
  initialMode?: PracticeMode;
  settings: AppSettings;
  user: UserProfile;
  onFinishSession: (session: PracticeSession) => void;
  onOpenFeedback: (feedback: FeedbackReport, xp: number) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  initialScenarioId,
  initialMode = 'workplace',
  settings,
  user: _user,
  onFinishSession,
  onOpenFeedback,
}) => {
  // Scenario selection state
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDefinition | null>(() => {
    if (initialScenarioId) {
      return SCENARIOS.find((s) => s.id === initialScenarioId) || null;
    }
    return null;
  });

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>(initialMode);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakingAi, setIsSpeakingAi] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());

  // Think -> Speak countdown timer state
  const [thinkTimeLeft, setThinkTimeLeft] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // When initialScenarioId changes from outside
  useEffect(() => {
    if (initialScenarioId) {
      const found = SCENARIOS.find((s) => s.id === initialScenarioId);
      if (found) {
        startScenario(found);
      }
    }
  }, [initialScenarioId]);

  // Scroll to chat bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiResponding]);

  // Handle think countdown for Think -> Speak mode
  useEffect(() => {
    if (thinkTimeLeft === null || thinkTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setThinkTimeLeft((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [thinkTimeLeft]);

  const startScenario = (sc: ScenarioDefinition) => {
    setSelectedScenario(sc);
    const initialMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'ai',
      text: sc.initialMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialMsg]);
    setSessionStartTime(Date.now());

    // Auto speak if enabled in settings
    if (settings.textToSpeech) {
      speechService.speak(sc.initialMessage, settings.voiceRate, () => setIsSpeakingAi(true), () => setIsSpeakingAi(false));
    }

    // Set think timer if Think -> Speak
    if (sc.category === 'daily' && sc.id.includes('think')) {
      setThinkTimeLeft(5);
    } else {
      setThinkTimeLeft(null);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !selectedScenario || isAiResponding) return;

    const userText = inputText.trim();
    setInputText('');

    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    }

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsAiResponding(true);

    try {
      const replyText = await aiService.generateMentorResponse(
        newMessages,
        {
          mode: selectedScenario.category as PracticeMode,
          roleTitle: selectedScenario.role,
          topic: selectedScenario.title,
          persona: settings.mentorPersona,
          difficulty: selectedScenario.difficulty,
          itSpecific: selectedScenario.itSpecific,
        },
        settings
      );

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (settings.textToSpeech) {
        speechService.speak(
          replyText,
          settings.voiceRate,
          () => setIsSpeakingAi(true),
          () => setIsSpeakingAi(false)
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiResponding(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      const started = speechService.startListening(
        (transcript, _isFinal) => {
          setInputText(transcript);
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsRecording(false);
        },
        () => setIsRecording(false)
      );
      if (started) setIsRecording(true);
    }
  };

  const handleSpeakText = (text: string) => {
    if (isSpeakingAi) {
      speechService.stopSpeaking();
      setIsSpeakingAi(false);
    } else {
      speechService.speak(
        text,
        settings.voiceRate,
        () => setIsSpeakingAi(true),
        () => setIsSpeakingAi(false)
      );
    }
  };

  const handleFinishAndEvaluate = async () => {
    if (!selectedScenario || messages.length <= 1) return;
    setIsEvaluating(true);

    const userResponses = messages.filter((m) => m.sender === 'user').map((m) => m.text);
    if (userResponses.length === 0) {
      userResponses.push('I completed the task.');
    }

    try {
      const feedback = await aiService.evaluateSession(
        {
          mode: selectedScenario.category as PracticeMode,
          scenarioTitle: selectedScenario.title,
          userResponses,
          allMessages: messages,
          persona: settings.mentorPersona,
          difficulty: selectedScenario.difficulty,
        },
        settings
      );

      const durationSec = Math.round((Date.now() - sessionStartTime) / 1000);
      const sessionRecord: PracticeSession = {
        id: `sess_${Date.now()}`,
        date: new Date().toISOString(),
        mode: selectedScenario.category as PracticeMode,
        categoryTitle: selectedScenario.title,
        topic: selectedScenario.description,
        personaTitle: selectedScenario.role,
        messages,
        userResponses,
        feedback,
        xpEarned: 20,
        durationSeconds: durationSec,
        completed: true,
      };

      onFinishSession(sessionRecord);
      onOpenFeedback(feedback, 20);
    } catch (e) {
      console.error('Evaluation failed:', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleResetSession = () => {
    speechService.stopSpeaking();
    speechService.stopListening();
    setIsSpeakingAi(false);
    setIsRecording(false);
    if (selectedScenario) {
      startScenario(selectedScenario);
    }
  };

  // Filtered scenarios
  const filteredScenarios = SCENARIOS.filter((s) => {
    if (activeCategoryFilter === 'all') return true;
    if (activeCategoryFilter === 'workplace') return s.category === 'workplace' || s.itSpecific;
    if (activeCategoryFilter === 'it') return s.itSpecific;
    return s.category === activeCategoryFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {!selectedScenario ? (
        /* SCENARIO CATALOGUE VIEW */
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Practice Arenas & Workplace Simulations
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select a realistic dialogue simulation. The mentor converses naturally and delivers a complete
                evaluation when you finish.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'workplace', label: 'Workplace & IT', icon: Briefcase },
                { id: 'interview', label: 'Interview', icon: Award },
                { id: 'difficult', label: 'Difficult Chats', icon: Zap },
                { id: 'meeting', label: 'Meeting', icon: Users },
                { id: 'presentation', label: 'Presentation', icon: Mic },
                { id: 'daily', label: 'Daily Chat', icon: MessageSquare },
              ].map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scenario Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredScenarios.map((sc) => (
              <div
                key={sc.id}
                onClick={() => startScenario(sc)}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {sc.role}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sc.difficulty === 'Beginner'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : sc.difficulty === 'Intermediate'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {sc.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors mb-2">
                    {sc.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {sc.description}
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 mb-4">
                    <span className="font-semibold text-slate-500 block mb-0.5">Prompt:</span>
                    <span className="italic">"{sc.initialMessage.slice(0, 85)}..."</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span className="text-slate-400 text-[11px] font-normal">Objective: {sc.suggestedGoal.slice(0, 30)}...</span>
                  <span className="group-hover:translate-x-1 transition-transform">Start Chat →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* LIVE CONVERSATION SCREEN */
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Top Bar with Scenario Title, Goal, and Controls */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 min-w-0">
              <button
                onClick={() => {
                  speechService.stopSpeaking();
                  setSelectedScenario(null);
                }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                title="Back to catalogue"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="truncate">
                <div className="flex items-center space-x-2">
                  <span className="font-black text-slate-900 dark:text-white text-base truncate">
                    {selectedScenario.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 shrink-0">
                    {selectedScenario.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Goal: {selectedScenario.suggestedGoal}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleResetSession}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Restart conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleFinishAndEvaluate}
                disabled={isEvaluating || messages.length <= 1}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Finish & Evaluate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Think -> Speak Timer Indicator (if active) */}
          {thinkTimeLeft !== null && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 animate-pulse text-amber-600" />
                <span>
                  {thinkTimeLeft > 0
                    ? `Think time remaining: ${thinkTimeLeft}s (Formulate your thoughts before speaking!)`
                    : 'Time to respond! Give your spontaneous answer now.'}
                </span>
              </div>
              <span className="font-mono text-sm font-black">{thinkTimeLeft}s</span>
            </div>
          )}

          {/* Messages Flow Area */}
          <div className="p-5 rounded-3xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 min-h-[380px] max-h-[500px] overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-sm ${
                      isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-teal-600 text-white'
                    }`}
                  >
                    {isUser ? 'You' : 'AI'}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between space-x-4 mb-1">
                      <span className="text-[10px] font-bold opacity-75">
                        {isUser ? 'You' : selectedScenario.role}
                      </span>
                      <span className="text-[10px] opacity-60">{msg.timestamp}</span>
                    </div>

                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Speaker audio button for AI */}
                    {!isUser && (
                      <button
                        onClick={() => handleSpeakText(msg.text)}
                        className="mt-2 text-xs flex items-center space-x-1 opacity-70 hover:opacity-100 text-teal-600 dark:text-teal-400 font-semibold transition"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI Thinking Animation */}
            {isAiResponding && (
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 p-2">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce delay-200" />
                <span>Mentor is responding naturally...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input & Microphone Action Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-2"
          >
            {/* Mic speech recognition button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-3 rounded-xl transition-all shadow-sm ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
              title={isRecording ? 'Listening... click to stop' : 'Click to speak with microphone'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isRecording
                  ? 'Listening to your speech...'
                  : 'Type or speak your realistic response...'
              }
              className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isAiResponding}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          {/* Mentor Guidance Tip */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
            <span>💡 <strong>Mentor Rule:</strong> Speak naturally. Minor grammatical errors are preserved during chat so you stay in flow, then thoroughly analyzed when you click "Finish & Evaluate".</span>
          </div>
        </div>
      )}
    </div>
  );
};
