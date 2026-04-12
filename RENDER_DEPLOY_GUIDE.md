# Hosting on Render.com - Complete Guide

## What You Need (3 Things)

| # | What | Where to Get | Cost |
|---|------|-------------|------|
| 1 | **Render Account** | [render.com](https://render.com) | Free tier available |
| 2 | **MongoDB Atlas Database** | [mongodb.com/atlas](https://cloud.mongodb.com) | Free (512MB) |
| 3 | **Emergent LLM Key** | [emergent.sh](https://emergent.sh) → Profile → Universal Key | Pay per use |

---

## STEP 1: Create Free MongoDB Atlas Database (5 min)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and sign up
2. Click **"Build a Database"**
3. Choose **M0 FREE** tier
4. Pick any cloud provider & region
5. Set a **database username & password** (remember these!)
6. Click **"Create Cluster"**
7. In **Network Access** → Click **"Add IP Address"** → Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
8. Go to **Database** → Click **"Connect"** → Choose **"Drivers"**
9. Copy the connection string. It looks like:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
10. Replace `USERNAME` and `PASSWORD` with your actual credentials

**Save this connection string — you'll need it in Step 3.**

---

## STEP 2: Get Your Emergent LLM Key

1. Go to [emergent.sh](https://emergent.sh)
2. Click **Profile** → **Universal Key**
3. Copy the key (starts with `sk-emergent-...`)
4. Make sure you have balance (add credits if needed)

**Save this key — you'll need it in Step 3.**

---

## STEP 3: Deploy Backend on Render (10 min)

1. Go to [render.com](https://render.com) and sign up
2. Click **"New"** → **"Web Service"**
3. Connect your **GitHub repo**
4. Configure the service:

   | Setting | Value |
   |---------|-------|
   | **Name** | `chat-safety-trainer` |
   | **Region** | Pick closest to you |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt && pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/` |
   | **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
   | **Instance Type** | `Free` |

5. Click **"Advanced"** → **"Add Environment Variable"** and add these 4:

   | Key | Value |
   |-----|-------|
   | `MONGO_URL` | Your MongoDB Atlas connection string from Step 1 |
   | `DB_NAME` | `chat_safety_trainer` |
   | `CORS_ORIGINS` | `*` |
   | `EMERGENT_LLM_KEY` | Your Emergent key from Step 2 |

6. Click **"Create Web Service"**
7. Wait for deployment (~5-10 minutes)
8. You'll get a URL like: `https://chat-safety-trainer.onrender.com`
9. Test it: open `https://chat-safety-trainer.onrender.com/api/` in browser — you should see `{"message":"Chat Safety Trainer API"}`

---

## STEP 4: Deploy Frontend on Render (5 min)

1. In Render, click **"New"** → **"Static Site"**
2. Connect the same **GitHub repo**
3. Configure:

   | Setting | Value |
   |---------|-------|
   | **Name** | `chat-safety-frontend` |
   | **Branch** | `main` |
   | **Root Directory** | `frontend` |
   | **Build Command** | `yarn install && yarn build` |
   | **Publish Directory** | `build` |

4. Click **"Advanced"** → **"Add Environment Variable"**:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_BACKEND_URL` | `https://chat-safety-trainer.onrender.com` (your backend URL from Step 3) |

5. Click **"Create Static Site"**
6. Wait for build (~3-5 minutes)
7. You'll get a URL like: `https://chat-safety-frontend.onrender.com`

---

## STEP 5: Use in MIT App Inventor

### For the full React app:
Set WebViewer URL to: `https://chat-safety-frontend.onrender.com`

### For the lightweight mobile version (recommended):
Set WebViewer URL to: `https://chat-safety-frontend.onrender.com/mobile.html`

But first, update the `API_URL` in `mobile.html`:
- Open `frontend/public/mobile.html` in your GitHub repo
- Change this line:
  ```javascript
  var API_URL = 'https://troubleshoot-guide-3.preview.emergentagent.com/api';
  ```
  To:
  ```javascript
  var API_URL = 'https://chat-safety-trainer.onrender.com/api';
  ```
- Commit and push — Render will auto-redeploy

### WebViewer Settings in MIT App Inventor:
- **JavaScriptEnabled** = `true`
- **IgnoreSslErrors** = `true`

---

## Important Notes

- **Free tier on Render** spins down after 15 min of inactivity. First request after idle takes ~30-60 seconds (cold start).
- **MongoDB Atlas free tier** gives 512MB storage — plenty for this app.
- **Emergent LLM Key** charges per AI request. Check your balance at emergent.sh → Profile → Universal Key.

---

## Quick Checklist

- [ ] MongoDB Atlas account + connection string
- [ ] Emergent LLM key with balance
- [ ] Render account
- [ ] Backend deployed as Web Service on Render
- [ ] Frontend deployed as Static Site on Render
- [ ] Updated `API_URL` in `mobile.html` to your Render backend URL
- [ ] Tested in browser before using in MIT App Inventor
- [ ] Set WebViewer URL in MIT App Inventor
