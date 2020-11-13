import { RouteSchema } from "fastify";

export const IndexGetSchema: RouteSchema = {
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: {
        code: { type: 'number' },
        msg: { type: 'string' },
        root: { type: 'boolean' }
      },
      example: {
        code: 200,
        msg: 'This is a dummy text.',
        root: true
      }
    }
  }
}