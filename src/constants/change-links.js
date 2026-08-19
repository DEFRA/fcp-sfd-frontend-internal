export const BUSINESS_CHANGE_LINKS = {
  businessEmail: (sbi) => `/business/${sbi}/business-email-change`,
  businessName: (sbi) => `/business/${sbi}/business-name-change`,
  businessTelephone: (sbi) => `/business/${sbi}/business-phone-numbers-change`,
  businessAddress: (sbi) => `/business/${sbi}/business-address-change`,
  businessVat: (sbi) => `/business/${sbi}/business-vat-registration-number-change`,
  businessVatRemove: (sbi) => `/business/${sbi}/business-vat-registration-remove`
}

export const PERSONAL_CHANGE_LINKS = {
  personalEmail: (crn) => `/customer/${crn}/account-email-change`,
  personalName: (crn) => `/customer/${crn}/account-name-change`,
  personalAddress: (crn) => `/customer/${crn}/account-address-change`
}
