import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AppSettings, ChatMessage } from '../../types';
import { speechService } from '../../services/speechService';
import { teluguService, TeluguTranslationResult } from '../../services/teluguService';
import { aiService } from '../../services/aiService';
import { storageService } from '../../services/storageService';
import {
  Mic,
  MicOff,
  PhoneOff,
  PhoneCall,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Languages,
  Headphones,
  Settings2,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  HandMetal,
} from 'lucide-react';

export type VoiceCallState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'paused'
  | 'error';

interface VoicePartnerViewProps {
  user: UserProfile;
  settings: AppSettings;
  onRefreshState: () => void;
  onNavigateToPractice?: () => void;
}

export const VoicePartnerView: React.FC<VoicePartnerViewProps> = ({
  user,
  settings,
  onRefreshState,
}) => {
  const [callState, setCallState] = useState<VoiceCallState>('idle');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [continuousMode, setContinuousMode] = useState(true);
  const [activePersona, setActivePersona] = useState<'friendly' | 'executive' | 'motivating' | 'bilingual'>('friendly');
  const [callDuration, setCallDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Transcript states
  const [liveUserTranscript, setLiveUserTranscript] = useState('');
  const [activeAiResponse, setActiveAiResponse] = useState('');
  const [bilingualCard, setBilingualCard] = useState<TeluguTranslationResult | null>(null);
  const [callHistory, setCallHistory] = useState<ChatMessage[]>([]);

  // Push-to-talk state
  const [isPushToTalkPressed, setIsPushToTalkPressed] = useState(false);

  // Timers and refs
  const callTimerRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  const lastFinalTranscriptRef = useRef('');

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      handleEndCall();
    };
  }, []);

  // Call duration counter
  useEffect(() => {
    if (callState !== 'idle' && callState !== 'error') {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [callState]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // --- START CALL ---
  const handleStartCall = () => {
    setErrorMessage(null);
    setCallState('connecting');
    setCallDuration(0);
    setCallHistory([]);
    setLiveUserTranscript('');
    setBilingualCard(null);

    // Initial greeting based on persona
    let greeting = `Hello Pallavi! It's so wonderful to connect with you today. I'm ready to chat. What's on your mind?`;
    if (activePersona === 'executive') {
      greeting = `Good day Pallavi. Let's practice high-impact workplace communication today. What project or meeting shall we simulate?`;
    } else if (activePersona === 'bilingual') {
      greeting = `Namaskaram Pallavi! Feel free to talk in English or Telugu. Whenever you need help finding the right words, I've got you covered!`;
    }

    setTimeout(() => {
      if (!isMountedRef.current) return;
      setActiveAiResponse(greeting);
      const greetingMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCallHistory([greetingMsg]);

      // Speak greeting
      speakAiResponse(greeting, () => {
        if (continuousMode && !isMicMuted) {
          startListeningTurn();
        } else {
          setCallState('paused');
        }
      });
    }, 800);
  };

  // --- END CALL ---
  const handleEndCall = () => {
    speechService.stopSpeaking();
    speechService.stopListening();
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallState('idle');
    setLiveUserTranscript('');

    // Award practice activity & XP if call lasted more than 15 seconds
    if (callDuration > 15) {
      storageService.recordPracticeActivity();
      storageService.addXp(30);
      onRefreshState();
    }
  };

  // --- INTERRUPT AI ---
  const handleInterruptAi = () => {
    if (callState === 'speaking') {
      speechService.stopSpeaking();
      setCallState('listening');
      startListeningTurn();
    }
  };

  // --- LISTEN TURN ---
  const startListeningTurn = () => {
    if (!speechService.isSpeechRecognitionSupported()) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      setCallState('error');
      return;
    }

    setCallState('listening');
    setLiveUserTranscript('');
    lastFinalTranscriptRef.current = '';

    speechService.startListening({
      lang: 'en-US',
      continuous: continuousMode,
      interimResults: true,
      autoStopOnSilenceMs: continuousMode ? 1700 : undefined,
      onSpeechDetected: () => {
        // Voice interruption: Stop AI speech immediately if user begins speaking
        if (speechService.isSpeaking()) {
          speechService.stopSpeaking();
        }
      },
      onResult: (transcript, isFinal) => {
        setLiveUserTranscript(transcript);
        if (isFinal) {
          lastFinalTranscriptRef.current = transcript;
          speechService.stopListening();
          processUserSpeech(transcript);
        }
      },
      onError: (err) => {
        console.warn('Speech recognition notice:', err);
        if (callState === 'listening') {
          // Retry gracefully on silent timeout
          setTimeout(() => {
            if (isMountedRef.current && callState === 'listening') {
              startListeningTurn();
            }
          }, 600);
        }
      },
      onEnd: () => {
        if (continuousMode && callState === 'listening' && !lastFinalTranscriptRef.current) {
          // Restart listening loop if user was still in listening turn
          setTimeout(() => {
            if (isMountedRef.current && callState === 'listening') {
              startListeningTurn();
            }
          }, 300);
        }
      },
    });
  };

  // --- PROCESS USER UTTERANCE ---
  const processUserSpeech = async (userText: string) => {
    if (!userText.trim()) {
      if (continuousMode) startListeningTurn();
      return;
    }

    setCallState('processing');

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCallHistory((prev) => [...prev, userMsg]);
    setLiveUserTranscript('');

    try {
      // 1. Check if user spoke Telugu (script or transliteration like "nenu office ki late ga vasthanu")
      const teluguCheck = teluguService.translateTelugu(userText);

      let aiReplyText = '';

      if (teluguCheck.detectedLanguage !== 'english') {
        // User expressed in Telugu! Provide bilingual learning assistance
        setBilingualCard(teluguCheck);

        aiReplyText = `In English, you can say: "${teluguCheck.naturalEnglish}". For executive meetings, say: "${teluguCheck.professionalEnglish}". Let's practice that! Try repeating it after me.`;
      } else {
        setBilingualCard(null);

        // Generate natural conversational AI response
        const prompt = `You are an encouraging, world-class English conversation tutor on a live telephone call with Pallavi.
Keep your response short, conversational, natural (1-3 sentences), warm, and end with an engaging question to keep the conversation flowing.
Pallavi said: "${userText}"`;

        aiReplyText = await aiService.generateChatResponse(
          [...callHistory, userMsg],
          prompt,
          settings
        );
      }

      setActiveAiResponse(aiReplyText);

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCallHistory((prev) => [...prev, aiMsg]);

      // Speak response out loud through device speaker
      speakAiResponse(aiReplyText, () => {
        if (continuousMode && !isMicMuted) {
          startListeningTurn();
        } else {
          setCallState('paused');
        }
      });
    } catch (e: any) {
      console.error(e);
      setErrorMessage('Communication error. Reconnecting...');
      setCallState('error');
    }
  };

  // --- SPEAK AI RESPONSE ---
  const speakAiResponse = (text: string, onEnd: () => void) => {
    setCallState('speaking');
    speechService.speak(text, {
      rate: settings.voiceRate || 1.0,
      voiceGender: settings.voiceGender || 'default',
      onStart: () => {
        setCallState('speaking');
      },
      onEnd: () => {
        onEnd();
      },
      onError: () => {
        onEnd();
      },
    });
  };

  // --- REPLAY CURRENT AI AUDIO ---
  const handleReplayActiveAudio = () => {
    if (activeAiResponse) {
      speechService.stopListening();
      speakAiResponse(activeAiResponse, () => {
        if (continuousMode && !isMicMuted) startListeningTurn();
      });
    }
  };

  // --- PUSH TO TALK HANDLERS ---
  const handlePushToTalkStart = () => {
    if (callState === 'speaking') {
      speechService.stopSpeaking();
    }
    setIsPushToTalkPressed(true);
    setCallState('listening');
    setLiveUserTranscript('');

    speechService.startListening({
      lang: 'en-US',
      continuous: false,
      interimResults: true,
      onResult: (transcript, isFinal) => {
        setLiveUserTranscript(transcript);
        if (isFinal) {
          lastFinalTranscriptRef.current = transcript;
        }
      },
    });
  };

  const handlePushToTalkRelease = () => {
    setIsPushToTalkPressed(false);
    speechService.stopListening();
    if (liveUserTranscript.trim() || lastFinalTranscriptRef.current.trim()) {
      processUserSpeech(lastFinalTranscriptRef.current || liveUserTranscript);
    } else {
      setCallState('paused');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      {/* Top Header & Call Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl shadow-inner shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Voice Partner
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                Live 2-Way Audio
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time phone call practice with voice interruption & Telugu support.
            </p>
          </div>
        </div>

        {/* Persona Selector & Call Duration */}
        <div className="flex items-center space-x-3">
          {callState !== 'idle' && (
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{formatTimer(callDuration)}</span>
            </div>
          )}

          <select
            value={activePersona}
            onChange={(e) => setActivePersona(e.target.value as any)}
            disabled={callState !== 'idle'}
            className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="friendly">Friendly Mentor</option>
            <option value="executive">Executive Presence</option>
            <option value="motivating">Confidence Booster</option>
            <option value="bilingual">Telugu & English Tutor</option>
          </select>
        </div>
      </div>

      {/* ERROR NOTICE */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-rose-800 dark:text-rose-200 text-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="font-bold underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* MAIN CALL SCREEN */}
      <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-between min-h-[460px]">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* State Indicator Pill */}
        <div className="relative z-10 flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold tracking-wide">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              callState === 'speaking'
                ? 'bg-emerald-400 animate-ping'
                : callState === 'listening'
                ? 'bg-teal-400 animate-pulse'
                : callState === 'processing'
                ? 'bg-amber-400 animate-spin'
                : callState === 'connecting'
                ? 'bg-indigo-400 animate-pulse'
                : callState === 'paused'
                ? 'bg-slate-400'
                : 'bg-slate-500'
            }`}
          />
          <span className="capitalize">
            {callState === 'idle'
              ? 'Ready to Connect'
              : callState === 'connecting'
              ? 'Connecting Call...'
              : callState === 'listening'
              ? 'Listening to you... (Speak freely)'
              : callState === 'processing'
              ? 'AI Thinking...'
              : callState === 'speaking'
              ? 'AI Speaking...'
              : callState === 'paused'
              ? 'Call Paused'
              : 'Disconnected'}
          </span>
        </div>

        {/* Animated Avatar / Audio Visualizer Circle */}
        <div className="relative z-10 my-8 flex flex-col items-center justify-center">
          {/* Animated Pulsing Wave Rings */}
          <div
            className={`absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full transition-all duration-700 pointer-events-none ${
              callState === 'speaking'
                ? 'bg-emerald-500/20 ring-4 ring-emerald-500/40 animate-ping'
                : callState === 'listening'
                ? 'bg-teal-500/20 ring-4 ring-teal-500/40 animate-pulse'
                : 'bg-transparent'
            }`}
          />
          <div
            className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full transition-all duration-500 pointer-events-none ${
              callState === 'speaking'
                ? 'bg-indigo-500/30 ring-2 ring-indigo-400/50'
                : callState === 'listening'
                ? 'bg-teal-500/30 ring-2 ring-teal-400/50'
                : 'bg-transparent'
            }`}
          />

          {/* Central AI Avatar Core */}
          <div
            className={`relative z-20 w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 ${
              callState === 'speaking'
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-emerald-500/40 scale-105'
                : callState === 'listening'
                ? 'bg-gradient-to-tr from-teal-500 to-indigo-500 text-white shadow-teal-500/40 ring-4 ring-teal-300/40'
                : callState === 'processing'
                ? 'bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-amber-500/30'
                : 'bg-gradient-to-tr from-indigo-700 to-slate-800 text-white/90 shadow-indigo-900/50'
            }`}
          >
            {callState === 'speaking' ? (
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-6 bg-white rounded-full animate-bounce" />
                <span className="w-1.5 h-10 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-7 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
                <span className="w-1.5 h-9 bg-white rounded-full animate-bounce [animation-delay:0.1s]" />
              </div>
            ) : callState === 'listening' ? (
              <Mic className="w-12 h-12 text-white animate-pulse" />
            ) : callState === 'processing' ? (
              <Sparkles className="w-10 h-10 text-amber-200 animate-spin" />
            ) : (
              <Headphones className="w-12 h-12 text-indigo-200" />
            )}
          </div>

          {/* Live Waveform Indicator Bar */}
          <div className="mt-4 flex items-center space-x-1.5 h-6">
            {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
              <span
                key={bar}
                className={`w-1 rounded-full transition-all duration-200 ${
                  callState === 'speaking'
                    ? 'bg-emerald-400 animate-pulse'
                    : callState === 'listening'
                    ? 'bg-teal-400 animate-pulse'
                    : 'bg-slate-700 h-1.5'
                }`}
                style={{
                  height:
                    callState === 'speaking'
                      ? `${Math.max(6, (bar * 5) % 22)}px`
                      : callState === 'listening'
                      ? `${Math.max(6, ((8 - bar) * 4) % 20)}px`
                      : '4px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Live Speech Caption Display */}
        <div className="relative z-10 w-full max-w-2xl text-center space-y-3">
          {liveUserTranscript ? (
            <div className="p-3.5 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-200 text-sm font-semibold animate-pulse">
              <span className="text-[11px] uppercase tracking-wider block opacity-75">You are saying:</span>
              "{liveUserTranscript}"
            </div>
          ) : activeAiResponse ? (
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-slate-100 text-sm sm:text-base font-medium leading-relaxed shadow-lg">
              <span className="text-[11px] uppercase tracking-wider text-indigo-300 block mb-1 font-bold">
                AI Partner:
              </span>
              "{activeAiResponse}"
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Tap "Start Conversation" below to begin talking with your AI mentor.
            </p>
          )}

          {/* Bilingual Telugu Flashcard (When user spoke in Telugu) */}
          {bilingualCard && (
            <div className="p-4 rounded-2xl bg-indigo-900/60 backdrop-blur-md border border-indigo-400/40 text-left text-xs space-y-2 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <div className="flex items-center space-x-1.5">
                  <Languages className="w-4 h-4" />
                  <span>Bilingual Expression Helper</span>
                </div>
                <span className="text-[10px] bg-amber-400/20 px-2 py-0.5 rounded-md text-amber-200">
                  Telugu → English
                </span>
              </div>
              <p className="text-white">
                <span className="text-indigo-300 font-semibold">Natural Spoken: </span>
                "{bilingualCard.naturalEnglish}"
              </p>
              <p className="text-indigo-200">
                <span className="text-indigo-300 font-semibold">Executive Workplace: </span>
                "{bilingualCard.professionalEnglish}"
              </p>
              <p className="text-slate-300 text-[11px] pt-1 border-t border-white/10">
                💡 {bilingualCard.explanation}
              </p>
            </div>
          )}
        </div>

        {/* BOTTOM CALL CONTROLS */}
        <div className="relative z-10 w-full pt-8 flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          {callState === 'idle' ? (
            <button
              onClick={handleStartCall}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center space-x-2.5"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Start Call</span>
            </button>
          ) : (
            <>
              {/* Tap to Interrupt Button */}
              {callState === 'speaking' && (
                <button
                  onClick={handleInterruptAi}
                  className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 animate-bounce"
                >
                  <HandMetal className="w-4 h-4" />
                  <span>Interrupt & Speak</span>
                </button>
              )}

              {/* Push to Talk Button (if continuous mode disabled) */}
              {!continuousMode && (
                <button
                  onMouseDown={handlePushToTalkStart}
                  onMouseUp={handlePushToTalkRelease}
                  onTouchStart={handlePushToTalkStart}
                  onTouchEnd={handlePushToTalkRelease}
                  className={`px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 ${
                    isPushToTalkPressed
                      ? 'bg-rose-600 text-white scale-105 ring-4 ring-rose-400'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>{isPushToTalkPressed ? 'Listening... (Release to Send)' : 'Hold to Speak'}</span>
                </button>
              )}

              {/* Mute / Unmute Button */}
              <button
                onClick={() => {
                  const nextMuted = !isMicMuted;
                  setIsMicMuted(nextMuted);
                  if (nextMuted) {
                    speechService.stopListening();
                    setCallState('paused');
                  } else {
                    startListeningTurn();
                  }
                }}
                className={`p-3.5 rounded-2xl font-bold transition-all ${
                  isMicMuted
                    ? 'bg-rose-500/20 border border-rose-500 text-rose-300'
                    : 'bg-white/10 hover:bg-white/20 border border-white/10 text-white'
                }`}
                title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Replay Current AI Audio Button */}
              <button
                onClick={handleReplayActiveAudio}
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold transition-all"
                title="Replay Audio"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center space-x-2"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* CALL SETTINGS & HANDS-FREE TOGGLE */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Settings2 className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Hands-Free Continuous Mode
          </span>
          <span className="text-[10px] text-slate-400">
            (Automatically takes turns like a real telephone call)
          </span>
        </div>
        <button
          onClick={() => setContinuousMode(!continuousMode)}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            continuousMode
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {continuousMode ? 'Enabled' : 'Push-to-Talk'}
        </button>
      </div>

      {/* CONVERSATION HISTORY LOG */}
      {callHistory.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Call Transcript History
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {callHistory.length} turns
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {callHistory.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                  item.sender === 'user'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-slate-900 dark:text-slate-100 ml-8 border border-indigo-100 dark:border-indigo-900/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 mr-8 border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[10px] text-slate-500 dark:text-slate-400">
                  <span>{item.sender === 'user' ? 'Pallavi' : 'AI Partner'}</span>
                  <span>{item.timestamp}</span>
                </div>
                <p className="leading-relaxed">{item.text}</p>
                {item.sender === 'ai' && (
                  <button
                    onClick={() => {
                      speechService.speak(item.text, {
                        rate: settings.voiceRate || 1.0,
                        voiceGender: settings.voiceGender || 'default',
                      });
                    }}
                    className="inline-flex items-center space-x-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Play Audio</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
