/**
 * Builds the data object expected by the govukPagination Nunjucks macro.
 *
 * Returns null when there is only one page (GOV.UK guidance: do not show
 * pagination if there is only one page of content).
 *
 * @module paginationPresenter
 */

// Default page size for pagination (items per page)
const PAGE_SIZE_DEFAULT = 2

/**
 * @param {Object} options
 * @param {number} options.totalItems - Total number of items in the full list
 * @param {number} options.currentPage - 1-based current page number
 * @param {number} [options.pageSize=20] - Items per page
 * @param {string} options.baseUrl - URL with existing query params (page param will be appended)
 *
 * @returns {Object|null} Shape matching govukPagination macro, or null if single page
 */
const paginationPresenter = ({ totalItems, currentPage, pageSize = PAGE_SIZE_DEFAULT, baseUrl }) => {
  const totalPages = Math.ceil(totalItems / pageSize)

  if (totalPages <= 1) {
    return null
  }

  const page = Math.max(1, Math.min(currentPage, totalPages))
  const separator = baseUrl.includes('?') ? '&' : '?'
  const buildHref = (pageNum) => `${baseUrl}${separator}page=${pageNum}`

  const pagination = {
    items: buildItems(page, totalPages, buildHref)
  }

  if (page > 1) {
    pagination.previous = { href: buildHref(page - 1) }
  }

  if (page < totalPages) {
    pagination.next = { href: buildHref(page + 1) }
  }

  return pagination
}

/**
 * Builds the items array with page numbers and ellipsis markers.
 *
 * Always shows: first page, last page, current page, and one page either side
 * of current. Uses { ellipsis: true } for gaps larger than one page.
 */
const buildItems = (currentPage, totalPages, buildHref) => {
  const pageNumbers = getVisiblePages(currentPage, totalPages)
  const items = []

  for (let i = 0; i < pageNumbers.length; i++) {
    const pageNum = pageNumbers[i]
    const prevPageNum = pageNumbers[i - 1]

    // Insert ellipsis if there's a gap
    if (prevPageNum !== undefined && pageNum - prevPageNum > 1) {
      items.push({ ellipsis: true })
    }

    const item = {
      number: pageNum,
      href: buildHref(pageNum)
    }

    if (pageNum === currentPage) {
      item.current = true
    }

    items.push(item)
  }

  return items
}

/**
 * Determines which page numbers should be visible.
 * Returns a sorted, deduplicated array of page numbers.
 */
const getVisiblePages = (currentPage, totalPages) => {
  const pages = new Set()

  // Always show first and last
  pages.add(1)
  pages.add(totalPages)

  // Always show current and neighbours
  pages.add(currentPage)
  if (currentPage > 1) pages.add(currentPage - 1)
  if (currentPage < totalPages) pages.add(currentPage + 1)

  return [...pages].sort((a, b) => a - b)
}

export {
  paginationPresenter,
  PAGE_SIZE_DEFAULT
}
