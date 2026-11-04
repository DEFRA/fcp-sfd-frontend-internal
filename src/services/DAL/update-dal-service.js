/**
 * Runs a GraphQL mutation against the DAL
 *
 * This helper is reused across update services to avoid duplicating code.
 * Right now it only handles successful responses ("happy path").
 * If DAL returns errors, it throws an exception.
 *
 * Having this in one place also makes it easier to add retries
 * or extra error handling in the future.
 *
 * @module update-dal-service
 */

import { getDalConnector } from '../../dal/connector.js'

/**
 * Runs a GraphQL mutation against the DAL
 *
 * @param {string} mutation - The GraphQL mutation to run
 * @param {object} variables - The variables for the mutation
 * @param {string} email - The internal user's email address (sent to the DAL in the request headers)
 *
 * @returns {Promise<object>} The DAL response
 *
 * @throws {Error} If the DAL response contains errors
 */
const updateDalService = async (mutation, variables, email) => {
  const dalConnector = getDalConnector()
  const response = await dalConnector.query(mutation, variables, email)

  if (response.errors) {
    throw new Error('DAL error from mutation')
  }

  return response
}

export {
  updateDalService
}
