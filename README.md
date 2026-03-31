# 🌐 TranslateAI Pro

**AI-Powered Translation Platform** — Translate text, images, and documents between Hindi, Nepali, Telugu & English using neural machine translation, OCR, and NLP analysis.

![TranslateAI Pro](https://img.shields.io/badge/TranslateAI-Pro-6366f1?style=for-the-badge&logo=translate)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square)

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  React + Vite + TailwindCSS + Framer Motion     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│  │Landing│ │Auth  │ │Dashbd│ │Chat  │           │
│  │Page   │ │Pages │ │Pages │ │Widget│           │
│  └──────┘ └──────┘ └──────┘ └──────┘           │
└────────────────────┬─────────────────────────────┘
                     │ REST API (Axios)
┌────────────────────▼─────────────────────────────┐
│                   BACKEND                        │
│  FastAPI + SQLAlchemy + JWT Auth + Rate Limiter  │
│  ┌──────────────────────────────────────┐       │
│  │           API Routes                  │       │
│  │  /auth  /translate  /ocr  /pdf       │       │
│  │  /download  /history  /dashboard     │       │
│  │  /chatbot  /health                   │       │
│  └──────────────────────────────────────┘       │
│  ┌──────────────────────────────────────┐       │
│  │           AI Services                 │       │
│  │  Translation (IndiaTrans2)  │       │
│  │  OCR (Tesseract + Preprocessing)     │       │
│  │  PDF (PyPDF2 + OCR Fallback)         │       │
│  │  NLP (Summarize + Sentiment + KW)    │       │
│  │  Chatbot (Command-based Assistant)   │       │
│  └──────────────────────────────────────┘       │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│  SQLite (dev) / PostgreSQL (prod)               │
│  Users • Translations • History                  │
└──────────────────────────────────────────────────┘
```

## 🚀 Features

### Core
- ✅ **AI Text Translation** — Hindi, Nepali, Telugu ↔ English with confidence scoring
- ✅ **Image OCR** — Extract & translate text from images (Tesseract OCR)
- ✅ **PDF Translation** — Page-by-page with OCR fallback for scanned documents
- ✅ **Download Results** — Export as TXT, DOCX, or PDF
- ✅ **JWT Authentication** — Secure signup/login with token-based auth
- ✅ **Translation History** — View, filter, and manage past translations
- ✅ **Dashboard & Analytics** — Usage stats with interactive Recharts graphs
- ✅ **Rate Limiting** — Per-user request throttling

### Advanced AI
- ✅ **Text Summarization** — Extractive summary of translated content
- ✅ **Sentiment Analysis** — Detect emotional tone with polarity scoring
- ✅ **Keyword Extraction** — Extract key phrases using YAKE
- ✅ **AI Chatbot** — Interactive assistant for translation & analysis
- ✅ **Language Detection** — Automatic source language identification
- ✅ **Batch Translation** — Translate multiple texts in one request

### UI/UX
- ✅ **Dark/Light Mode** — Toggle with persistent preference
- ✅ **Drag & Drop Upload** — For images and PDFs
- ✅ **Progress Indicators** — Animated loading bars
- ✅ **Copy to Clipboard** — One-click copy for translations
- ✅ **Responsive Design** — Works on all screen sizes
- ✅ **Premium Glassmorphism UI** — Modern SaaS-style design

---

## 📂 Folder Structure

```
TranslateAI/
├── backend/
│   ├── app/
│   │   ├── auth/                 # JWT authentication
│   │   │   ├── auth_handler.py   # Password hashing
│   │   │   ├── jwt_handler.py    # Token creation/verification
│   │   │   └── dependencies.py   # Auth middleware
│   │   ├── routes/               # API endpoints
│   │   │   ├── auth.py           # Signup, login, profile
│   │   │   ├── translate.py      # Text translation + NLP
│   │   │   ├── ocr.py            # Image OCR + translation
│   │   │   ├── pdf.py            # PDF processing
│   │   │   ├── download.py       # File downloads (TXT/DOCX/PDF)
│   │   │   ├── history.py        # Translation history
│   │   │   ├── dashboard.py      # Stats & analytics
│   │   │   ├── chatbot.py        # AI assistant
│   │   │   └── health.py         # System health check
│   │   ├── services/             # AI/NLP modules
│   │   │   ├── translation.py    # Neural MT (HuggingFace)
│   │   │   ├── ocr.py            # Tesseract OCR
│   │   │   ├── pdf_processor.py  # PDF text extraction
│   │   │   ├── nlp.py            # Summarize, sentiment, keywords
│   │   │   └── chatbot.py        # Chatbot logic
│   │   ├── main.py               # FastAPI app
│   │   ├── config.py             # Settings
│   │   ├── database.py           # SQLAlchemy setup
│   │   ├── models.py             # DB models
│   │   └── schemas.py            # Pydantic schemas
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatbotWidget.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── DashboardHome.jsx
│   │   │   ├── TranslatePage.jsx
│   │   │   ├── OCRPage.jsx
│   │   │   ├── PDFPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   └── AnalyticsPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Tesseract OCR** (optional, for OCR features)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` with docs at `/docs`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The UI will be available at `http://localhost:5173`.

### 3. Install Tesseract OCR (Optional)

**Windows:** Download from https://github.com/UB-Mannheim/tesseract/wiki

**macOS:** `brew install tesseract tesseract-lang`

**Linux:** `sudo apt install tesseract-ocr tesseract-ocr-hin tesseract-ocr-nep tesseract-ocr-tel`

---

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Access the app at http://localhost
# API at http://localhost:8000
# API docs at http://localhost:8000/docs
```

---

## ☁️ Cloud Deployment

### Railway / Render

1. Push code to GitHub
2. Connect repo to Railway/Render
3. Set environment variables:
   - `SECRET_KEY` — Strong random key
   - `DATABASE_URL` — PostgreSQL connection string
   - `DEBUG` — `false`
4. Deploy backend and frontend as separate services

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `translateai-...` | JWT signing key |
| `DATABASE_URL` | `sqlite:///./translateai.db` | Database connection |
| `UPLOAD_DIR` | `uploads` | File upload directory |
| `RATE_LIMIT` | `30/minute` | API rate limit |
| `DEBUG` | `true` | Debug mode |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/translate/` | Translate text |
| POST | `/api/translate/batch` | Batch translate |
| POST | `/api/translate/detect` | Detect language |
| POST | `/api/translate/analyze` | NLP analysis |
| POST | `/api/ocr/extract` | Extract text from image |
| POST | `/api/ocr/translate` | OCR + translate |
| POST | `/api/pdf/process` | Process PDF document |
| POST | `/api/download/txt` | Download as TXT |
| POST | `/api/download/docx` | Download as DOCX |
| POST | `/api/download/pdf` | Download as PDF |
| GET | `/api/history/` | Get translation history |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/dashboard/analytics` | Analytics data |
| POST | `/api/chatbot/message` | Chat with AI assistant |
| GET | `/api/health` | System health check |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, TailwindCSS, Framer Motion, Recharts |
| **Backend** | FastAPI, SQLAlchemy, Pydantic, SlowAPI |
| **AI/NLP** | HuggingFace Transformers, Tesseract OCR, TextBlob, YAKE |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **Auth** | JWT (python-jose), BCrypt |
| **Deploy** | Docker, Docker Compose, Nginx |

---

## 📜 License

MIT License — Built for educational purposes.

---

<p align="center">Built with ❤️ using <b>FastAPI</b> + <b>React</b> + <b>AI/NLP</b></p>
