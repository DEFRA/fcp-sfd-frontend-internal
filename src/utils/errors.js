/**
 * Catches errors for failed requests and renders the matching error page
 *
 * @module errors
 */

import { constants } from '@defra/fcp-sfd-frontend-engine'

/**
 * Catches errors for failed requests and renders the matching error page
 *
 * Maps 503, 404 and 500 responses to their error views, defaulting to the page not found view for any other error.
 * The error stack is logged.
 *
 * @param {object} request - The Hapi request object
 * @param {object} h - The Hapi response toolkit
 *
 * @returns {object} The continue signal for non-error responses, otherwise the rendered error view
 */
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
