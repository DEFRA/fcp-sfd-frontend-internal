/**
 * Takes the raw customer overview details data and maps it to a more usable format
 *
 * @param {Object} value - The data from the DAL
 *
 * @returns {Object} Formatted customer overview details data
 */

export const mapCustomerOverviewDetails = (value) => {
  const name = value?.customer?.info?.name ?? {}

  return {
    info: {
      crn: value?.customer?.crn,
      customerName: `${name.first} ${name.last}`
    },
    businesses: formatBusinesses(value?.customer?.businesses ?? [])
  }
}

const formatBusinesses = (businesses) => {
  return businesses.map(business => ({
    name: business?.name,
    sbi: business?.sbi
  }))
}
