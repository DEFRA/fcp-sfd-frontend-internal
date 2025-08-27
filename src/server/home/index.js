import { homeController } from './controller.js'
/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const home = {
  plugin: {
    name: 'home',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/',
          ...homeController
        },
        {
          method: 'GET',
          path: '/home',
          options: {
            auth: { scope: 'SFD:Basic' }
          },
          handler: (_request, h) => {
            return h.view('home')
          }
        }
      ])
    }
  }
}
