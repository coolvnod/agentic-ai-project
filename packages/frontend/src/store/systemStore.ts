import { create } from 'zustand';
import type { SystemMetricsEventPayload, SystemTraceEventPayload } from '@agentic-office/shared';

interface SystemState {
  traceLogs: SystemTraceEventPayload[];
  metrics: SystemMetricsEventPayload | null;
  metricsHistory: SystemMetricsEventPayload[];
  addTrace: (trace: SystemTraceEventPayload) => void;
  setMetrics: (metrics: SystemMetricsEventPayload) => void;
  clearLogs: () => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  traceLogs: [],
  metrics: null,
  metricsHistory: [],
  addTrace: (trace) => set((state) => ({
    traceLogs: [trace, ...state.traceLogs].slice(0, 200),
  })),
  setMetrics: (metrics) => set((state) => ({
    metrics,
    metricsHistory: [...state.metricsHistory, metrics].slice(-60),
  })),
  clearLogs: () => set({ traceLogs: [] }),
}));
