/**
 * Takes the raw business overview data and maps it to a more usable format
 *
 * @param {Object} value - The data from the DAL
 *
 * @returns {Object} Formatted business overview data
 */

export const mapBusinessOverview = (value) => {
  const business = value?.business ?? {}

  return {
    sbi: business.sbi,
    businessName: business.info?.name ?? null,
    customers: (business.customers ?? []).map((customer) => ({
      crn: customer.crn,
      firstName: customer.firstName,
      lastName: customer.lastName
    }))
  }
}
