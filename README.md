# Agentic-Office

Agentic-Office is a real-time virtual office dashboard for OpenClaw agents.

Created by **Gaurav Karthikeyan** and **Vinod Kumar** (Team Rocket).

It includes:
- A Fastify backend with REST + WebSocket APIs
- A React/Vite frontend rendered from the backend in production build mode
- Shared types/schemas in a PNPM monorepo
- OpenClaw Gateway integration (live agent status, logs, tasks, movement)

---

## 1) Tech Stack

- Node.js 20+
- PNPM 10+
- TypeScript
- Fastify
- React + Vite
- WebSocket (`/ws`)

---

## 2) Project Structure

```text
.
├─ packages/
│  ├─ backend/      # API + WS server + OpenClaw integration
│  ├─ frontend/     # UI app
│  └─ shared/       # shared types/schemas/constants
├─ assets/          # office layout, collision grid, sprites
├─ agentic-office.json
├─ .env
├─ start.sh
└─ stop.sh
```

---

## 3) Prerequisites

Install the following first:

1. **Node.js 20+**
2. **PNPM 10+** (Corepack supported)
3. **OpenClaw running locally** with gateway enabled (default gateway: `ws://127.0.0.1:18789`)
4. `~/.openclaw/openclaw.json` must exist (used to auto-read gateway token)

Enable PNPM with Corepack:

```bash
corepack enable
corepack prepare pnpm@10.17.1 --activate
```

---

## 4) Environment Configuration

The project uses `.env` at repo root.

Important keys:

```env
AGENTIC_OFFICE_HOST=0.0.0.0
AGENTIC_OFFICE_PORT=3000
AGENTIC_OFFICE_GATEWAY_URL=ws://127.0.0.1:18789
AGENTIC_OFFICE_DEBUG=false
# Optional overrides:
# AGENTIC_OFFICE_GATEWAY_TOKEN=...
# AGENTIC_OFFICE_OPENCLAW_CONFIG=/Users/<you>/.openclaw/openclaw.json
# AGENTIC_OFFICE_APPEARANCES_PATH=/Users/<you>/.openclaw/agentic-office/appearances.json
# AGENTIC_OFFICE_OFFICE_LAYOUT_PATH=./assets/office-layout.json
```

### OpenClaw connection notes

- Local non-Docker: usually `AGENTIC_OFFICE_GATEWAY_URL=ws://127.0.0.1:18789`
- Docker on Linux host networking: use your host-reachable gateway URL if needed.
- If OpenClaw auth token is not picked automatically, set `AGENTIC_OFFICE_GATEWAY_TOKEN` explicitly.

---

## 5) Quick Setup (Recommended)

Use this once for clean bootstrap:

```bash
pnpm install --frozen-lockfile
pnpm -r build
chmod +x start.sh stop.sh
./start.sh
```

What this does:
- installs dependencies
- builds shared/backend/frontend
- starts backend server from `packages/backend/dist/server.js`
- serves built frontend from backend
- connects to OpenClaw gateway using `.env`

Stop service:

```bash
./stop.sh
```

Logs location:

```text
~/.openclaw/agentic-office/agentic-office.log
```

---

## 6) One-Command Daily Start

After first setup, start quickly with:

```bash
./start.sh
```

Health check:

```bash
curl http://127.0.0.1:3000/api/v1/health
```

Expected response:

```json
{"ok":true,"service":"agentic-office-backend"}
```

Open app:

```text
http://127.0.0.1:3000
```

---

## 7) Development Mode (manual)

### Frontend only (Vite)

```bash
pnpm dev
```

This runs Vite for the frontend package.

### Backend (built JS watch mode)

```bash
pnpm --filter backend build
pnpm --filter backend dev
```

> Note: backend `dev` watches `dist/server.js`, so rebuild may be required after TypeScript source changes.

---

## 8) Docker Run (Production Style)

```bash
docker compose up --build -d
```

Then check:

```bash
docker compose ps
docker compose logs -f agentic-office
```

Stop:

```bash
docker compose down
```

---

## 9) Configuration File

`agentic-office.json` controls display names, roles, hierarchy, reserved waypoints, and spawn positions.

Start from template:

```bash
cp agentic-office.example.json agentic-office.json
```

---

## 10) Troubleshooting

### A) Cannot connect to OpenClaw gateway

- Confirm OpenClaw is running.
- Verify gateway URL in `.env` (`AGENTIC_OFFICE_GATEWAY_URL`).
- Verify token availability in `~/.openclaw/openclaw.json` or set `AGENTIC_OFFICE_GATEWAY_TOKEN`.

### B) Health endpoint fails

- Check process/logs:
  - `./stop.sh`
  - `./start.sh`
  - `tail -f ~/.openclaw/agentic-office/agentic-office.log`

### C) Port already in use

- Change `.env` port (`AGENTIC_OFFICE_PORT`) and restart.

### D) macOS note for `start.sh`

`start.sh` checks port binding with `ss`.
If your macOS setup does not have `ss`, install it (for example via `iproute2mac`) or run using Docker/manual commands.

---

## 11) API/WS Endpoints

- Health: `/api/v1/health`
- Agents: `/api/v1/agents`
- Office layout: `/api/v1/office/layout`
- Meetings: `/api/v1/meetings`
- WebSocket: `/ws`

---

## 12) Quick Verification Checklist

1. OpenClaw is running and gateway is reachable.
2. `.env` has correct `AGENTIC_OFFICE_GATEWAY_URL`.
3. `pnpm install --frozen-lockfile` succeeded.
4. `./start.sh` started successfully.
5. `http://127.0.0.1:3000/api/v1/health` returns `ok: true`.
6. UI loads at `http://127.0.0.1:3000` and agents appear.

---

## Credits

**Agentic-Office** by **Gaurav Karthikeyan** and **Vinod Kumar** — **Team Rocket**.
