from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# LLM Key
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']

app = FastAPI()
api_router = APIRouter(prefix="/api")

# --- Models ---

class StartChatRequest(BaseModel):
    platform_type: str  # "social_media" or "gaming"

class StartChatResponse(BaseModel):
    session_id: str
    initial_message: str

class SendMessageRequest(BaseModel):
    session_id: str
    message: str

class FlagItem(BaseModel):
    title: str
    description: str

class AnalysisData(BaseModel):
    score: int
    red_flags: List[FlagItem] = []
    green_flags: List[FlagItem] = []
    alternative_suggestions: List[str] = []

class BotMessage(BaseModel):
    role: str = "assistant"
    content: str
    timestamp: str

class SendMessageResponse(BaseModel):
    bot_response: BotMessage
    analysis: AnalysisData

class EndChatRequest(BaseModel):
    session_id: str
    action: str  # "block", "report", "end"

class EndChatResponse(BaseModel):
    final_score: int
    was_correct_action: bool
    decision_feedback: str
    explanation: str
    safety_recommendation: str
    bot_truth: str

# --- Stranger Persona Prompts ---

STRANGER_PROMPTS = {
    "social_media": """You are roleplaying as a STRANGER on social media who is chatting with a young person. You must gradually become more manipulative and unsafe throughout the conversation.

Start friendly and casual. Over time, subtly:
- Ask for personal information (real name, age, school, location)
- Try to get them to share photos
- Suggest meeting in person
- Use flattery and emotional manipulation
- Try to isolate them from friends/family
- Create urgency or secrecy

Stay in character. Never break character or mention you are AI. Be realistic - real predators are subtle, not obvious. Start with normal small talk and escalate slowly.

Keep responses concise (1-3 sentences). Use casual internet language.""",
    
    "gaming": """You are roleplaying as a STRANGER on a gaming platform who is chatting with a young gamer. You must gradually become more manipulative and unsafe throughout the conversation.

Start as a friendly gamer. Over time, subtly:
- Ask for personal info (real name, age, where they live)
- Offer free game items/currency in exchange for personal info
- Try to get them on a private voice chat or external platform
- Suggest meeting at gaming events
- Pressure them into sharing account credentials
- Use peer pressure and gaming reputation

Stay in character. Never break character or mention you are AI. Be realistic. Start with normal gaming talk and escalate slowly.

Keep responses concise (1-3 sentences). Use gaming/internet slang."""
}

ANALYZER_SYSTEM = """You are a chat safety analyzer. You analyze messages sent BY THE USER (the young person practicing) in a simulated conversation with a potentially unsafe stranger.

For each user message, provide a JSON analysis with:
1. "score" (0-100): How safely the user responded. 100 = perfectly safe, 0 = very dangerous.
2. "red_flags": Array of {title, description} - unsafe things the user did (sharing personal info, agreeing to meet, etc.)
3. "green_flags": Array of {title, description} - safe things the user did (being cautious, refusing requests, etc.)
4. "alternative_suggestions": Array of strings - better/safer ways the user could have responded.

Be strict but fair. Consider:
- Did the user share personal information?
- Did they set boundaries?
- Did they recognize manipulation tactics?
- Did they keep the conversation safe?

Respond ONLY with valid JSON. No markdown, no code blocks, just raw JSON."""

FINAL_EVAL_SYSTEM = """You are a chat safety evaluator. Given a complete chat conversation and the user's final action (block/report/end), provide a final evaluation.

The conversation was between a user (practicing safe chatting) and an AI simulating a potentially unsafe stranger.

Respond with ONLY valid JSON:
{
  "final_score": <0-100 overall safety score>,
  "was_correct_action": <true/false - was the user's chosen action appropriate?>,
  "decision_feedback": "<one line about their decision>",
  "explanation": "<2-3 sentences explaining the score and what they did well/poorly>",
  "safety_recommendation": "<practical safety tip based on their performance>",
  "bot_truth": "<reveal what the AI stranger was actually doing - the manipulation tactics used>"
}"""

# --- Helper Functions ---

def get_stranger_chat(session_id: str, platform_type: str) -> LlmChat:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"stranger-{session_id}",
        system_message=STRANGER_PROMPTS[platform_type]
    )
    chat.with_model("openai", "gpt-4o")
    return chat

def get_analyzer_chat(session_id: str) -> LlmChat:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"analyzer-{session_id}",
        system_message=ANALYZER_SYSTEM
    )
    chat.with_model("openai", "gpt-4o")
    return chat

def get_evaluator_chat(session_id: str) -> LlmChat:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"eval-{session_id}",
        system_message=FINAL_EVAL_SYSTEM
    )
    chat.with_model("openai", "gpt-4o")
    return chat

def parse_json_response(text: str) -> dict:
    """Extract JSON from LLM response, handling markdown code blocks."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = lines[1:]  # remove opening ```json
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    return json.loads(text)

# --- Routes ---

@api_router.get("/")
async def root():
    return {"message": "Chat Safety Trainer API"}

@api_router.get("/health")
async def health():
    """Debug endpoint to check env vars and connectivity."""
    has_key = bool(EMERGENT_LLM_KEY and len(EMERGENT_LLM_KEY) > 5)
    try:
        await db.command("ping")
        db_ok = True
    except Exception as e:
        db_ok = str(e)
    return {"llm_key_set": has_key, "key_prefix": EMERGENT_LLM_KEY[:12] + "..." if has_key else "MISSING", "db_connected": db_ok}

@api_router.post("/start-chat", response_model=StartChatResponse)
async def start_chat(req: StartChatRequest):
    if req.platform_type not in ("social_media", "gaming"):
        raise HTTPException(400, "Invalid platform type")
    
    session_id = str(uuid.uuid4())
    
    try:
        # Generate initial stranger message
        stranger_chat = get_stranger_chat(session_id, req.platform_type)
    
        if req.platform_type == "social_media":
            prompt = "Start a conversation. You just found this person's profile and are reaching out for the first time. Say something casual and friendly."
        else:
            prompt = "Start a conversation. You just finished a game together and want to chat. Say something casual about the game."
        
        initial_message = await stranger_chat.send_message(UserMessage(text=prompt))
        
        # Store session in MongoDB
        session_doc = {
            "id": session_id,
            "platform_type": req.platform_type,
            "messages": [
                {"role": "assistant", "content": initial_message, "timestamp": datetime.now(timezone.utc).isoformat()}
            ],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "active"
        }
        await db.chat_sessions.insert_one(session_doc)
        
        return StartChatResponse(session_id=session_id, initial_message=initial_message)
    except Exception as e:
        logger.error(f"start-chat error: {type(e).__name__}: {e}")
        raise HTTPException(500, f"Error: {type(e).__name__}: {str(e)}")

@api_router.post("/send-message", response_model=SendMessageResponse)
async def send_message(req: SendMessageRequest):
    # Get session
    session = await db.chat_sessions.find_one({"id": req.session_id}, {"_id": 0})
    if not session:
        raise HTTPException(404, "Session not found")
    if session["status"] != "active":
        raise HTTPException(400, "Session is no longer active")
    
    # Get stranger response - include conversation history in prompt
    stranger_chat = get_stranger_chat(req.session_id, session["platform_type"])
    
    # Build conversation context for the stranger
    conversation_context = "Here is the conversation so far:\n"
    for msg in session["messages"]:
        if msg["role"] == "user":
            conversation_context += f"Them (the young person): {msg['content']}\n"
        else:
            conversation_context += f"You (the stranger): {msg['content']}\n"
    conversation_context += f"\nThey just said: \"{req.message}\"\n\nRespond as the stranger. Stay in character. Keep it to 1-3 sentences."
    
    bot_reply = await stranger_chat.send_message(UserMessage(text=conversation_context))
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Analyze the user's message
    analyzer = get_analyzer_chat(req.session_id)
    
    # Build context for analyzer
    conversation_so_far = ""
    for msg in session["messages"]:
        role_label = "Stranger" if msg["role"] == "assistant" else "User"
        conversation_so_far += f"{role_label}: {msg['content']}\n"
    conversation_so_far += f"User: {req.message}\n"
    
    analysis_prompt = f"""Analyze the USER's latest message for safety.

Conversation so far:
{conversation_so_far}

The user's latest message is: "{req.message}"

Respond with JSON only."""
    
    analysis_raw = await analyzer.send_message(UserMessage(text=analysis_prompt))
    
    try:
        analysis_data = parse_json_response(analysis_raw)
    except (json.JSONDecodeError, Exception):
        analysis_data = {
            "score": 50,
            "red_flags": [],
            "green_flags": [{"title": "Conversation Active", "description": "You are engaging in the conversation."}],
            "alternative_suggestions": ["Try being more cautious about what you share."]
        }
    
    # Update session in MongoDB
    user_msg = {"role": "user", "content": req.message, "timestamp": now}
    bot_msg = {"role": "assistant", "content": bot_reply, "timestamp": now}
    
    await db.chat_sessions.update_one(
        {"id": req.session_id},
        {"$push": {"messages": {"$each": [user_msg, bot_msg]}}}
    )
    
    return SendMessageResponse(
        bot_response=BotMessage(role="assistant", content=bot_reply, timestamp=now),
        analysis=AnalysisData(
            score=analysis_data.get("score", 50),
            red_flags=[FlagItem(**f) for f in analysis_data.get("red_flags", [])],
            green_flags=[FlagItem(**f) for f in analysis_data.get("green_flags", [])],
            alternative_suggestions=analysis_data.get("alternative_suggestions", [])
        )
    )

@api_router.post("/end-chat", response_model=EndChatResponse)
async def end_chat(req: EndChatRequest):
    session = await db.chat_sessions.find_one({"id": req.session_id}, {"_id": 0})
    if not session:
        raise HTTPException(404, "Session not found")
    
    # Build full conversation for evaluation
    conversation = ""
    for msg in session["messages"]:
        role_label = "Stranger" if msg["role"] == "assistant" else "User"
        conversation += f"{role_label}: {msg['content']}\n"
    
    eval_prompt = f"""Evaluate this complete chat session.

Platform: {session['platform_type']}
User's final action: {req.action}

Full conversation:
{conversation}

The stranger was an AI simulating a potentially unsafe person. Evaluate how safely the user handled the conversation and whether their final action ({req.action}) was appropriate.

Respond with JSON only."""
    
    evaluator = get_evaluator_chat(req.session_id)
    eval_raw = await evaluator.send_message(UserMessage(text=eval_prompt))
    
    try:
        eval_data = parse_json_response(eval_raw)
    except (json.JSONDecodeError, Exception):
        eval_data = {
            "final_score": 50,
            "was_correct_action": req.action in ("block", "report"),
            "decision_feedback": "Session ended.",
            "explanation": "The conversation has been evaluated.",
            "safety_recommendation": "Always be cautious when chatting with strangers online.",
            "bot_truth": "The stranger was an AI designed to simulate common manipulation tactics used by online predators."
        }
    
    # Mark session as ended
    await db.chat_sessions.update_one(
        {"id": req.session_id},
        {"$set": {"status": "ended", "final_action": req.action, "final_score": eval_data.get("final_score", 50)}}
    )
    
    return EndChatResponse(
        final_score=eval_data.get("final_score", 50),
        was_correct_action=eval_data.get("was_correct_action", False),
        decision_feedback=eval_data.get("decision_feedback", ""),
        explanation=eval_data.get("explanation", ""),
        safety_recommendation=eval_data.get("safety_recommendation", ""),
        bot_truth=eval_data.get("bot_truth", "")
    )

# Include router
app.include_router(api_router)

# Serve the mobile app at root
@app.get("/", response_class=HTMLResponse)
async def serve_app():
    html_path = Path(__file__).parent / "mobile.html"
    return HTMLResponse(content=html_path.read_text(), status_code=200)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
