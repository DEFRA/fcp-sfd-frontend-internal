export const businessOverviewQuery = `
  query Business($sbi: ID!) {
  business(sbi: $sbi) {
    sbi
    info {
      name
    }
    customers {
      crn
      firstName
      lastName
    }
  }
}
`
