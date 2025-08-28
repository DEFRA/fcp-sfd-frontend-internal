import { constants as httpConstants } from 'node:http2'
import { dalConnector } from '../../dal/connector.js'
import { exampleQuery } from '../../dal/queries/example-query.js'

const variables = {
  sbi: '107591843',
  crn: '9477368292'
}

const exampleDalConnectionRoute = {
  method: 'GET',
  path: '/example',
  handler: async (_request, h) => {
    const response = await dalConnector(exampleQuery, variables)

    if (response.errors) {
      return h.response({
        data: response.data,
        errors: response.errors.map(err => ({
          message: err.message,
          code: err.extensions?.code
        }))
      }).code(response.statusCode)
    }

    return h.response({
      message: 'success',
      data: response.data
    }).code(httpConstants.HTTP_STATUS_OK)
  }
}

export { exampleDalConnectionRoute }
