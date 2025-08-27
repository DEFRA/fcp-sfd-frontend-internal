import Yar from '@hapi/yar'
import { config } from '../config/index.js'

export const session = {
  name: 'session',
  plugin: Yar,
  options: {
    storeBlank: false,
    maxCookieSize: 0,
    cache: {
      cache: config.get('server.session.cache.name'),
      segment: `${config.get('server.session.cache.segment')}-temp`
    },
    cookieOptions: {
      password: config.get('server.session.cookie.password'),
      isSecure: !config.get('server.isDevelopment'),
      isSameSite: 'Lax'
    }
  }
}
