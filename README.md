# 🎮 QUBIQ — Learn. Play. Level Up.

> An AI-powered gamified learning platform that transforms study materials into epic learning adventures.

![QUBIQ Banner](https://img.shields.io/badge/QUBIQ-Learn.Play.LevelUp-7357D9?style=for-the-badge&logo=gamepad)

---

## ✨ What is QUBIQ?

QUBIQ turns your boring PDFs, Word docs, and PowerPoints into an interactive gaming experience. Upload your study material → AI extracts topics → generates quizzes and missions → you play, earn XP, and level up. The AI also identifies your weak spots and creates personalised revision plans.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React |
| **Backend** | Node.js + Express.js REST API |
| **Database** | PostgreSQL + Prisma ORM |
| **AI** | OpenRouter API (configurable model) |
| **Auth** | JWT + bcryptjs |
| **Storage** | Supabase Storage (optional) |
| **Uploads** | Multer (PDF, DOCX, PPTX, TXT) |

---

## 🗂️ Project Structure

```
qubiq/
├── backend/
│   ├── config/          # DB, Supabase connections
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, upload, error handling
│   ├── routes/          # Express routers
│   ├── services/        # Business logic (AI, XP, achievements…)
│   ├── prisma/          # Database schema
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # Mascot, layout, UI primitives
        ├── pages/       # All page components
        ├── services/    # Axios API client
        └── store/       # Zustand state (auth + game)
```

---

## 🚀 Setup Guide

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or remote)
- OpenRouter API key → [openrouter.ai](https://openrouter.ai)
- Supabase account (optional, for file storage)

---

### 1. Clone / Navigate to project

```bash
cd d:\projects\qubiq
```

---

### 2. Backend Setup

```bash
cd backend
```

**Copy and edit the environment file:**

```bash
copy .env.example .env
```

Edit `backend/.env`:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/qubiq
JWT_SECRET=your-very-long-random-secret-string
FRONTEND_URL=http://localhost:5173

# Required: Get from https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx
OPENROUTER_MODEL=openai/gpt-4o-mini

# Optional: Supabase storage (documents stored in memory if not set)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

NODE_ENV=development
```

**Create the PostgreSQL database:**

```sql
CREATE DATABASE qubiq;
```

**Run database migrations:**

```bash
npx prisma migrate dev --name init
# OR for quick setup (no migration history):
npx prisma db push
```

**Start the backend:**

```bash
npm run dev
```

Backend runs on → **http://localhost:3001**

---

### 3. Frontend Setup

```bash
cd ../frontend
npm run dev
```

Frontend runs on → **http://localhost:5173**

---

## 🎮 Features

### 📄 Document Upload Arena
- Drag & drop upload (PDF, DOCX, PPTX, TXT — up to 50MB)
- Real-time processing status
- AI-powered topic extraction
- Document library with management

### 🤖 AI Quiz Generation
- Configurable difficulty (Easy / Medium / Hard)
- Question types: MCQ, True/False
- 5–20 questions per quiz
- Countdown timer
- Questions grounded strictly in uploaded material

### 🎯 Quiz Arena
- Animated question cards
- Countdown timer with visual indicator
- Heart lives system
- Question progress bar
- Answer explanations after submission

### 📊 Results & Analytics
- Score circle with animation
- Topic-wise performance bar chart
- XP breakdown
- Weak topic identification
- Full question review with explanations

### 🧠 AI Revision Centre
- Personalised revision notes for weak topics
- AI-generated practice questions with hints
- Suggested study sequence
- Tracks improvement over time

### ⚡ Gamification System
| Action | XP |
|---|---|
| Correct answer | +10 XP |
| Quiz completion | +20 XP |
| Perfect score | +50 bonus XP |
| Boss Battle | +40 bonus XP |
| Daily challenge | +30 XP |

**Levels:** Beginner → Explorer → Challenger → Scholar → Master

**Achievements:** First Victory, Perfect Score, 7-Day Streak, Knowledge Master, Speedster, Mission Champion

### 🗺️ Missions & Worlds
- Topics auto-converted into missions
- World progression system
- Boss Battles for extra XP
- Lock/unlock system

### 🏆 Leaderboard
- Global XP ranking
- Weekly XP ranking
- Your rank highlight

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/profile` | ✅ | Get full profile |
| POST | `/api/documents/upload` | ✅ | Upload document |
| GET | `/api/documents` | ✅ | List user documents |
| GET | `/api/documents/:id` | ✅ | Document + topics |
| DELETE | `/api/documents/:id` | ✅ | Delete document |
| POST | `/api/quizzes/generate` | ✅ | Generate AI quiz |
| POST | `/api/quizzes/attempt` | ✅ | Start quiz attempt |
| POST | `/api/quizzes/submit` | ✅ | Submit & score quiz |
| GET | `/api/quizzes/history` | ✅ | Quiz history |
| GET | `/api/gamification/stats` | ✅ | XP, level, streak |
| GET | `/api/gamification/missions` | ✅ | All missions |
| GET | `/api/leaderboard?type=global` | ✅ | Leaderboard |
| GET | `/api/revision` | ✅ | Revision plans |
| PATCH | `/api/revision/:id/read` | ✅ | Mark as read |
| GET | `/api/health` | ❌ | Health check |

---

## 🎨 Design System

| Colour | Hex | Usage |
|---|---|---|
| Primary Purple | `#7357D9` | Buttons, accents, nav |
| Sky Blue | `#55C7E8` | Highlights, XP bar |
| Cream | `#FFF5D9` | Backgrounds |
| Green | `#75D66B` | Correct answers, success |
| Orange | `#FFB547` | XP, streaks, warnings |
| Pink | `#FF6685` | Wrong answers, hearts |
| Dark Navy | `#30304A` | Text, sidebar |

**Mascot:** *Quby* — a round purple creature with big eyes, wings, and a star on its forehead. Reacts to quiz results with 6 expressions.

---

## 🔧 Configuration

### Changing the AI Model

In `backend/.env`:

```env
# Examples:
OPENROUTER_MODEL=openai/gpt-4o-mini       # Fast, cheap (default)
OPENROUTER_MODEL=openai/gpt-4o            # More accurate
OPENROUTER_MODEL=anthropic/claude-3-haiku # Claude alternative
OPENROUTER_MODEL=google/gemini-flash-1.5  # Google option
```

### Without Supabase

If `SUPABASE_URL` is not set, documents are uploaded and processed from memory without persistent file storage. Text is still extracted and stored in PostgreSQL — full functionality is preserved.

---

## 🛡️ Security

- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens expire in 7 days
- All document/quiz routes require valid JWT
- Correct answers never sent to frontend before submission
- Duplicate XP transactions prevented via unique constraint
- File type and size validated before processing
- AI responses validated before saving to DB

---

## 📱 Responsive Design

Fully responsive across:
- 🖥️ Desktop (1024px+) — full sidebar
- 📱 Tablet (768px) — collapsible sidebar
- 📱 Mobile (< 768px) — hamburger menu, stacked layout

---

## 🚦 Getting Started (Quick)

```bash
# 1. Setup DB
createdb qubiq

# 2. Backend
cd backend
copy .env.example .env   # Edit with your keys
npx prisma db push
npm run dev

# 3. Frontend (new terminal)
cd ../frontend
npm run dev

# 4. Open browser
# http://localhost:5173
```

---

*Built with ❤️ and ✨ magic — QUBIQ makes students forget they're studying.*

