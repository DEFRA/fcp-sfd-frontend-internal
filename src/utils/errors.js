import { constants } from '@defra/fcp-sfd-frontend-engine'

export const catchAll = (request, h) => {
  if (!request.response || !('isBoom' in request.response)) {
    return h.continue
  }

  const statusCode = request.response.output.statusCode

  const errorViewMap = {
    [constants.statusCodes.SERVICE_UNAVAILABLE]: 'errors/service-unavailable',
    [constants.statusCodes.NOT_FOUND]: 'errors/page-not-found',
    [constants.statusCodes.INTERNAL_SERVER_ERROR]: 'errors/service-problem'
  }

  const viewPath = errorViewMap[statusCode] || 'errors/page-not-found'

  request.logger.error(request.response?.stack)
  return h
    .view(viewPath)
    .code(statusCode)
}
