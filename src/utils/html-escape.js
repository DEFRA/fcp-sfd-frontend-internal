/**
 * Escapes HTML special characters to prevent XSS attacks
 * Converts &, <, >, ", and ' to their HTML entity equivalents
 *
 * @module htmlEscape
 * @param {string} text - The text to escape
 * @returns {string} The escaped text safe for use in HTML
 */
const htmlEscape = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }

  return String(text).replace(/[&<>"']/g, (char) => map[char])
}

export { htmlEscape }
