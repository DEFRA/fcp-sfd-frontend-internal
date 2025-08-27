import { SCOPE } from '../constants/scope/business-details.js'

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
  options: {
    auth: { scope: SCOPE }
  },
  handler: (_request, h) => {
    return h.view('home')
  }
}

export const homeRoutes = [
  index,
  home
]
