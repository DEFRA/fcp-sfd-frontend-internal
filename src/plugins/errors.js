import { constants } from 'node:http2'
const { HTTP_STATUS_FORBIDDEN, HTTP_STATUS_NOT_FOUND } = constants

export const errors = {
  plugin: {
    name: 'errors',
    register: (server, _options) => {
      server.ext('onPreResponse', (request, h) => {
        const response = request.response

        if (!response.isBoom) {
          return h.continue
        }

        const statusCode = response.output.statusCode

        // Catch any user in incorrect scope errors
        if (statusCode === HTTP_STATUS_FORBIDDEN) {
          return h.view('unauthorised').code(statusCode)
        }

        if (statusCode === HTTP_STATUS_NOT_FOUND) {
          return h.view('errors/page-not-found').code(statusCode)
        }

        request.log('error', {
          statusCode,
          message: response.message,
          stack: response.data?.stack
        })

        return h.view('errors/service-problem').code(statusCode)
      })
    }
  }
}
