/**
 * Response formatting utilities for DAL (Data Access Layer) operations
 * @module dal-response
 *
 * Provides consistent response shaping and error mapping for GraphQL
 * responses from the DAL connector.
 */

import { constants as httpConstants } from 'node:http2'

const formatDalResponse = (options = {}) => ({
  data: null,
  statusCode: httpConstants.HTTP_STATUS_OK,
  errors: null,
  ...options
})

const mapDalErrors = (responseErrors) => {
  return responseErrors.map(err => {
    const extensions = err.extensions
    const parsedMessage = extensions?.parsedBody?.message
    const statusCode = extensions?.parsedBody?.statusCode || extensions?.response?.status || httpConstants.HTTP_STATUS_BAD_REQUEST

    return {
      message: parsedMessage ? `${err.message}: ${parsedMessage}` : err.message,
      statusCode,
      extensions
    }
  })
}

export {
  formatDalResponse,
  mapDalErrors
}
