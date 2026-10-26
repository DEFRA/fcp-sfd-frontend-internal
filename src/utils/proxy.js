/**
 * Proxy agent configuration for outbound requests
 *
 * @module proxy
 */

import { URL } from 'node:url'
import { ProxyAgent } from 'undici'
import { HttpsProxyAgent } from 'https-proxy-agent'

import { config } from '../config/index.js'
import { createLogger } from './logger.js'

const logger = createLogger()

/**
 * Provides the proxy configuration for outbound requests
 *
 * @returns {{url: URL, port: number, proxyAgent: object, httpAndHttpsProxyAgent: object}|null} The proxy details,
 * or null if no proxy is configured
 */
const provideProxy = () => {
  const proxyUrl = config.get('server.httpsProxy') ?? config.get('server.httpProxy')

  if (!proxyUrl) {
    return null
  }

  const url = new URL(proxyUrl)
  const httpPort = 80
  const httpsPort = 443

  const port = url.protocol.toLowerCase() === 'http:' ? httpPort : httpsPort

  logger.debug(`Proxy set up using ${url.origin}:${port}`)

  return {
    url,
    port,
    proxyAgent: new ProxyAgent({
      uri: proxyUrl,
      keepAliveTimeout: 10,
      keepAliveMaxTimeout: 10,
      allowH2: false
    }),
    httpAndHttpsProxyAgent: new HttpsProxyAgent(url)
  }
}

/**
 * Fetches a URL via the configured proxy
 *
 * Falls back to a direct fetch when no proxy is configured.
 *
 * @param {string|URL} url - The URL to fetch
 * @param {object} [options] - The fetch options
 *
 * @returns {Promise<Response>} The fetch response
 */
const proxyFetch = (url, options) => {
  const proxy = provideProxy()

  if (!proxy) {
    return fetch(url, options)
  }

  logger.debug(
    `Fetching: ${url.toString()} via the proxy: ${proxy?.url.origin}:${proxy.port}`
  )

  return fetch(url, {
    ...options,
    dispatcher: proxy.proxyAgent
  })
}

export { proxyFetch, provideProxy }
