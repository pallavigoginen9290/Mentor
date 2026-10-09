import {
  FeedbackReport,
  ScoresBreakdown,
  MistakeDetail,
  VocabularyItem,
  ChatMessage,
  PracticeMode,
  MentorPersona,
  DifficultyLevel,
  AppSettings,
} from '../types';

interface EvaluationContext {
  mode: PracticeMode;
  scenarioTitle: string;
  userResponses: string[];
  allMessages: ChatMessage[];
  persona: MentorPersona;
  difficulty: DifficultyLevel;
}

// Built-in ESL and Indian English workplace common patterns to detect constructively
const COMMON_WORKPLACE_PATTERNS: Array<{
  regex: RegExp;
  better: string;
  explanation: string;
}> = [
  {
    regex: /\b(facing some issues in (this|the) task)\b/i,
    better: 'encountering an issue with this task',
    explanation: 'In professional English, use "encountering an issue with" rather than "facing some issues in".',
  },
  {
    regex: /\b(revert back)\b/i,
    better: 'reply / get back to you',
    explanation: '"Revert" already means return. "Revert back" is redundant; use "reply" or "get back to you".',
  },
  {
    regex: /\b(do the needful)\b/i,
    better: 'take the necessary action / proceed accordingly',
    explanation: '"Do the needful" is considered outdated and archaic in global workplace communication.',
  },
  {
    regex: /\b(I am completed|I am finished the)\b/i,
    better: 'I have completed / I have finished',
    explanation: 'Use the present perfect tense "I have completed" instead of "I am completed".',
  },
  {
    regex: /\b(didn't (got|went|saw|did))\b/i,
    better: "didn't get / see / go",
    explanation: 'After "did not" or "didn\'t", always use the base form of the verb.',
  },
  {
    regex: /\b(myself [a-z]+)\b/i,
    better: 'My name is / I am',
    explanation: 'Avoid starting self-introductions with "Myself...". Say "I am" or "My name is".',
  },
  {
    regex: /\b(passed out from)\b/i,
    better: 'graduated from',
    explanation: '"Passed out" means fainted. Use "graduated from university/college".',
  },
  {
    regex: /\b(discuss about)\b/i,
    better: 'discuss',
    explanation: 'The verb "discuss" already incorporates "about". Say "let\'s discuss the design" instead of "discuss about".',
  },
  {
    regex: /\b(prepone)\b/i,
    better: 'advance / reschedule earlier',
    explanation: '"Prepone" is not widely understood in international offices; use "move up" or "reschedule earlier".',
  },
  {
    regex: /\b(today morning)\b/i,
    better: 'this morning',
    explanation: 'Native speakers say "this morning" rather than "today morning".',
  },
  {
    regex: /\b(yesterday night)\b/i,
    better: 'last night',
    explanation: 'Say "last night" instead of "yesterday night".',
  },
  {
    regex: /\b(I will explain you)\b/i,
    better: 'I will explain to you / I will walk you through',
    explanation: 'The verb "explain" requires the preposition "to": "I will explain to you".',
  },
];

// Curated vocabulary bank for suggestions
const VOCABULARY_SUGGESTIONS: Record<string, VocabularyItem[]> = {
  workplace: [
    {
      word: 'Expedite',
      meaning: 'To make an action or process happen more quickly.',
      simpleExample: 'Can we expedite this request?',
      professionalExample: 'I will coordinate directly with the DBA team to expedite the database index rebuild.',
    },
    {
      word: 'Bandwidth',
      meaning: 'The mental capacity or time required to handle work.',
      simpleExample: 'I do not have time for that today.',
      professionalExample: 'I currently do not have the bandwidth this sprint, but I can prioritize it starting Monday.',
    },
    {
      word: 'Mitigate',
      meaning: 'To make something bad less severe or painful.',
      simpleExample: 'We tried to lessen the damage.',
      professionalExample: 'To mitigate the deployment risk, we will conduct a canary release in staging first.',
    },
    {
      word: 'Pivot',
      meaning: 'To quickly change direction or strategy.',
      simpleExample: 'We changed our plans quickly.',
      professionalExample: 'Given the new API constraints, our team needs to pivot to asynchronous polling.',
    },
  ],
  interview: [
    {
      word: 'Spearheaded',
      meaning: 'Led an activity or initiative from the front.',
      simpleExample: 'I led this new project.',
      professionalExample: 'I spearheaded the migration of our legacy reporting scripts to automated Python pipelines.',
    },
    {
      word: 'Proactive',
      meaning: 'Taking action to control a situation rather than just responding to it.',
      simpleExample: 'I acted before problems happened.',
      professionalExample: 'Taking a proactive approach, I set up automated alerts before memory bottlenecks impacted users.',
    },
    {
      word: 'Optimized',
      meaning: 'Rearranged or rewritten to work at peak efficiency.',
      simpleExample: 'I made the process faster.',
      professionalExample: 'I optimized the ETL execution time by 40% through targeted SQL query restructuring.',
    },
  ],
  general: [
    {
      word: 'Articulate',
      meaning: 'To express thoughts or ideas fluently and coherently.',
      simpleExample: 'He can explain ideas clearly.',
      professionalExample: 'She articulated the architectural trade-offs with exceptional precision.',
    },
    {
      word: 'Consensus',
      meaning: 'A general agreement among a group.',
      simpleExample: 'Everyone agreed on the plan.',
      professionalExample: 'We reached consensus with the product stakeholders on the MVP delivery dates.',
    },
    {
      word: 'Holistic',
      meaning: 'Characterized by the treatment of the whole thing rather than parts.',
      simpleExample: 'Looking at the full picture.',
      professionalExample: 'We took a holistic view of the customer onboarding journey to identify drop-off points.',
    },
  ],
};

export class AIService {
  // Generate conversation turn
  public async generateMentorResponse(
    messages: ChatMessage[],
    context: {
      mode: PracticeMode;
      roleTitle: string;
      topic: string;
      persona: MentorPersona;
      difficulty: DifficultyLevel;
      itSpecific?: boolean;
    },
    settings: AppSettings
  ): Promise<string> {
    // If external API configured, call cloud model
    if (settings.aiProvider === 'gemini' && settings.geminiApiKey) {
      try {
        return await this.callGeminiChat(messages, context, settings.geminiApiKey);
      } catch (err) {
        console.warn('Gemini API call failed, falling back to intelligent mentor engine:', err);
      }
    } else if (settings.aiProvider === 'openai' && settings.openaiApiKey) {
      try {
        return await this.callOpenAIChat(messages, context, settings.openaiApiKey);
      } catch (err) {
        console.warn('OpenAI API call failed, falling back to intelligent mentor engine:', err);
      }
    }

    // Built-in Intelligent Dialogue Engine
    return this.generateBuiltinMentorResponse(messages, context);
  }

  // Generate evaluation & feedback
  public async evaluateSession(
    ctx: EvaluationContext,
    settings: AppSettings
  ): Promise<FeedbackReport> {
    if (settings.aiProvider === 'gemini' && settings.geminiApiKey) {
      try {
        return await this.callGeminiEvaluation(ctx, settings.geminiApiKey);
      } catch (err) {
        console.warn('Gemini eval failed, falling back to local evaluator:', err);
      }
    } else if (settings.aiProvider === 'openai' && settings.openaiApiKey) {
      try {
        return await this.callOpenAIEvaluation(ctx, settings.openaiApiKey);
      } catch (err) {
        console.warn('OpenAI eval failed, falling back to local evaluator:', err);
      }
    }

    return this.generateBuiltinEvaluation(ctx);
  }

  // --- BUILT-IN INTELLIGENT DIALOGUE ENGINE ---
  private generateBuiltinMentorResponse(
    messages: ChatMessage[],
    context: {
      mode: PracticeMode;
      roleTitle: string;
      topic: string;
      persona: MentorPersona;
      difficulty: DifficultyLevel;
      itSpecific?: boolean;
    }
  ): string {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user')?.text || '';
    const userTurnCount = messages.filter((m) => m.sender === 'user').length;

    // Check if user is asking AI to do work for them ("What should I say?")
    if (/what (should|can) i say/i.test(lastUserMsg) || /give me (the )?answer/i.test(lastUserMsg)) {
      return "I want you to think on your feet first! Don't worry about sounding perfect right now. How would you naturally explain this situation to me if I were your manager or client? Give it your best shot, and we'll polish it together right after.";
    }

    // Interview mode natural sequencing
    if (context.mode === 'interview') {
      if (userTurnCount === 1) {
        return `Thank you for sharing that overview. Could you tell me about a specific technical or professional challenge you faced recently, and how you personally went about resolving it?`;
      } else if (userTurnCount === 2) {
        return `That's an interesting approach. What trade-offs or constraints did you have to balance when choosing that solution over alternative options?`;
      } else if (userTurnCount === 3) {
        return `Great insight. If you had to look back at the outcome, what is one thing you would do differently if you faced the exact same situation today?`;
      } else {
        return `Thank you for that thorough breakdown. That gives me a clear picture of your problem-solving style. Would you like to review our conversation feedback now or tackle one more situational question?`;
      }
    }

    // Meeting simulator sequencing
    if (context.mode === 'meeting') {
      if (userTurnCount === 1) {
        return `Good point. However, looking at the Q3 timeline, engineering might push back on that scope. How would you prioritize the deliverables so we don't miss the primary release date?`;
      } else if (userTurnCount === 2) {
        return `I see. Who among the cross-functional teams needs to be informed first, and what kind of support or inputs will you require from QA?`;
      } else {
        return `Alright, team! Pallavi, could you quickly summarize the key decisions and immediate action items we just agreed upon so everyone leaves on the same page?`;
      }
    }

    // Workplace & IT scenario sequencing
    if (context.mode === 'workplace' || context.itSpecific) {
      if (userTurnCount === 1) {
        if (/delay|issue|bug|problem|error|block/i.test(lastUserMsg)) {
          return `I appreciate you bringing this up right away. What is our current mitigation plan, and do you need me or any other senior engineer to intervene or grant elevated access?`;
        } else {
          return `Got it. What are the next steps on your radar for the rest of today, and are there any dependencies that might slow us down?`;
        }
      } else if (userTurnCount === 2) {
        return `Understood. Please keep me posted on Slack once the initial tests pass. When do you think the client or downstream stakeholders will see the updated figures?`;
      } else {
        return `Sounds like a solid, realistic plan. Thanks for handling this with clear communication. Let's wrap up this practice scenario and review how your message came across!`;
      }
    }

    // Think → Speak mode
    if (context.mode === 'think_speak') {
      return `Good initial reaction! You covered the core point. Notice how structuring it into [Acknowledge situation] → [State root cause] → [Provide concrete ETA & contingency] makes your answer sound twice as confident. Let's check your full score!`;
    }

    // Presentation mode
    if (context.mode === 'presentation') {
      return `Thank you for presenting that! You laid down a solid foundation. If someone in the executive audience asked you: "Why should we invest our time and resources into this right now?", how would you summarize the business value in two sentences?`;
    }

    // Daily conversation general
    if (userTurnCount === 1) {
      return `That sounds engaging! What part of that did you find most challenging or interesting, and why?`;
    } else if (userTurnCount === 2) {
      return `I can definitely relate to that. When you run into situations like that, what is your go-to strategy to stay focused and productive?`;
    } else {
      return `It was wonderful chatting about this with you. You expressed yourself naturally. Whenever you're ready, hit "Finish & Evaluate" to see your communication breakdown!`;
    }
  }

  // --- BUILT-IN INTELLIGENT EVALUATOR ---
  private generateBuiltinEvaluation(ctx: EvaluationContext): FeedbackReport {
    const responses = ctx.userResponses;
    const combinedText = responses.join(' ');
    const wordCount = combinedText.split(/\s+/).filter(Boolean).length;
    const sentenceCount = (combinedText.match(/[.!?]+/g) || []).length || 1;
    const avgWordsPerSentence = wordCount / sentenceCount;

    // Detect mistakes
    const detectedMistakes: MistakeDetail[] = [];
    for (const pattern of COMMON_WORKPLACE_PATTERNS) {
      if (pattern.regex.test(combinedText)) {
        const match = combinedText.match(pattern.regex)?.[0] || '';
        detectedMistakes.push({
          original: match,
          better: pattern.better,
          explanation: pattern.explanation,
        });
      }
    }

    // Check for fillers
    const fillerWords = (combinedText.match(/\b(um|uh|like|you know|basically|actually|sort of)\b/gi) || []).length;

    // Check for professional keywords
    const profKeywords = (
      combinedText.match(
        /\b(ensure|deliver|coordinate|resolve|deadline|priority|mitigate|collaborate|optimize|stakeholder|clarify|pipeline|automate|buffer)\b/gi
      ) || []
    ).length;

    // Calculate dynamic scores based on actual user output
    let grammarScore = 7.5;
    if (detectedMistakes.length > 0) grammarScore -= Math.min(2.5, detectedMistakes.length * 0.8);
    if (combinedText.length > 80 && !/[.!?]/.test(combinedText)) grammarScore -= 1.0;

    let vocabScore = 6.8;
    if (profKeywords >= 3) vocabScore += 1.5;
    else if (profKeywords >= 1) vocabScore += 0.8;
    if (wordCount < 15) vocabScore -= 1.0;

    let clarityScore = 7.8;
    if (avgWordsPerSentence > 28) clarityScore -= 1.2; // overly long run-on
    if (avgWordsPerSentence < 5 && wordCount < 20) clarityScore -= 1.0; // too brief

    let confidenceScore = 7.2;
    if (fillerWords > 2) confidenceScore -= 1.2;
    if (/maybe|i think maybe|i guess|sorry to bother/i.test(combinedText)) confidenceScore -= 0.8;
    if (/will deliver|confirmed|ensuring|i am working on/i.test(combinedText)) confidenceScore += 1.0;

    let professionalScore = 7.5;
    if (ctx.mode === 'workplace' || ctx.mode === 'interview') {
      if (profKeywords >= 2) professionalScore += 1.2;
      if (/gonna|wanna|dunno|yeah|nope/i.test(combinedText)) professionalScore -= 1.5;
    }

    let relevanceScore = 8.0;
    if (wordCount < 6) relevanceScore = 5.5;

    let naturalnessScore = 7.4;
    if (fillerWords === 0 && wordCount > 25) naturalnessScore += 0.6;

    let sentenceStructScore = 7.5;
    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 22) sentenceStructScore += 0.8;

    // Normalize all scores to 1-10 with 1 decimal
    const clamp = (val: number) => Math.min(9.8, Math.max(4.0, Number(val.toFixed(1))));

    const scores: ScoresBreakdown = {
      grammar: clamp(grammarScore),
      vocabulary: clamp(vocabScore),
      clarity: clamp(clarityScore),
      confidence: clamp(confidenceScore),
      professionalTone: clamp(professionalScore),
      relevance: clamp(relevanceScore),
      naturalness: clamp(naturalnessScore),
      sentenceStructure: clamp(sentenceStructScore),
    };

    const overallScore = Number(
      (
        Object.values(scores).reduce((a, b) => a + b, 0) /
        Object.values(scores).length
      ).toFixed(1)
    );

    // What you did well (3 points)
    const whatYouDidWell: string[] = [
      'Maintained a constructive, cooperative attitude throughout the dialogue.',
      profKeywords > 0
        ? 'Used relevant workplace terminology to clearly convey your point.'
        : 'Delivered an answer directly without unnecessary hesitation.',
      'Kept communication calm and oriented toward solving the objective.',
    ];

    // What to improve (2-4 points)
    const whatToImprove: string[] = [
      fillerWords > 0
        ? `Reduce filler phrases (found ${fillerWords} instances) to sound more decisive.`
        : 'Incorporate stronger connective signposts (e.g., "Furthermore", "In parallel", "As a result").',
      avgWordsPerSentence > 25
        ? 'Break long compound sentences into two distinct, punchy thoughts.'
        : 'Add concrete timeframes or metrics to reinforce your authority.',
    ];

    if (detectedMistakes.length > 0) {
      whatToImprove.push('Review subtle preposition and tense agreements noted in Common Mistakes below.');
    } else {
      whatToImprove.push('Challenge yourself to swap basic verbs for higher-impact executive verbs.');
    }

    // Better Version construction
    let betterVersion = '';
    const lastUser = responses[responses.length - 1] || 'I will complete the task tomorrow.';
    if (ctx.mode === 'workplace') {
      betterVersion = `I'm currently working through an unforeseen technical bottleneck, but I've scoped a workaround and anticipate delivering the completed update by 3 PM. I'll keep you posted if anything shifts.`;
    } else if (ctx.mode === 'interview') {
      betterVersion = `In my previous role, I navigated a similar deadline challenge by breaking the deliverable into prioritized milestones and maintaining daily stakeholder transparency, which allowed us to ship on schedule.`;
    } else {
      betterVersion = `I really enjoyed tackling that challenge today. It gave me a chance to apply what I learned and test out creative ways to solve the problem more efficiently.`;
    }

    // Vocabulary pick
    const vocabPool =
      ctx.mode === 'interview'
        ? VOCABULARY_SUGGESTIONS.interview
        : ctx.mode === 'workplace'
        ? VOCABULARY_SUGGESTIONS.workplace
        : VOCABULARY_SUGGESTIONS.general;

    return {
      overallScore,
      scores,
      whatYouDidWell,
      whatToImprove,
      commonMistakes:
        detectedMistakes.length > 0
          ? detectedMistakes
          : [
              {
                original: lastUser.slice(0, 50) || 'I am working on this task.',
                better: 'I am actively addressing this priority and will share an update shortly.',
                explanation: 'Using assertive phrasing conveys ownership and managerial presence.',
              },
            ],
      betterVersion,
      retryPrompt: 'Now try answering the same question again in your own words with these improvements.',
      vocabulary: vocabPool.slice(0, 3),
      encouragement:
        overallScore >= 8.0
          ? 'Outstanding execution! Your articulation was crisp, professional, and well-structured.'
          : overallScore >= 6.5
          ? 'Solid practice session! You communicated the core message clearly. Minor tweaks will make it shine.'
          : 'Great effort taking on this challenging scenario! Regular practice will rapidly build your fluency.',
    };
  }

  // --- GOOGLE GEMINI CLOUD INTEGRATION ---
  private async callGeminiChat(
    messages: ChatMessage[],
    context: any,
    apiKey: string
  ): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `You are the AI Soft-Skills & Communication Mentor.
Current Mode: ${context.mode}
Role/Persona: ${context.roleTitle} (${context.persona} style)
Scenario: ${context.topic}
Difficulty: ${context.difficulty}

MENTOR RULES:
1. Act naturally as the persona (${context.roleTitle}).
2. Do NOT interrupt the user for grammar mistakes during conversation. Let them speak!
3. Continue the conversation realistically, ask relevant follow-ups.
4. Keep your response conversational, concise (2-4 sentences max), realistic.
5. If the user asks "what should I say?", encourage them to think and try first.`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I will act realistically in character and mentor constructively.' }] },
      ...messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
    ];

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Could you elaborate on that?';
  }

  private async callGeminiEvaluation(ctx: EvaluationContext, apiKey: string): Promise<FeedbackReport> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are an elite Soft-Skills, English & Corporate Communication Evaluator.
Analyze the user's responses in this ${ctx.mode} session:
Topic: "${ctx.scenarioTitle}"
User's full responses:
${ctx.userResponses.map((r, i) => `${i + 1}. "${r}"`).join('\n')}

Evaluate strictly and return JSON with this EXACT structure:
{
  "overallScore": number (1.0 to 10.0),
  "scores": {
    "grammar": number,
    "vocabulary": number,
    "clarity": number,
    "confidence": number,
    "professionalTone": number,
    "relevance": number,
    "naturalness": number,
    "sentenceStructure": number
  },
  "whatYouDidWell": ["point 1", "point 2", "point 3"],
  "whatToImprove": ["point 1", "point 2", "point 3"],
  "commonMistakes": [
    { "original": "exact text user wrote", "better": "how to rephrase properly", "explanation": "simple explanation" }
  ],
  "betterVersion": "complete natural high-level business response example",
  "retryPrompt": "Now try answering the same question again in your own words.",
  "vocabulary": [
    { "word": "word1", "meaning": "definition", "simpleExample": "simple sentence", "professionalExample": "business sentence" },
    { "word": "word2", "meaning": "definition", "simpleExample": "simple sentence", "professionalExample": "business sentence" },
    { "word": "word3", "meaning": "definition", "simpleExample": "simple sentence", "professionalExample": "business sentence" }
  ],
  "encouragement": "motivational feedback sentence"
}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) throw new Error(`Gemini Eval API error: ${res.statusText}`);
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(raw);
  }

  // --- OPENAI INTEGRATION ---
  private async callOpenAIChat(messages: ChatMessage[], context: any, apiKey: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a Communication Mentor playing role: ${context.roleTitle}. Topic: ${context.topic}. Mode: ${context.mode}. Do not correct minor errors mid-chat; have a natural, realistic dialogue. Keep responses 2-3 sentences.`,
          },
          ...messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        ],
      }),
    });

    if (!res.ok) throw new Error(`OpenAI API error: ${res.statusText}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  }

  private async callOpenAIEvaluation(ctx: EvaluationContext, apiKey: string): Promise<FeedbackReport> {
    const prompt = `Analyze user communication in ${ctx.mode}: "${ctx.scenarioTitle}".
User responses:
${ctx.userResponses.join('\n')}

Return JSON with overallScore (1-10), scores (grammar, vocabulary, clarity, confidence, professionalTone, relevance, naturalness, sentenceStructure all 1-10), whatYouDidWell (3 points), whatToImprove (3 points), commonMistakes [{original, better, explanation}], betterVersion, retryPrompt, vocabulary [{word, meaning, simpleExample, professionalExample}], encouragement.`;

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

    if (!res.ok) throw new Error(`OpenAI Eval API error: ${res.statusText}`);
    const data = await res.json();
    return JSON.parse(data.choices?.[0]?.message?.content);
  }
}

export const aiService = new AIService();
