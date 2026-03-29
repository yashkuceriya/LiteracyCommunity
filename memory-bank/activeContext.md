# Active Context

## Current State
Project is feature-complete and production-hardened. Deployed to GitHub at yashkuceriya/LiteracyCommunity.

## Recent Changes
- Fixed 4 authorization/performance bugs (moderator read-state leak, unrestricted flagging, missing role hierarchy, N+1 queries)
- Added production Docker setup (gunicorn + nginx)
- Security headers, CSRF_TRUSTED_ORIGINS, WhiteNoise static serving
- 60 backend tests all passing
- All frontend silent catches replaced with proper error handling
- 26 aria-labels added for accessibility

## Next Steps
- Deploy: Railway (backend) + Vercel (frontend) or single Docker host
- Add PostgreSQL support via dj-database-url for production DB
- Add email backend for future password reset flow
- Consider WebSocket for real-time messaging (currently polls every 8s)

## Active Decisions
- SQLite stays for dev, PostgreSQL for prod (swap via DATABASE_URL env var)
- Session auth chosen over JWT for simplicity (single-domain deployment)
- Matching runs synchronously — acceptable at current scale, would need Celery for 10K+ users
