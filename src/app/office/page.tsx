"use client";

import { useState, useEffect } from "react";
import { useAgents } from "@/hooks/useAgents";
import { useOffice } from "@/hooks/useOffice";
import OfficeCanvasInner from "@/components/office/OfficeCanvas";
import OfficeControls from "@/components/office/OfficeControls";
import ChatWindow from "@/components/chat/ChatWindow";
import type { AgentBehavior } from "@/lib/types";
import { loadConfig, DEFAULT_OWNER } from "@/lib/config";
import { BEHAVIOR_INFO } from "@/lib/state-mapper";

export default function OfficePage() {
  const [chatAgent, setChatAgent] = useState<string | null>(null);
  const [inspectedAgentId, setInspectedAgentId] = useState<string | null>(null);

  const {
    agents,
    agentStates,
    demoMode,
    connected,
    chatMessages,
    sendChat,
    setBehavior,
    addAgent,
    renameAgent,
    loadChatHistory,
  } = useAgents();

  const { officeState, tick } = useOffice(agents, agentStates);

  const [ownerConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadConfig().owner;
    }
    return DEFAULT_OWNER;
  });
  const openAgent = chatAgent ? agents.find((a) => a.id === chatAgent) : null;
  const inspectedAgent = inspectedAgentId ? agents.find((a) => a.id === inspectedAgentId) : null;
  const inspectedState = inspectedAgent ? agentStates[inspectedAgent.id] : null;
  const inspectedBehavior = inspectedState?.behavior ?? "idle";
  const inspectedBehaviorInfo = BEHAVIOR_INFO[inspectedBehavior];

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] overflow-hidden" data-theme="default">
      <div className="mx-4 mt-3 mb-2 px-4 py-3 rounded-2xl hud-panel flex items-center justify-between">
        <div>
          <h1 className="font-pixel text-sm" style={{ color: 'var(--text-primary)' }}>Office Command Center</h1>
          <p className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
            Live workspace • {connected ? 'connected' : demoMode ? 'demo mode' : 'offline'}
          </p>
        </div>
        <div className="text-[10px] font-mono px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
          {agents.length} agents
        </div>
      </div>

      <div className="flex-1 px-4 pb-3 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-3">
          <div className="relative flex items-center justify-center overflow-auto rounded-2xl hud-panel p-2">
            <OfficeCanvasInner
              officeState={officeState}
              agents={agents}
              owner={ownerConfig}
              onTick={tick}
              width={1100}
              height={620}
              connected={connected}
              demoMode={demoMode}
            />
          </div>

          <aside className="rounded-2xl hud-panel p-3 overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-pixel text-xs" style={{ color: 'var(--text-primary)' }}>Show Working On</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                Live
              </span>
            </div>

            {!inspectedAgent ? (
              <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                Pick an agent from controls to inspect what they are currently doing.
              </p>
            ) : (
              <>
                <div className="rounded-xl p-3 mb-3" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{inspectedAgent.emoji}</span>
                    <span className="font-pixel text-xs" style={{ color: 'var(--text-primary)' }}>{inspectedAgent.name}</span>
                  </div>
                  <p className="text-[10px] font-mono" style={{ color: inspectedBehaviorInfo.neonColor }}>
                    {inspectedBehaviorInfo.emoji} {inspectedBehaviorInfo.label}
                  </p>
                </div>

                <div className="rounded-xl p-3 mb-3" style={{ border: '1px solid var(--border)' }}>
                  <p className="text-[10px] font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>Current Work</p>
                  <p className="text-xs leading-5" style={{ color: 'var(--text-primary)' }}>
                    {inspectedState?.statusSummary ?? 'No activity available yet.'}
                  </p>
                </div>

                <div className="rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
                  <p className="text-[10px] font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>Tool</p>
                  <p className="text-xs" style={{ color: 'var(--accent-warning)' }}>
                    {inspectedState?.toolName
                      ? `${inspectedState.toolName}${inspectedState.toolPhase ? ` (${inspectedState.toolPhase})` : ''}`
                      : 'No tool running'}
                  </p>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>

      <OfficeControls
        agents={agents}
        agentStates={agentStates}
        demoMode={demoMode}
        onSetBehavior={(id: string, b: AgentBehavior) => setBehavior(id, b)}
        onAddAgent={addAgent}
        onRenameAgent={renameAgent}
        onInspectAgent={(id) => setInspectedAgentId(id)}
      />

      {openAgent && (
        <ChatWindow
          agentId={openAgent.id}
          agentName={openAgent.name}
          agentEmoji={openAgent.emoji}
          agentColor={openAgent.color}
          messages={chatMessages[openAgent.id] ?? []}
          onSend={sendChat}
          onClose={() => setChatAgent(null)}
          onOpen={() => loadChatHistory(openAgent.id)}
        />
      )}
    </div>
  );
}
