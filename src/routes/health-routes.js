import { constants } from '@defra/fcp-sfd-frontend-engine'

export const health = {
  method: 'GET',
  path: '/health',
  handler: (_request, h) => {
    return h.response({ message: 'success' }).code(constants.statusCodes.OK)
  }
}
