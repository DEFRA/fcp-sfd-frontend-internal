import { auth } from './auth/index.js'
import { businessAddressChangeRoutes } from './business/business-address-change-routes.js'
import { businessAddressCheckRoutes } from './business/business-address-check-routes.js'
import { businessAddressEnterRoutes } from './business/business-address-enter-routes.js'
import { businessAddressSelectRoutes } from './business/business-address-select-routes.js'
import { businessDetailsRoutes } from './business/business-details-routes.js'
import { businessEmailChangeRoutes } from './business/business-email-change-routes.js'
import { businessEmailCheckRoutes } from './business/business-email-check-routes.js'
import { businessFixCheckRoutes } from './business/business-fix-check-routes.js'
import { businessFixListRoutes } from './business/business-fix-list-routes.js'
import { businessFixRoutes } from './business/business-fix-routes.js'
import { businessLegalStatusChangeRoutes } from './business/business-legal-status-change-routes.js'
import { businessLegalStatusCheckRoutes } from './business/business-legal-status-check-routes.js'
import { businessLegalStatusEnterRoutes } from './business/business-legal-status-enter-routes.js'
import { businessNameChangeRoutes } from './business/business-name-change-routes.js'
import { businessNameCheckRoutes } from './business/business-name-check-routes.js'
import { businessPhoneNumbersChangeRoutes } from './business/business-phone-numbers-change-routes.js'
import { businessPhoneNumbersCheckRoutes } from './business/business-phone-numbers-check-routes.js'
import { businessVatChangeRoutes } from './business/business-vat-change-routes.js'
import { businessVatCheckRoutes } from './business/business-vat-check-routes.js'
import { businessVatRemoveRoutes } from './business/business-vat-remove-routes.js'
import { customerDetailsRoutes } from './customer/customer-details-routes.js'
import { personalAddressChangeRoutes } from './customer/personal-address-change-routes.js'
import { personalAddressCheckRoutes } from './customer/personal-address-check-routes.js'
import { personalAddressEnterRoutes } from './customer/personal-address-enter-routes.js'
import { personalAddressSelectRoutes } from './customer/personal-address-select-routes.js'
import { personalDobChangeRoutes } from './customer/personal-dob-change-routes.js'
import { personalDobCheckRoutes } from './customer/personal-dob-check-routes.js'
import { personalEmailChangeRoutes } from './customer/personal-email-change-routes.js'
import { personalEmailCheckRoutes } from './customer/personal-email-check-routes.js'
import { personalFixCheckRoutes } from './customer/personal-fix-check-routes.js'
import { personalFixListRoutes } from './customer/personal-fix-list-routes.js'
import { personalFixRoutes } from './customer/personal-fix-routes.js'
import { personalNameChangeRoutes } from './customer/personal-name-change-routes.js'
import { personalNameCheckRoutes } from './customer/personal-name-check-routes.js'
import { personalPhoneNumbersChangeRoutes } from './customer/personal-phone-numbers-change-routes.js'
import { personalPhoneNumbersCheckRoutes } from './customer/personal-phone-numbers-check-routes.js'
import { errors } from './errors/error-routes.js'
import { cookies } from './footer/cookies-routes.js'
import { footerRoutes } from './footer/footer-routes.js'
import { health } from './health-routes.js'
import { index } from './index-routes.js'
import { businessOverviewRoutes } from './overview/business-routes.js'
import { customerOverviewRoutes } from './overview/customer-routes.js'
import { changeSearchCriteriaRoutes } from './search/change-search-criteria-routes.js'
import { searchCrnRoutes } from './search/search-crn-routes.js'
import { searchSbiRoutes } from './search/search-sbi-routes.js'
import { signedOut } from './signed-out-routes.js'
import { staticAssetRoutes } from './static-assets-routes.js'

export const routes = [
  ...auth,
  ...businessAddressChangeRoutes,
  ...businessAddressCheckRoutes,
  ...businessAddressEnterRoutes,
  ...businessAddressSelectRoutes,
  ...businessDetailsRoutes,
  ...businessEmailChangeRoutes,
  ...businessEmailCheckRoutes,
  ...businessFixCheckRoutes,
  ...businessFixListRoutes,
  ...businessFixRoutes,
  ...businessLegalStatusChangeRoutes,
  ...businessLegalStatusCheckRoutes,
  ...businessLegalStatusEnterRoutes,
  ...businessNameChangeRoutes,
  ...businessNameCheckRoutes,
  ...businessOverviewRoutes,
  ...businessPhoneNumbersChangeRoutes,
  ...businessPhoneNumbersCheckRoutes,
  ...businessVatChangeRoutes,
  ...businessVatCheckRoutes,
  ...businessVatRemoveRoutes,
  ...changeSearchCriteriaRoutes,
  cookies,
  ...customerDetailsRoutes,
  ...customerOverviewRoutes,
  ...errors,
  ...footerRoutes,
  health,
  index,
  ...personalAddressChangeRoutes,
  ...personalAddressCheckRoutes,
  ...personalAddressEnterRoutes,
  ...personalAddressSelectRoutes,
  ...personalDobChangeRoutes,
  ...personalDobCheckRoutes,
  ...personalEmailChangeRoutes,
  ...personalEmailCheckRoutes,
  ...personalFixCheckRoutes,
  ...personalFixListRoutes,
  ...personalFixRoutes,
  ...personalNameChangeRoutes,
  ...personalNameCheckRoutes,
  ...personalPhoneNumbersChangeRoutes,
  ...personalPhoneNumbersCheckRoutes,
  ...searchCrnRoutes,
  ...searchSbiRoutes,
  signedOut,
  ...staticAssetRoutes
]
