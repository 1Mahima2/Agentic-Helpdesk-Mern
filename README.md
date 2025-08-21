# Smart Helpdesk with Agentic Triage (MERN - Track A)

A minimal, production-lean scaffold for the Wexa AI Fresher Assignment. This version implements the full required flows with a **deterministic LLM stub** so you can run without external keys.

## Features
- Users: register/login (JWT), create tickets, view replies & status
- Admin: manage KB articles (CRUD), set auto-close threshold
- Agentic Triage: classify → retrieve KB → draft reply → auto-close or assign
- Audit Log: every step recorded with `traceId`
- Runs with Docker Compose: `client`, `api`, `mongo`
- Seed script for users, KB, and tickets
- Basic tests
- Works with `STUB_MODE=true` (no API keys required)

## Quick Start (Docker)
```bash
# in project root:
docker compose up --build

# API will start at http://localhost:8080
# Frontend will start at http://localhost:5173
```

## Default Env
See `.env.example` in `api` and `client` directories. Copy them to `.env` before running locally without Docker (Docker uses defaults in compose).

## Seed
After containers are up, run the seed inside the API container:
```bash
docker compose exec api node scripts/seed.js
```
The seed creates:
- Admin: `admin@example.com` / `password123`
- Agent: `agent@example.com` / `password123`
- User: `user@example.com` / `password123`

## Architecture
- **Frontend**: React + Vite; simple pages for Auth, KB management, Tickets, Ticket Detail, Settings
- **Backend**: Node 20 + Express + Mongoose (MongoDB)
- **Agent Stub**: keyword-based classifier + simple KB retriever + templated reply
- **Background**: triage runs inline for simplicity (can be swapped to a queue)

### High-level Diagram
```
User ──> client (React) ──> api (Express/Mongo)
                               │
                               ├─ KB Service
                               ├─ Ticket Service
                               ├─ Agent Service (stub)
                               └─ Audit Log
```

## API Overview
- `POST /api/auth/register` → `{ token }`
- `POST /api/auth/login` → `{ token }`
- `GET /api/kb?query=` (search); `POST /api/kb` (admin); `PUT /api/kb/:id` (admin); `DELETE /api/kb/:id` (admin)
- `POST /api/tickets` (user); `GET /api/tickets`; `GET /api/tickets/:id`
- `POST /api/tickets/:id/reply` (agent); `POST /api/tickets/:id/assign` (admin/agent)
- `POST /api/agent/triage` (internal); `GET /api/agent/suggestion/:ticketId`
- `GET /api/config`; `PUT /api/config` (admin)
- `GET /api/tickets/:id/audit`

## Testing
```bash
docker compose exec api npm test
```

## Notes
- This project is intentionally compact to meet timebox; extend as needed (BullMQ/Redis, WebSockets, per-category thresholds, etc.).
- All timestamps are ISO strings; basic validation is included on writes.
- Never commit real secrets.
