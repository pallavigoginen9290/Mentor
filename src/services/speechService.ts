// Speech synthesis and recognition service for AI Communication Mentor
// Production-grade real-time voice call engine with interruption handling and bilingual support

export type RecognitionLanguage = 'en-US' | 'en-IN' | 'te-IN';

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voiceGender?: 'default' | 'female' | 'male';
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onBoundary?: (charIndex: number) => void;
}

export interface ListeningOptions {
  lang?: RecognitionLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  autoStopOnSilenceMs?: number; // Auto-commit when user pauses in phone-call mode
  onSpeechDetected?: () => void; // Triggered immediately on first word (for voice interruption)
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognition: any = null;
  private isListening = false;
  private silenceTimer: any = null;
  private onInterruptCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Preload voices
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.synth?.getVoices();
        };
      }
    }
  }

  // --- TEXT TO SPEECH ---
  public speak(
    text: string,
    rateOrOptions: number | SpeakOptions = 1.0,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (!this.synth) {
      if (typeof rateOrOptions === 'object' && rateOrOptions.onEnd) {
        rateOrOptions.onEnd();
      } else {
        onEnd?.();
      }
      return;
    }

    // Normalize options
    const options: SpeakOptions =
      typeof rateOrOptions === 'number'
        ? { rate: rateOrOptions, onStart, onEnd, onError }
        : rateOrOptions;

    // Stop any ongoing speech immediately
    this.stopSpeaking();

    // Clean text: strip markdown symbols, URLs, asterisks, brackets, and code blocks for smooth natural speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '') // remove code blocks
      .replace(/https?:\/\/\S+/g, '') // remove links
      .replace(/[*_#`~>]/g, ' ') // remove markdown syntax
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // retain anchor text
      .replace(/[""«»]/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      options.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;

    // Pick best natural voice available
    const voices = this.synth.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (options.voiceGender === 'female') {
      selectedVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Samantha') ||
            v.name.includes('Victoria') ||
            v.name.includes('Zira') ||
            v.name.includes('Female') ||
            v.name.includes('Google UK English Female') ||
            v.name.includes('Natural'))
      );
    } else if (options.voiceGender === 'male') {
      selectedVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('David') ||
            v.name.includes('Alex') ||
            v.name.includes('George') ||
            v.name.includes('Male') ||
            v.name.includes('Google UK English Male'))
      );
    }

    if (!selectedVoice) {
      // Prefer high-quality Neural or Google voices
      selectedVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Neural') ||
              v.name.includes('Samantha') ||
              v.name.includes('Karen'))
        ) ||
        voices.find((v) => v.lang.startsWith('en-IN')) ||
        voices.find((v) => v.lang.startsWith('en'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      // 'interrupted' is normal when user interrupts AI
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        options.onError?.(e);
      } else {
        options.onEnd?.();
      }
    };

    if (options.onBoundary) {
      utterance.onboundary = (e) => {
        options.onBoundary?.(e.charIndex);
      };
    }

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  // Interruption: Cancels speech immediately and invokes interruption callback
  public stopSpeaking() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // ignore
      }
      this.currentUtterance = null;
      if (this.onInterruptCallback) {
        this.onInterruptCallback();
      }
    }
  }

  public setOnInterrupt(callback: (() => void) | null) {
    this.onInterruptCallback = callback;
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  // --- SPEECH RECOGNITION (MIC) ---
  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  public startListening(
    optionsOrOnResult: ListeningOptions | ((transcript: string, isFinal: boolean) => void),
    legacyOnError?: (error: any) => void,
    legacyOnEnd?: () => void
  ): boolean {
    const options: ListeningOptions =
      typeof optionsOrOnResult === 'function'
        ? {
            onResult: optionsOrOnResult,
            onError: legacyOnError,
            onEnd: legacyOnEnd,
            continuous: true,
            interimResults: true,
            lang: 'en-US',
          }
        : optionsOrOnResult;

    if (!this.isSpeechRecognitionSupported()) {
      options.onError?.('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return false;
    }

    try {
      this.stopListening();

      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRec();
      this.recognition.continuous = options.continuous ?? true;
      this.recognition.interimResults = options.interimResults ?? true;
      this.recognition.lang = options.lang || 'en-US';

      let lastSpokenText = '';
      let hasReportedSpeechDetected = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        hasReportedSpeechDetected = false;
      };

      this.recognition.onresult = (event: any) => {
        // Real-time voice interruption: If user starts uttering words while AI is speaking, interrupt AI!
        if (!hasReportedSpeechDetected && this.isSpeaking()) {
          this.stopSpeaking();
          options.onSpeechDetected?.();
          hasReportedSpeechDetected = true;
        }

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const fullText = (finalTranscript || interimTranscript).trim();
        const isFinal = Boolean(finalTranscript);

        if (fullText) {
          lastSpokenText = fullText;
          options.onResult(fullText, isFinal);

          // Handle automatic silence detection in continuous phone-call mode
          if (options.autoStopOnSilenceMs && options.autoStopOnSilenceMs > 0) {
            if (this.silenceTimer) clearTimeout(this.silenceTimer);
            this.silenceTimer = setTimeout(() => {
              if (lastSpokenText.trim().length > 0) {
                options.onResult(lastSpokenText, true);
              }
            }, options.autoStopOnSilenceMs);
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // ignore silent pause
          return;
        }
        if (event.error === 'aborted') {
          return;
        }
        this.isListening = false;
        options.onError?.(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        options.onEnd?.();
      };

      this.recognition.start();
      return true;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      options.onError?.(e);
      return false;
    }
  }

  public stopListening() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.recognition = null;
      this.isListening = false;
    }
  }

  public getListeningStatus(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();
