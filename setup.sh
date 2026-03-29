#!/bin/bash
set -e

echo "=== Literacy Leaders Community — Setup ==="

# Backend
echo ""
echo "Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -q -r requirements.txt
python manage.py makemigrations accounts community messaging moderation
python manage.py migrate
python manage.py seed_data
echo ""
echo "Creating admin superuser..."
DJANGO_SUPERUSER_PASSWORD=admin123 python manage.py createsuperuser --username admin --email admin@example.com --noinput 2>/dev/null || echo "  (admin user already exists)"
deactivate
cd ..

# Frontend
echo ""
echo "Setting up frontend..."
cd frontend
npm install
cd ..

echo ""
echo "=== Setup complete! ==="
echo ""
echo "To run the app:"
echo "  Terminal 1: cd backend && source venv/bin/activate && python manage.py runserver"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Demo accounts:"
echo "  Member:    sarah_chen / password123"
echo "  Moderator: moderator / password123"
echo "  Admin:     admin / admin123"
