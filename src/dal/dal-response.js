import { constants as httpConstants } from 'node:http2'

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

export {
  formatDalResponse,
  mapDalErrors
}
