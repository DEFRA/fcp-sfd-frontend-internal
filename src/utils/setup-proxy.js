/**
 * Configures the global HTTP proxy used by outbound requests
 *
 * @module setupProxy
 */

import { ProxyAgent, setGlobalDispatcher } from 'undici'
import { bootstrap } from 'global-agent'
import { config } from '../config/index.js'
import { createLogger } from './logger.js'
const logger = createLogger()

/**
 * Applies the configured proxy to libraries that do not accept a per-request agent.
 * Node Fetch still needs a ProxyAgent passed in on each call.
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
