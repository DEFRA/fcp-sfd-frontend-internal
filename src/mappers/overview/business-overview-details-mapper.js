/**
 * Maps the raw business overview details data from the DAL to a more usable format
 *
 * @module businessOverviewDetailsMapper
 */

/**
 * Maps the raw business overview details data from the DAL to a more usable format
 *
 * @param {object} value - The data from the DAL
 *
 * @returns {object} Formatted business overview details data
 */
export const mapBusinessOverviewDetails = (value) => {
  const business = value?.business ?? {}

  return {
    sbi: business.sbi ?? null,
    businessName: business.info?.name ?? null,
    customers: formatCustomers(business.customers ?? [])
  }
}

const formatCustomers = (customers) => {
  return customers.map((customer) => ({
    crn: customer.crn,
    firstName: customer.firstName,
    lastName: customer.lastName
  }))
}
