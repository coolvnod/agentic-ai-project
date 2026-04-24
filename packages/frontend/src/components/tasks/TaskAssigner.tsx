import { useState } from 'react';
import { assignAgentTask } from '@/lib/api';
import type { Agent } from '@/lib/api';

interface TaskAssignerProps {
  agent: Agent;
}

export function TaskAssigner({ agent }: TaskAssignerProps) {
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setStatus(null);
    try {
      await assignAgentTask(agent.id, description, priority);
      setDescription('');
      setStatus({ type: 'success', message: 'Task assigned!' });
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to assign task' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pixel-frame crt-panel rounded-[18px] bg-[linear-gradient(180deg,rgba(15,12,16,0.98),rgba(9,8,11,0.98))] p-5">
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.28em] text-[#9c907f]">Task Management</div>
        <h3 className="mt-2 font-display text-lg text-white">Assign Task to {agent.displayName || agent.name}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-[#9c907f]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="pixel-inset w-full rounded-[10px] bg-[#0e0a10] px-3 py-2 text-sm text-white outline-none focus:border-[#d1a45a]/50 min-h-[80px]"
            placeholder="What should they do?"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="mr-3 text-xs uppercase tracking-wider text-[#9c907f]">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="pixel-inset rounded-[10px] bg-[#0e0a10] px-3 py-2 text-sm text-white outline-none focus:border-[#d1a45a]/50"
              disabled={isSubmitting}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !description.trim()}
            className="pixel-frame rounded-[10px] bg-[#00d4aa]/20 px-4 py-2 text-sm text-[#00d4aa] transition hover:bg-[#00d4aa]/30 disabled:opacity-50"
          >
            {isSubmitting ? 'Assigning...' : 'Assign Task'}
          </button>
        </div>
        
        {status && (
          <div className={`mt-2 text-sm ${status.type === 'success' ? 'text-[#00d4aa]' : 'text-rose-400'}`}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
}
