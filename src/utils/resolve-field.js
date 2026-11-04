/**
 * Resolves a field value from the current, original or fallback values
 *
 * @module resolveField
 */

/**
 * Resolves a field value from the current, original or fallback values
 *
 * Uses the original value unless a success message is being shown, otherwise the current value, then the fallback,
 * then an empty string.
 *
 * @param {object} params - The values to resolve from
 * @param {string} [params.current] - The current (for example payload) value
 * @param {string} [params.original] - The original (for example session) value
 * @param {string} [params.fallback] - The value to use when no current value exists
 * @param {boolean} [params.showSuccess] - Whether a success message is being shown
 *
 * @returns {string} The resolved value
 */
export const resolveField = ({ current, original, fallback, showSuccess }) => {
  return original && !showSuccess ? original : (current || fallback || '')
}
