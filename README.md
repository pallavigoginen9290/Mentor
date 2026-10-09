# AI Communication Mentor 🎙️✨
> **Your Personal AI Soft-Skills Coach, Workplace Simulator, Interview Partner & Games Platform**

---

## 🌟 Overview
**AI Communication Mentor** is an interactive, gamified soft-skills and English communication platform designed specifically for working professionals, developers, and job seekers. Unlike typical chatbots or conventional language learning tools, it simulates realistic workplace pressure, interviews, team meetings, and spontaneous speaking situations.

The core learning philosophy:
> **"Don't just give the user the answer. Help the user learn how to produce the answer."**

---

## 🔄 Core Learning Cycle
```
Practice ➔ Respond ➔ Evaluation ➔ Feedback ➔ Retry ➔ Improvement ➔ Progress ➔ Challenge
```

---

## 🚀 Key Features

### 1. Main Dashboard
- **Live Communication Score**: Comprehensive weighted 1–10 rating with monthly progress tracking.
- **Streak & Level System**: Streak tracking with recovery encouragement, XP levels from *Level 1 (Beginner)* to *Level 7 (Communication Master)*.
- **Today's XP Goal**: Dynamic progress meter (e.g. `80 / 100 XP`) with smart task recommendations to hit 100%.
- **AI Recommendation Engine**: Dynamically identifies your lowest-scoring dimension and recommends targeted simulations and games.
- **Instant Quick Actions**: One-click access to *Start Practice*, *Play Games*, *Daily Challenge*, and *Mystery Scenario*.

### 2. Practice Arenas & Workplace Simulations
- **Workplace Communication**: Manager, Team Lead, Colleague, Senior Dev, Client, HR, PM, BA.
- **IT-Specific Scenarios**:
  - Automated Excel macro delays & schema changes
  - SQL query data mismatches & Cartesian duplicates
  - Scanned invoice PDF OCR inaccuracies
  - ERP data sync & SharePoint rate limits
- **Interview Simulator**:
  - High-impact 90-second self-introduction
  - Behavioral questions using the **STAR methodology** (Situation, Task, Action, Result)
  - Technical challenge breakdowns & strengths/weaknesses
- **Difficult Workplace Conversations**:
  - Owning a critical reporting error with executive poise
  - Declining last-minute requests diplomatically (*Saying "No" professionally*)
  - Responding to harsh architectural criticism calmly
- **Meeting Simulator & Presentation Practice**:
  - Sprint capacity pushback & decision summarization
  - 2-minute elevator presentations of complex technical workflows
- **Think → Speak Spontaneous Mode**:
  - Timed thinking period to formulate thoughts before delivering spontaneous responses.

### 3. Comprehensive Evaluation & Feedback (8 Dimensions)
Every practice session evaluates:
1. **Grammar** (1–10)
2. **Vocabulary** (1–10)
3. **Clarity** (1–10)
4. **Confidence** (1–10)
5. **Professional Tone** (1–10)
6. **Relevance** (1–10)
7. **Naturalness** (1–10)
8. **Sentence Structure** (1–10)

Feedback includes:
- **What You Did Well** (3 specific strengths)
- **What To Improve** (2–4 actionable points)
- **Identified Refinements**: Before & After phrasing diffs with clear explanations
- **Model Exemplar**: Natural executive phrasing
- **Interactive Retry Loop**: Test your improved version immediately to earn bonus XP
- **Vocabulary Vault**: 3–5 curated high-impact words with definitions, everyday examples, and executive examples

### 4. Interactive Games & Challenges
Includes 12+ communication-focused games:
- **Word Builder**: Form common (5 XP), advanced (10 XP), and professional (15 XP) words from letter sets (e.g., `C O N F I D E N T`).
- **Sentence Scramble**: Drag/tap words to reconstruct proper business English syntax.
- **Choose the Better Response**: Analyze realistic workplace responses and pick the most diplomatic one with full rationale.
- **30-Second Speaking Sprint**: High-energy countdown sprint to explain topics without hesitating.
- **Forbidden Word Challenge**: Explain your job or technical issues without using default words (e.g. without `work`, `job`, `company`).
- **Branching Dialogue Tree**: Interactive story tree where each sentence changes the director's reaction and outcome.
- **Spot the Mistake**: Detect and fix subtle ESL/workplace syntax errors.
- **Vocabulary Match**: Timed definition matching.
- **What Would You Say?**, **Story Builder**, **Emoji Story**, and **Guess the Word**.

### 5. Daily Challenges & Mystery Scenarios
- **Daily Challenge**: Fresh daily prompt with XP rewards and time targets.
- **🕵️ Mystery Scenario ("What Would You Do?")**: Unexpected workplace emergencies (Friday 4:45 PM client escalations, VP elevator encounters, colleague claiming credit).

### 6. Speech & Audio
- **Text-to-Speech (TTS)**: Listen to the AI mentor speak with adjustable speech rate.
- **Speech-to-Text (Mic)**: Speak your answers directly into your microphone or type them.

### 7. Pluggable AI Service Architecture
- **Built-in Intelligent Engine**: Sophisticated offline NLP engine analyzing grammar patterns, ESL idioms, filler words, tone, and sentence structure with 0 configuration.
- **Google Gemini API**: Support for Google Gemini 1.5/2.0 Flash with custom API key.
- **OpenAI API**: Support for GPT-4o-mini with custom API key.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React icons
- **Gamification**: Canvas-Confetti, LocalStorage persistence
- **Speech**: Web Speech API (`SpeechSynthesis` & `SpeechRecognition`)

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
