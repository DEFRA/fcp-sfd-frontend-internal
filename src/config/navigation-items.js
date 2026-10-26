/**
 * Navigation items shown in the service header
 *
 * @module navigationItems
 */

/**
 * Navigation items shown in the service header
 *
 * @param {object} [request] - The Hapi request object, used to set the active item
 *
 * @returns {object[]} The navigation items
 */
export const getNavigationItems = (request) => {
  return [
    {
      text: 'Home',
      url: '/',
      isActive: request?.path === '/'
    }
  ]
}
