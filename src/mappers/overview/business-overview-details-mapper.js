/**
 * Takes the raw business overview details data and maps it to a more usable format
 *
 * @param {Object} value - The data from the DAL
 *
 * @returns {Object} Formatted business overview details data
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
