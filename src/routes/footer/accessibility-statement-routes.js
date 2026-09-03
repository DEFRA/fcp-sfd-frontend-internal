import { getSafeBackLink } from '../../utils/get-safe-back-link.js'
import { SEARCH_SBI } from '../../constants/search-links.js'

export const accessibilityStatement = {
  method: 'GET',
  path: '/accessibility-statement',
  options: {
    auth: false
  },
  handler: (request, h) => {
    const backLink = getSafeBackLink(request.info.referrer, SEARCH_SBI)
    return h.view('footer/accessibility-statement', {
      pageTitle: 'Accessibility statement',
      heading: 'Accessibility statement',
      backLink
    })
  }
}
