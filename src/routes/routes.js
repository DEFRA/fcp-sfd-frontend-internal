import { errors } from './errors/error-routes.js'
import { health } from './health-routes.js'
import { auth } from './auth/index.js'
import { index } from './index-routes.js'
import { staticAssetRoutes } from './static-assets-routes.js'
import { cookies } from './footer/cookies-routes.js'
import { signedOut } from './signed-out-routes.js'
import { footerRoutes } from './footer/footer-routes.js'
import { searchSbiRoutes } from './search/search-sbi-routes.js'
import { searchCrnRoutes } from './search/search-crn-routes.js'
import { changeSearchCriteriaRoutes } from './search/change-search-criteria-routes.js'
import { customerOverviewRoutes } from './overview/customer-routes.js'
import { businessOverviewRoutes } from './overview/business-routes.js'
import { customerDetailsRoutes } from './customer/customer-details-routes.js'
import { personalNameChangeRoutes } from './customer/personal-name-change-routes.js'
import { personalNameCheckRoutes } from './customer/personal-name-check-routes.js'
import { personalDobChangeRoutes } from './customer/personal-dob-change-routes.js'
import { personalDobCheckRoutes } from './customer/personal-dob-check-routes.js'
import { personalPhoneNumbersChangeRoutes } from './customer/personal-phone-numbers-change-routes.js'
import { personalPhoneNumbersCheckRoutes } from './customer/personal-phone-numbers-check-routes.js'
import { personalEmailChangeRoutes } from './customer/personal-email-change-routes.js'
import { personalEmailCheckRoutes } from './customer/personal-email-check-routes.js'
import { personalFixRoutes } from './customer/personal-fix-routes.js'
import { personalFixListRoutes } from './customer/personal-fix-list-routes.js'
import { personalFixCheckRoutes } from './customer/personal-fix-check-routes.js'
import { businessDetailsRoutes } from './business/business-details-routes.js'
import { businessEmailChangeRoutes } from './business/business-email-change-routes.js'
import { businessEmailCheckRoutes } from './business/business-email-check-routes.js'
import { businessNameChangeRoutes } from './business/business-name-change-routes.js'
import { businessNameCheckRoutes } from './business/business-name-check-routes.js'
import { businessAddressChangeRoutes } from './business/business-address-change-routes.js'
import { businessAddressSelectRoutes } from './business/business-address-select-routes.js'
import { businessAddressEnterRoutes } from './business/business-address-enter-routes.js'
import { businessAddressCheckRoutes } from './business/business-address-check-routes.js'
import { businessPhoneNumbersChangeRoutes } from './business/business-phone-numbers-change-routes.js'
import { businessPhoneNumbersCheckRoutes } from './business/business-phone-numbers-check-routes.js'
import { personalAddressEnterRoutes } from './customer/personal-address-enter-routes.js'
import { personalAddressSelectRoutes } from './customer/personal-address-select-routes.js'
import { personalAddressCheckRoutes } from './customer/personal-address-check-routes.js'
import { personalAddressChangeRoutes } from './customer/personal-address-change-routes.js'
import { businessVatChangeRoutes } from './business/business-vat-change-routes.js'
import { businessVatCheckRoutes } from './business/business-vat-check-routes.js'
import { businessVatRemoveRoutes } from './business/business-vat-remove-routes.js'

export const routes = [
  health,
  index,
  ...auth,
  cookies,
  signedOut,
  ...errors,
  ...staticAssetRoutes,
  ...footerRoutes,
  ...searchSbiRoutes,
  ...searchCrnRoutes,
  ...changeSearchCriteriaRoutes,
  ...customerOverviewRoutes,
  ...businessOverviewRoutes,
  ...customerDetailsRoutes,
  ...personalNameChangeRoutes,
  ...personalNameCheckRoutes,
  ...personalEmailChangeRoutes,
  ...personalEmailCheckRoutes,
  ...personalPhoneNumbersChangeRoutes,
  ...personalPhoneNumbersCheckRoutes,
  ...personalDobChangeRoutes,
  ...personalDobCheckRoutes,
  ...personalFixRoutes,
  ...personalFixListRoutes,
  ...personalFixCheckRoutes,
  ...businessDetailsRoutes,
  ...businessEmailChangeRoutes,
  ...businessEmailCheckRoutes,
  ...businessNameChangeRoutes,
  ...businessNameCheckRoutes,
  ...businessAddressChangeRoutes,
  ...businessAddressSelectRoutes,
  ...businessAddressEnterRoutes,
  ...businessAddressCheckRoutes,
  ...businessPhoneNumbersChangeRoutes,
  ...businessPhoneNumbersCheckRoutes,
  ...personalAddressEnterRoutes,
  ...personalAddressSelectRoutes,
  ...personalAddressCheckRoutes,
  ...personalAddressChangeRoutes,
  ...businessVatChangeRoutes,
  ...businessVatCheckRoutes,
  ...businessVatRemoveRoutes
]
