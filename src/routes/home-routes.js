const index = {
  method: 'GET',
  path: '/',
  options: {
    auth: { mode: 'try' }
  },
  handler: (_request, h) => {
    return h.view('index')
  }
}

const home = {
  method: 'GET',
  path: '/home',
  handler: (request, h) => {
    return h.view('home', { auth: request.auth.credentials })
  }
}

export const homeRoutes = [
  index,
  home
]
