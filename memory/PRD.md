# Chat Safety Trainer - PRD

## Original Problem Statement
User uploaded a `chat.html` file (a Chat Safety Trainer app) that wasn't working. The HTML file was a standalone frontend connecting to a non-existent backend API at `https://platform-chat-audit.preview.emergentagent.com/api`.

## Architecture
- **Frontend**: React (CRA) with Tailwind CSS, Lucide icons
- **Backend**: FastAPI (Python) with OpenAI GPT-4o via emergentintegrations
- **Database**: MongoDB (motor async driver)
- **AI Integration**: OpenAI GPT-4o via Emergent LLM Key

## Core Requirements
1. Platform Selection Screen (Social Media / Gaming Platform)
2. AI-simulated chat with a gradually manipulative stranger
3. Real-time safety analysis (score, red/green flags, suggestions)
4. Action buttons (Block/Report/End Chat)
5. Result screen with final score, feedback, and "truth about the bot"

## User Personas
- Young internet users learning to identify unsafe online interactions
- Parents/educators using the tool for safety training

## What's Been Implemented (Jan 2026)
- Full backend with 3 API endpoints: start-chat, send-message, end-chat
- AI-powered stranger simulation with platform-specific personas
- AI-powered safety analysis of user messages
- AI-powered final evaluation with score and feedback
- MongoDB session storage
- React frontend with 3 screens matching tactical command center design
- Animated score reveals, typing indicators, toast notifications

## Backlog
- P1: Mobile-responsive analysis panel (currently hidden on small screens)
- P1: Session history / replay feature
- P2: More platform scenarios (dating apps, forums, etc.)
- P2: Difficulty levels (easy/medium/hard manipulation)
- P2: Leaderboard / progress tracking
- P3: Multi-language support
