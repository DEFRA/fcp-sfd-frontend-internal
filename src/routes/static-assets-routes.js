import { constants as httpConstants } from 'node:http2'
import { config } from '../config/index.js'

export const staticAssetRoutes = [
  {
    options: {
      auth: false,
      cache: {
        expiresIn: config.get('server.staticCacheTimeout'),
        privacy: 'private'
      }
    },
    method: 'GET',
    path: '/favicon.ico',
    handler (_request, h) {
      return h
        .response()
        .code(httpConstants.HTTP_STATUS_NO_CONTENT)
        .type('image/x-icon')
    }
  },
  {
    options: {
      auth: false,
      cache: {
        expiresIn: config.get('server.staticCacheTimeout'),
        privacy: 'private'
      }
    },
    method: 'GET',
    path: `${config.get('server.assetPath')}/{param*}`,
    handler: {
      directory: {
        path: '.',
        redirectToSlash: true
      }
    }
  }
]
