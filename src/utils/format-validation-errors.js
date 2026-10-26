/**
 * Formats Joi validation errors for display
 *
 * @module formatValidationErrors
 */

/**
 * Formats Joi validation errors for display
 *
 * Errors are keyed by field name. Missing-peer errors are applied to each peer field.
 *
 * @param {object[]} errors - The Joi validation error details
 *
 * @returns {object} The errors keyed by field name, each in the form `{ text }`
 */
export const formatValidationErrors = (errors) => {
  const formattedErrors = {}

  errors.forEach(error => {
    const { type, context, message: text, path } = error

    // If the error type is 'object.missing' and multiple input fields (peers) are involved
    if (type === 'object.missing' && Array.isArray(context?.peers)) {
      context.peers.forEach(peer => {
        formattedErrors[peer] = { text }
      })
    } else {
      // Handle individual input field error
      formattedErrors[path[0]] = { text }
    }
  })

  return formattedErrors
}
