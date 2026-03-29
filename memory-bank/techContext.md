# Tech Context

## Backend
- Django 5 + DRF with session-based auth (CSRF protected)
- 5 apps: accounts, community, messaging, moderation, resources
- SQLite for dev, PostgreSQL for prod (swap via DATABASE_URL)
- gunicorn (3 workers) for production WSGI
- WhiteNoise for static file serving with compression + cache busting

## Frontend
- React 18 + React Router 6 (SPA with client-side routing)
- Tailwind CSS 4 via @tailwindcss/vite plugin
- Axios with CSRF interceptor + 401 global handler
- Vite 6 dev server proxies /api to Django

## Infrastructure
- Docker Compose: production (gunicorn + nginx) and dev override (runserver + vite HMR)
- nginx reverse proxy: /api → backend, SPA fallback via try_files
- GitHub Actions CI: Django tests + frontend build on push/PR
- Security headers (HSTS, secure cookies, XSS filter) when DEBUG=False

## Dependencies
- Backend: django, djangorestframework, django-cors-headers, gunicorn, whitenoise
- Frontend: react, react-dom, react-router-dom, axios

## Dev Setup
- `./setup.sh` → creates venv, installs deps, migrates, seeds data
- `./run.sh` → starts both servers
- `python manage.py test` → 60 tests
- `npm run build` → production bundle
