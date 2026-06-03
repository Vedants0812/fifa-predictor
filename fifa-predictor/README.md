# ⚽ FIFA World Cup 2026 AI Predictor

A production-grade, full-stack web application that predicts all **104 FIFA World Cup 2026** matches using machine learning — Poisson scoring models, calibrated logistic regression, and AI-generated match explanations.

---

## 📊 Match Count (2026 Format)

| Round            | Matches | Notes                            |
|------------------|---------|----------------------------------|
| Group Stage      | 72      | 12 groups × 6 matches each       |
| Round of 32      | 16      | 32 teams advance (top 2 + 8 best 3rd) |
| Round of 16      | 8       | 16 → 8 teams                     |
| Quarterfinals    | 4       | 8 → 4 teams                      |
| Semifinals       | 2       | 4 → 2 finalists                  |
| Third Place      | 1       | Bronze medal playoff             |
| Final            | 1       | World Cup Champion               |
| **Total**        | **104** | ✅ Official FIFA 2026 count       |

---

## 🏗️ Project Structure

```
fifa-predictor/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app entry point
│   │   ├── data/
│   │   │   └── teams.py          # All 48 teams + 12 groups
│   │   ├── ml/
│   │   │   └── predictor.py      # ML model (Logistic + Poisson)
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic schemas
│   │   └── routers/
│   │       ├── health.py
│   │       ├── predictions.py    # /matches, /predict-match
│   │       ├── teams.py          # /teams, /teams/{id}, /head-to-head
│   │       └── tournament.py     # /simulate-tournament, /standings
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx            # Root layout + Navbar
│   │   ├── page.tsx              # Home page
│   │   ├── predictions/page.tsx  # All 72 group matches
│   │   ├── bracket/page.tsx      # Full tournament bracket
│   │   ├── teams/page.tsx        # 48 team analytics
│   │   ├── predictor/page.tsx    # Custom match predictor
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── MatchCard.tsx     # Animated probability bars
│   │   │   ├── TeamCard.tsx      # Team stats + form
│   │   │   └── Skeleton.tsx      # Loading skeletons
│   │   ├── lib/
│   │   │   └── api.ts            # API client + TypeScript types
│   │   └── globals.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   ├── Dockerfile
│   └── .env.example
│
├── nginx/
│   └── nginx.conf                # Reverse proxy + rate limiting
├── docker-compose.yml
└── .gitignore
```

---

## 🚀 Running Locally

### Option A — Docker Compose (Recommended)

```bash
# 1. Clone / unzip the project
cd fifa-predictor

# 2. Start everything
docker compose up --build

# App:     http://localhost:80   (or :3000 directly)
# API:     http://localhost:8000/api/docs
# Health:  http://localhost:8000/api/health
```

---

### Option B — Manual (Dev Mode)

#### Backend
```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env
cp .env.example .env

# Run dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: `http://localhost:8000/api/docs`

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Copy env
cp .env.example .env.local

# Run dev server
npm run dev
```

Frontend available at: `http://localhost:3000`

---

## 🌐 API Endpoints

| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/api/health`                     | Health check                       |
| GET    | `/api/matches`                    | All 72 group stage matches         |
| GET    | `/api/matches?group=Group A`      | Filter by group                    |
| POST   | `/api/predict-match`              | Predict any custom matchup         |
| GET    | `/api/teams`                      | All 48 teams                       |
| GET    | `/api/teams?confederation=UEFA`   | Filter by confederation            |
| GET    | `/api/teams/{id}`                 | Single team detail                 |
| GET    | `/api/teams/{id}/head-to-head/{id2}` | H2H stats between two teams    |
| GET    | `/api/simulate-tournament`        | Full 104-match simulation          |
| GET    | `/api/simulate-tournament?seed=42`| Reproducible simulation            |
| GET    | `/api/standings`                  | Group stage standings              |

### POST `/api/predict-match` body:
```json
{
  "team_a_id": "arg",
  "team_b_id": "fra",
  "stage": "final",
  "neutral_venue": true
}
```

---

## ☁️ Deploying to Production

### Render.com (Free tier)

**Backend (Web Service):**
1. New → Web Service → connect your repo
2. Root directory: `backend`
3. Runtime: Python 3.11
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add env var: `ALLOWED_ORIGINS=https://your-frontend.vercel.app`

**Frontend (Static / Next.js):**
1. New → Web Service → connect your repo
2. Root directory: `frontend`
3. Runtime: Node 20
4. Build: `npm install && npm run build`
5. Start: `npm start`
6. Add env var: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`

---

### Vercel + Railway

**Frontend → Vercel:**
```bash
cd frontend
npx vercel --prod
# Set NEXT_PUBLIC_API_URL in Vercel dashboard
```

**Backend → Railway:**
```bash
# Push to GitHub, connect repo to Railway
# Railway auto-detects Dockerfile
# Set PORT=8000 in Railway environment
```

---

### VPS / DigitalOcean / EC2

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. Clone project
git clone https://github.com/you/fifa-predictor.git
cd fifa-predictor

# 4. Add SSL certs (Let's Encrypt)
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/certs/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/certs/

# 5. Update nginx.conf — uncomment HTTPS server block and set domain

# 6. Deploy
docker compose up -d --build

# 7. Auto-renew SSL
echo "0 0 1 * * cd /path/to/fifa-predictor && docker compose restart nginx" | crontab -
```

---

## 🧠 ML Model Details

### Prediction Features
| Feature | Weight | Description |
|---------|--------|-------------|
| AI Rating diff | 0.062 | Composite team strength |
| Form score diff | 0.420 | Weighted last-10 match results |
| Goals/match diff | 0.210 | Attacking output |
| Defensive diff | 0.180 | Goals conceded |
| Squad depth diff | 0.140 | Squad quality bench |
| Home advantage | 0.350 | CONCACAF 2026 host bonus |
| FIFA rank diff | -0.028 | International ranking |
| Win rate diff | 0.018 | Historical win % |
| Experience diff | 0.008 | WC appearances |

### Score Prediction
- Uses **Poisson distribution** with expected goals (λ) derived from attack/defense ratings
- λ = `team_goals_per_match × 0.85 + (rating_diff × 0.05)`, clamped to [0.3, 4.5]

### Knockout Simulation
- Draws in knockout rounds → **penalty shootout** (50/50 after accounting for form)
- Tournament simulated with `numpy.random.default_rng()` for reproducibility

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0A0F1C` | Page background |
| `--surface` | `#111827` | Cards |
| `--surface2` | `#1A2235` | Inputs, nested cards |
| `--primary` | `#3B82F6` | CTAs, highlights |
| `--accent` | `#22C55E` | Success, win indicators |
| `--amber` | `#F59E0B` | Draws, warnings |
| `--danger` | `#EF4444` | Losses, errors |
| Font (body) | DM Sans | Clean, readable |
| Font (headings) | Syne | Bold, distinctive |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Data fetching | SWR (stale-while-revalidate) |
| Backend | FastAPI (Python 3.11) |
| ML | NumPy + calibrated logistic weights |
| Score model | Poisson distribution |
| Serving | Uvicorn (ASGI) |
| Reverse proxy | Nginx |
| Containers | Docker + Docker Compose |

---

## 🔧 Team IDs Reference

| ID | Team | ID | Team |
|----|------|----|------|
| `arg` | Argentina 🇦🇷 | `fra` | France 🇫🇷 |
| `bra` | Brazil 🇧🇷 | `eng` | England 🏴󠁧󠁢󠁥󠁮󠁧󠁿 |
| `esp` | Spain 🇪🇸 | `ger` | Germany 🇩🇪 |
| `por` | Portugal 🇵🇹 | `ned` | Netherlands 🇳🇱 |
| `bel` | Belgium 🇧🇪 | `ita` | Italy 🇮🇹 |
| `cro` | Croatia 🇭🇷 | `mor` | Morocco 🇲🇦 |
| `jpn` | Japan 🇯🇵 | `kor` | South Korea 🇰🇷 |
| `usa` | USA 🇺🇸 | `mex` | Mexico 🇲🇽 |
| `can` | Canada 🇨🇦 | `aus` | Australia 🇦🇺 |
| `sen` | Senegal 🇸🇳 | `nga` | Nigeria 🇳🇬 |
| ...and 28 more — see `backend/app/data/teams.py` | | | |

---

## 📄 License

MIT — free to use, modify, and deploy.
