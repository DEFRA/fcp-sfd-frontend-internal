import { SEARCH_SBI } from '../constants/search-links.js'

export const getSafeRedirect = (redirect) => {
  if (!redirect?.startsWith('/')) {
    return SEARCH_SBI
  }
  return redirect
}
