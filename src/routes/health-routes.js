import { constants as httpConstants } from 'node:http2'

export const health = {
  method: 'GET',
  path: '/health',
  handler: (_request, h) => {
    return h.response({ message: 'success' }).code(httpConstants.HTTP_STATUS_OK)
  }
}
