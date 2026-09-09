export const BUSINESS_CHANGE_LINKS = {
  businessEmail: (sbi) => `/business/${sbi}/email-change`,
  businessName: (sbi) => `/business/${sbi}/name-change`,
  businessTelephone: (sbi) => `/business/${sbi}/phone-numbers-change`,
  businessAddress: (sbi) => `/business/${sbi}/address-change`,
  businessVat: (sbi) => `/business/${sbi}/vat-registration-number-change`,
  businessVatRemove: (sbi) => `/business/${sbi}/vat-registration-remove`,
  businessLegalStatus: (sbi) => `/business/${sbi}/legal-status-change`,
  businessLegalStatusRegistrationNumber: (sbi) => `/business/${sbi}/legal-status-enter`
}

export const PERSONAL_CHANGE_LINKS = {
  personalEmail: (crn) => `/customer/${crn}/account-email-change`,
  personalName: (crn) => `/customer/${crn}/account-name-change`,
  personalAddress: (crn) => `/customer/${crn}/account-address-change`
}
