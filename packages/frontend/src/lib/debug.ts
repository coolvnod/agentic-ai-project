const AGENTIC_OFFICE_DEBUG = typeof window !== 'undefined' && (window as any).__agenticOfficeDebug;
const AGENTIC_OFFICE_DEBUG_AGENT = typeof window !== 'undefined' && (window as any).__agenticOfficeDebugAgent;

export const isDebug = () => AGENTIC_OFFICE_DEBUG;
export const isDebugAgent = (agentId: string) => AGENTIC_OFFICE_DEBUG_AGENT === agentId;

export const debugLog = (msg: string, data?: any) => {
  if (!AGENTIC_OFFICE_DEBUG) return;
  console.log(msg, data);
};

export const debugAgent = (agentId: string, msg: string, data?: any) => {
  if (AGENTIC_OFFICE_DEBUG_AGENT !== agentId) return;
  console.log(msg, data);
};
