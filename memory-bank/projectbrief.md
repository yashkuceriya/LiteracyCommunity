# Project Brief: Literacy Leaders Community

## Overview
Full-stack platform connecting school district literacy leaders through intelligent demographic-based matching. Curriculum directors, literacy coaches, and administrators find peers facing similar challenges and collaborate.

## Core Requirements
- Matching algorithm scoring members 0-100 on shared challenges, district demographics, FRL%, ESL%, geography
- Member directory with search/filter by state, district type, size, challenge area
- Direct messaging between matched members
- Resource library (articles, guides, research, tools, videos) with upvoting
- Community analytics dashboard
- District comparison tool (side-by-side demographics)
- Moderation system (flag messages, warn/suspend/ban users, role hierarchy)
- Onboarding wizard for new members

## Tech Stack
- **Backend:** Django 5 + Django REST Framework, SQLite (dev), PostgreSQL (prod)
- **Frontend:** React 18, React Router 6, Axios, Tailwind CSS 4, Vite 6
- **Infrastructure:** Docker Compose, GitHub Actions CI, nginx, gunicorn, WhiteNoise

## Target Users
School district leaders: curriculum directors, literacy coaches, principals, administrators

## Success Criteria
- Accurate matching based on district demographics and shared literacy challenges
- Clean, professional UX with proper error handling and accessibility
- Production-ready deployment with security hardening
