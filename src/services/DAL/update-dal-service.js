/**
 * Runs a GraphQL mutation against the DAL
 * @module update-dal-service
 *
 * This helper is reused across update services to avoid duplicating code.
 * Right now it only handles successful responses ("happy path").
 * If DAL returns errors, it throws an exception.
 *
 * Having this in one place also makes it easier to add retries
 * or extra error handling in the future.
 */

import { dalConnector } from '../../dal/connector.js'

const updateDalService = async (mutation, variables) => {
  const response = await dalConnector(mutation, variables)

  if (response.errors) {
    throw new Error('DAL error from mutation')
  }

  return response
}

export {
  updateDalService
}
