/**
 * Adds the CDP trust store certificates to the secure context
 *
 * @module secureContext
 */

import tls from 'node:tls'

import { config } from '../../config/index.js'
import { getTrustStoreCerts } from './get-trust-store-certs.js'

export const secureContext = {
  plugin: {
    name: 'secure-context',

    /**
     * Adds the CDP trust store certificates to the secure context
     *
     * Does nothing other than log when the custom secure context is disabled in config.
     *
     * @param {object} server - The Hapi server
     */
    register: (server) => {
      if (config.get('server.isSecureContextEnabled')) {
        const originalTlsCreateSecureContext = tls.createSecureContext

        tls.createSecureContext = (options = {}) => {
          const trustStoreCerts = getTrustStoreCerts(process.env)

          if (!trustStoreCerts.length) {
            server.logger.info('Could not find any TRUSTSTORE_ certificates')
          }

          const tlsSecureContext = originalTlsCreateSecureContext(options)

          trustStoreCerts.forEach((cert) => {
            tlsSecureContext.context.addCACert(cert)
          })

          return tlsSecureContext
        }

        server.decorate('server', 'secureContext', tls.createSecureContext())
      } else {
        server.logger.info('Custom secure context is disabled')
      }
    }
  }
}
