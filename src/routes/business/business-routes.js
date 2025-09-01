import { businessAddressRoutes } from './business-address-enter-routes.js'
import { businessAddressCheckRoutes } from './business-address-check-routes.js'
import { businessDetailsRoutes } from './business-details-routes.js'
import { businessEmailChangeRoutes } from './business-email-change-routes.js'
import { businessEmailCheckRoutes } from './business-email-check-routes.js'
import { businessLegalStatusRoutes } from './business-legal-status-change-routes.js'
import { businessNameChangeRoutes } from './business-name-change-routes.js'
import { businessNameCheckRoutes } from './business-name-check-routes.js'
import { businessPhoneNumbersChangeRoutes } from './business-phone-numbers-change-routes.js'
import { businessPhoneNumbersCheckRoutes } from './business-phone-numbers-check-routes.js'
import { businessTypeRoutes } from './business-type-change-routes.js'
import { businessVatChangeRoutes } from './business-vat-change-routes.js'
import { businessVatCheckRoutes } from './business-vat-check-routes.js'
import { exampleDalConnectionRoute } from './example-routes.js'

export const businessRoutes = [
  ...businessAddressRoutes,
  ...businessAddressCheckRoutes,
  ...businessDetailsRoutes,
  ...businessEmailChangeRoutes,
  ...businessEmailCheckRoutes,
  ...businessLegalStatusRoutes,
  ...businessNameChangeRoutes,
  ...businessNameCheckRoutes,
  ...businessPhoneNumbersChangeRoutes,
  ...businessPhoneNumbersCheckRoutes,
  ...businessTypeRoutes,
  ...businessVatChangeRoutes,
  ...businessVatCheckRoutes,
  exampleDalConnectionRoute
]
