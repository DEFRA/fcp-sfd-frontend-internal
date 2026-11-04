/**
 * Enables the configured HTTP proxy globally for outbound requests
 *
 * @module setupProxy
 */

import { ProxyAgent, setGlobalDispatcher } from 'undici'
import { bootstrap } from 'global-agent'
import { config } from '../config/index.js'
import { createLogger } from './logger.js'
const logger = createLogger()

/**
 * Enables the configured HTTP proxy globally for outbound requests
 * for a number of http clients.
 * Node Fetch will still need to pass a ProxyAgent in on each call.
 */
export const setupProxy = () => {
  const proxyUrl = config.get('server.httpProxy')

  if (proxyUrl) {
    logger.info('setting up global proxies')

    // Undici proxy
    setGlobalDispatcher(new ProxyAgent(proxyUrl))

    // global-agent (axios/request/and others)
    bootstrap()
    globalThis.GLOBAL_AGENT.HTTP_PROXY = proxyUrl
  }
}
