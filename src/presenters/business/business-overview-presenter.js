/**
 * Formats data ready for presenting in the `/business-overview` page
 * @module businessOverviewPresenter
 */

const businessOverviewPresenter = (data) => {
  return {
    searchResultsLink: '/search-sbi',
    pageTitle: 'Business overview',
    sbi: data.sbi,
    businessName: data.businessName,
    customers: data.customers.map((customer) => ({
      name: [customer.firstName, customer.lastName].filter(Boolean).join(' '),
      crn: customer.crn
    }))
  }
}

export {
  businessOverviewPresenter
}
