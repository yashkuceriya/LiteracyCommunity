# Literacy Leaders Community

A full-stack platform connecting school district literacy leaders through intelligent demographic-based matching. Built to help curriculum directors, literacy coaches, and administrators find peers facing similar challenges — and learn from each other.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5 + Django REST Framework |
| Frontend | React 18 + React Router 6 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Database | SQLite (development) |
| Auth | Session-based with CSRF protection |

## Features

### Intelligent Matching Algorithm
Members are scored on a **0-100 compatibility scale** using six weighted criteria:

| Criteria | Max Points | Description |
|----------|-----------|-------------|
| Shared Challenges | 45 pts | 15 pts per shared problem statement (capped at 3) |
| District Type | 15 pts | Urban, suburban, rural, or town classification |
| District Size | 15 pts | Proximity in enrollment brackets (small/medium/large/very large) |
| Free/Reduced Lunch % | 10 pts | Socioeconomic similarity |
| ESL % | 10 pts | English Language Learner population similarity |
| Same State | 5 pts | Geographic proximity bonus |

### Core Platform
- **Member Directory** — Search and filter community members by state, district type, size, and challenge areas
- **Messaging** — Direct conversations between matched members with real-time polling
- **Resource Library** — Share and upvote articles, guides, research, tools, and videos tagged by literacy challenge
- **Analytics Dashboard** — Community-wide insights: member distribution by district type, state, and challenge area
- **District Comparison** — Side-by-side comparison of up to 4 districts across all demographic metrics
- **Moderation Tools** — Flag messages, review reports, warn/suspend/ban users with full audit trail
- **Announcements** — Pinned community announcements from moderators and admins
- **Onboarding Flow** — 4-step guided profile setup for new members

## Architecture

```
backend/
├── accounts/       # Custom User model, auth endpoints (register, login, logout, password change)
├── community/      # Districts, problem statements, member profiles, matching algorithm, analytics
├── messaging/      # Conversations and messages with read tracking
├── moderation/     # Message flagging, moderator review, user actions (warn/suspend/ban)
├── resources/      # Shared literacy resources with upvoting
└── config/         # Django settings and root URL configuration

frontend/
├── src/
│   ├── api/        # Axios client with CSRF interceptor
│   ├── components/ # Navbar, MemberCard, ProtectedRoute
│   ├── pages/      # 15 pages (Dashboard, Matches, Directory, Messages, Resources, Analytics, etc.)
│   └── store/      # AuthContext, ToastContext
```

### API Endpoints

| Prefix | App | Key Endpoints |
|--------|-----|--------------|
| `/api/auth/` | Accounts | `POST register`, `POST login`, `POST logout`, `GET me`, `POST change-password` |
| `/api/community/` | Community | `GET matches`, `GET directory`, `GET profile`, `GET analytics`, `POST compare-districts` |
| `/api/messaging/` | Messaging | `GET conversations`, `POST conversations`, `POST messages`, `GET unread-count` |
| `/api/moderation/` | Moderation | `POST flag`, `GET flagged`, `POST review`, `POST users/:id/action` |
| `/api/resources/` | Resources | `GET list`, `POST create`, `POST upvote`, `DELETE remove` |

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 20+

### Setup

```bash
# Clone and setup
git clone <repo-url>
cd LiteracyCommunity
chmod +x setup.sh run.sh
./setup.sh
```

### Run

```bash
./run.sh
# Backend:  http://127.0.0.1:8000
# Frontend: http://localhost:5173
```

Or run manually:
```bash
# Terminal 1 — Backend
cd backend && source venv/bin/activate && python manage.py runserver

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### Docker (Production)

```bash
docker compose up --build
# App available at http://localhost (port 80)
# Gunicorn + nginx, static assets cached, security headers enabled
```

### Docker (Development)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
# Backend:  http://localhost:8000 (Django runserver with hot reload)
# Frontend: http://localhost:5173 (Vite dev server with HMR)
```

### Run Tests

```bash
cd backend && source venv/bin/activate && python manage.py test
```

## Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Member | `sarah_chen` | `password123` |
| Moderator | `moderator` | `password123` |
| Admin | `admin` | `admin123` |

## Seed Data

The project ships with 40 realistic school districts across the US (seeded from NCES data patterns), 20 curated literacy challenge areas across 5 categories, and demo user accounts. Run `python manage.py seed_data` to populate.

### Challenge Categories
- **Curriculum & Instruction** — Science of Reading, phonics programs, writing instruction
- **Assessment & Data** — Universal screening, data-driven decision making, progress monitoring
- **Professional Development** — Teacher coaching, training design, learning communities
- **Equity & Access** — ELL support, special education, family engagement, diverse materials
- **Leadership & Culture** — Reading culture, stakeholder communication, change management

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | dev key (dev only) | Django secret key — **required in production** |
| `DEBUG` | `True` | Set to `False` in production |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated allowed hosts |

## License

MIT
