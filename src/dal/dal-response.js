/**
 * Takes the raw JSON body from the DAL and returns a formatted response.
 *
 * Responses from the DAL (success or error) pass through here
 * so the rest of the app always gets the same { data, statusCode, errors } shape.
 *
 * @module dalResponse
 */
import { constants } from '@defra/fcp-sfd-frontend-engine'

// Default contract expected by services and tests.

/**
 * Formats a DAL response into the { data, statusCode, errors } shape
 *
 * @param {object} response - The response parts
 * @param {object} [response.data] - The response data
 * @param {object[]} [response.errors] - The mapped errors
 * @param {number} [response.statusCode] - The HTTP status code, defaulting to 200
 *
 * @returns {{data: object, statusCode: number, errors: object[]}} The formatted response
 */
const formatDalResponse = ({
  data = null,
  errors = null,
  statusCode = constants.statusCodes.OK
}) => {
  return {
    data,
    statusCode,
    errors
  }
}

// Prefer status/message from DAL extensions, otherwise fall back to 400.
const mapDalErrors = (responseErrors) => {
  return responseErrors.map(err => {
    const ext = err.extensions
    const parsedMessage = ext?.parsedBody?.message
    const statusCode = ext?.parsedBody?.statusCode || ext?.response?.status || constants.statusCodes.BAD_REQUEST

    return {
      message: parsedMessage ? `${err.message}: ${parsedMessage}` : err.message,
      statusCode,
      extensions: ext
    }
  })
}

/**
 * Takes the raw JSON body from the DAL and returns a formatted response.
 * If the body contains errors they are mapped and normalised first;
 * otherwise the data is passed through as a success.
 *
 * @param {object} responseBody - The raw JSON body from the DAL
 *
 * @returns {{data: object, statusCode: number, errors: object[]}} The formatted response
 */
const handleDalResponse = (responseBody) => {
  if (responseBody.errors) {
    const extendedErrors = mapDalErrors(responseBody.errors)
    return formatDalResponse({
      statusCode: extendedErrors[0]?.statusCode,
      errors: extendedErrors
    })
  }
  return formatDalResponse({ data: responseBody.data })
}

export {
  formatDalResponse,
  handleDalResponse
}
