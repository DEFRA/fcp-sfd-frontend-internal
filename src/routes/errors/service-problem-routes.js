export const serviceProblem = {
  method: 'GET',
  path: '/service-problem',
  handler: (_request, h) => {
    return h.view('errors/service-problem')
  }
}
