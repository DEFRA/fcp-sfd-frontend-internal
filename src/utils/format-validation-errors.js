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
