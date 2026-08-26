const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])

/**
 * Reduces a client-supplied Referer value down to a safe, same-origin relative path.
 * Real browsers only ever send an absolute Referer, so relative values are treated as unsafe
 * rather than special-cased, closing off tricks (e.g. "/\evil.com") that rely on a lenient
 * relative-path check and the URL parser's backslash normalisation to escape to another origin.
 * Falls back to the given default if the value is missing, not a valid absolute URL,
 * or uses a disallowed protocol (e.g. "javascript:").
 * @param {string | undefined} referer - the raw `request.headers.referer` value
 * @param {string} fallback - the path to use when the referer is missing or unsafe
 * @returns {string}
 */
export const getSafeBackLink = (referer, fallback) => {
  if (typeof referer !== 'string' || !referer) {
    return fallback
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
