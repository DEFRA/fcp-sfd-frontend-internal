/**
 * Formats a date using a date-fns format string
 *
 * @module formatDate
 */

import { format, isDate, parseISO } from 'date-fns'

/**
 * Formats a date using a date-fns format string
 *
 * @param {Date|string} value - The date, or an ISO 8601 date string
 * @param {string} [formattedDateStr] - The date-fns format, defaulting to 'EEE do MMMM yyyy'
 *
 * @returns {string} The formatted date
 */
export const formatDate = (value, formattedDateStr = 'EEE do MMMM yyyy') => {
  const date = isDate(value) ? value : parseISO(value)

  return format(date, formattedDateStr)
}
