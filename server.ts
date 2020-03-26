// Require the framework
import * as Fastify from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import * as Swagger from 'fastify-swagger';
import Routes from './routes';
import Tado from './plugins/tado';

const serverAddress = process.env.ADDRESS || '0.0.0.0';
const serverPort = +process.env.PORT || 3000;

// Instantiate Fastify with some config
const server: Fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = Fastify({
  logger: true,
  pluginTimeout: 10000
});

// Register Swagger
server.register(Swagger, {
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'Xuan Wu - Black Tortoise API',
      description: 'testing the fastify swagger api',
      version: '0.1.0',
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here',
    },
    consumes: ['application/json'],
    produces: ['application/json'],
  },
  exposeRoute: true
});

// Register your application as a normal plugin.
Routes.forEach(route => {
  server.route(route);
});

// Register Tado Plugin
server.register(Tado);

// Start listening.
const start = async (): Promise<void> => {
  try {
    await server.listen(serverPort, serverAddress);
    server.swagger();
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();

export default server;