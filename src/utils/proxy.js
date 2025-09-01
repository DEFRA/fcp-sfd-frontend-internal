import { URL } from 'node:url'
import { ProxyAgent } from 'undici'
import { HttpsProxyAgent } from 'https-proxy-agent'

import { config } from '../config/index.js'
import { createLogger } from './logger.js'

const logger = createLogger()

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
      keepAliveMaxTimeout: 10
    }),
    httpAndHttpsProxyAgent: new HttpsProxyAgent(url)
  }
}

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
