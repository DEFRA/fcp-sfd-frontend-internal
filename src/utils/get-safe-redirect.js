export const getSafeRedirect = (redirect) => {
  if (!redirect?.startsWith('/')) {
    return '/search-sbi'
  }
  return redirect
}
