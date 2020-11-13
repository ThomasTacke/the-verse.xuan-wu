import { IndexGetSchema } from './index.schema';
import { FastifyReply, FastifyRequest } from 'fastify'
import { Controller, ControllerType, GET, PUT, POST, DELETE, Hook } from 'fastify-decorators'
import { IncomingMessage, ServerResponse } from 'http'

@Controller({ route: '' })
export default class IndexRoute {
  @GET({ url: '/' }) public async returnIndex(reqeust: FastifyRequest<IncomingMessage>, reply: FastifyReply<ServerResponse>) {
    return reply.code(200).send('Heello World!');
  }
}
