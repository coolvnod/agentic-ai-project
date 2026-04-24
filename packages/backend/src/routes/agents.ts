import appearanceSchema from '../schemas/appearance.schema.json' with { type: 'json' };
import taskAssignSchema from '../schemas/task-assign.schema.json' with { type: 'json' };
import chatMessageSchema from '../schemas/chat-message.schema.json' with { type: 'json' };
import type { FastifyPluginAsync } from 'fastify';
import type { Agent, AgentLog, AppearancePatch } from '@agentic-office/shared';

interface TaskAssignRequest {
  description: string;
  priority?: 'low' | 'normal' | 'high';
}

interface ChatMessageRequest {
  text: string;
}
import { assertValid, createValidator } from '../utils/validation.js';

function stripSensitiveFields(agent: Agent): Agent {
  const a = agent as unknown as Record<string, unknown>;
  delete a.soul;
  delete a.identity;
  const config = a.config as Record<string, unknown> | undefined;
  if (config) {
    delete config.workspace;
    delete config.agentDir;
    delete config.source;
    delete config.model;
  }
  return agent;
}

const validateAppearancePatch = createValidator<AppearancePatch>(appearanceSchema);
const validateTaskAssign = createValidator<TaskAssignRequest>(taskAssignSchema);
const validateChatMessage = createValidator<ChatMessageRequest>(chatMessageSchema);

const agentRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/v1/agents', async () => {
    const agents = app.agenticOffice.agentStateManager.getAgents().map(stripSensitiveFields);
    return { agents };
  });

  app.get('/api/v1/agents/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const agent = app.agenticOffice.agentStateManager.getAgent(id);
    if (!agent) {
      return reply.code(404).send({ error: 'Agent not found' });
    }
    return stripSensitiveFields(agent);
  });

  app.get('/api/v1/agents/:id/logs', async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { limit?: string; offset?: string; level?: AgentLog['level'] };
    const agent = app.agenticOffice.agentStateManager.getAgent(id);
    if (!agent) {
      return reply.code(404).send({ error: 'Agent not found' });
    }

    return app.agenticOffice.agentStateManager.getLogs(id, {
      limit: query.limit ? Number(query.limit) : undefined,
      offset: query.offset ? Number(query.offset) : undefined,
      level: query.level,
    });
  });

  app.get('/api/v1/agents/:id/tasks', async (request, reply) => {
    const { id } = request.params as { id: string };
    const agent = app.agenticOffice.agentStateManager.getAgent(id);
    if (!agent) {
      return reply.code(404).send({ error: 'Agent not found' });
    }

    return { tasks: app.agenticOffice.agentStateManager.getTasks(id) };
  });

  app.patch('/api/v1/agents/:id/appearance', async (request, reply) => {
    const { id } = request.params as { id: string };
    const agent = app.agenticOffice.agentStateManager.getAgent(id);
    if (!agent) {
      return reply.code(404).send({ error: 'Agent not found' });
    }

    const patch = assertValid(validateAppearancePatch, request.body ?? {}, 'Invalid appearance patch');
    const appearance = await app.agenticOffice.agentStateManager.upsertAppearance(id, patch);
    return { success: true, appearance };
  });

  app.patch('/api/v1/agents/:id/displayName', async (request, reply) => {
    const { id } = request.params as { id: string };
    const agent = app.agenticOffice.agentStateManager.getAgent(id);
    if (!agent) {
      return reply.code(404).send({ error: 'Agent not found' });
    }
    const body = request.body as { displayName?: string | null } | undefined;
    const displayName = typeof body?.displayName === 'string' ? body.displayName : null;
    const result = await app.agenticOffice.agentStateManager.setDisplayName(id, displayName);
    return { success: true, displayName: result };
  });

  app.post('/api/v1/agents/:id/tasks', async (request, reply) => {
    const { id } = request.params as { id: string };
    const agent = app.agenticOffice.agentStateManager.getAgent(id);
    if (!agent) {
      return reply.code(404).send({ error: 'Agent not found' });
    }

    const payload = assertValid(validateTaskAssign, request.body ?? {}, 'Invalid task assignment');
    try {
      await app.agenticOffice.gatewayClient.assignTask(id, payload.description);
      return reply.code(202).send({ success: true, message: 'Task assigned successfully' });
    } catch (err) {
      app.log.error({ err }, 'Failed to assign task via Gateway');
      return reply.code(502).send({ error: 'Failed to communicate with OpenClaw Gateway' });
    }
  });

  app.post('/api/v1/agents/:id/messages', async (request, reply) => {
    const { id } = request.params as { id: string };
    const agent = app.agenticOffice.agentStateManager.getAgent(id);
    if (!agent) {
      return reply.code(404).send({ error: 'Agent not found' });
    }

    const payload = assertValid(validateChatMessage, request.body ?? {}, 'Invalid chat message');
    try {
      await app.agenticOffice.gatewayClient.sendSessionMessage(id, payload.text);
      return reply.code(202).send({ success: true, message: 'Message sent successfully' });
    } catch (err) {
      app.log.error({ err }, 'Failed to send message via Gateway');
      return reply.code(502).send({ error: 'Failed to communicate with OpenClaw Gateway' });
    }
  });
};

export default agentRoutes;
