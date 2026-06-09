/**
 * Test-only fixture helpers for business overview.
 * Returns fresh objects so tests can safely mutate values in beforeEach blocks.
 *
 * @module mockBusinessOverview
 */

const getDalData = () => ({
  business: {
    sbi: '106705779',
    info: {
      name: 'Herberts Lawn Mowing'
    },
    customers: [
      { crn: '1100000001', firstName: 'Alice', lastName: 'Smith' },
      { crn: '1100000002', firstName: 'Bob', lastName: 'Jones' },
      { crn: '1100000003', firstName: 'Charlie', lastName: 'Brown' }
    ]
  }
})

const getMappedData = () => ({
  sbi: '106705779',
  businessName: 'Herberts Lawn Mowing',
  customers: [
    { crn: '1100000001', firstName: 'Alice', lastName: 'Smith' },
    { crn: '1100000002', firstName: 'Bob', lastName: 'Jones' },
    { crn: '1100000003', firstName: 'Charlie', lastName: 'Brown' }
  ]
})

const getPresentedData = () => ({
  searchResultsLink: '/search-sbi',
  pageTitle: 'Business overview',
  sbi: '106705779',
  businessName: 'Herberts Lawn Mowing',
  customers: [
    { name: 'Alice Smith', crn: '1100000001' },
    { name: 'Bob Jones', crn: '1100000002' },
    { name: 'Charlie Brown', crn: '1100000003' }
  ]
})

export {
  getDalData,
  getMappedData,
  getPresentedData
}
