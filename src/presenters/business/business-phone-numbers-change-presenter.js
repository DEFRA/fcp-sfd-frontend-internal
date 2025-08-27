/**
 * Formats data ready for presenting in the `/business-phone-number-change` page
 * @module businessPhoneNumberChangePresenter
 */

const businessPhoneNumbersChangePresenter = (data, payload) => {
  return {
    backLink: { href: '/business-details' },
    pageTitle: 'What are your business phone numbers?',
    metaDescription: 'Update the phone numbers for your business.',
    businessName: data.info.businessName ?? null,
    sbi: data.info.sbi ?? null,
    userName: data.customer.fullName ?? null,
    businessTelephone: formatBusinessNumber(payload?.businessTelephone, data.changeBusinessTelephone, data.contact.landline),
    businessMobile: formatBusinessNumber(payload?.businessMobile, data.changeBusinessMobile, data.contact.mobile)
  }
}

/**
 * The first time a user loads the business phone numbers change page they won't have entered any data, so a payload
 * or a changedNumber won't be present. If a user has a validation issue then we want to reply the payload data to them.
 * We check if payload is not undefined because it could be a user has removed the 'mobile' number for example but
 * incorrectly entered the telephone number so the payload for this would appear as an empty string.
 *
 * Payload is the priority to check and then after that if changedNumber is present then we display that value.
 *
 * @private
 */
const formatBusinessNumber = (payloadNumber, changedNumber, originalNumber) => {
  if (payloadNumber !== undefined) {
    return payloadNumber
  }

  if (changedNumber !== undefined) {
    return changedNumber
  }

  return originalNumber
}

export {
  businessPhoneNumbersChangePresenter
}
