import { getSafeBackLink } from '../../utils/get-safe-back-link.js'
import { SEARCH_SBI } from '../../constants/search-links.js'

export const cookies = {
  method: 'GET',
  path: '/cookies',
  options: {
    auth: false
  },
  handler: (request, h) => {
    const backLink = getSafeBackLink(request.info.referrer, SEARCH_SBI)
    return h.view('cookies', {
      pageTitle: 'Cookies',
      heading: 'How we use cookies to store information about how you use this service.',
      backLink
    })
  }
}
