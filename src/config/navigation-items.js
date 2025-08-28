export const getNavigationItems = (request) => {
  return [
    {
      text: 'Home',
      url: '/',
      isActive: request?.path === '/'
    }
  ]
}
