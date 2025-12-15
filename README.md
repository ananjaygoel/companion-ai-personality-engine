# Companion AI - Memory Extraction & Personality Engine

A modular AI companion system that extracts memories from user conversations and transforms response tones based on different personality profiles.

## 🚀 Live Demo

🌐 **Live App:** [https://ass-apg21605-gmailcoms-projects.vercel.app](https://ass-apg21605-gmailcoms-projects.vercel.app)

📂 **GitHub:** [https://github.com/ananjaygoel/companion-ai-personality-engine](https://github.com/ananjaygoel/companion-ai-personality-engine)

## 📖 Overview

This project demonstrates core concepts in building companion AI systems:

1. **Memory Extraction Module** - Analyzes chat messages to identify:
   - User preferences (likes, dislikes, habits)
   - Emotional patterns (recurring moods, triggers, coping mechanisms)
   - Facts worth remembering (personal details, relationships, life events)

2. **Personality Engine** - Transforms AI response tones:
   - 🧘 Calm Mentor - Wise, patient, guiding
   - 😄 Witty Friend - Casual, humorous, supportive
   - 💚 Therapist-Style - Empathetic, reflective, validating
   - 🎯 Cheerful Coach - Energetic, motivating, action-oriented
   - 🦉 Wise Elder - Philosophical, thoughtful, storytelling

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Companion AI System                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │  Memory Extractor   │    │    Personality Engine       │ │
│  │                     │    │                             │ │
│  │  • Preferences      │───▶│  • System Prompts           │ │
│  │  • Emotions         │    │  • Memory Context Injection │ │
│  │  • Facts            │    │  • Tone Transformation      │ │
│  │  • Profile          │    │                             │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
│           │                            │                     │
│           ▼                            ▼                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              OpenAI API (GPT-4o-mini)                   ││
│  │         Structured Output + JSON Schema                  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Key Features

### Structured Output Parsing
- Uses OpenAI's JSON Schema feature for reliable extraction
- Well-defined schemas for preferences, emotions, and facts
- Confidence scoring for extracted memories

### Modular Design
- `MemoryExtractor` class - Standalone memory extraction
- `PersonalityEngine` class - Personality transformation
- `CompanionAI` class - Orchestrates both modules

### Before/After Comparison
- Side-by-side personality response comparison
- Baseline (no personality) vs. each personality type
- Interactive demo with custom messages

## 📁 Project Structure

```
├── src/
│   ├── memoryExtractor.js   # Memory extraction module
│   ├── personalityEngine.js # Personality transformation engine
│   ├── sampleMessages.js    # 30 sample chat messages
│   └── index.js             # Main entry point
├── app.js                   # Frontend application
├── index.html               # UI template
├── styles.css               # Styling
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies
```

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/companion-ai-personality-engine.git

# Navigate to project directory
cd companion-ai-personality-engine

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Usage

1. Open the application in your browser
2. Enter your OpenAI API key (used client-side only)
3. Click "Initialize System" to extract memories from sample messages
4. Explore the three tabs:
   - **Memory Extraction** - View extracted preferences, emotions, and facts
   - **Personality Comparison** - See how different personalities respond
   - **Interactive Chat** - Chat with different AI personalities

## 📊 Sample Data

The system includes 30 realistic chat messages from a fictional user, covering:
- Starting a new job
- Moving to a new city
- Social anxiety and making friends
- Personal growth and challenges
- Seeking therapy

## 🧠 Memory Extraction Schema

```javascript
{
  preferences: [{
    category: "food|entertainment|communication|...",
    preference: "string",
    sentiment: "positive|negative|neutral",
    confidence: 0.0-1.0
  }],
  emotionalPatterns: [{
    emotion: "joy|sadness|anxiety|...",
    trigger: "string",
    frequency: "rare|occasional|frequent|constant",
    intensity: "low|medium|high"
  }],
  factsWorthRemembering: [{
    category: "personal_info|life_event|relationship|...",
    fact: "string",
    importance: "low|medium|high|critical"
  }],
  overallProfile: {
    dominantMood: "string",
    communicationStyle: "formal|casual|mixed",
    topConcerns: ["string"],
    supportNeeds: ["string"]
  }
}
```

## 🎭 Personality Profiles

| Personality | Description | Key Traits |
|-------------|-------------|------------|
| Calm Mentor | Wise, patient guide | Reflective, metaphorical, grounding |
| Witty Friend | Casual, fun buddy | Humorous, relatable, supportive |
| Therapist-Style | Empathetic listener | Validating, curious, non-judgmental |
| Cheerful Coach | Energetic motivator | Action-oriented, celebrating, pushing |
| Wise Elder | Philosophical guide | Storytelling, timeless wisdom, accepting |

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build the project
npm run build

# Deploy dist folder to Netlify
```

## 📝 API Requirements

- OpenAI API key with access to GPT-4o-mini
- API key is used client-side and never stored

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning and development.

---

Built with ❤️ for companion AI research and development.
