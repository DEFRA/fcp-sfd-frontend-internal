const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])

/**
 * Reduces a client-supplied Referer value down to a safe, same-origin relative path.
 * Falls back to the given default if the value is missing, protocol-relative (e.g. "//evil.com"),
 * or uses a disallowed protocol (e.g. "javascript:").
 * @param {string} referer - the raw `request.headers.referer` value
 * @param {string} fallback - the path to use when the referer is missing or unsafe
 * @returns {string}
 */
export const getSafeBackLink = (referer, fallback) => {
  if (typeof referer !== 'string' || !referer) {
    return fallback
  }

  if (referer.startsWith('/') && !referer.startsWith('//')) {
    return referer
  }

  try {
    const url = new URL(referer)

    if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
      return fallback
    }

    return `${url.pathname}${url.search}`
  } catch {
    return fallback
  }
}
