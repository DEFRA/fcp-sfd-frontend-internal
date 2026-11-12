export const businessDetailsOverview = `
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
