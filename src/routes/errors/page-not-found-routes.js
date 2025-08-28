export const pageNotFound = {
  method: 'GET',
  path: '/page-not-found',
  handler: (_request, h) => {
    return h.view('errors/page-not-found')
  }
}
