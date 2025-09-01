/**
 * Takes the data from a request and sets it on the session
 * @module setSessionData
 */

/**
 * Takes the data from a request and sets it on the session
 *
 * Using the key provided this function will fetch the current session data already set on the state.
 * With that data it will then update the session with the data provided. This uses the value
 * provided as the key to update the session data.
 *
 * It returns the newly updated session object to be used.
 *
 * @param {object} data - The data from the form that will be set on the session
 * @param {object} yar - The hapi `request.yar` object
 * @param {string} key - The key to fetch the current session data
 * @param {string} value - The object value
 *
 * @returns {object} - The updated session data object
 */
const setSessionData = (yar, key, value, data) => {
  const sessionData = yar.get(key)

  sessionData[value] = data

  yar.set(key, sessionData)

  return sessionData
}

export {
  setSessionData
}
