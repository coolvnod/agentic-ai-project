import { useState, useRef, useEffect } from 'react';
import { sendAgentMessage } from '@/lib/api';
import type { Agent, AgentLog } from '@/lib/api';

interface ChatWindowProps {
  agent: Agent;
  logs: AgentLog[];
}

export function ChatWindow({ agent, logs }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await sendAgentMessage(agent.id, message);
      setMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const chatLogs = logs.filter(log => log.message.startsWith('💬') || log.id?.includes(':user:') || log.id?.includes(':assistant:'));

  return (
    <div className="pixel-frame crt-panel flex h-full flex-col rounded-[18px] bg-[linear-gradient(180deg,rgba(15,12,16,0.98),rgba(9,8,11,0.98))] p-5">
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.28em] text-[#9c907f]">Communication</div>
        <h3 className="mt-2 font-display text-lg text-white">Direct Message</h3>
      </div>

      <div ref={scrollRef} className="pixel-inset flex-1 overflow-y-auto rounded-[14px] bg-white/[0.03] p-4 space-y-3 mb-4">
        {chatLogs.length === 0 ? (
          <div className="text-center text-sm text-[#9c907f] mt-4">No recent messages</div>
        ) : (
          chatLogs.map((log) => {
            const isUser = log.id?.includes(':user:');
            return (
              <div key={log.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] rounded-[10px] px-3 py-2 text-sm ${isUser ? 'bg-[#d1a45a]/20 text-[#f0d6a5]' : 'bg-[#00d4aa]/10 text-[#00d4aa]'}`}>
                  {log.message.replace('💬 ', '')}
                </div>
                <div className="text-[10px] text-[#9c907f] mt-1">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message..."
          disabled={isSending}
          className="pixel-inset flex-1 rounded-[10px] bg-[#0e0a10] px-3 py-2 text-sm text-white outline-none focus:border-[#d1a45a]/50"
        />
        <button
          type="submit"
          disabled={isSending || !message.trim()}
          className="pixel-frame rounded-[10px] bg-[#d1a45a]/20 px-4 py-2 text-sm text-[#f0d6a5] transition hover:bg-[#d1a45a]/30 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
