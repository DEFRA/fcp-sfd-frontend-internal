export const contactUs = {
  method: 'GET',
  path: '/contact-help',
  handler: (_request, h) => {
    return h.view('footer/contact-help', {
      pageTitle: 'Contact us for help',
      heading: 'How to contact this service if you need help.'
    })
  }
}
