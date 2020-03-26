import { RouteOptions } from 'fastify';

const getIndexSchema = {
  description: 'Get the root page',
  summary: 'Get the root page'
}

const getIndexRoute: RouteOptions = {
  method: 'GET',
  url: '/',
  handler: async () => {
    return 'Heello World!';
  }
};

export default [getIndexRoute];