/**
 * Creates a state value and stores it in the session
 *
 * @module state
 */

import crypto from 'node:crypto'

/**
 * Creates a state value and stores it in the session
 *
 * The value is passed to Entra during redirection and must be verified when the user returns.
 *
 * @param {object} request - The Hapi request object
 *
 * @returns {string} The base64 encoded state value
 */
function createState (request) {
  // Generate a unique state value and store it in the session
  // Entra will pass this value back to the application during redirection
  // The value should be verified when the user is redirected back to the application to prevent CSRF attacks
  // The format must be base64 encoded
  const state = Buffer.from(JSON.stringify({ id: crypto.randomUUID() })).toString('base64')
  request.yar.set('state', state)
  return state
}

/**
 * Validates the returned state against the value stored in the session
 *
 * The stored value is cleared whether or not it matches.
 *
 * @param {object} request - The Hapi request object
 * @param {string} state - The state value returned by Entra
 *
 * @throws {Error} If the state does not match, as this is a possible CSRF attack
 */
function validateState (request, state) {
  const storedState = request.yar.get('state')
  request.yar.clear('state')

  // If state has been modified, it is likely a potential CSRF attack
  if (storedState !== state) {
    throw new Error('Invalid state, possible CSRF attack')
  }
}

export { createState, validateState }
