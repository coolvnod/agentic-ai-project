import type { FastifyPluginAsync } from 'fastify';

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/v1/health', async () => ({ ok: true, service: 'agentic-office-backend' }));
};

export default healthRoutes;
