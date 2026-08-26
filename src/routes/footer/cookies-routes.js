import { getSafeBackLink } from '../../utils/get-safe-back-link.js'

export const cookies = {
  method: 'GET',
  path: '/cookies',
  handler: (request, h) => {
    const backLink = getSafeBackLink(request.headers.referer, '/search-sbi')
    return h.view('cookies', {
      pageTitle: 'Cookies',
      heading: 'How we use cookies to store information about how you use this service.',
      backLink
    })
  }
}
