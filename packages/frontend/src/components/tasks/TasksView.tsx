import { useState, useEffect, useMemo } from 'react';
import { useAgentsStore, agentsStore } from '@/store/agentsStore';
import { AgentStatus } from '@/components/ui/AgentStatus';
import { TaskAssigner } from './TaskAssigner';
import { ChatWindow } from './ChatWindow';
import type { Agent, AgentLog } from '@/lib/api';
import { getAgentLogs } from '@/lib/api';

export function TasksView() {
  const { agents, selectedAgentId } = useAgentsStore();
  const [logs, setLogs] = useState<AgentLog[]>([]);

  const selectedAgent = useMemo(() => {
    return agents.find((a) => a.id === selectedAgentId) as unknown as Agent;
  }, [agents, selectedAgentId]);

  useEffect(() => {
    if (!selectedAgentId) {
      setLogs([]);
      return;
    }
    
    // Initial fetch
    getAgentLogs(selectedAgentId, { limit: 50 }).then((res) => {
      setLogs(res.logs.reverse());
    }).catch(console.error);

    // Poll for logs every 2 seconds for this simple view
    // (Ideally would rely on WS, but polling is quick to implement here)
    const interval = setInterval(() => {
      getAgentLogs(selectedAgentId, { limit: 50 }).then((res) => {
        setLogs(res.logs.reverse());
      }).catch(console.error);
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedAgentId]);

  return (
    <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <aside className="pixel-frame crt-panel flex h-[70vh] flex-col rounded-[18px] bg-[linear-gradient(180deg,rgba(15,12,16,0.98),rgba(9,8,11,0.98))] p-5 overflow-y-auto">
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#9c907f]">Select Agent</div>
          <h3 className="mt-3 font-display text-lg text-white">Task Assigner</h3>
        </div>

        <div className="space-y-2">
          {agents.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-[#d1a45a]/25 bg-white/[0.03] px-4 py-5 text-sm text-[#b7aa96]">
              No agents connected.
            </div>
          ) : (
            agents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => agentsStore.selectAgent(agent.id)}
                className={`pixel-frame w-full rounded-[14px] px-4 py-3 text-left transition hover:brightness-110 ${
                  selectedAgentId === agent.id
                    ? 'bg-[#d1a45a]/12'
                    : 'bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full border border-black/20"
                      style={{ backgroundColor: agent.color }}
                    />
                    <span className="text-white">{agent.displayName ?? agent.name}</span>
                  </div>
                  <AgentStatus status={agent.status} />
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      <div className="flex h-[70vh] flex-col gap-6">
        {selectedAgent ? (
          <>
            <TaskAssigner agent={selectedAgent} />
            <div className="flex-1 min-h-0">
              <ChatWindow agent={selectedAgent} logs={logs} />
            </div>
          </>
        ) : (
          <div className="pixel-frame crt-panel flex h-full items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,rgba(15,12,16,0.98),rgba(9,8,11,0.98))]">
            <div className="text-[#9c907f] text-sm">Select an agent from the roster to assign tasks or chat.</div>
          </div>
        )}
      </div>
    </section>
  );
}
