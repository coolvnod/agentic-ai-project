import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_HOST = '0.0.0.0';
export const DEFAULT_PORT = 3000;
export const DEFAULT_LOG_LEVEL = 'info';
export const DEFAULT_GATEWAY_URL = 'ws://127.0.0.1:18789';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MONOREPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const DEFAULT_OFFICE_LAYOUT_PATH = path.join(MONOREPO_ROOT, 'assets', 'office-layout.json');

export const DEFAULT_OPENCLAW_CONFIG_PATH = path.join(
  process.env.HOME ?? '/root',
  '.openclaw',
  'openclaw.json',
);
export const DEFAULT_APPEARANCES_PATH = path.join(
  process.env.HOME ?? '/root',
  '.openclaw',
  'agentic-office',
  'appearances.json',
);
