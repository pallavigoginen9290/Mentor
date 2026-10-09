// Daily Inspiration, Motivational Quotes, Word of the Day, and Executive Micro-Habits

export interface DailyQuote {
  id: string;
  quote: string;
  author: string;
  authorRole: string;
  category: 'Confidence' | 'Eloquence' | 'Leadership' | 'Courage' | 'Clarity' | 'Mindset';
  energyBoostReason: string;
  actionableApplication: string;
  tags: string[];
}

export interface DailyWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  workplaceExample: string;
  casualExample: string;
  synonyms: string[];
  powerTip: string;
  category: string;
}

export interface DailyMicroHabit {
  id: string;
  title: string;
  category: string;
  problemPhrase: string;
  powerAlternative: string;
  whyItWorks: string;
  quickChallenge: string;
}

export interface VocalWarmUpStep {
  id: string;
  stepNumber: number;
  title: string;
  durationSeconds: number;
  instructions: string;
  drillText?: string;
  benefit: string;
}

export const DAILY_QUOTES: DailyQuote[] = [
  {
    id: 'dq_1',
    quote: 'Confidence is not "they will like me." Confidence is "I’ll be fine even if they don’t."',
    author: 'Christina Grimmie',
    authorRole: 'Artist & Speaker',
    category: 'Confidence',
    energyBoostReason: 'Removes the anxiety of seeking approval. You belong in every room you enter.',
    actionableApplication: 'Speak your point with calm conviction today without apologizing for having an opinion.',
    tags: ['Self-Worth', 'Executive Presence', 'Calmness'],
  },
  {
    id: 'dq_2',
    quote: 'Words have energy and power with the ability to help, to heal, to hinder, to hurt, to harm, to humiliate, and to humble.',
    author: 'Maya Angelou',
    authorRole: 'Poet, Orator & Civil Rights Leader',
    category: 'Eloquence',
    energyBoostReason: 'Your voice is your greatest instrument. When you speak with intention, people lean in.',
    actionableApplication: 'Choose one uplifting, encouraging phrase to share with a colleague or peer today.',
    tags: ['Impact', 'Mindful Speaking', 'Influence'],
  },
  {
    id: 'dq_3',
    quote: 'The most important thing in communication is hearing what isn’t said.',
    author: 'Peter Drucker',
    authorRole: 'Father of Modern Management',
    category: 'Clarity',
    energyBoostReason: 'Sharpening your listening turns you from a regular speaker into an indispensable strategic partner.',
    actionableApplication: 'Pause for two full seconds before answering questions today to truly absorb the other person’s intent.',
    tags: ['Active Listening', 'Insight', 'Empathy'],
  },
  {
    id: 'dq_4',
    quote: 'You don’t have to be great to start, but you have to start to be great.',
    author: 'Zig Ziglar',
    authorRole: 'Master Motivator & Author',
    category: 'Courage',
    energyBoostReason: 'Every articulate leader you admire once stumbled over their words. Fluency is built rep by rep.',
    actionableApplication: 'Volunteer to give the first status update or ask the first question in your next meeting.',
    tags: ['Initiative', 'Action', 'Growth Mindset'],
  },
  {
    id: 'dq_5',
    quote: 'Speak clearly, if you speak at all; carve every word before you let it fall.',
    author: 'Oliver Wendell Holmes Sr.',
    authorRole: 'Scholar & Jurist',
    category: 'Eloquence',
    energyBoostReason: 'Speed is not fluency. A measured, deliberate tempo commands immediate authority and respect.',
    actionableApplication: 'Slow your speaking rate by 15% today. Notice how much more weight every syllable carries.',
    tags: ['Pacing', 'Articulation', 'Poise'],
  },
  {
    id: 'dq_6',
    quote: 'Courage starts with showing up and letting ourselves be seen.',
    author: 'Dr. Brené Brown',
    authorRole: 'Research Professor & Best-Selling Author',
    category: 'Courage',
    energyBoostReason: 'You do not need to be flawless to be persuasive. Authenticity beats rehearsed perfection every time.',
    actionableApplication: 'Share an honest perspective or an innovative idea even if it is not fully baked yet.',
    tags: ['Vulnerability', 'Presence', 'Authenticity'],
  },
  {
    id: 'dq_7',
    quote: 'If you can’t explain it simply, you don’t understand it well enough.',
    author: 'Albert Einstein',
    authorRole: 'Theoretical Physicist',
    category: 'Clarity',
    energyBoostReason: 'True mastery is simplicity. Stripping away jargon creates instant connection with any listener.',
    actionableApplication: 'Explain your current project or technical task using everyday metaphors anyone can grasp.',
    tags: ['Simplicity', 'Technical Articulation', 'Clarity'],
  },
  {
    id: 'dq_8',
    quote: 'Leadership is about making others better as a result of your presence and making sure that impact lasts in your absence.',
    author: 'Sheryl Sandberg',
    authorRole: 'Technology Executive & Author',
    category: 'Leadership',
    energyBoostReason: 'Your words can clarify direction, remove fear, and inspire confidence in everyone around you.',
    actionableApplication: 'Highlight a teammate’s contribution publicly in a discussion or update today.',
    tags: ['Empowerment', 'Leadership', 'Presence'],
  },
  {
    id: 'dq_9',
    quote: 'Do not wait for leaders; do it alone, person to person.',
    author: 'Mother Teresa',
    authorRole: 'Humanitarian & Nobel Laureate',
    category: 'Courage',
    energyBoostReason: 'Small individual connections create monumental shifts in team chemistry and mutual trust.',
    actionableApplication: 'Reach out to someone new today with a warm, genuine "How are things going on your end?"',
    tags: ['Connection', 'Warmth', 'Proactivity'],
  },
  {
    id: 'dq_10',
    quote: 'The single biggest problem in communication is the illusion that it has taken place.',
    author: 'George Bernard Shaw',
    authorRole: 'Nobel Laureate Playwright',
    category: 'Clarity',
    energyBoostReason: 'Assuming understanding leads to friction. Confirming alignment leads to extraordinary success.',
    actionableApplication: 'End key discussions with a crisp summary: "To confirm our mutual next steps, I will..."',
    tags: ['Alignment', 'Directness', 'Accountability'],
  },
  {
    id: 'dq_11',
    quote: 'Believe you can and you’re halfway there.',
    author: 'Theodore Roosevelt',
    authorRole: '26th U.S. President',
    category: 'Confidence',
    energyBoostReason: 'Your posture, eye contact, and tone will naturally mirror whatever you believe about yourself.',
    actionableApplication: 'Stand tall, roll your shoulders back, take a deep breath, and smile before speaking.',
    tags: ['Self-Efficacy', 'Body Language', 'Energy'],
  },
  {
    id: 'dq_12',
    quote: 'Tact is the knack of making a point without making an enemy.',
    author: 'Isaac Newton',
    authorRole: 'Mathematician & Astronomer',
    category: 'Leadership',
    energyBoostReason: 'Diplomacy is not weakness; it is the ultimate expression of emotional intelligence and influence.',
    actionableApplication: 'When disagreeing today, frame it around the shared objective: "I share the same goal, and I see another path..."',
    tags: ['Diplomacy', 'Tact', 'Influence'],
  },
  {
    id: 'dq_13',
    quote: 'It’s not what you say, it’s how you make them feel.',
    author: 'Maya Angelou',
    authorRole: 'Author & Orator',
    category: 'Eloquence',
    energyBoostReason: 'People forget 80% of what was spoken, but they never forget whether you made them feel valued.',
    actionableApplication: 'Express genuine appreciation before diving into the transactional details of a task.',
    tags: ['Empathy', 'Rapport', 'Impact'],
  },
  {
    id: 'dq_14',
    quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill',
    authorRole: 'Statesman & Orator',
    category: 'Mindset',
    energyBoostReason: 'Stumbling over a sentence or mispronouncing a word is just a rep. Brush it off and keep speaking.',
    actionableApplication: 'If you lose your train of thought today, pause calmly, smile, and say: "Allow me to reframe that."',
    tags: ['Resilience', 'Composure', 'Grit'],
  },
  {
    id: 'dq_15',
    quote: 'Your voice is your signature. Own it, nurture it, and let it ring with conviction.',
    author: 'Julian Treasure',
    authorRole: 'Sound & Communication Expert',
    category: 'Confidence',
    energyBoostReason: 'There is only one voice like yours in the entire world. Use it without hesitation.',
    actionableApplication: 'Speak from your diaphragm rather than your throat to give your tone warmth and resonance.',
    tags: ['Vocal Tone', 'Conviction', 'Authenticity'],
  },
  {
    id: 'dq_16',
    quote: 'Simplicity is the ultimate sophistication.',
    author: 'Leonardo da Vinci',
    authorRole: 'Renaissance Polymath',
    category: 'Clarity',
    energyBoostReason: 'Cut the clutter. When your message is direct and crystal clear, decision-makers take instant action.',
    actionableApplication: 'Challenge yourself to deliver your main status update in three crisp, potent bullet points.',
    tags: ['Conciseness', 'Executive Summary', 'Precision'],
  },
  {
    id: 'dq_17',
    quote: 'They may forget what you said, but they will never forget how you made them feel.',
    author: 'Carl W. Buehner',
    authorRole: 'Leader & Speaker',
    category: 'Eloquence',
    energyBoostReason: 'Infuse warmth, energy, and validation into your conversations to stand out as a magnetic communicator.',
    actionableApplication: 'Acknowledge someone’s effort specifically: "I really admired how thoroughly you handled that."',
    tags: ['Warmth', 'Charisma', 'Validation'],
  },
  {
    id: 'dq_18',
    quote: 'Doubt kills more dreams than failure ever will.',
    author: 'Suzy Kassem',
    authorRole: 'Writer & Poet',
    category: 'Confidence',
    energyBoostReason: 'Hesitation wastes brilliance. When an insight pops into your mind, speak it before second-guessing yourself.',
    actionableApplication: 'Count down: 3... 2... 1... and unmute yourself to voice your idea without waiting for permission.',
    tags: ['Overcoming Hesitation', 'Boldness', 'Action'],
  },
  {
    id: 'dq_19',
    quote: 'A good listener is not only popular everywhere, but after a while he knows something.',
    author: 'Wilson Mizner',
    authorRole: 'Playwright & Raconteur',
    category: 'Clarity',
    energyBoostReason: 'Listening gives you all the ammunition you need to craft the perfect, laser-focused response.',
    actionableApplication: 'Summarize the speaker’s premise before presenting your solution: "If I heard you correctly, the core issue is..."',
    tags: ['Active Listening', 'Comprehension', 'Tact'],
  },
  {
    id: 'dq_20',
    quote: 'The way we communicate with others and with ourselves ultimately determines the quality of our lives.',
    author: 'Tony Robbins',
    authorRole: 'Author & Peak Performance Coach',
    category: 'Mindset',
    energyBoostReason: 'Improving your communication changes how managers see you, how peers treat you, and how you see yourself.',
    actionableApplication: 'Eliminate negative self-talk today: Replace "I’m bad at public speaking" with "I am improving every day."',
    tags: ['Self-Talk', 'Growth', 'Mastery'],
  },
];

export const DAILY_WORDS: DailyWord[] = [
  {
    id: 'dw_1',
    word: 'Articulate',
    phonetic: '/ɑːrˈtɪk.jə.leɪt/',
    partOfSpeech: 'verb & adjective',
    meaning: 'To express an idea, thought, or feeling fluently and coherently.',
    workplaceExample: 'She articulated the technical migration strategy so clearly that both engineers and clients were fully aligned.',
    casualExample: 'He was able to articulate why he wanted to change career paths.',
    synonyms: ['Express', 'Enunciate', 'Elucidate', 'Formulate'],
    powerTip: 'Use in reviews and interviews: "I excel at articulating complex architecture to non-technical stakeholders."',
    category: 'Executive Eloquence',
  },
  {
    id: 'dw_2',
    word: 'Proactive',
    phonetic: '/proʊˈæk.tɪv/',
    partOfSpeech: 'adjective',
    meaning: 'Creating or controlling a situation rather than just reacting to it after it happens.',
    workplaceExample: 'By taking a proactive approach to database indexing, we eliminated the latency bottleneck before launch.',
    casualExample: 'She was proactive and packed an umbrella before checking the forecast.',
    synonyms: ['Anticipatory', 'Enterprising', 'Driven', 'Forward-looking'],
    powerTip: 'Replace "I waited for instructions" with "I took a proactive step to audit the preliminary schemas."',
    category: 'Leadership & Initiative',
  },
  {
    id: 'dw_3',
    word: 'Concise',
    phonetic: '/kənˈsaɪs/',
    partOfSpeech: 'adjective',
    meaning: 'Giving a lot of information clearly and in a few words; brief but comprehensive.',
    workplaceExample: 'His executive summary was remarkably concise, capturing a 40-page audit in three bullet points.',
    casualExample: 'Keep your text message concise so everyone reads the address quickly.',
    synonyms: ['Succinct', 'Pithy', 'Brief', 'Compact'],
    powerTip: 'Executives value conciseness above almost everything else. Deliver the bottom-line answer first.',
    category: 'Clarity & Precision',
  },
  {
    id: 'dw_4',
    word: 'Consensus',
    phonetic: '/kənˈsen.səs/',
    partOfSpeech: 'noun',
    meaning: 'A general agreement arrived at by mutual discussion and collaboration.',
    workplaceExample: 'After evaluating three architecture options, the team reached consensus on using asynchronous message queues.',
    casualExample: 'The family reached a consensus on which movie to watch tonight.',
    synonyms: ['Agreement', 'Accord', 'Harmony', 'Concurrence'],
    powerTip: 'Use in meeting wrap-ups: "Let us make sure we establish consensus before finalizing sprint scope."',
    category: 'Meeting Leadership',
  },
  {
    id: 'dw_5',
    word: 'Nuance',
    phonetic: '/ˈnuː.ɑːns/',
    partOfSpeech: 'noun',
    meaning: 'A subtle difference or distinction in meaning, tone, expression, or response.',
    workplaceExample: 'Her diplomatic reply captured every nuance of the client’s feedback without conceding our timeline.',
    casualExample: 'I noticed a subtle nuance in her voice that told me she was thrilled.',
    synonyms: ['Subtlety', 'Distinction', 'Finesse', 'Shade'],
    powerTip: 'Use when analyzing issues: "There is an important architectural nuance between these two APIs."',
    category: 'Critical Thinking',
  },
  {
    id: 'dw_6',
    word: 'Spearhead',
    phonetic: '/ˈspɪr.hed/',
    partOfSpeech: 'verb',
    meaning: 'To lead an attack, movement, initiative, or complex campaign from the forefront.',
    workplaceExample: 'Pallavi spearheaded the automation rollout that saved the operations team twenty hours per week.',
    casualExample: 'He spearheaded our neighborhood cleanup drive over the weekend.',
    synonyms: ['Pioneer', 'Lead', 'Champion', 'Steer'],
    powerTip: 'High-impact resume and interview verb. Highlight what you spearheaded instead of merely "worked on."',
    category: 'Career & Interviews',
  },
  {
    id: 'dw_7',
    word: 'Resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    partOfSpeech: 'adjective',
    meaning: 'Able to withstand or recover quickly from difficult conditions, setbacks, or system faults.',
    workplaceExample: 'We designed a resilient error-handling mechanism that graceful restarts background parsing workers.',
    casualExample: 'She stayed remarkably resilient despite the sudden travel cancellations.',
    synonyms: ['Robust', 'Tenacious', 'Adaptive', 'Sturdy'],
    powerTip: 'Applies both to technical systems ("resilient infrastructure") and character ("resilient composure").',
    category: 'Technical & Personal',
  },
  {
    id: 'dw_8',
    word: 'Candor',
    phonetic: '/ˈkæn.dɚ/',
    partOfSpeech: 'noun',
    meaning: 'The quality of being open, sincere, and direct in speech or expression; honest frankness.',
    workplaceExample: 'I appreciate your candor regarding the project timeline; now we can calibrate realistic milestones.',
    casualExample: 'Her refreshingly honest candor made everyone feel comfortable sharing their true feelings.',
    synonyms: ['Frankness', 'Openness', 'Honesty', 'Directness'],
    powerTip: 'Praise colleagues with: "Thank you for your candor in this retrospective; it helped us fix the root issue."',
    category: 'Workplace Culture',
  },
  {
    id: 'dw_9',
    word: 'Mitigate',
    phonetic: '/ˈmɪt̬.ə.ɡeɪt/',
    partOfSpeech: 'verb',
    meaning: 'To make something bad, painful, or dangerous less severe, serious, or painful.',
    workplaceExample: 'To mitigate the risk of downtime during deployment, we scheduled the update during off-peak hours.',
    casualExample: 'Drinking herbal tea helped mitigate his headache.',
    synonyms: ['Alleviate', 'Diminish', 'Lessen', 'Cushion'],
    powerTip: 'Never just report a risk; always present your strategy to mitigate that risk in the same breath.',
    category: 'Risk & Strategy',
  },
  {
    id: 'dw_10',
    word: 'Equanimity',
    phonetic: '/ˌek.wəˈnɪm.ə.t̬i/',
    partOfSpeech: 'noun',
    meaning: 'Mental calmness, composure, and evenness of temper, especially in a difficult situation.',
    workplaceExample: 'She handled the critical production outage with remarkable equanimity, guiding the team without panic.',
    casualExample: 'He accepted the unexpected news with calm equanimity.',
    synonyms: ['Composure', 'Poise', 'Serenity', 'Self-control'],
    powerTip: 'Executive presence is largely defined by equanimity—how calm your voice sounds under pressure.',
    category: 'Executive Presence',
  },
  {
    id: 'dw_11',
    word: 'Holistic',
    phonetic: '/hoʊˈlɪs.tɪk/',
    partOfSpeech: 'adjective',
    meaning: 'Characterized by the treatment or consideration of the whole entity, rather than just parts.',
    workplaceExample: 'We took a holistic view of the customer onboarding journey instead of just debugging the signup screen.',
    casualExample: 'She adopted a holistic lifestyle incorporating nutrition, sleep, and mindfulness.',
    synonyms: ['Comprehensive', 'Integrated', 'All-inclusive', 'Global'],
    powerTip: 'Demonstrates senior leadership thinking: "Let us adopt a holistic lens before rewriting this module."',
    category: 'Strategic Vision',
  },
  {
    id: 'dw_12',
    word: 'Fulfill',
    phonetic: '/fʊlˈfɪl/',
    partOfSpeech: 'verb',
    meaning: 'To achieve or carry out a duty, promise, requirement, or anticipated potential.',
    workplaceExample: 'The updated software pipeline fulfilled all stringent enterprise compliance benchmarks.',
    casualExample: 'She fulfilled her lifelong dream of running a marathon.',
    synonyms: ['Execute', 'Accomplish', 'Satisfy', 'Realize'],
    powerTip: 'Emphasize reliability: "Our objective is to fulfill all functional acceptance criteria ahead of schedule."',
    category: 'Delivery & Excellence',
  },
];

export const DAILY_MICRO_HABITS: DailyMicroHabit[] = [
  {
    id: 'dmh_1',
    title: 'The 2-Second Silence Rule',
    category: 'Executive Presence',
    problemPhrase: 'Blurting out "Um, yeah, so basically..." the microsecond someone stops speaking.',
    powerAlternative: 'Take a calm 2-second breath, nod thoughtfully, then speak with measured rhythm.',
    whyItWorks: 'A brief intentional pause makes you appear composed, reflective, and completely in control of the room.',
    quickChallenge: 'In your next call today, count 2 seconds of silence before answering the first question.',
  },
  {
    id: 'dmh_2',
    title: 'Replace "Does that make sense?"',
    category: 'Assertiveness & Clarity',
    problemPhrase: '"...does that make sense? Did I explain that right?" (Undermines your authority and competence).',
    powerAlternative: '"What are your thoughts on this approach?" or "How does that align with your expectations?"',
    whyItWorks: 'Shifts the focus from doubting your own ability to inviting strategic collaboration.',
    quickChallenge: 'Catch yourself before saying "Does that make sense?" and swap it for "I’d love to hear your perspective."',
  },
  {
    id: 'dmh_3',
    title: 'The BLUF Rule (Bottom Line Up Front)',
    category: 'Executive Conciseness',
    problemPhrase: 'Starting with a 5-minute backstory of what went wrong before finally giving the final status.',
    powerAlternative: 'Lead with the verdict in sentence 1, then offer supporting context only if requested.',
    whyItWorks: 'Busy leaders and clients remember the conclusion. Putting it first respects their time and commands attention.',
    quickChallenge: 'Structure your next update email as: 1. Core outcome, 2. Current status, 3. Immediate next step.',
  },
  {
    id: 'dmh_4',
    title: 'Eliminate the Shrinking Word "Just"',
    category: 'Confidence',
    problemPhrase: '"I’m just checking in..." or "I just wanted to ask a quick question..."',
    powerAlternative: '"I am following up on..." or "I have a question regarding..."',
    whyItWorks: 'The word "just" acts as an unconscious apology for taking up space. Removing it elevates your credibility.',
    quickChallenge: 'Delete every occurrence of the word "just" from your outbound messages today.',
  },
  {
    id: 'dmh_5',
    title: 'Replace "Sorry for the delay"',
    category: 'Professional Diplomacy',
    problemPhrase: '"Sorry for being late!" or "Sorry for the delayed reply!" (Frames you as delinquent).',
    powerAlternative: '"Thank you for your patience while I gathered these details!"',
    whyItWorks: 'Praising the other person’s patience transforms a defensive apology into gracious positive reinforcement.',
    quickChallenge: 'Use "Thank you for your patience" instead of "Sorry" in your next response.',
  },
  {
    id: 'dmh_6',
    title: 'The Diplomatic "Yes, And..." Technique',
    category: 'Meeting Participation',
    problemPhrase: '"Yes, but that won’t work because of engineering constraints."',
    powerAlternative: '"I agree with that goal, and to make it feasible within our sprint, we can phase the release."',
    whyItWorks: '"But" negates everything said prior. "And" builds a bridge, making you a constructive problem-solver.',
    quickChallenge: 'Ban the phrase "Yes, but" from all meetings today; replace it with "I see that objective, and..."',
  },
];

export const VOCAL_WARM_UP_STEPS: VocalWarmUpStep[] = [
  {
    id: 'vw_1',
    stepNumber: 1,
    title: 'Diaphragmatic Breath',
    durationSeconds: 15,
    instructions: 'Inhale deeply through your nose for 4 seconds, feeling your stomach expand. Hold 2s. Exhale slowly on a soft "shhh" sound.',
    benefit: 'Releases throat tension and grounds your vocal pitch into an authoritative, calm register.',
  },
  {
    id: 'vw_2',
    stepNumber: 2,
    title: 'Articulation & Enunciation Drill',
    durationSeconds: 20,
    instructions: 'Recite the following sentence 3 times, exaggerating your lip and tongue movements on every consonant:',
    drillText: '"Proper prioritisation and proactive communication produce predictable performance."',
    benefit: 'Wakes up facial muscles, eliminating mumbling and sluggish consonants during presentations.',
  },
  {
    id: 'vw_3',
    stepNumber: 3,
    title: 'Power Affirmation & Resonance',
    durationSeconds: 15,
    instructions: 'Stand tall, roll shoulders back, smile, and speak aloud with warmth and conviction:',
    drillText: '"I speak with clarity, composure, and confidence. My perspective adds genuine value to every conversation."',
    benefit: 'Primes neuro-linguistic confidence, flooding your nervous system with executive presence.',
  },
];

// Helper to deterministically pick daily items by calendar day
export function getDailyInspiration(dayOffset = 0): {
  quote: DailyQuote;
  word: DailyWord;
  habit: DailyMicroHabit;
  dayString: string;
} {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const effectiveDay = dayOfYear + dayOffset;

  const quoteIdx = Math.abs(effectiveDay) % DAILY_QUOTES.length;
  const wordIdx = Math.abs(effectiveDay) % DAILY_WORDS.length;
  const habitIdx = Math.abs(effectiveDay) % DAILY_MICRO_HABITS.length;

  const dayString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return {
    quote: DAILY_QUOTES[quoteIdx],
    word: DAILY_WORDS[wordIdx],
    habit: DAILY_MICRO_HABITS[habitIdx],
    dayString,
  };
}
