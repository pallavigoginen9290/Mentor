// Games and Challenges Data Engine

export interface WordBuilderLevel {
  baseWord: string;
  letters: string[];
  validWords: {
    common: string[];
    advanced: string[];
    professional: string[];
  };
  bonusLessons: Array<{ word: string; meaning: string; professionalTip: string }>;
}

export interface SentenceScrambleItem {
  id: string;
  scrambled: string[];
  correctOrder: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  explanation: string;
}

export interface BetterResponseItem {
  id: string;
  scenario: string;
  context: string;
  options: Array<{
    id: string;
    text: string;
    isBest: boolean;
    feedback: string;
  }>;
}

export interface SpotTheMistakeItem {
  id: string;
  incorrectSentence: string;
  correctedSentence: string;
  mistakeCategory: string;
  explanation: string;
}

export interface VocabMatchPair {
  id: string;
  word: string;
  definition: string;
  category: string;
}

export interface ProfessionalOrCasualItem {
  id: string;
  sentence: string;
  correctCategory: 'Professional' | 'Casual' | 'Too Informal' | 'Inappropriate';
  bestProfessionalRewrite: string;
  explanation: string;
}

export interface GuessTheWordItem {
  id: string;
  targetWord: string;
  clues: string[];
  category: string;
}

export interface ForbiddenWordChallenge {
  id: string;
  topic: string;
  forbiddenWords: string[];
  sampleGoodAnswer: string;
  benefitTip: string;
}

export interface ConversationNode {
  id: string;
  character: string;
  statement: string;
  options: Array<{
    text: string;
    feedback: string;
    scoreBonus: number;
    nextNodeId?: string;
    isEnding?: boolean;
    outcomeSummary?: string;
  }>;
}

export const WORD_BUILDER_DATA: WordBuilderLevel[] = [
  {
    baseWord: 'CONFIDENT',
    letters: ['C', 'O', 'N', 'F', 'I', 'D', 'E', 'N', 'T'],
    validWords: {
      common: ['TEN', 'TIE', 'NET', 'NOT', 'ONE', 'FIND', 'FINE', 'COIN', 'INTO', 'NOTE', 'DONE', 'NOON'],
      advanced: ['NOTICE', 'CONFIN', 'INTENT', 'INFECT', 'CONDEN', 'FINITE', 'FICTION'],
      professional: ['CONFIDENT', 'DEFINITE', 'CONTENTION', 'INFECTION', 'CONFIDE'],
    },
    bonusLessons: [
      {
        word: 'Confide',
        meaning: 'To tell someone a secret or personal matter trusting that they will keep it safe.',
        professionalTip: 'Use in workplace: "I confided my team concerns to the senior mentor."',
      },
      {
        word: 'Definite',
        meaning: 'Clearly stated or decided; not vague.',
        professionalTip: 'Replace "maybe soon" with: "We have a definite delivery milestone for Thursday."',
      },
    ],
  },
  {
    baseWord: 'COLLABORATE',
    letters: ['C', 'O', 'L', 'L', 'A', 'B', 'O', 'R', 'A', 'T', 'E'],
    validWords: {
      common: ['BAT', 'CAT', 'RAT', 'TABLE', 'BALL', 'CALL', 'LATE', 'BOAT', 'BEAT', 'ROBE'],
      advanced: ['CORAL', 'LOCATE', 'BALLOT', 'ROTATE', 'COLLAR', 'LABOR', 'RELATE'],
      professional: ['COLLABORATE', 'ALLOCATE', 'CORRELATE', 'ELABORATE', 'TOLERATE'],
    },
    bonusLessons: [
      {
        word: 'Allocate',
        meaning: 'To distribute resources or duties for a particular purpose.',
        professionalTip: 'Say "Let us allocate 3 days to integration testing."',
      },
      {
        word: 'Elaborate',
        meaning: 'To develop or explain in greater detail.',
        professionalTip: 'Say "Could you elaborate on the second requirement?" instead of "explain more".',
      },
    ],
  },
];

export const SENTENCE_SCRAMBLE_DATA: SentenceScrambleItem[] = [
  {
    id: 'scramble_1',
    scrambled: ['tomorrow', 'the', 'complete', 'I', 'task', 'will'],
    correctOrder: ['I', 'will', 'complete', 'the', 'task', 'tomorrow'],
    difficulty: 'Easy',
    category: 'Workplace Commitment',
    explanation: 'Standard English Subject-Verb-Object-Time structure: Subject (I) + Modal Verb (will complete) + Object (the task) + Time adverbial (tomorrow).',
  },
  {
    id: 'scramble_2',
    scrambled: ['issue', 'currently', 'I', 'with', 'am', 'facing', 'an', 'database', 'the'],
    correctOrder: ['I', 'am', 'currently', 'facing', 'an', 'issue', 'with', 'the', 'database'],
    difficulty: 'Medium',
    category: 'Status Updates',
    explanation: 'Placing the adverb "currently" between auxiliary "am" and main verb "facing" sounds smooth and professional.',
  },
  {
    id: 'scramble_3',
    scrambled: ['would', 'I', 'to', 'appreciate', 'opportunity', 'this', 'contribute', 'the'],
    correctOrder: ['I', 'would', 'appreciate', 'the', 'opportunity', 'to', 'contribute', 'to', 'this'],
    difficulty: 'Hard',
    category: 'Interview & Politeness',
    explanation: 'Polite conditional expression: "I would appreciate the opportunity to contribute..." demonstrates high corporate sophistication.',
  },
  {
    id: 'scramble_4',
    scrambled: ['clarify', 'could', 'please', 'the', 'acceptance', 'you', 'criteria'],
    correctOrder: ['Could', 'you', 'please', 'clarify', 'the', 'acceptance', 'criteria'],
    difficulty: 'Easy',
    category: 'Asking Clarification',
    explanation: 'Modal question format: "Could you please [verb] the [noun phrase]?" is courteous and direct.',
  },
];

export const CHOOSE_BETTER_RESPONSE_DATA: BetterResponseItem[] = [
  {
    id: 'cbr_1',
    scenario: 'Your manager asks why an automated report pipeline was delayed by 3 hours.',
    context: 'You encountered an unannounced schema change from a partner API.',
    options: [
      {
        id: 'opt_a',
        text: "I don't know. There are some problems with the third-party side.",
        isBest: false,
        feedback: 'Too passive and sounds dismissive. Avoid "I don\'t know" and vague terms like "some problems".',
      },
      {
        id: 'opt_b',
        text: "The report is delayed because the partner API introduced an unannounced schema change. I'm currently patching our parser and will have it verified and delivered by 3 PM.",
        isBest: true,
        feedback: 'Perfect! Identifies the precise root cause without throwing blame, outlines the active fix, and delivers a realistic ETA.',
      },
      {
        id: 'opt_c',
        text: "It is not my mistake. The external vendor changed their fields without telling our team.",
        isBest: false,
        feedback: 'Defensive. Even when external causes occur, executives look for ownership of the solution rather than finger-pointing.',
      },
    ],
  },
  {
    id: 'cbr_2',
    scenario: 'You did not understand what your director said during a noisy client presentation.',
    context: 'The director gave a complex requirement that everyone else seemed to nod along with.',
    options: [
      {
        id: 'opt_a',
        text: 'What? Can you repeat that again?',
        isBest: false,
        feedback: '"What?" is abrupt and unprofessional in high-stakes meetings.',
      },
      {
        id: 'opt_b',
        text: 'I didn\'t got your point properly, sir.',
        isBest: false,
        feedback: 'Grammar error: "didn\'t got" should be "didn\'t get", and "sir" can sound overly deferential rather than collaborative.',
      },
      {
        id: 'opt_c',
        text: 'Could you please elaborate on that last point regarding client onboarding? I want to ensure our team aligns with the exact requirements.',
        isBest: true,
        feedback: 'Outstanding! Frame needing repetition as a commitment to precision and alignment, not as confusion.',
      },
    ],
  },
  {
    id: 'cbr_3',
    scenario: 'A colleague asks you to finish their testing tasks 20 minutes before you log off for an urgent personal commitment.',
    context: 'You genuinely do not have the bandwidth today.',
    options: [
      {
        id: 'opt_a',
        text: 'No, that is your job, not mine. I have to leave right now.',
        isBest: false,
        feedback: 'Overly aggressive and burns workplace bridges needlessly.',
      },
      {
        id: 'opt_b',
        text: "I'd love to help, but I have a hard stop today at 6 PM. I can walk you through the test script first thing tomorrow morning, or help you ping Raj if it can't wait.",
        isBest: true,
        feedback: 'Exceptional diplomatic assertiveness: Validates intention, sets clear firm boundary with warmth, and offers actionable alternatives.',
      },
      {
        id: 'opt_c',
        text: 'Okay fine, I will stay back and do it for you.',
        isBest: false,
        feedback: 'Over-committing leads to resentment, rushed low-quality work, and missed personal obligations.',
      },
    ],
  },
];

export const SPOT_THE_MISTAKE_DATA: SpotTheMistakeItem[] = [
  {
    id: 'stm_1',
    incorrectSentence: 'Yesterday I am completed the report and send it to my manager.',
    correctedSentence: 'Yesterday I completed the report and sent it to my manager.',
    mistakeCategory: 'Past Tense Consistency',
    explanation: 'When describing actions finished in the past with "yesterday", use simple past verbs: "completed" and "sent", NOT "am completed" or present "send".',
  },
  {
    id: 'stm_2',
    incorrectSentence: 'Please revert back with the updated Excel file as soon as possible.',
    correctedSentence: 'Please get back to me with the updated Excel file as soon as possible.',
    mistakeCategory: 'Redundancy',
    explanation: '"Revert back" is redundant because revert already implies back. Use "reply", "respond", or "get back to me".',
  },
  {
    id: 'stm_3',
    incorrectSentence: 'I didn\'t received the email from the client regarding the new requirements.',
    correctedSentence: 'I didn\'t receive the email from the client regarding the new requirements.',
    mistakeCategory: 'Did + Base Verb Rule',
    explanation: 'After the auxiliary "didn\'t" or "did not", always use the base infinitive form ("receive"), never past tense ("received").',
  },
  {
    id: 'stm_4',
    incorrectSentence: 'We need to discuss about the database migration strategy in today meeting.',
    correctedSentence: 'We need to discuss the database migration strategy in today\'s meeting.',
    mistakeCategory: 'Transitive Verbs & Possessive',
    explanation: 'The verb "discuss" does not take "about" (say "discuss the strategy"). Also use possessive "today\'s meeting".',
  },
  {
    id: 'stm_5',
    incorrectSentence: 'Myself Rahul, working as Senior Software Developer in Bangalore.',
    correctedSentence: 'I am Rahul, and I work as a Senior Software Developer in Bangalore.',
    mistakeCategory: 'Self-Introduction Syntax',
    explanation: 'Never start self-introductions with the reflexive pronoun "Myself". Use "I am [Name]" or "My name is [Name]".',
  },
];

export const VOCAB_MATCH_DATA: VocabMatchPair[] = [
  {
    id: 'vm_1',
    word: 'Clarify',
    definition: 'To make an idea or instruction easier to understand by clearing up confusion.',
    category: 'Communication',
  },
  {
    id: 'vm_2',
    word: 'Delegate',
    definition: 'To assign a specific task or responsibility to a team member or colleague.',
    category: 'Leadership',
  },
  {
    id: 'vm_3',
    word: 'Collaborate',
    definition: 'To work jointly with others toward achieving a shared objective.',
    category: 'Teamwork',
  },
  {
    id: 'vm_4',
    word: 'Resolve',
    definition: 'To find a conclusive and effective solution to a problem or conflict.',
    category: 'Problem Solving',
  },
  {
    id: 'vm_5',
    word: 'Contingency',
    definition: 'A planned course of action designed to address a potential unforeseen future event.',
    category: 'Risk Management',
  },
  {
    id: 'vm_6',
    word: 'Proactive',
    definition: 'Taking deliberate action in advance rather than simply reacting after an event occurs.',
    category: 'Professionalism',
  },
];

export const FORBIDDEN_WORD_DATA: ForbiddenWordChallenge[] = [
  {
    id: 'fw_1',
    topic: 'Explain your job / profession',
    forbiddenWords: ['work', 'job', 'company', 'office', 'computer'],
    sampleGoodAnswer:
      'I spend my days analyzing complex digital processes, writing instructions for automated machines, and collaborating with brilliant peers to solve everyday human inefficiencies.',
    benefitTip: 'Forces you to draw upon descriptive conceptual verbs rather than default repetitive titles.',
  },
  {
    id: 'fw_2',
    topic: 'Explain why a project was delayed',
    forbiddenWords: ['delay', 'late', 'problem', 'bug', 'mistake'],
    sampleGoodAnswer:
      'During thorough verification, we uncovered unexpected data anomalies. To ensure peak stability upon release, our team is refining the schema before greenlighting the launch.',
    benefitTip: 'Teaches executive framing: turns negative vocabulary into quality and diligence signals.',
  },
  {
    id: 'fw_3',
    topic: 'Explain what Python or Excel does',
    forbiddenWords: ['software', 'code', 'data', 'tool', 'file'],
    sampleGoodAnswer:
      'It acts like an obedient digital assistant that takes massive piles of numbers and organizes them into neat summaries in seconds without human fatigue.',
    benefitTip: 'Builds your ability to speak to non-technical stakeholders and leadership with effortless metaphors.',
  },
];

export const CONVERSATION_BRANCH_DATA: ConversationNode = {
  id: 'root',
  character: 'Sarah (Engineering Director)',
  statement:
    'Pallavi, we noticed our weekly client reconciliation pipeline failed this morning. Finance is on edge. Can you explain what happened?',
  options: [
    {
      text: "I'm not sure. Looks like the database servers were behaving weirdly again.",
      feedback: 'Too vague and deflects blame onto infrastructure without concrete diagnostic evidence.',
      scoreBonus: -5,
      nextNodeId: 'node_blame',
    },
    {
      text: "The pipeline failed due to a schema mismatch in today's incoming CSV file. I've isolated the unmapped columns and I'm currently running a dry test with the patched parser. We will be back online within 45 minutes.",
      feedback: 'Outstanding! Direct root cause identification, active isolation status, and a definite 45-minute recovery timeline.',
      scoreBonus: 25,
      nextNodeId: 'node_proactive',
    },
    {
      text: 'Sorry! It was my oversight not checking the file before breakfast.',
      feedback: 'Excessive self-flagellation damages confidence. Focus on the fix, not on self-blame.',
      scoreBonus: 5,
      nextNodeId: 'node_apology',
    },
  ],
};

export const BRANCHING_TREE: Record<string, ConversationNode> = {
  node_proactive: {
    id: 'node_proactive',
    character: 'Sarah (Engineering Director)',
    statement:
      'Thanks for the quick turnaround and crisp update. What can we put in place so this schema change does not catch us off guard next month?',
    options: [
      {
        text: 'I will write an automated schema pre-validator that flags column deviations and pings our channel before the ETL job attempts to execute.',
        feedback: 'Superb engineering maturity! Proactive prevention converts an incident into an architectural win.',
        scoreBonus: 25,
        isEnding: true,
        outcomeSummary: 'Sarah commended your executive composure and recommended you for the technical lead opening!',
      },
      {
        text: 'I guess we can just email the vendor and ask them to be more careful next time.',
        feedback: 'Relying on human memory without systemic safeguards leaves room for future incidents.',
        scoreBonus: 5,
        isEnding: true,
        outcomeSummary: 'The issue was solved, but leadership felt systemic rigor was lacking.',
      },
    ],
  },
  node_blame: {
    id: 'node_blame',
    character: 'Sarah (Engineering Director)',
    statement:
      'Saying the servers were "weird" doesn\'t help us reassure Finance. I need specific details on what broke and who is actively fixing it.',
    options: [
      {
        text: 'My apologies Sarah. Let me pull the error logs immediately, pinpoint the exact exception stack trace, and give you a written update within 15 minutes.',
        feedback: 'Good recovery! Taking immediate ownership and committing to a quick 15-minute diagnostic window.',
        scoreBonus: 15,
        isEnding: true,
        outcomeSummary: 'You recovered gracefully from a shaky start by pivoting to clear facts.',
      },
    ],
  },
  node_apology: {
    id: 'node_apology',
    character: 'Sarah (Engineering Director)',
    statement:
      'Mistakes happen, but let\'s stay focused on resolution. What is our recovery plan right now?',
    options: [
      {
        text: 'I have rolled back the pipeline to yesterday\'s stable snapshot and will re-run the clean transaction batches while we fix the anomaly.',
        feedback: 'Pragmatic, steady operational decision-making.',
        scoreBonus: 20,
        isEnding: true,
        outcomeSummary: 'Situation stabilized calmly. Remember to project confidence from turn 1.',
      },
    ],
  },
};

// --- TYPING PRACTICE ENGINE DATA ---
export interface TypingPassage {
  id: string;
  title: string;
  category: 'Workplace' | 'Technical IT' | 'Interview' | 'Presentation';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  text: string;
  recommendedWpm: number;
  communicationTip: string;
}

export const TYPING_PRACTICE_PASSAGES: TypingPassage[] = [
  {
    id: 'tp_1',
    title: 'Incident Status Escalation',
    category: 'Technical IT',
    difficulty: 'Easy',
    text: 'Good morning team. We have identified a momentary schema mismatch in our automated ingestion pipeline. Our engineering team has isolated the root cause and we expect all data reconciliations to complete within thirty minutes. We will broadcast a follow-up confirmation once production metrics stabilize.',
    recommendedWpm: 45,
    communicationTip: 'Clear, direct communication during incidents prevents panic and demonstrates composure under pressure.',
  },
  {
    id: 'tp_2',
    title: 'Executive Meeting Summary',
    category: 'Workplace',
    difficulty: 'Medium',
    text: 'To summarize our key takeaways: we reached consensus on phasing the deliverable milestones across two sprints. Pallavi will spearhead the client validation workflows, while engineering fortifies our security boundary. Let us convene on Friday afternoon to confirm our integration benchmarks.',
    recommendedWpm: 50,
    communicationTip: 'Action-oriented meeting recaps ensure accountability and aligned ownership across stakeholders.',
  },
  {
    id: 'tp_3',
    title: 'Behavioral Interview STAR Technique',
    category: 'Interview',
    difficulty: 'Medium',
    text: 'When our data pipeline experienced unexpected throttling under peak user load, I took immediate ownership by profiling query execution plans. I introduced partition indexing and asynchronous batching, reducing processing latency by forty percent without increasing infrastructure overhead.',
    recommendedWpm: 55,
    communicationTip: 'Quantifying your achievements in behavioral interviews makes your competence tangible and compelling.',
  },
  {
    id: 'tp_4',
    title: 'Elevator Pitch & Solution Vision',
    category: 'Presentation',
    difficulty: 'Hard',
    text: 'Our initiative bridges the gap between raw data collection and rapid decision-making. By automating tedious spreadsheet reconciliations into real-time analytical dashboards, we liberate business analysts to focus on strategic insights rather than repetitive manual verification.',
    recommendedWpm: 60,
    communicationTip: 'A crisp elevator pitch paints an inspiring picture of value before diving into technical implementation details.',
  },
  {
    id: 'tp_5',
    title: 'Diplomatic Scope & Deadline Negotiation',
    category: 'Workplace',
    difficulty: 'Medium',
    text: 'I completely agree that these additional reporting widgets will add substantial value for our enterprise clients. To guarantee rigorous quality assurance and avoid rushed bugs, I propose we release the fundamental analytics package this Friday, and deploy the extended visual charts in our subsequent release next Tuesday.',
    recommendedWpm: 50,
    communicationTip: 'Saying yes to the goal while structuring realistic milestones projects both empathy and executive responsibility.',
  },
];

// --- WORD CONNECT ENGINE DATA ---
export interface WordConnectLevel {
  id: string;
  levelNumber: number;
  theme: string;
  letters: string[];
  targetWords: string[];
  bonusWords: string[];
  definitions: Record<string, string>;
}

export const WORD_CONNECT_LEVELS: WordConnectLevel[] = [
  {
    id: 'wc_1',
    levelNumber: 1,
    theme: 'Effective Speaking',
    letters: ['S', 'P', 'E', 'A', 'K'],
    targetWords: ['SPEAK', 'PEAK', 'SEAP', 'PEA', 'SEA', 'ASK'],
    bonusWords: ['APE', 'SPA', 'PAS'],
    definitions: {
      SPEAK: 'To express thoughts, opinions, or information using spoken words.',
      PEAK: 'The highest level, maximum point, or greatest period of performance.',
      ASK: 'To make a request, inquire, or solicit clarifying input from others.',
      SEA: 'A vast expanse; often used metaphorically as a sea of possibilities.',
      PEA: 'A small round green seed; symbolizes modest beginnings that grow.',
    },
  },
  {
    id: 'wc_2',
    levelNumber: 2,
    theme: 'Leadership & Tact',
    letters: ['L', 'E', 'A', 'D', 'E', 'R'],
    targetWords: ['LEADER', 'DEALER', 'LEAD', 'DEAL', 'READ', 'DEAR', 'DARE'],
    bonusWords: ['RED', 'ALE', 'EEL', 'EAR', 'ERA', 'LED'],
    definitions: {
      LEADER: 'A person who inspires, guides, and empowers others toward shared goals.',
      DEALER: 'One who negotiates agreements and navigates commercial partnerships.',
      LEAD: 'To guide by direction, initiative, and high ethical standard.',
      DEAL: 'An agreement or arrangement reached through mutual consensus.',
      READ: 'To interpret data, body language, or documentation with sharp acumen.',
      DARE: 'To possess the courageous initiative to propose transformative ideas.',
    },
  },
  {
    id: 'wc_3',
    levelNumber: 3,
    theme: 'Communication Clarity',
    letters: ['C', 'L', 'A', 'R', 'I', 'T', 'Y'],
    targetWords: ['CLARITY', 'CITY', 'CART', 'RAIL', 'CLAY', 'TRAY'],
    bonusWords: ['AIR', 'ART', 'CAT', 'ACT', 'RAY', 'RAT', 'TRY'],
    definitions: {
      CLARITY: 'The quality of being easily understood, transparent, and free from ambiguity.',
      CITY: 'A bustling urban hub representing diversity, commerce, and connection.',
      CART: 'A carrier mechanism; metaphorically carrying data or payloads.',
      RAIL: 'A firm guided pathway ensuring safe and predictable direction.',
      TRAY: 'A flat supportive surface for presenting polished deliverables.',
    },
  },
  {
    id: 'wc_4',
    levelNumber: 4,
    theme: 'Professional Fluency',
    letters: ['F', 'L', 'U', 'E', 'N', 'T'],
    targetWords: ['FLUENT', 'FLUTE', 'LUTE', 'FUEL', 'LEFT', 'TUNE'],
    bonusWords: ['FUN', 'NUT', 'NET', 'LET', 'ELF'],
    definitions: {
      FLUENT: 'Able to articulate ideas effortlessly, smoothly, and with natural confidence.',
      FLUTE: 'A wind instrument producing harmonious, melodious acoustic tones.',
      FUEL: 'That which sustains, energizes, and powers sustained forward momentum.',
      LEFT: 'Departed, or pointing toward unconventional lateral perspectives.',
      TUNE: 'To align or adjust communication until it resonates with your audience.',
    },
  },
  {
    id: 'wc_5',
    levelNumber: 5,
    theme: 'Mentorship Excellence',
    letters: ['M', 'E', 'N', 'T', 'O', 'R'],
    targetWords: ['MENTOR', 'TENOR', 'TERM', 'RENT', 'NOTE', 'MORE', 'TONE'],
    bonusWords: ['MEN', 'NET', 'NOT', 'ONE', 'MET', 'ROT', 'ROE', 'ROTE'],
    definitions: {
      MENTOR: 'A trusted guide who fosters wisdom, confidence, and professional skill.',
      TENOR: 'The prevailing character, drift, or underlying mood of a conversation.',
      TERM: 'A specific workplace word, expression, or stipulated timeframe.',
      NOTE: 'A concise written record capturing vital observations or action items.',
      TONE: 'The expressive quality of voice reflecting attitude, respect, and intent.',
      MORE: 'A continuous yearning for personal mastery and expanded vocabulary.',
    },
  },
];
