export interface SystemTraceEventPayload {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface SystemMetricsEventPayload {
  timestamp: string;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  uptime: number;
  eventLoopLag: number;
  activeRequests: number;
  activeConnections: number;
}
import { EventEmitter } from 'node:events';

export class SystemMonitorService {
  private readonly events = new EventEmitter();
  private metricsInterval: NodeJS.Timeout | null = null;
  private lastCpuUsage: NodeJS.CpuUsage | null = null;
  private startTime = Date.now();

  constructor() {
    this.lastCpuUsage = process.cpuUsage();
  }

  start(broadcastCallback: (event: 'system:trace' | 'system:metrics', payload: any) => void): void {
    this.events.on('trace', (payload: SystemTraceEventPayload) => {
      broadcastCallback('system:trace', payload);
    });

    this.metricsInterval = setInterval(() => {
      const metrics = this.collectMetrics();
      broadcastCallback('system:metrics', metrics);
    }, 2000);
    this.metricsInterval.unref();

    this.trace('info', 'SystemMonitor', 'System monitor started');
  }

  stop(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }

  trace(level: SystemTraceEventPayload['level'], source: string, message: string, metadata?: Record<string, unknown>): void {
    const payload: SystemTraceEventPayload = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      metadata,
    };
    this.events.emit('trace', payload);
  }

  private collectMetrics(): SystemMetricsEventPayload {
    const memory = process.memoryUsage();
    const cpuUsage = process.cpuUsage(this.lastCpuUsage ?? undefined);
    this.lastCpuUsage = process.cpuUsage();

    return {
      timestamp: new Date().toISOString(),
      memory: {
        rss: memory.rss,
        heapTotal: memory.heapTotal,
        heapUsed: memory.heapUsed,
        external: memory.external,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      eventLoopLag: 0, // Would need more logic to measure accurately
      activeRequests: 0, // Could hook into Fastify
      activeConnections: 0,
    };
  }
}

export const systemMonitor = new SystemMonitorService();
