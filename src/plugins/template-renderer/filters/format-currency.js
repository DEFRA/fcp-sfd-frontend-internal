/**
 * Formats a value as currency
 *
 * @module formatCurrency
 */

/**
 * Formats a value as currency
 *
 * @param {number} value - The value to format
 * @param {string} [locale] - The locale, defaulting to en-GB
 * @param {string} [currency] - The ISO 4217 currency code, defaulting to GBP
 *
 * @returns {string} The formatted currency value
 */
export const formatCurrency = (value, locale = 'en-GB', currency = 'GBP') => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  })

  return formatter.format(value)
}
