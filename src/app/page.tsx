"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/dashboard/Navbar";
import SystemStats from "@/components/dashboard/SystemStats";
import AgentGrid from "@/components/dashboard/AgentGrid";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import AutoworkPanel from "@/components/dashboard/AutoworkPanel";
import ChatWindow from "@/components/chat/ChatWindow";
import GlobalChatPanel from "@/components/chat/GlobalChatPanel";
import SettingsPanel from "@/components/settings/SettingsPanel";
import MiniOffice from "@/components/office/MiniOffice";
import TokenTracker from "@/components/TokenTracker";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import AgentMeeting from "@/components/meeting/AgentMeeting";
import AchievementList from "@/components/achievements/AchievementList";
import Leaderboard from "@/components/achievements/Leaderboard";
import MetricsDashboard from "@/components/metrics/MetricsDashboard";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import { useAgents } from "@/hooks/useAgents";
import { initialAchievementState, checkAchievements } from "@/lib/achievements";
import { initialXPState, addXP, calculateTokenXP } from "@/lib/xp";
import type { AutoworkConfig, AutoworkPolicy, DashboardConfig } from "@/lib/types";
import { clearConfig, loadConfig, saveConfig } from "@/lib/config";
import { BEHAVIOR_INFO } from "@/lib/state-mapper";

const DEFAULT_AUTOWORK: AutoworkConfig = {
  maxSendsPerTick: 0, // Disabled by default
  defaultDirective:
    "Check your memory and recent context, then continue the highest-impact task for your role. Do real work now and move the task forward.",
  policies: {},
};

type DashboardTab = 'overview' | 'achievements' | 'leaderboard' | 'metrics';

export default function DashboardPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [chatAgent, setChatAgent] = useState<string | null>(null);
  const [config, setConfig] = useState<DashboardConfig>(() => loadConfig());
  const [autoworkConfig, setAutoworkConfig] = useState<AutoworkConfig>(DEFAULT_AUTOWORK);
  const [autoworkLoading, setAutoworkLoading] = useState(true);
  const [autoworkSaving, setAutoworkSaving] = useState(false);
  const [autoworkRunning, setAutoworkRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [newAgentName, setNewAgentName] = useState('');
  const [renameAgentName, setRenameAgentName] = useState('');
  
  const [achievementState, setAchievementState] = useState(initialAchievementState);
  const [xpState, setXpState] = useState(initialXPState);

  const {
    agents,
    agentStates,
    activityFeed,
    systemStats,
    demoMode,
    connected,
    chatMessages,
    globalChatMessages,
    sendChat,
    sendGlobalChat,
    addAgent,
    renameAgent,
    restartSession,
    loadChatHistory,
  } = useAgents(config.demoMode);

  const openAgent = chatAgent ? agents.find((agent) => agent.id === chatAgent) : null;
  const selectedAgent = selectedAgentId ? agents.find((agent) => agent.id === selectedAgentId) ?? null : null;
  const selectedState = selectedAgent ? agentStates[selectedAgent.id] : undefined;
  const ownerConfig = config.owner;
  const theme = config.theme;

  const handleAddAgent = useCallback(() => {
    const trimmed = newAgentName.trim();
    if (!trimmed) return;
    addAgent(trimmed);
    setNewAgentName('');
  }, [addAgent, newAgentName]);

  const handleRenameAgent = useCallback(() => {
    const trimmed = renameAgentName.trim();
    if (!trimmed || !selectedAgentId) return;
    renameAgent(selectedAgentId, trimmed);
    setRenameAgentName('');
  }, [renameAgent, renameAgentName, selectedAgentId]);

  useEffect(() => {
    saveConfig(config);
  }, [config]);

  useEffect(() => {
    const stats = {
      tokens_sent: systemStats.totalTokens || 0,
      tasks_completed: systemStats.completedTasks || 0,
      meetings_attended: 0,
      messages_sent: globalChatMessages.length,
      days_active: 1,
    };
    
    const newState = checkAchievements(achievementState, stats);
    if (newState.totalXP !== achievementState.totalXP) {
      const xpGained = newState.totalXP - achievementState.totalXP;
      setXpState(prev => addXP(prev, xpGained, 'achievements', 'Achievement unlocked!'));
    }
    setAchievementState(newState);
  }, [systemStats.totalTokens, systemStats.completedTasks, globalChatMessages.length]);

  useEffect(() => {
    if (systemStats.totalTokens > 0) {
      const tokenXP = calculateTokenXP(systemStats.totalTokens);
      setXpState(prev => ({ ...prev, totalXP: prev.totalXP + tokenXP }));
    }
  }, [systemStats.totalTokens]);

  const loadAutowork = useCallback(async () => {
    try {
      setAutoworkLoading(true);
      const response = await fetch("/api/gateway/autowork");
      const data = await response.json();
      if (data.ok && data.config) {
        setAutoworkConfig(data.config);
      }
    } catch {
    } finally {
      setAutoworkLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAutowork();
  }, [loadAutowork, connected]);

  const saveAutoworkConfig = useCallback(async (patch: Partial<AutoworkConfig>) => {
    try {
      setAutoworkSaving(true);
      const response = await fetch("/api/gateway/autowork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (data.ok && data.config) {
        setAutoworkConfig(data.config);
      }
    } finally {
      setAutoworkSaving(false);
    }
  }, []);

  const runAutoworkNow = useCallback(async (sessionKey?: string) => {
    try {
      setAutoworkRunning(true);
      await fetch("/api/gateway/autowork", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionKey ? { sessionKey } : {}),
      });
      await loadAutowork();
    } finally {
      setAutoworkRunning(false);
    }
  }, [loadAutowork]);

  const renderTab = () => {
    switch (activeTab) {
      case 'achievements':
        return <AchievementList achievements={achievementState.achievements} filter="all" />;
      case 'leaderboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Leaderboard
              entries={agents.map((a, i) => ({
                rank: i + 1,
                agentId: a.id,
                agentName: a.name || a.id,
                agentEmoji: a.emoji || '🤖',
                value: agentStates[a.id]?.totalTokens || 0,
              })).sort((a, b) => b.value - a.value)}
              title="Top Agents by Tokens"
              icon="📊"
            />
            <Leaderboard
              entries={agents.map((a, i) => ({ rank: i + 1, agentId: a.id, agentName: a.name || a.id, agentEmoji: a.emoji || '🤖', value: 0 })).sort((a, b) => b.value - a.value)}
              title="Top Agents by Tasks"
              icon="✅"
            />
          </div>
        );
      case 'metrics':
        return (
          <MetricsDashboard
            data={{
              tokensSent: systemStats.totalTokens || 0,
              tasksCompleted: systemStats.completedTasks || 0,
              meetingsAttended: 0,
              messagesSent: globalChatMessages.length,
              avgResponseTime: 2.5,
              productivityScore: 85,
            }}
            period="weekly"
          />
        );
      default:
        return (
          <>
            {/* OFFICE VIEW - PROMINENT TOP POSITION */}
            <div className="mb-6">
              <MiniOffice agents={agents} agentStates={agentStates} ownerConfig={ownerConfig} theme={theme} />
            </div>

            {/* AGENT GRID & SIDEBAR */}
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)] gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="space-y-4">
                <div className="hud-panel rounded-2xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="font-pixel text-xs" style={{ color: 'var(--text-primary)' }}>Agent Manager</h3>
                    <span className="text-[10px] font-mono px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                      {agents.length} total
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        value={newAgentName}
                        onChange={(e) => setNewAgentName(e.target.value)}
                        placeholder="New agent name"
                        className="w-full text-xs font-mono px-2 py-1.5 rounded border bg-transparent"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}
                      />
                      <button onClick={handleAddAgent} className="text-xs font-mono px-3 py-1.5 rounded-lg arcade-btn">
                        Add
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        value={renameAgentName}
                        onChange={(e) => setRenameAgentName(e.target.value)}
                        placeholder="Rename selected agent"
                        className="w-full text-xs font-mono px-2 py-1.5 rounded border bg-transparent"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}
                      />
                      <button onClick={handleRenameAgent} disabled={!selectedAgentId} className="text-xs font-mono px-3 py-1.5 rounded-lg arcade-btn disabled:opacity-50">
                        Rename
                      </button>
                    </div>
                  </div>
                </div>

                <AgentGrid
                  agents={agents}
                  agentStates={agentStates}
                  onChatClick={(id) => setChatAgent(id)}
                  onRestart={restartSession}
                  onSelectAgent={(id) => setSelectedAgentId(id)}
                />
              </div>

              <div className="space-y-4">
                <div className="hud-panel rounded-2xl p-4 animate-slide-in">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-pixel text-xs" style={{ color: 'var(--text-primary)' }}>Show Working On</h3>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>Live</span>
                  </div>
                  {!selectedAgent || !selectedState ? (
                    <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                      Click any agent card to inspect current work, tool usage, and latest activity.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-xl p-3" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                        <p className="font-pixel text-xs mb-1" style={{ color: 'var(--text-primary)' }}>
                          {selectedAgent.emoji} {selectedAgent.name}
                        </p>
                        <p className="text-[11px] font-mono" style={{ color: BEHAVIOR_INFO[selectedState.behavior].neonColor }}>
                          {BEHAVIOR_INFO[selectedState.behavior].emoji} {BEHAVIOR_INFO[selectedState.behavior].label}
                        </p>
                      </div>
                      <div className="rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-[10px] font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>Current Task</p>
                        <p className="text-xs leading-5" style={{ color: 'var(--text-primary)' }}>
                          {selectedState.statusSummary ?? selectedState.currentTask?.title ?? 'No active task right now'}
                        </p>
                      </div>
                      <div className="rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-[10px] font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>Current Tool</p>
                        <p className="text-xs" style={{ color: 'var(--accent-warning)' }}>
                          {selectedState.toolName
                            ? `${selectedState.toolName}${selectedState.toolPhase ? ` (${selectedState.toolPhase})` : ''}`
                            : 'No tool currently running'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <TokenTracker totalTokens={systemStats.totalTokens || 0} inputTokens={systemStats.totalTokens || 0} outputTokens={0} />
                <PerformanceMetrics tasksCompleted={systemStats.completedTasks || 0} avgResponseTime={2.5} successRate={95} xp={xpState.totalXP} level={xpState.level} achievements={[]} />
                <AgentMeeting agents={agents} />
              </div>
            </div>

            {/* BOTTOM SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
              <div className="xl:col-span-2 space-y-6">
                <ActivityFeed events={activityFeed} />
              </div>
              <div className="space-y-6">
                <AutoworkPanel agents={agents} config={autoworkConfig} loading={autoworkLoading} saving={autoworkSaving} running={autoworkRunning} onSaveConfig={saveAutoworkConfig} onSavePolicy={async () => {}} onRunNow={runAutoworkNow} />
                <SystemStats stats={systemStats} />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]" data-theme={theme}>
      <Navbar connected={connected} demoMode={demoMode} onSettingsClick={() => setShowSettings(true)} />

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-24">
        <div className="mb-6 rounded-3xl border px-5 py-5 md:px-6 md:py-6" style={{ borderColor: 'var(--border)', background: 'linear-gradient(140deg, color-mix(in oklab, var(--bg-card) 84%, var(--accent-primary) 8%), var(--bg-card))', boxShadow: 'var(--shadow-md)' }}>
          <div className="flex items-center gap-3">
            <span className="font-pixel text-xs" style={{ color: 'var(--accent-primary)' }}>AGENT COMMAND HQ</span>
            <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
              {agents.length} agents · {systemStats.totalTokens || 0} tokens · lvl {xpState.level}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Redesigned control center with live office simulation, interactive agent management, and instant activity visibility.
            </p>
            <span className="text-[10px] font-mono px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
              {connected ? 'LIVE' : demoMode ? 'DEMO' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="hud-panel rounded-2xl p-2 flex gap-2 mb-6 overflow-x-auto">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-xl font-mono text-sm transition-all ${activeTab === 'overview' ? 'arcade-btn text-white shadow-[var(--shadow-glow)]' : 'text-[var(--text-secondary)] hover:bg-white/10'}`}>📊 Overview</button>
          <button onClick={() => setActiveTab('achievements')} className={`px-4 py-2 rounded-xl font-mono text-sm transition-all ${activeTab === 'achievements' ? 'arcade-btn text-white shadow-[var(--shadow-glow)]' : 'text-[var(--text-secondary)] hover:bg-white/10'}`}>🏆 Achievements ({achievementState.unlockedCount}/{achievementState.achievements.length})</button>
          <button onClick={() => setActiveTab('leaderboard')} className={`px-4 py-2 rounded-xl font-mono text-sm transition-all ${activeTab === 'leaderboard' ? 'arcade-btn text-white shadow-[var(--shadow-glow)]' : 'text-[var(--text-secondary)] hover:bg-white/10'}`}>🏅 Leaderboard</button>
          <button onClick={() => setActiveTab('metrics')} className={`px-4 py-2 rounded-xl font-mono text-sm transition-all ${activeTab === 'metrics' ? 'arcade-btn text-white shadow-[var(--shadow-glow)]' : 'text-[var(--text-secondary)] hover:bg-white/10'}`}>📈 Metrics</button>
        </div>

        {/* TAB CONTENT */}
        {renderTab()}
      </main>

      {openAgent && <ChatWindow agentId={openAgent.id} agentName={openAgent.name} agentEmoji={openAgent.emoji} agentColor={openAgent.color} messages={chatMessages[openAgent.id] || []} onSend={sendChat} onClose={() => setChatAgent(null)} />}
      <GlobalChatPanel messages={globalChatMessages} connected={connected} demoMode={demoMode} totalAgents={agents.length} onSend={sendGlobalChat} />
      {showSettings && <SettingsPanel config={config} connected={connected} sessionCount={1} onUpdate={setConfig} onReset={() => {}} onClose={() => setShowSettings(false)} />}
      {showShortcuts && <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}
