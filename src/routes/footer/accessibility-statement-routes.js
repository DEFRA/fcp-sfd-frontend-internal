import { getSafeBackLink } from '../../utils/get-safe-back-link.js'

export const accessibilityStatement = {
  method: 'GET',
  path: '/accessibility-statement',
  handler: (request, h) => {
    const backLink = getSafeBackLink(request.headers.referer, '/search-sbi')
    return h.view('footer/accessibility-statement', {
      pageTitle: 'Accessibility statement',
      heading: 'Accessibility statement',
      backLink
    })
  }
}
