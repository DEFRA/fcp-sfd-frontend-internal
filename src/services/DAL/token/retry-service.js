import { drop } from '../../../utils/caching/drop.js'
import { DAL_TOKEN } from '../../../constants/cache-keys.js'
import { UNAUTHORIZED } from '../../../constants/status-codes.js'

/**
 * Retries an asynchronous function multiple times if it fails
 *
 * If the function throws a 401 error, the cached DAL token is dropped so that
 * a new token can be fetched on the next attempt
 *
 * Each time it retries, it waits a bit longer before trying again, doubling
 * the wait if exponential is true
 */
const retry = async (fn, retriesLeft = 3, interval = 1000, exponential = true) => {
  try {
    return (await fn())
  } catch (err) {
    if (err.isBoom && err.output.statusCode === UNAUTHORIZED) {
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
