// Telugu to English translation, transliteration recognition, and bilingual soft-skills learning engine

export interface TeluguTranslationResult {
  detectedLanguage: 'telugu' | 'telugu_transliteration' | 'english';
  originalInput: string;
  teluguScript: string;
  transliteration: string;
  naturalEnglish: string;
  professionalEnglish: string;
  explanation: string;
  grammarNote: string;
  keyVocabulary: Array<{
    telugu: string;
    transliteration: string;
    english: string;
    meaning: string;
  }>;
  suggestedFollowUpPrompt: string;
}

// Common Telugu transliteration keywords and workplace expressions
const TELUGU_KEYWORDS = [
  'nenu', 'naaku', 'naku', 'memu', 'manamu', 'meeru', 'nuvvu', 'vaallu', 'athanu', 'aame',
  'office', 'late', 'vastanu', 'vastha', 'vellali', 'cheppali', 'cheyali', 'chesanu', 'chesi',
  'undhi', 'undi', 'ledu', 'ledhu', 'kavali', 'kaavali', 'ivvandi', 'adagali', 'teliyadu',
  'bhayam', 'bhayamga', 'doubt', 'ardham', 'kaledu', 'kaaledhu', 'repu', 'ivala', 'eeroju',
  'ippudu', 'tarvatha', 'thondaraga', 'ela', 'enti', 'eppudu', 'ekkada', 'enduku', 'chala',
  'bagundi', 'kudaradu', 'time', 'task', 'project', 'bug', 'issue', 'call', 'meeting', 'manager',
  'permission', 'leave', 'access', 'file', 'data', 'mail', 'update'
];

interface TranslationPattern {
  keywords: string[];
  regex?: RegExp;
  teluguScript: string;
  transliteration: string;
  naturalEnglish: string;
  professionalEnglish: string;
  explanation: string;
  grammarNote: string;
  keyVocabulary: Array<{ telugu: string; transliteration: string; english: string; meaning: string }>;
}

const COMMON_PATTERNS: TranslationPattern[] = [
  {
    keywords: ['late', 'office', 'vastanu', 'cheppali', 'manager'],
    regex: /(late.*vastanu|office.*late|manager.*late|late.*cheppali)/i,
    teluguScript: 'నాకు ఈరోజు ఆఫీసుకు ఆలస్యంగా వస్తాను అని మేనేజర్కు చెప్పాలి.',
    transliteration: 'Naaku eeroju office ki late ga vasthanu ani manager ki cheppali.',
    naturalEnglish: 'I need to let my manager know that I will be late to the office today.',
    professionalEnglish: 'I wanted to inform my manager that I will be arriving late to the office today due to an unavoidable delay.',
    explanation: 'In English, use "let someone know" or "inform" rather than a direct literal translation. "I will be late" is direct and polite.',
    grammarNote: 'Telugu uses the future tense "vasthanu", which translates smoothly to "I will be late" or "I will be arriving late".',
    keyVocabulary: [
      { telugu: 'ఆలస్యంగా', transliteration: 'late ga', english: 'late / delayed', meaning: 'behind scheduled time' },
      { telugu: 'చెప్పాలి', transliteration: 'cheppali', english: 'need to inform / let know', meaning: 'must communicate' },
      { telugu: 'ఈరోజు', transliteration: 'eeroju', english: 'today', meaning: 'this current day' },
    ],
  },
  {
    keywords: ['task', 'complete', 'chesanu', 'update', 'done'],
    regex: /(task.*chesanu|work.*complete|task.*ayipoyindi|update.*ivvali)/i,
    teluguScript: 'నేను నా టాస్క్ పూర్తి చేశాను. దీనిపై అప్‌డేట్ ఇవ్వాలనుకుంటున్నాను.',
    transliteration: 'Nenu na task poorthi chesanu. Deenipai update ivvalanukuntunnanu.',
    naturalEnglish: 'I have finished my task and I would like to give a quick update on it.',
    professionalEnglish: 'I have completed the assigned deliverables and would like to share a brief progress update.',
    explanation: 'Instead of saying "I am finished the task", native speakers always say "I have finished" (present perfect).',
    grammarNote: 'Use "have completed" when an action finished recently and has relevance to the present meeting.',
    keyVocabulary: [
      { telugu: 'పూర్తి చేశాను', transliteration: 'poorthi chesanu', english: 'have completed', meaning: 'finished entirely' },
      { telugu: 'అప్‌డేట్', transliteration: 'update', english: 'status update', meaning: 'current progress report' },
    ],
  },
  {
    keywords: ['doubt', 'adagali', 'clarification', 'kavali', 'ardham'],
    regex: /(doubt.*undi|clarification.*kavali|ardham.*kaledu|adagali)/i,
    teluguScript: 'నాకు ఈ రిక్వైర్మెంట్ గురించి ఒక చిన్న సందేహం ఉంది, మీరు కొంచెం వివరించగలరా?',
    transliteration: 'Naaku ee requirement gurinchi oka chinna sandeham undi, meeru konchem vivarinchagalara?',
    naturalEnglish: 'I have a quick question about this requirement. Could you please clarify that for me?',
    professionalEnglish: 'Could you please provide some additional clarification on this specific requirement?',
    explanation: 'In global workplace English, replace "I have a doubt" with "I have a question" or "I would like clarification". "Doubt" implies you mistrust someone.',
    grammarNote: 'Use polite modal verbs like "Could you please..." or "Would you mind clarifying...".',
    keyVocabulary: [
      { telugu: 'సందేహం / ప్రశ్న', transliteration: 'sandeham / prashna', english: 'question / clarification', meaning: 'inquiry needing details' },
      { telugu: 'వివరించగలరా', transliteration: 'vivarinchagalara', english: 'could you clarify', meaning: 'polite request to explain' },
    ],
  },
  {
    keywords: ['time', 'kavali', 'deadline', 'kudaradu', 'extension'],
    regex: /(time.*kavali|deadline.*kudaradu|extension.*kavali|more.*time)/i,
    teluguScript: 'ఈ టాస్క్ పూర్తి చేయడానికి నాకు మరికొంత సమయం కావాలి.',
    transliteration: 'Ee task poorthi cheyadaniki naaku marikontha samayam kaavali.',
    naturalEnglish: 'I need a little more time to complete this task properly.',
    professionalEnglish: 'Could we adjust the timeline slightly? I require an additional day to ensure thorough testing and quality.',
    explanation: 'Pair requests for more time with quality assurance ("to ensure thorough testing") so it sounds professional and responsible.',
    grammarNote: '"I require an additional day" is more diplomatic than "I cannot finish today".',
    keyVocabulary: [
      { telugu: 'మరికొంత సమయం', transliteration: 'marikontha samayam', english: 'additional time / buffer', meaning: 'extra time window' },
      { telugu: 'పూర్తి చేయడానికి', transliteration: 'poorthi cheyadaniki', english: 'to deliver / complete', meaning: 'to finalize' },
    ],
  },
  {
    keywords: ['bug', 'issue', 'sql', 'data', 'error', 'kanipinchindi'],
    regex: /(bug.*vachindi|issue.*undi|error.*kanipinchindi|data.*mismatch)/i,
    teluguScript: 'డేటాబేస్‌లో ఒక డేటా మిస్‌మ్యాచ్ వచ్చింది, నేను దాన్ని పరిశీలిస్తున్నాను.',
    transliteration: 'Database lo oka data mismatch vachindi, nenu daanni parisheelisthunnanu.',
    naturalEnglish: 'I found a data mismatch in the database, and I am currently looking into it.',
    professionalEnglish: 'I have identified a minor data discrepancy in the database schema and am currently investigating the root cause.',
    explanation: 'Replace "I am checking the problem" with "investigating the root cause" for instant executive polish.',
    grammarNote: 'Use "am currently investigating" (present continuous) to show active, in-progress troubleshooting.',
    keyVocabulary: [
      { telugu: 'డేటా తేడా', transliteration: 'data theda', english: 'data discrepancy / mismatch', meaning: 'difference between tables' },
      { telugu: 'పరిశీలిస్తున్నాను', transliteration: 'parisheelisthunnanu', english: 'investigating / analyzing', meaning: 'examining root cause' },
    ],
  },
  {
    keywords: ['leave', 'repu', 'raleenu', 'selavu', 'holiday'],
    regex: /(repu.*raleenu|leave.*kavali|selavu.*kavali|holiday.*kavali)/i,
    teluguScript: 'నాకు వ్యక్తిగత పని ఉండటం వల్ల నేను రేపు ఆఫీసుకు రాలేను.',
    transliteration: 'Naaku vyakthigatha pani undatam valla nenu repu office ki raaleenu.',
    naturalEnglish: 'I will not be able to make it to the office tomorrow due to personal reasons.',
    professionalEnglish: 'I would like to request leave for tomorrow due to a prior personal commitment. I will ensure all urgent tasks are handed over.',
    explanation: 'Use "personal commitment" or "personal matters" instead of over-explaining private family details.',
    grammarNote: '"I will not be able to attend" is polite, definitive, and professional.',
    keyVocabulary: [
      { telugu: 'రాలేను', transliteration: 'raaleenu', english: 'will be unable to attend', meaning: 'cannot be present' },
      { telugu: 'వ్యక్తిగత పని', transliteration: 'vyakthigatha pani', english: 'personal commitment', meaning: 'private obligation' },
    ],
  },
  {
    keywords: ['meeting', 'link', 'call', 'join', 'kaledu'],
    regex: /(meeting.*link|join.*kaledu|call.*disconnect|mic.*pani)/i,
    teluguScript: 'నా మైక్ సరిగ్గా పనిచేయట్లేదు, నన్ను రెండు నిమిషాల్లో మళ్లీ జాయిన్ అవ్వనివ్వండి.',
    transliteration: 'Naa mic sarigga panicheyadam ledu, nannu rendu nimishallo malli join avvanivvandi.',
    naturalEnglish: 'My microphone is not working properly. Please give me two minutes to reconnect.',
    professionalEnglish: 'I am experiencing audio difficulties with my microphone. Allow me two minutes to restart and dial back in.',
    explanation: 'Say "experiencing audio difficulties" or "allow me a moment to reconnect" to project calm technical composure.',
    grammarNote: '"Allow me two minutes" is more assertive and courteous than "Wait for me".',
    keyVocabulary: [
      { telugu: 'పనిచేయట్లేదు', transliteration: 'panicheyadam ledu', english: 'malfunctioning / experiencing issues', meaning: 'not operating' },
      { telugu: 'మళ్లీ జాయిన్', transliteration: 'malli join', english: 'reconnect / dial back in', meaning: 're-enter the call' },
    ],
  },
  {
    keywords: ['bhayam', 'interview', 'tension', 'nervous', 'english'],
    regex: /(interview.*bhayam|english.*matladatam|tension.*ga.*undi|nervous)/i,
    teluguScript: 'నాకు ఇంటర్వ్యూలో ఇంగ్లీష్ మాట్లాడటానికి కొంచెం భయంగా, కంగారుగా ఉంది.',
    transliteration: 'Naaku interview lo English matladataniki konchem bhayamga, kangaaruga undi.',
    naturalEnglish: 'I feel a bit nervous about speaking English during the interview.',
    professionalEnglish: 'I sometimes experience hesitation when articulating my thoughts in English during high-stakes interviews.',
    explanation: 'It is completely normal to feel nervous. In an interview, take slow breaths, speak in shorter sentences, and pause intentionally.',
    grammarNote: '"I feel nervous about speaking" pairs the adjective "nervous" with the preposition "about" and a gerund ("speaking").',
    keyVocabulary: [
      { telugu: 'భయంగా / కంగారుగా', transliteration: 'bhayamga / kangaaruga', english: 'nervous / hesitant', meaning: 'apprehensive under pressure' },
      { telugu: 'మాట్లాడటానికి', transliteration: 'matladataniki', english: 'speaking / articulating', meaning: 'verbalizing ideas' },
    ],
  },
  {
    keywords: ['access', 'permission', 'sharepoint', 'server', 'kavali'],
    regex: /(access.*kavali|permission.*ivvandi|sharepoint.*open.*kaledu)/i,
    teluguScript: 'ఈ షేర్‌పాయింట్ ఫోల్డర్‌ను యాక్సెస్ చేయడానికి నాకు పర్మిషన్ కావాలి.',
    transliteration: 'Ee SharePoint folder nu access cheyadaniki naaku permission kaavali.',
    naturalEnglish: 'I need access permission to open this SharePoint folder.',
    professionalEnglish: 'Could you please grant me read and write permissions for this SharePoint repository so I can proceed with the automation?',
    explanation: 'Always include the business justification (e.g. "so I can proceed with the automation") when requesting access.',
    grammarNote: '"Could you please grant me..." is the gold-standard IT request phrasing.',
    keyVocabulary: [
      { telugu: 'యాక్సెస్ పర్మిషన్', transliteration: 'access permission', english: 'system authorization / access', meaning: 'credentials to view/edit' },
      { telugu: 'కొనసాగించడానికి', transliteration: 'konasaginchadaniki', english: 'so I can proceed', meaning: 'in order to continue work' },
    ],
  },
];

class TeluguService {
  /**
   * Detects whether text is Telugu script, Romanized Telugu transliteration, or English
   */
  public detectLanguage(text: string): 'telugu' | 'telugu_transliteration' | 'english' {
    if (!text || !text.trim()) return 'english';

    // Check Telugu Unicode range \u0C00-\u0C7F
    const teluguUnicodeRegex = /[\u0C00-\u0C7F]/;
    if (teluguUnicodeRegex.test(text)) {
      return 'telugu';
    }

    // Check Romanized Telugu keywords
    const lower = text.toLowerCase();
    const words = lower.split(/[\s,?.!]+/);
    let teluguMatchCount = 0;

    for (const w of words) {
      if (TELUGU_KEYWORDS.includes(w)) {
        teluguMatchCount++;
      }
    }

    if (teluguMatchCount >= 1 || (words.length > 0 && teluguMatchCount / words.length >= 0.2)) {
      return 'telugu_transliteration';
    }

    return 'english';
  }

  /**
   * Synchronous pattern and heuristic translation for instant UI rendering and voice calls
   */
  public translateTelugu(input: string): TeluguTranslationResult {
    const trimmed = input.trim();
    const detected = this.detectLanguage(trimmed);
    const lower = trimmed.toLowerCase();

    for (const pattern of COMMON_PATTERNS) {
      if (pattern.regex && pattern.regex.test(lower)) {
        return {
          detectedLanguage: detected,
          originalInput: trimmed,
          teluguScript: pattern.teluguScript,
          transliteration: pattern.transliteration,
          naturalEnglish: pattern.naturalEnglish,
          professionalEnglish: pattern.professionalEnglish,
          explanation: pattern.explanation,
          grammarNote: pattern.grammarNote,
          keyVocabulary: pattern.keyVocabulary,
          suggestedFollowUpPrompt: `Practise saying: "${pattern.naturalEnglish}" aloud with confident rhythm.`,
        };
      }

      // Keyword density match
      const matched = pattern.keywords.filter((k) => lower.includes(k));
      if (matched.length >= 2) {
        return {
          detectedLanguage: detected,
          originalInput: trimmed,
          teluguScript: pattern.teluguScript,
          transliteration: pattern.transliteration,
          naturalEnglish: pattern.naturalEnglish,
          professionalEnglish: pattern.professionalEnglish,
          explanation: pattern.explanation,
          grammarNote: pattern.grammarNote,
          keyVocabulary: pattern.keyVocabulary,
          suggestedFollowUpPrompt: `Practise saying: "${pattern.naturalEnglish}" aloud with confident rhythm.`,
        };
      }
    }

    return this.generateHeuristicTranslation(trimmed, detected);
  }

  /**
   * Translates Telugu script or transliterated text into natural English and professional workplace English
   */
  public async translateTeluguToEnglish(
    input: string,
    apiKey?: string
  ): Promise<TeluguTranslationResult> {
    const trimmed = input.trim();

    // If API key is provided and valid, call AI for bespoke translation
    if (apiKey) {
      try {
        const aiResult = await this.translateWithAI(trimmed, apiKey);
        if (aiResult) return aiResult;
      } catch (err) {
        console.warn('AI Telugu translation fallback to local pattern matching:', err);
      }
    }

    return this.translateTelugu(trimmed);
  }

  /**
   * General heuristic translation builder for sentences not covered by exact patterns
   */
  private generateHeuristicTranslation(
    text: string,
    detected: 'telugu' | 'telugu_transliteration' | 'english'
  ): TeluguTranslationResult {
    // Generate helpful contextual translation
    const lower = text.toLowerCase();
    let natural = '';
    let professional = '';
    let explanation = '';

    if (lower.includes('late') || lower.includes('vastanu')) {
      natural = 'I will be arriving a little late today.';
      professional = 'I wanted to notify you that my arrival will be slightly delayed today.';
      explanation = 'Use "notify you" or "inform you" for a polished corporate email or message.';
    } else if (lower.includes('cheppali') || lower.includes('adagali')) {
      natural = 'I would like to discuss this with you when you have a moment.';
      professional = 'Could we schedule five minutes to discuss this at your earliest convenience?';
      explanation = '"At your earliest convenience" is the universal executive polite phrasing.';
    } else if (lower.includes('ardham') || lower.includes('kaledu')) {
      natural = 'Could you explain that one more time? I want to make sure I got it right.';
      professional = 'Could you please elaborate on that point to ensure our team is completely aligned?';
      explanation = '"Elaborate" is an articulate synonym for "explain more".';
    } else if (lower.includes('chesanu') || lower.includes('complete')) {
      natural = 'I have completed this task and it is ready for your review.';
      professional = 'The deliverable has been finalized and submitted for stakeholder review.';
      explanation = 'Highlight the deliverable rather than yourself to sound strategic.';
    } else {
      natural = `In English, you can say: "${text}" expressed clearly with confidence.`;
      professional = `Professional version: I would like to communicate regarding this task proactively.`;
      explanation = 'Structure your thought as: 1) What is happening, 2) Why it matters, 3) What the next step is.';
    }

    return {
      detectedLanguage: detected,
      originalInput: text,
      teluguScript: detected === 'telugu' ? text : 'నా ఆలోచనను స్పష్టంగా ఇంగ్లీష్‌లో చెప్పాలనుకుంటున్నాను.',
      transliteration: detected === 'telugu' ? 'Mee aalochana' : text,
      naturalEnglish: natural,
      professionalEnglish: professional,
      explanation: explanation,
      grammarNote: 'In English, sentences follow Subject + Verb + Object order, whereas Telugu often uses Subject + Object + Verb.',
      keyVocabulary: [
        { telugu: 'స్పష్టంగా', transliteration: 'spashtamga', english: 'clearly / concisely', meaning: 'free of ambiguity' },
        { telugu: 'ఆలోచన', transliteration: 'aalochana', english: 'perspective / idea', meaning: 'viewpoint or proposal' },
      ],
      suggestedFollowUpPrompt: `Try repeating: "${natural}"`,
    };
  }

  /**
   * Gemini / OpenAI translation with structured JSON output
   */
  private async translateWithAI(text: string, apiKey: string): Promise<TeluguTranslationResult | null> {
    const isGemini = apiKey.startsWith('AIza');
    const prompt = `You are a world-class Telugu-to-English soft-skills translator and speech coach.
The user input is: "${text}". It may be in Telugu script (తెలుగు) or Romanized Telugu transliteration (e.g. "nenu office ki late ga vastanu").
Analyze the Telugu input and provide:
1. Detected language (telugu, telugu_transliteration, or english)
2. Accurate Telugu script
3. Transliteration in Latin alphabet
4. Natural, everyday conversational English translation
5. Executive professional workplace English alternative
6. Simple, encouraging explanation of the vocabulary and sentence structure
7. Brief grammar note contrasting Telugu and English structure
8. Key vocabulary words (with telugu, transliteration, english, meaning)

Return ONLY valid JSON matching this structure:
{
  "detectedLanguage": "telugu" | "telugu_transliteration" | "english",
  "originalInput": "${text}",
  "teluguScript": "...",
  "transliteration": "...",
  "naturalEnglish": "...",
  "professionalEnglish": "...",
  "explanation": "...",
  "grammarNote": "...",
  "keyVocabulary": [
    { "telugu": "...", "transliteration": "...", "english": "...", "meaning": "..." }
  ],
  "suggestedFollowUpPrompt": "..."
}`;

    if (isGemini) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(raw);
    } else {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return JSON.parse(data.choices?.[0]?.message?.content);
    }
  }
}

export const teluguService = new TeluguService();
