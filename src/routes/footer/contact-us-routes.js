export const contactUs = {
  method: 'GET',
  path: '/contact-help',
  handler: (request, h) => {
    const backLink = request.headers.referer
    return h.view('footer/contact-help', {
      pageTitle: 'Contact us for help',
      heading: 'How to contact this service if you need help.',
      backLink
    })
  }
}
