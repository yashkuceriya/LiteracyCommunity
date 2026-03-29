# System Patterns

## Architecture
```
Client (React SPA) → nginx → Django REST API → SQLite/PostgreSQL
                   ↘ static assets (WhiteNoise)
```

## Matching Algorithm (community/matching.py)
Scores 0-100 using weighted criteria:
- Shared problem statements: up to 45 pts (15 per shared, cap 3)
- District type match: 15 pts
- District size proximity: 0-15 pts (step-based)
- FRL% similarity: 0-10 pts
- ESL% similarity: 0-10 pts
- Same state: 5 pts

## Auth Pattern
- Session-based auth with CSRF tokens
- Frontend extracts csrftoken from cookies, attaches to requests
- 401 responses trigger redirect to /login via Axios interceptor
- Role-based access: member < moderator < admin

## Moderation Hierarchy
- Members can flag messages in their own conversations only
- Moderators can review flags, warn/suspend/ban members
- Moderators cannot action other moderators or admins
- Admins can action anyone except other admins
- Moderator conversation views are audit-only (don't mark messages read)

## Frontend Patterns
- AuthContext + ToastContext for global state
- ProtectedRoute component for auth guards
- ErrorBoundary wraps entire app
- All API errors surface via toast notifications or inline error states
- Loading skeletons on data-fetching pages

## API Design
- Function-based views with DRF decorators
- Session auth, no token/JWT
- Pagination: 20 items per page for directory
- All endpoints under /api/ prefix
