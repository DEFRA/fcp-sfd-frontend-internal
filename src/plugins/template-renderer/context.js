/**
 * Builds the global context passed to every template
 *
 * @module context
 */

import path from 'node:path'
import { readFileSync } from 'node:fs'

import { config } from '../../config/index.js'
import { createLogger } from '../../utils/logger.js'
import { getNavigationItems } from '../../config/navigation-items.js'

const logger = createLogger()
const assetPath = config.get('server.assetPath')
const manifestPath = path.join(
  config.get('server.root'),
  '.public/assets-manifest.json'
)

let webpackManifest

/**
 * Builds the global context passed to every template
 *
 * Merges any context set on the response with the asset path, service name, navigation and the signed in user's
 * cached session. Loads the Webpack manifest on first use so asset paths can be resolved.
 *
 * @param {object} request - The Hapi request object
 *
 * @returns {Promise<object>} The template context
 */
export const context = async (request) => {
  if (!webpackManifest) {
    try {
      webpackManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
    } catch (error) {
      logger.error(`Webpack ${path.basename(manifestPath)} not found`)
    }
  }
  const ctx = request.response.source?.context || {}
  const serverAuth = request.auth?.isAuthenticated ? await request.server.app.cache.get(request.auth.credentials.sessionId) : null
  return {
    ...ctx,
    assetPath: `${assetPath}/assets/rebrand`,
    serviceName: config.get('server.serviceName'),
    serviceUrl: '/',
    breadcrumbs: [],
    navigation: getNavigationItems(request),
    auth: serverAuth,
    getAssetPath (asset) {
      const webpackAssetPath = webpackManifest?.[asset]
      const result = `${assetPath}/${webpackAssetPath ?? asset}`
      return result
    }
  }
}
