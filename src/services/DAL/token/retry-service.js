/**
 * Retries an asynchronous function multiple times if it fails
 *
 * @module retryService
 */

import { constants } from '@defra/fcp-sfd-frontend-engine'
import { drop } from '../../../utils/caching/drop.js'
import { DAL_TOKEN } from '../../../constants/cache-keys.js'

/**
 * Retries an asynchronous function multiple times if it fails
 *
 * If the function throws a 401 error, the cached DAL token is dropped so that
 * a new token can be fetched on the next attempt
 *
 * Each time it retries, it waits a bit longer before trying again, doubling
 * the wait if exponential is true
 *
 * @param {Function} fn - The asynchronous function to attempt
 * @param {number} [retriesLeft] - The number of retries remaining
 * @param {number} [interval] - The time to wait before the next attempt, in milliseconds
 * @param {boolean} [exponential] - Whether to double the wait after each failed attempt
 *
 * @returns {Promise<*>} The result of the function
 */
const retry = async (fn, retriesLeft = 3, interval = 1000, exponential = true) => {
  try {
    return (await fn())
  } catch (err) {
    if (err.isBoom && err.output.statusCode === constants.statusCodes.UNAUTHORIZED) {
      await drop(DAL_TOKEN)
    }
    if (retriesLeft > 0) {
      await new Promise(resolve => setTimeout(resolve, interval))
      return retry(fn, retriesLeft - 1, exponential ? interval * 2 : interval, exponential)
    } else {
      throw err
    }
  }
}

export { retry }
