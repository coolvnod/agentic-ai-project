import type { FastifyPluginAsync } from 'fastify';

const officeRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/v1/office/layout', async () => app.agenticOffice.officeLayout);
};

export default officeRoutes;
