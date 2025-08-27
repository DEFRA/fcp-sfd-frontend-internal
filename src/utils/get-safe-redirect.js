export const getSafeRedirect = (redirect) => {
  if (!redirect?.startsWith('/')) {
    return '/home'
  }
  return redirect
}
