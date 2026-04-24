import { useSystemStore } from '@/store/systemStore';
import { useAgentsStore } from '@/store/agentsStore';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

function formatTime(ts: string) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch { return ts; }
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function TracePanel() {
  const { traceLogs, clearLogs } = useSystemStore();
  const ref = useRef<HTMLDivElement>(null);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (auto && ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [traceLogs, auto]);

  return (
    <div className="pixel-frame crt-panel flex flex-col overflow-hidden rounded-[18px] bg-[#0a080c]/90 h-full">
      <div className="flex items-center justify-between border-b border-[#d1a45a]/10 bg-[#16121a] px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#00d4aa]" />
          <span className="font-display text-[10px] tracking-[0.2em] text-[#f0d6a5] uppercase">Engine Trace</span>
        </div>
        <button onClick={clearLogs} className="text-[9px] uppercase tracking-widest text-[#9c907f] hover:text-white transition-colors">Clear</button>
      </div>
      <div ref={ref} onScroll={() => { if (!ref.current) return; setAuto(ref.current.scrollHeight - ref.current.scrollTop - ref.current.clientHeight < 50); }}
        className="flex-1 overflow-y-auto p-3 font-mono text-[10px] leading-relaxed">
        {traceLogs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[#4a4035]">Waiting for backend traces…</div>
        ) : traceLogs.map((log, i) => (
          <div key={i} className="mb-1 flex gap-3 hover:bg-white/[0.02] px-1">
            <span className="shrink-0 text-[#4a4035]">[{formatTime(log.timestamp)}]</span>
            <span className={cn("shrink-0 font-bold uppercase w-12",
              log.level === 'error' ? "text-rose-500" : log.level === 'warn' ? "text-amber-500" :
              log.level === 'info' ? "text-sky-400" : "text-emerald-500")}>{log.level}</span>
            <span className="shrink-0 text-[#9c907f] w-20 truncate">{log.source}</span>
            <span className="text-[#ddd4c8]">{log.message}
              {log.metadata && Object.keys(log.metadata).length > 0 && <span className="ml-1 text-[#4a4035]">{JSON.stringify(log.metadata)}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricsPanel() {
  const { metrics } = useSystemStore();
  const pct = metrics ? (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100 : 0;

  return (
    <div className="pixel-frame crt-panel rounded-[18px] bg-[#16121a]/95 p-5">
      <h3 className="mb-4 font-display text-[10px] tracking-[0.2em] text-[#9c907f] uppercase">Backend Vitals</h3>
      <div className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider">
            <span className="text-[#b7aa96]">Heap Memory</span>
            <span className="text-[#00d4aa]">{metrics ? formatBytes(metrics.memory.heapUsed) : '—'}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div className="h-full bg-gradient-to-r from-[#00d4aa] to-[#008a6e] transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-0.5 text-right text-[8px] text-[#4a4035]">/ {metrics ? formatBytes(metrics.memory.heapTotal) : '—'}</div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider">
            <span className="text-[#b7aa96]">RSS Memory</span>
            <span className="text-amber-400">{metrics ? formatBytes(metrics.memory.rss) : '—'}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="pixel-inset rounded-[10px] bg-black/40 p-2 text-center">
            <div className="text-[8px] uppercase tracking-widest text-[#4a4035]">Uptime</div>
            <div className="mt-0.5 font-mono text-xs text-white">
              {metrics ? `${Math.floor(metrics.uptime / 60)}m ${metrics.uptime % 60}s` : '—'}
            </div>
          </div>
          <div className="pixel-inset rounded-[10px] bg-black/40 p-2 text-center">
            <div className="text-[8px] uppercase tracking-widest text-[#4a4035]">External</div>
            <div className="mt-0.5 font-mono text-xs text-white">{metrics ? formatBytes(metrics.memory.external) : '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchitecturePanel() {
  return (
    <div className="pixel-frame crt-panel rounded-[18px] bg-[#0e0c10]/95 p-5 border border-white/5">
      <h3 className="mb-4 font-display text-[10px] tracking-[0.2em] text-[#9c907f] uppercase">Engine Architecture</h3>
      <div className="space-y-3 text-[10px]">
        {[
          { icon: '🤖', name: 'AgentStateManager', desc: '822-line reactive state orchestrator', color: 'border-[#d1a45a]/20 bg-[#d1a45a]/5', text: 'text-[#f0d6a5]' },
          { icon: '🗺️', name: 'MovementEngine', desc: 'Collision avoidance & A* pathfinding', color: 'border-sky-500/20 bg-sky-500/5', text: 'text-sky-400' },
          { icon: '⚡', name: 'GatewayClient', desc: 'Ed25519-auth WebSocket bridge to OpenClaw', color: 'border-emerald-500/20 bg-emerald-500/5', text: 'text-emerald-400' },
          { icon: '🔄', name: 'ConfigWatcher', desc: 'Hot-reload of agent configs', color: 'border-purple-500/20 bg-purple-500/5', text: 'text-purple-400' },
        ].map((s, i) => (
          <div key={i}>
            <div className={`flex items-center gap-2 rounded-lg border ${s.color} p-2.5`}>
              <span className="text-base">{s.icon}</span>
              <div><div className={`font-bold ${s.text}`}>{s.name}</div><div className="text-[#9c907f]">{s.desc}</div></div>
            </div>
            {i < 3 && <div className="ml-5 h-3 border-l-2 border-dashed border-[#d1a45a]/15" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentScorecards() {
  const agents = useAgentsStore(s => s.agents);
  return (
    <div className="pixel-frame crt-panel rounded-[18px] bg-[#0e0c10]/95 p-5">
      <h3 className="mb-4 font-display text-[10px] tracking-[0.2em] text-[#9c907f] uppercase">Agent Scorecards</h3>
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {agents.length === 0 ? <div className="text-[#4a4035] text-[10px]">No agents connected</div> :
        agents.map(a => (
          <div key={a.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-2.5 border border-white/5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.status === 'working' ? '#00d4aa' : a.status === 'conference' ? '#d1a45a' : a.status === 'online' ? '#60a5fa' : '#4a4035' }} />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-white truncate">{a.displayName ?? a.name}</div>
              <div className="text-[8px] text-[#9c907f] uppercase">{a.status}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-[#00d4aa]">{a.stats?.tasksCompleted ?? 0}</div>
              <div className="text-[7px] text-[#4a4035] uppercase">tasks</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-[#d1a45a]">{a.stats?.messagesProcessed ?? 0}</div>
              <div className="text-[7px] text-[#4a4035] uppercase">msgs</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GlobalChatFeed() {
  const agents = useAgentsStore(s => s.agents);
  const allLogs = agents.flatMap(a =>
    (a.logs ?? []).slice(0, 10).map(l => ({ ...l, agentName: a.displayName ?? a.name, agentId: a.id }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 30);

  return (
    <div className="pixel-frame crt-panel flex flex-col rounded-[18px] bg-[#0a080c]/90 h-full overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[#d1a45a]/10 bg-[#16121a] px-5 py-3">
        <span className="text-base">💬</span>
        <span className="font-display text-[10px] tracking-[0.2em] text-[#f0d6a5] uppercase">Global Feed</span>
        <span className="ml-auto text-[8px] text-[#4a4035]">{allLogs.length} events</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {allLogs.length === 0 ? <div className="text-[#4a4035] text-[10px] text-center mt-8">No activity yet</div> :
        allLogs.map((log, i) => (
          <div key={i} className="flex gap-2 text-[10px] hover:bg-white/[0.02] px-1 rounded">
            <span className="shrink-0 text-[#4a4035]">{formatTime(log.timestamp)}</span>
            <span className="shrink-0 text-[#d1a45a] font-bold truncate w-16">{log.agentName}</span>
            <span className="text-[#ddd4c8] truncate">{log.message.slice(0, 100)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityTimeline() {
  const agents = useAgentsStore(s => s.agents);
  const events = agents.flatMap(a => {
    const items: Array<{ time: string; agent: string; type: string; detail: string }> = [];
    if (a.status === 'working') items.push({ time: a.lastSeen, agent: a.displayName ?? a.name, type: 'working', detail: 'Agent is actively working' });
    if (a.status === 'conference') items.push({ time: a.lastSeen, agent: a.displayName ?? a.name, type: 'conference', detail: 'In a meeting' });
    if (a.movement?.status === 'moving') items.push({ time: a.lastSeen, agent: a.displayName ?? a.name, type: 'moving', detail: 'Walking to destination' });
    if (a.status === 'online') items.push({ time: a.lastSeen, agent: a.displayName ?? a.name, type: 'online', detail: 'Online and idle' });
    return items;
  }).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15);

  const typeColors: Record<string, string> = {
    working: 'bg-[#00d4aa]', conference: 'bg-[#d1a45a]', moving: 'bg-sky-400', online: 'bg-emerald-400',
  };

  return (
    <div className="pixel-frame crt-panel rounded-[18px] bg-[#0e0c10]/95 p-5">
      <h3 className="mb-4 font-display text-[10px] tracking-[0.2em] text-[#9c907f] uppercase">Activity Timeline</h3>
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {events.length === 0 ? <div className="text-[#4a4035] text-[10px]">No activity yet</div> :
        events.map((e, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${typeColors[e.type] ?? 'bg-white/20'}`} />
            <div>
              <div className="text-[10px] text-white"><span className="font-bold text-[#f0d6a5]">{e.agent}</span> — {e.detail}</div>
              <div className="text-[8px] text-[#4a4035]">{formatTime(e.time)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const SystemView = () => {
  const [tab, setTab] = useState<'dashboard' | 'feed'>('dashboard');

  return (
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 200px)' }}>
      <div className="flex items-center gap-2">
        {(['dashboard', 'feed'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-2 text-[10px] uppercase tracking-widest font-display rounded-lg transition-all",
              tab === t ? "bg-[#d1a45a]/20 text-[#f0d6a5] pixel-frame" : "text-[#9c907f] hover:text-white")}>
            {t === 'dashboard' ? '📊 Dashboard' : '💬 Global Feed'}
          </button>
        ))}
      </div>

      {tab === 'dashboard' ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px] flex-1 min-h-0">
          <TracePanel />
          <div className="flex flex-col gap-4 overflow-y-auto">
            <MetricsPanel />
            <ArchitecturePanel />
            <AgentScorecards />
            <ActivityTimeline />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <GlobalChatFeed />
        </div>
      )}
    </div>
  );
};
