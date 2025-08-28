import { rawPermissionsSchema } from '../schemas/dal/permissions-schema.js'
import { createLogger } from '../utils/logger.js'

/**
 * Takes the raw data and maps it to a more usable format
 *
 * @param {Object} raw - The raw response payload from the DAL
 *
 * @returns {Object} Formatted permission data
 */

export const mapPermissions = (raw) => {
  const logger = createLogger()

  const { error, value } = rawPermissionsSchema.validate(raw)

  if (error) {
    logger.error(`Permission Validation fail for DAL response: ${error.message}`)
    throw new Error(`Permission Validation fail for DAL response: ${error.message}`)
  }

  const privileges = value.business.customer.permissionGroups.map(permissionGroups => `${permissionGroups.id.toUpperCase()}:${permissionGroups.level.toUpperCase()}`)

  return {
    privileges,
    businessName: value.business.info.name
  }
}
