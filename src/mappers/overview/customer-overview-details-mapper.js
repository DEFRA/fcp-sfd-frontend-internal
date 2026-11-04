/**
 * Maps the raw customer overview details data from the DAL to a more usable format
 *
 * @module customerOverviewDetailsMapper
 */

/**
 * Maps the raw customer overview details data from the DAL to a more usable format
 *
 * @param {object} value - The data from the DAL
 *
 * @returns {object} Formatted customer overview details data
 */
export const mapCustomerOverviewDetails = (value) => {
  const name = value?.customer?.info?.name ?? {}

  return {
    crn: value?.customer?.crn,
    customerName: `${name.first ?? ''} ${name.last ?? ''}`.trim(),
    businesses: formatBusinesses(value?.customer?.businesses ?? [])
  }
}

const formatBusinesses = (businesses) => {
  return businesses.map(business => ({
    name: business?.name,
    sbi: business?.sbi
  }))
}
