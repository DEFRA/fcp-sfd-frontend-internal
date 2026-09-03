import { getSafeBackLink } from '../../utils/get-safe-back-link.js'
import { SEARCH_SBI } from '../../constants/search-links.js'

export const contactUs = {
  method: 'GET',
  path: '/contact-help',
  options: {
    auth: false
  },
  handler: (request, h) => {
    const backLink = getSafeBackLink(request.info.referrer, SEARCH_SBI)
    return h.view('footer/contact-help', {
      pageTitle: 'Contact us for help',
      heading: 'How to contact this service if you need help.',
      backLink
    })
  }
}
