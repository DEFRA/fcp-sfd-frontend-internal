/**
 * Reads trust store certificates from environment variables
 *
 * @module getTrustStoreCerts
 */

/**
 * Reads trust store certificates from environment variables
 *
 * Any variable whose name starts with `TRUSTSTORE_` is treated as a base64 encoded certificate.
 *
 * @param {object} envs - The environment variables, for example `process.env`
 *
 * @returns {string[]} The decoded certificates
 */
export const getTrustStoreCerts = (envs) => {
  return Object.entries(envs)
    .map(([key, value]) => key.startsWith('TRUSTSTORE_') && value)
    .filter(Boolean)
    .map((envValue) => Buffer.from(envValue, 'base64').toString().trim())
}
