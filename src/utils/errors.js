import { StatusCodes } from 'http-status-codes'

export const catchAll = (request, h) => {
  if (!request.response || !('isBoom' in request.response)) {
    return h.continue
  }

  const statusCode = request.response.output.statusCode

  const errorViewMap = {
    [StatusCodes.SERVICE_UNAVAILABLE]: 'errors/service-unavailable',
    [StatusCodes.NOT_FOUND]: 'errors/page-not-found',
    [StatusCodes.INTERNAL_SERVER_ERROR]: 'errors/service-problem'
  }

  const viewPath = errorViewMap[statusCode] || 'errors/page-not-found'

  request.logger.error(request.response?.stack)
  return h
    .view(viewPath)
    .code(statusCode)
}
