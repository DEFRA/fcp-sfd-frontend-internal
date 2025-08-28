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

export const context = async (request) => {
  if (!webpackManifest) {
    try {
      webpackManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
    } catch (error) {
      logger.error(`Webpack ${path.basename(manifestPath)} not found`)
    }
  }
  const ctx = request.response.source.context || {}
  const serverAuth = request.auth?.isAuthenticated ? await request.server.app.cache.get(request.auth.credentials.sessionId) : null
  return {
    ...ctx,
    assetPath: `${assetPath}/assets`,
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
