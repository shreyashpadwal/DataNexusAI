# DataNexus AI

> An AI-powered full-stack data analytics platform that lets users query structured PostgreSQL data using natural language, process CSV datasets through Agentic AI ETL workflows, and explore data through an interactive analytics dashboard.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Architecture](#3-architecture)
4. [Tech Stack](#4-tech-stack)
5. [Requirements](#5-requirements)
6. [PostgreSQL Setup](#6-postgresql-setup)
7. [Environment Variables](#7-environment-variables)
8. [Backend Setup](#8-backend-setup)
9. [Frontend Setup](#9-frontend-setup)
10. [Running the Application](#10-running-the-application)
11. [API Endpoints](#11-api-endpoints)
12. [Authentication](#12-authentication)
13. [AI Analyst](#13-ai-analyst)
14. [ETL Pipeline](#14-etl-pipeline)
15. [Data Dashboard](#15-data-dashboard)
16. [Security Design](#16-security-design)
17. [Observability](#17-observability)
18. [Known Limitations](#18-known-limitations)
19. [Project Structure](#19-project-structure)

---

## 1. Project Overview

DataNexus AI is a full-stack AI analytics application. Users can:

1. **Ask natural-language questions** about their data → get SQL + answers + visualizations
2. **Upload CSV files** → ETL Agent cleans and loads them into PostgreSQL
3. **View a live analytics dashboard** → KPI cards, charts, and vehicle/city breakdowns
4. **Browse query history** → review past AI queries with SQL and results
5. **Register and log in** → JWT-protected application with full session management

Built on React + FastAPI + LangGraph + Groq + PostgreSQL.

---

## 2. Features

| Feature | Description |
|---------|-------------|
| 🔐 JWT Authentication | Register, login, protected routes |
| 🤖 AI Analyst | Natural language → SQL → PostgreSQL → AI answer |
| 📊 Data Dashboard | KPI cards, revenue charts, city/vehicle analytics |
| 🔄 ETL Pipeline | CSV upload → clean → deduplicate → PostgreSQL |
| 📜 Query History | Browse and replay past AI queries |
| 🌙 Light/Dark Theme | Full theme system with persistent preference |
| 🛡️ SQL Security | SELECT-only enforcement via sqlglot |
| 📱 Responsive UI | Mobile-first sidebar + layout |

---

## 3. Architecture

```
                        USER
                          |
                          v
                   React Frontend  (port 5173)
                   /     |       \
                  /      |        \
            AI Analyst  Dashboard  ETL
                 |                  |
                 v                  v
           FastAPI Backend  (port 8000)
                  |                 |
            LangGraph Router        |
             /           \          |
            /             \         |
       SQL Agent       ETL Agent    |
           |                |       |
         Groq             Pandas    |
           |                |       |
     SQL Validation      Validation |
           |                |       |
           └────────┬────────┘       |
                    |                |
                    v                v
               PostgreSQL  ←────────┘
```

### Data Flow — AI Analyst
```
User Question → FastAPI → LangGraph Router → SQL Agent → Groq LLM
→ SQL Validation (sqlglot) → PostgreSQL → Natural Language Answer → React UI
```

### Data Flow — ETL
```
CSV File → FastAPI → ETL Agent → Groq (selects ops) → Pandas
→ Validate → PostgreSQL (etl_staging) → Summary → React UI
```

### Data Flow — Dashboard
```
PostgreSQL → /api/stats + /api/dashboard/stats
→ KPI metrics + chart data → React Recharts → Visual analytics
```

---

## 4. Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool + dev server |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Recharts | Data visualizations (dashboard charts) |
| Axios | HTTP client |
| lucide-react | Icons |
| react-router-dom | Client-side routing |

### Backend
| Technology | Purpose |
|-----------|---------|
| Python 3.12 | Runtime |
| FastAPI | REST API framework |
| SQLAlchemy | ORM + database access |
| Pydantic v2 | Request/response validation |
| Uvicorn | ASGI server |
| PyJWT + bcrypt | JWT authentication |

### Agentic AI
| Technology | Purpose |
|-----------|---------|
| LangGraph | Agent workflow orchestration |
| LangChain | LLM integration layer |
| Groq API | LLM inference provider |
| openai/gpt-oss-20b | Language model (SQL generation + answers) |

### Data / ETL
| Technology | Purpose |
|-----------|---------|
| Pandas | CSV processing and transformation |
| PostgreSQL | Primary database |
| sqlglot | SQL validation and parsing |

---

## 5. Requirements

- **Python** 3.10+
- **Node.js** 18+
- **PostgreSQL** 14+
- **Groq API Key** — free tier: https://console.groq.com

---

## 6. PostgreSQL Setup

```sql
-- Create the database
CREATE DATABASE datanexus_ai;
```

Tables are created automatically on first backend startup.

To seed with sample data (30 users, 20 vehicles, 196 rides, Indian transportation dataset):

```powershell
cd backend
venv\Scripts\python.exe init_db.py
```

**Sample dataset stats:**
- 30 ride customers, 20 vehicles, 196 rides, 196 payments, 156 ratings
- Indian cities, ₹ pricing, 12 months of 2024 data
- Total revenue: ₹26,473 | Average rating: 4.25

---

## 7. Environment Variables

### Backend (`backend/.env`)

Copy `backend/.env.example` → `backend/.env` and fill in your values:

```env
DATABASE_URL=postgresql://postgres:your_password@127.0.0.1:5432/datanexus_ai
ANALYTICS_DATABASE_URL=postgresql://postgres:your_password@127.0.0.1:5432/datanexus_ai
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=openai/gpt-oss-20b
SECRET_KEY=your-secret-key-min-32-chars-change-in-production
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=10
```

### Frontend (`frontend/.env`)

Copy `frontend/.env.example` → `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

> **Security:** Never commit `.env` files. API keys and database credentials must stay server-side only.

---

## 8. Backend Setup

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Seed the database with sample data
python init_db.py

# Start the server
uvicorn app.main:app --port 8000 --reload
```

API documentation: http://localhost:8000/docs

---

## 9. Frontend Setup

```powershell
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```

Visit: http://localhost:5173

---

## 10. Running the Application

Run both servers simultaneously in two terminals:

**Terminal 1 — Backend:**
```powershell
cd backend
venv\Scripts\activate
uvicorn app.main:app --port 8000 --reload
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```

Open **http://localhost:5173** → Register or log in → explore all features.

---

## 11. API Endpoints

All endpoints except `/api/health` and `/api/auth/*` require a JWT Bearer token.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | Public | Service health + database connectivity |
| `POST` | `/api/auth/register` | Public | Register new account |
| `POST` | `/api/auth/login` | Public | Login → returns JWT token |
| `GET` | `/api/auth/me` | JWT | Get current user info |
| `GET` | `/api/stats` | JWT | Application-level statistics |
| `GET` | `/api/database/stats` | JWT | Database row counts + revenue |
| `POST` | `/api/chat` | JWT | Natural-language query → AI answer |
| `POST` | `/api/etl/upload` | JWT | Upload CSV → ETL processing |
| `GET` | `/api/dashboard/stats` | JWT | Aggregated dashboard chart data |

### GET /api/dashboard/stats

Supports `?period=all|2024|30d|7d` query parameter.

```json
{
  "revenue_over_time": [{"month": "2024-01", "revenue": 2150.50}],
  "revenue_by_city":   [{"city": "Mumbai", "revenue": 8200.0}],
  "rides_by_city":     [{"city": "Mumbai", "rides": 45}],
  "top_vehicles":      [{"model": "Toyota Innova", "revenue": 4200.0, "rides": 32}]
}
```

---

## 12. Authentication

DataNexus AI uses JWT (JSON Web Token) authentication:

1. **Register** at `/register` → account stored in `auth_users` table (password bcrypt-hashed)
2. **Login** at `/login` → receive a JWT access token (60-minute expiry by default)
3. **Frontend** stores token in `localStorage`, attaches as `Authorization: Bearer <token>` on all API requests
4. **Backend** validates token on every protected endpoint

Security:
- Passwords are **never** returned to the frontend
- Password hashes are **never** exposed via the AI Analyst
- JWT secret is read from `.env` — never committed to source code

---

## 13. AI Analyst

The AI Analyst uses a LangGraph agent workflow:

1. User types a natural-language question
2. LangGraph **Router** classifies: SQL query or ETL task
3. **SQL Agent** prompts Groq with the database schema → generates SELECT SQL
4. **SQL Validator** (sqlglot) rejects any non-SELECT statement
5. SQLAlchemy executes the validated SQL against PostgreSQL
6. Groq converts raw results into a natural-language answer
7. Response includes: answer, SQL, data rows, execution steps, timing

### Example Questions

```
What is the total revenue?
Which vehicle type generated the highest revenue?
Show the number of rides by city.
What is the average customer rating?
Which city has the most rides?
Show the top 5 vehicles by revenue.
How many users registered?
What percentage of payments were successful?
```

### SQL Security

- Only `SELECT` statements are allowed
- `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`, multi-statement SQL → all blocked
- sqlglot parses every generated query before execution

---

## 14. ETL Pipeline

1. Upload a `.csv` file (max 10 MB, max 10,000 rows)
2. Provide optional processing instructions
3. ETL Agent (Groq) selects operations from a **fixed allowlist**:
   - `normalize_columns` — standardizes column names
   - `remove_duplicates` — deduplicates rows by content hash
   - `handle_missing_values` — fills NaN values
4. Pandas transforms the data
5. Validated rows are inserted into `etl_staging` via SQLAlchemy with SHA-256 hash deduplication
6. Summary returned to the UI

> The ETL Agent selects from a predefined operation list. It never generates or executes arbitrary Python code.

---

## 15. Data Dashboard

The `/data-dashboard` page provides a visual overview of the PostgreSQL dataset:

- **KPI Cards** — Total Revenue, Total Rides, Total Users, Average Rating (from `/api/stats`)
- **Revenue Over Time** — Monthly area chart (from `/api/dashboard/stats`)
- **Revenue by City** — Horizontal bar chart
- **Rides by City** — Vertical bar chart
- **Vehicle Performance** — Top vehicles by revenue table

Features:
- Date filter: All Time | 2024 | Last 30 Days | Last 7 Days
- Live refresh button
- Skeleton loading states
- Graceful empty/error states
- Full dark/light theme support

All data is fetched live from PostgreSQL — nothing is hardcoded.

---

## 16. Security Design

| Control | Implementation |
|---------|----------------|
| SQL read-only enforcement | sqlglot parses and validates every generated SQL. Only SELECT is allowed. |
| JWT authentication | bcrypt password hashing, PyJWT token signing, 60-min expiry |
| Controlled database writes | Only ETL pipeline writes to `etl_staging`. Core tables are read-only from the API. |
| Parameterized operations | SQLAlchemy ORM — no string-interpolated SQL |
| Environment-based secrets | GROQ_API_KEY, DATABASE_URL, SECRET_KEY in `.env` only |
| No arbitrary code execution | No `exec()`, `eval()`, or `os.system()` in application code |
| CSV validation | File type, size, row count all validated before processing |
| ETL allowlist | Operations are a fixed set — LLM cannot add to this list |
| LLM receives schema only | Groq sees table structure — never raw user data or credentials |
| Dashboard period filter | Period enum matched server-side — no SQL injection possible |

---

## 17. Observability

Every API request receives:
- `request_id` — UUID in response body + `X-Request-ID` header
- `duration_ms` — processing time in response body + `X-Duration-Ms` header

---

## 18. Known Limitations

| Limitation | Detail |
|-----------|--------|
| Groq rate limits | Free tier: ~8,000 TPM. Multiple rapid requests may hit limits. |
| ETL staging only | ETL pipeline writes to `etl_staging`, not core transportation tables. |
| Local development | Not production-hardened (no rate limiting, no HTTPS enforcement). |
| SQL complexity | Very complex multi-table JOINs may produce imperfect LLM-generated SQL. |
| No logout endpoint | JWT expiry handles session end; frontend clears token on logout. |

---

## 19. Project Structure

```
DataNexusAI/
├── .gitignore
├── README.md
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py          # JWT auth endpoints
│   │   │   ├── chat.py          # AI Analyst endpoint
│   │   │   ├── dashboard.py     # Dashboard chart data
│   │   │   ├── database.py      # Database stats endpoints
│   │   │   ├── etl.py           # ETL upload endpoint
│   │   │   ├── health.py        # Health check
│   │   │   └── stats.py         # Application statistics
│   │   ├── agents/              # LangGraph agent definitions
│   │   ├── database/            # SQLAlchemy connection
│   │   ├── middleware/          # Observability middleware
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic services
│   │   ├── tools/               # LangGraph tools
│   │   ├── auth_utils.py        # JWT utilities
│   │   ├── config.py            # Settings
│   │   └── main.py              # FastAPI app entry point
│   ├── database/
│   │   ├── schema.sql           # PostgreSQL schema
│   │   └── seed.sql             # Sample data
│   ├── test_data/
│   │   └── sample_rides.csv     # ETL test file
│   ├── init_db.py               # Database seeder
│   ├── migrate_auth.py          # Auth migration script
│   ├── test_auth.py             # Authentication tests
│   ├── test_full_regression.py  # Full JWT-aware regression tests
│   ├── test_module*.py          # Module regression tests
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/api.ts            # Centralized API service
    │   ├── components/
    │   │   ├── dashboard/        # Dashboard components
    │   │   └── *.tsx             # Shared components
    │   ├── contexts/             # React contexts (Auth, Theme)
    │   ├── layouts/              # ProtectedLayout (sidebar)
    │   ├── pages/                # All page components
    │   ├── App.tsx               # Router config
    │   ├── index.css             # Theme CSS variables
    │   └── main.tsx              # App entry point
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── .env.example
```

---

*Built as a full-stack AI analytics project demonstrating LangGraph agent workflows, natural language to SQL conversion, JWT authentication, controlled ETL pipelines, and interactive data visualization.*
