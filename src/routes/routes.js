import { errors } from './errors/error-routes.js'
import { health } from './health-routes.js'
import { auth } from './auth/index.js'
import { homeRoutes } from './home-routes.js'
import { dalExampleRoutes } from './dal-example-routes.js'
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
import { businessDetailsRoutes } from './business/business-details-routes.js'

export const routes = [
  health,
  ...homeRoutes,
  ...dalExampleRoutes,
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
  ...businessDetailsRoutes
]
