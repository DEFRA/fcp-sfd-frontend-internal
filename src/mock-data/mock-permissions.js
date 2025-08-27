const dalData = {
  business: {
    customer: {
      permissionGroups: [
        {
          id: 'BASIC_PAYMENT_SCHEME',
          level: 'SUBMIT'
        },
        {
          id: 'BUSINESS_DETAILS',
          level: 'FULL_PERMISSION'
        },
        {
          id: 'COUNTRYSIDE_STEWARDSHIP_AGREEMENTS',
          level: 'SUBMIT'
        },
        {
          id: 'COUNTRYSIDE_STEWARDSHIP_APPLICATIONS',
          level: 'SUBMIT'
        },
        {
          id: 'ENTITLEMENTS',
          level: 'AMEND'
        },
        {
          id: 'LAND_DETAILS',
          level: 'AMEND'
        }
      ]
    },
    info: {
      name: 'HENLEY, RE'
    }
  }
}

const mappedData = {
  privileges: [
    'BASIC_PAYMENT_SCHEME:SUBMIT',
    'BUSINESS_DETAILS:FULL_PERMISSION',
    'COUNTRYSIDE_STEWARDSHIP_AGREEMENTS:SUBMIT',
    'COUNTRYSIDE_STEWARDSHIP_APPLICATIONS:SUBMIT',
    'ENTITLEMENTS:AMEND',
    'LAND_DETAILS:AMEND'
  ],
  businessName: 'HENLEY, RE'
}

export {
  dalData,
  mappedData
}
