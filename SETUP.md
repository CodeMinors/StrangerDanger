# Chat Safety Trainer - Local Setup Guide

## Prerequisites
- **Node.js** (v18+) & **Yarn** — [Download Node.js](https://nodejs.org)
- **Python** (3.10+) — [Download Python](https://python.org)
- **MongoDB** — [Download MongoDB](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas) (free cloud DB)

---

## Step 1: Clone the Repo
```bash
git clone <your-github-repo-url>
cd <repo-folder>
```

## Step 2: Create Environment Files

### Backend `.env` — Create file at `backend/.env`
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=chat_safety_trainer
CORS_ORIGINS=*
EMERGENT_LLM_KEY=<your-emergent-llm-key>
```

> **Where to get EMERGENT_LLM_KEY:** Go to [Emergent](https://emergent.sh) → Profile → Universal Key → Copy your key. If you don't have one, you can also use your own OpenAI API key and modify `server.py` accordingly.

### Frontend `.env` — Create file at `frontend/.env`
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Step 3: Install & Run Backend
```bash
cd backend
pip install -r requirements.txt
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```
Backend will run at `http://localhost:8001`

## Step 4: Install & Run Frontend
Open a **new terminal**:
```bash
cd frontend
yarn install
yarn start
```
Frontend will run at `http://localhost:3000`

## Step 5: Open the App
Go to **http://localhost:3000** in your browser. That's it!

---

## Project Structure
```
├── backend/
│   ├── server.py          # FastAPI backend with AI chat + safety analysis
│   ├── requirements.txt   # Python dependencies
│   └── .env               # (you create this - not in git for security)
├── frontend/
│   ├── src/
│   │   ├── App.js                    # Main app with screen routing
│   │   ├── components/
│   │   │   ├── PlatformScreen.jsx    # Platform selection (Social Media / Gaming)
│   │   │   ├── ChatScreen.jsx        # Chat interface with stranger
│   │   │   ├── AnalysisPanel.jsx     # Safety analysis sidebar
│   │   │   ├── ResultScreen.jsx      # Final score & feedback
│   │   │   └── Toast.jsx             # Notifications
│   │   ├── index.css                 # Global styles
│   │   └── App.css
│   ├── package.json
│   └── .env               # (you create this - not in git for security)
```

## How It Works
1. **Choose a platform** (Social Media or Gaming)
2. **Chat with an AI stranger** that gradually becomes manipulative
3. **View safety analysis** of your messages (score, red/green flags, suggestions)
4. **Take action** — Block, Report, or End the chat
5. **See your results** — final safety score, feedback, and the truth about the bot

## Tech Stack
- **Frontend:** React, Tailwind CSS, Lucide Icons
- **Backend:** FastAPI (Python), OpenAI GPT-4o
- **Database:** MongoDB
- **AI:** emergentintegrations library with Emergent Universal Key
