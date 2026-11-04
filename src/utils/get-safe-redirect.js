/**
 * Validates a redirect target to prevent open redirects
 *
 * @module getSafeRedirect
 */

import { SEARCH_SBI } from '../constants/search-links.js'

/**
 * Validates a redirect target to prevent open redirects
 *
 * Only relative paths starting with `/` are allowed; anything else falls back to the SBI search link.
 *
 * @param {string} [redirect] - The requested redirect target
 *
 * @returns {string} The redirect if safe, otherwise the SBI search link
 */
export const getSafeRedirect = (redirect) => {
  if (!redirect?.startsWith('/')) {
    return SEARCH_SBI
  }
  return redirect
}
