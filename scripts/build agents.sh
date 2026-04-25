#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/openclaw-build-webapp.sh "build a portfolio website with admin panel"

PROMPT="${*:-build a modern web app}"

if ! command -v openclaw >/dev/null 2>&1; then
  echo "openclaw CLI not found in PATH." >&2
  exit 1
fi

echo "Dispatching team build task..."

openclaw agent --agent kevin --message "Role: Frontend Engineer. Task: ${PROMPT}. Focus on UI/UX, React components, responsive styles, and frontend integration notes." --json >/dev/null || true
openclaw agent --agent mark --message "Role: Backend Engineer. Task: ${PROMPT}. Focus on API design, backend architecture, data flow, and integration contract for frontend." --json >/dev/null || true
openclaw agent --agent ronny --message "Role: Systems Architect. Task: ${PROMPT}. Define project structure, folder layout, standards, CI/CD and deployment plan." --json >/dev/null || true
openclaw agent --agent jhon --message "Role: Security Auditor. Task: ${PROMPT}. Review threat model, auth, secrets, input validation, and security checklist." --json >/dev/null || true

openclaw agent --agent main --message "Coordinate agents kevin, mark, ronny, jhon for task: ${PROMPT}. Merge outputs into one implementation plan and execution order." --json >/dev/null || true

echo "Team task dispatched to main + kevin + mark + ronny + jhon."
