import { serviceUnavailable } from './service-unavailable-routes.js'
import { pageNotFound } from './page-not-found-routes.js'
import { serviceProblem } from './service-problem-routes.js'
import { config } from '../../config/index.js'

export const errors = config.get('server.allowErrorViews')
  ? [serviceUnavailable, pageNotFound, serviceProblem]
  : []
