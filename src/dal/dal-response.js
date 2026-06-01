/**
 * Shapes raw DAL responses into a consistent format.
 * Responses from the DAL (success or error) pass through here
 * so the rest of the app always gets the same { data, statusCode, errors } shape.
 */
import { constants as httpConstants } from 'node:http2'

// Default contract expected by services and tests.
const formatDalResponse = ({
  data = null,
  errors = null,
  statusCode = httpConstants.HTTP_STATUS_OK
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
    const statusCode = ext?.parsedBody?.statusCode || ext?.response?.status || httpConstants.HTTP_STATUS_BAD_REQUEST

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
