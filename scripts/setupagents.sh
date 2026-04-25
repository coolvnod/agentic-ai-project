#!/usr/bin/env bash
set -euo pipefail

# Creates team agents for Agentic-Office/OpenClaw and warms them up so they appear in dashboard.

MODEL="${OPENCLAW_MODEL:-ollama/qwen3.5:cloud}"
BASE_WORKSPACE="${OPENCLAW_TEAM_WORKSPACE:-$HOME/.openclaw/workspace/team-agents}"

TEAM_IDS=("kevin" "mark" "ronny" "jhon" "docclaw")
TEAM_NAMES=("Kevin" "Mark" "Ronny" "Jhon" "DocClaw")
TEAM_ROLES=("Frontend Engineer" "Backend Engineer" "Systems Architect" "Security Auditor" "QA Engineer")
TEAM_EMOJIS=("🎨" "🛠️" "🏗️" "🛡️" "🧪")

mkdir -p "$BASE_WORKSPACE"

if ! command -v openclaw >/dev/null 2>&1; then
  echo "openclaw CLI not found in PATH." >&2
  exit 1
fi

list_agents_json() {
  openclaw agents list --json 2>/dev/null || echo '[]'
}

agent_exists() {
  local id="$1"
  local json
  json="$(list_agents_json)"
  OPENCLAW_AGENTS_JSON="$json" python3 - "$id" <<'PY'
import json, os, sys
agent_id = sys.argv[1]
raw = os.environ.get('OPENCLAW_AGENTS_JSON', '[]').strip() or '[]'
try:
    arr = json.loads(raw)
except Exception:
    arr = []
print('yes' if any(a.get('id') == agent_id for a in arr if isinstance(a, dict)) else 'no')
PY
}

echo "Using model: $MODEL"
echo "Team workspace base: $BASE_WORKSPACE"

for i in "${!TEAM_IDS[@]}"; do
  id="${TEAM_IDS[$i]}"
  name="${TEAM_NAMES[$i]}"
  role="${TEAM_ROLES[$i]}"
  emoji="${TEAM_EMOJIS[$i]}"
  ws="$BASE_WORKSPACE/$id"

  mkdir -p "$ws"

  if [[ "$(agent_exists "$id")" != "yes" ]]; then
    echo "Creating agent: $id"
    openclaw agents add "$id" \
      --workspace "$ws" \
      --model "$MODEL" \
      --non-interactive \
      --json >/dev/null
  else
    echo "Agent already exists: $id"
  fi

  openclaw agents set-identity --agent "$id" --name "$name ($role)" --emoji "$emoji" --json >/dev/null || true

  cat > "$ws/ROLE.md" <<EOF
# ${name} Role

You are ${name}, the ${role}.

Primary responsibility:
- ${role} tasks in software projects.

Collaboration rule:
- Coordinate with agents kevin, mark, ronny, jhon, docclaw and summarize progress clearly.
EOF

done

echo "Warming up agents so they appear in Agentic-Office..."
for i in "${!TEAM_IDS[@]}"; do
  id="${TEAM_IDS[$i]}"
  role="${TEAM_ROLES[$i]}"
  openclaw agent --agent "$id" --timeout 20 --message "You are online as $id ($role). Reply READY and wait for orchestration tasks." --json >/dev/null || true
  sleep 1
done

echo "Done. Current agents:"
openclaw agents list --json
