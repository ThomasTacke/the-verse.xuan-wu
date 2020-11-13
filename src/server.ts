// Require the framework
import * as Fastify from 'fastify';
import * as Swagger from 'fastify-swagger';
import AsyncMqtt from '@smart-home-the-verse/fastify-async-mqtt';
import { IClientOptions } from 'async-mqtt';
import { bootstrap } from 'fastify-decorators';
import { join } from 'path';

const fastifyOpts = process.env.NODE_ENV !== 'test' ? {
  logger: {
    level: process.env.DEBUG === 'true' ? 'debug' : 'info'
  },
  pluginTimeout: 10000,
} : {}

const swaggerSchema = {
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
}

const mqttClientOptions: IClientOptions = {
  host: process.env.MQTT_BROKER || 'eclipse-mosquitto'
}

const createServer = () => {

  // Instantiate Fastify with some config
  const fastify: Fastify.FastifyInstance = Fastify(fastifyOpts);

  // Register Swagger
  fastify.register(Swagger, swaggerSchema);

  // Register Async MQTT Plugin
  fastify.register(AsyncMqtt, mqttClientOptions);

  // Register Tado Plugin
  // fastify.register(Tado);

  // Register routes.
  fastify.register(bootstrap, {
    controllersDirectory: join(__dirname, 'routes'),
    controllersMask: /\.route\./
  });

  // Return the instance
  fastify.ready();
  return fastify;
}

export default createServer;