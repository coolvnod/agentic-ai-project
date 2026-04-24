import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function stripJsoncComments(json: string): string {
  let result = '';
  let inString = false;
  let stringChar = '';
  let i = 0;
  while (i < json.length) {
    const ch = json[i];
    if (inString) {
      result += ch;
      if (ch === '\\') { i++; if (i < json.length) result += json[i]; }
      else if (ch === stringChar) inString = false;
    } else if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      result += ch;
    } else if (ch === '/' && json[i + 1] === '/') {
      while (i < json.length && json[i] !== '\n') i++;
      continue;
    } else if (ch === '/' && json[i + 1] === '*') {
      i += 2;
      while (i < json.length && !(json[i] === '*' && json[i + 1] === '/')) i++;
      i += 2;
      continue;
    } else {
      result += ch;
    }
    i++;
  }
  return result;
}

export interface HierarchyEdge {
  parent: string;
  child: string;
}

export interface SpawnPosition {
  x: number;
  y: number;
}

export interface AgenticOfficeConfigSchema {
  displayNames: Record<string, string>;
  roles: Record<string, string>;
  hierarchy: HierarchyEdge[];
  reservedWaypoints: Record<string, string>;
  spawnPositions: SpawnPosition[];
}

const DEFAULT_SPAWN_POSITIONS: SpawnPosition[] = [
  { x: 3, y: 22 },
  { x: 6, y: 22 },
  { x: 16, y: 22 },
  { x: 20, y: 21 },
  { x: 23, y: 22 },
  { x: 31, y: 22 },
  { x: 35, y: 22 },
  { x: 48, y: 22 },
  { x: 52, y: 22 },
  { x: 57, y: 22 },
  { x: 69, y: 22 },
  { x: 72, y: 22 },
  { x: 3, y: 21 },
  { x: 18, y: 21 },
  { x: 32, y: 21 },
  { x: 38, y: 21 },
];

const DEFAULT_CONFIG: AgenticOfficeConfigSchema = {
  displayNames: {
    main: 'Clawdie',
    devo: 'Devo',
    cornelio: 'Cornelio',
    docclaw: 'DocClaw',
    infralover: 'InfraLover',
    forbidden: 'Forbidden',
  },
  roles: {
    main: 'CEO',
    devo: 'CDO',
    cornelio: 'CISO',
    infralover: 'IM',
    docclaw: 'DM',
    forbidden: 'Analyst',
  },
  hierarchy: [
    { parent: 'main', child: 'devo' },
    { parent: 'main', child: 'cornelio' },
    { parent: 'devo', child: 'infralover' },
    { parent: 'devo', child: 'docclaw' },
    { parent: 'infralover', child: 'forbidden' },
  ],
  reservedWaypoints: {},
  spawnPositions: [...DEFAULT_SPAWN_POSITIONS],
};

class AgenticOfficeConfig {
  private config: AgenticOfficeConfigSchema = { ...DEFAULT_CONFIG };

  constructor() {
    this.load();
  }

  private load(): void {
    let configPath = path.resolve(process.cwd(), 'agentic-office.json');
    if (!existsSync(configPath)) {
      configPath = path.resolve(process.cwd(), '..', '..', 'agentic-office.json');
    }
    if (process.env.AGENTIC_OFFICE_CONFIG_PATH) {
      configPath = path.resolve(process.env.AGENTIC_OFFICE_CONFIG_PATH);
    }
    if (!existsSync(configPath)) {
      this.config = { ...DEFAULT_CONFIG };
      return;
    }
    try {
      const raw = readFileSync(configPath, 'utf8');
      const stripped = stripJsoncComments(raw);
      const parsed = JSON.parse(stripped) as Partial<AgenticOfficeConfigSchema>;
      this.config = {
        displayNames: parsed.displayNames ?? { ...DEFAULT_CONFIG.displayNames },
        roles: parsed.roles ?? { ...DEFAULT_CONFIG.roles },
        hierarchy: parsed.hierarchy ?? [...DEFAULT_CONFIG.hierarchy],
        reservedWaypoints: parsed.reservedWaypoints ?? { ...DEFAULT_CONFIG.reservedWaypoints },
        spawnPositions: Array.isArray(parsed.spawnPositions) && parsed.spawnPositions.length > 0
          ? parsed.spawnPositions as SpawnPosition[]
          : [...DEFAULT_SPAWN_POSITIONS],
      };
    } catch {
      this.config = { ...DEFAULT_CONFIG };
    }
  }

  reload(): void {
    this.load();
  }

  getDisplayName(agentId: string, _fallbackName: string): string | undefined {
    return this.config.displayNames[agentId];
  }

  getDisplayNameOrFallback(agentId: string, fallbackName: string): string {
    return this.config.displayNames[agentId] ?? fallbackName;
  }

  getRole(agentId: string): string {
    return this.config.roles[agentId] ?? 'Agent';
  }

  getHierarchy(): HierarchyEdge[] {
    return this.config.hierarchy;
  }

  getReservedWaypoint(agentId: string): string | null {
    return this.config.reservedWaypoints[agentId] ?? null;
  }

  getSpawnPositions(): SpawnPosition[] {
    return this.config.spawnPositions;
  }

  getPublicConfig(): { displayNames: Record<string, string>; roles: Record<string, string>; hierarchy: HierarchyEdge[] } {
    return {
      displayNames: { ...this.config.displayNames },
      roles: { ...this.config.roles },
      hierarchy: [...this.config.hierarchy],
    };
  }


  private getConfigPath(): string {
    let configPath = path.resolve(process.cwd(), 'agentic-office.json');
    if (!existsSync(configPath)) {
      configPath = path.resolve(process.cwd(), '..', '..', 'agentic-office.json');
    }
    if (process.env.AGENTIC_OFFICE_CONFIG_PATH) {
      configPath = path.resolve(process.env.AGENTIC_OFFICE_CONFIG_PATH);
    }
    return configPath;
  }

  private saveToFile(): void {
    const configPath = this.getConfigPath();
    const dir = path.dirname(configPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const json = JSON.stringify(this.config, null, 2);
    writeFileSync(configPath, `// Agentic-Office configuration – auto-generated\n${json}\n`, 'utf8');
  }

  updateDisplayName(agentId: string, displayName: string): { displayNames: Record<string, string> } {
    if (displayName.trim() === '') {
      delete this.config.displayNames[agentId];
    } else {
      this.config.displayNames[agentId] = displayName.trim();
    }
    this.saveToFile();
    return { displayNames: { ...this.config.displayNames } };
  }

  updateRole(agentId: string, role: string): { roles: Record<string, string> } {
    if (role.trim() === '') {
      delete this.config.roles[agentId];
    } else {
      this.config.roles[agentId] = role.trim();
    }
    this.saveToFile();
    return { roles: { ...this.config.roles } };
  }

  updateHierarchy(child: string, newParent: string | null): { hierarchy: HierarchyEdge[] } {
    if (newParent === child) {
      throw new Error('An agent cannot be its own parent.');
    }

    this.config.hierarchy = this.config.hierarchy.filter((e) => e.child !== child);

    if (newParent !== null) {
      if (this.wouldCreateCycle(child, newParent)) {
        throw new Error('Circular dependency detected.');
      }
      this.config.hierarchy.push({ parent: newParent, child });
    }

    this.saveToFile();
    return { hierarchy: [...this.config.hierarchy] };
  }

  private wouldCreateCycle(start: string, target: string): boolean {
    const childrenOf = new Map<string, string[]>();
    for (const edge of this.config.hierarchy) {
      const list = childrenOf.get(edge.parent) ?? [];
      list.push(edge.child);
      childrenOf.set(edge.parent, list);
    }
    const visited = new Set<string>();
    const queue = [target];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === start) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      const kids = childrenOf.get(current);
      if (kids) {
        for (const kid of kids) {
          if (!visited.has(kid)) queue.push(kid);
        }
      }
    }
    return false;
  }

  resetToDefaults(): { displayNames: Record<string, string>; roles: Record<string, string>; hierarchy: HierarchyEdge[] } {
    const reserved = { ...this.config.reservedWaypoints };
    const spawns = [...this.config.spawnPositions];

    this.config = {
      ...DEFAULT_CONFIG,
      reservedWaypoints: reserved,
      spawnPositions: spawns,
    };
    this.saveToFile();
    return this.getPublicConfig();
  }
}

export const agenticOfficeConfig = new AgenticOfficeConfig();
