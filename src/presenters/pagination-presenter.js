/**
 * Transforms pagination information into the appropriate pagination component element
 * @module paginationPresenter
 */

const SIMPLE_PAGINATOR = 'simple'
const COMPLEX_START_PAGINATOR = 'start'
const COMPLEX_MIDDLE_PAGINATOR = 'middle'
const COMPLEX_END_PAGINATOR = 'end'
const PAGE_SIZE = 20

/**
 * Transforms pagination information into the appropriate pagination component elements
 *
 * This takes the information provided (number of records and selected page number) and uses it to generate the data
 * needed for the {@link https://design-system.service.gov.uk/components/pagination/ | GDS pagination component}.
 *
 * The pagination component is the thing seen at the bottom of pages which have to display dynamic results, for example,
 * search results or the customer's attached to a business. Example of the pagination component:
 *
 * `<- Previous 1 ... 6 [7] 8 ... 42 Next ->`
 *
 * The first step is to take the total number of records and divide them by our page size config (currently defaults to
 * 20) to determine how many pages are needed. If only 1 page is required (`numberOfRecords` is less then or equal to
 * 20) no pagination is needed and the presenter doesn't generate the component data.
 *
 * If pagination is needed, the next step is to determine the type. This is because the paginator is expected to behave
 * and display differently depending on the number of pages and which page is selected.
 *
 * ## Previous & Next
 *
 * These when displayed will move the selected page forward and backwards by one. However, the design system states
 *
 * > Do not show the previous page link on the first page – and do not show the next page link on the last page.
 *
 * So, one of the things this presenter needs to determine is whether both or just one of the 'previous' and 'next'
 * controls should be displayed.
 *
 * ## Page items
 *
 * The example previously given is for a large page range. It shows 7 'page items'; first, previous, current, next and
 * last plus 2 ellipses for skipped pages. The ellipses are there because we are not expected to show a page item for
 * _every_ page in the range. This is as per the  design system guidance.
 *
 * > show page numbers for: the current page, at least one page immediately before and after the current page, first and
 * > last pages. Use ellipses (…) to replace any skipped pages.
 *
 * It includes a number of examples of ways of implementing this. They are not consistent so it has been left
 * to us to pick one. A control that applies the guidance will have at most 7 items visible. Our approach is to _always_
 * display 7 page items unless there are less than 7 pages. To do this we define pagination types. The first split is
 * 'simple' or 'complex'.
 *
 * ### Simple
 *
 * This applies for any scenario where the number of pages is 7 or less. In this case we simply iterate from 1 up to the
 * number of pages creating a page item for each one. No ellipses are used.
 *
 * `[1] 2 3 4 5 6 7 Next -->`
 *
 * ### Complex
 *
 * This applies where we have 8 or more pages of results. It means at least one page item we will need to be an
 * ellipsis. The next problem is determining if both should be displayed, or only one and if only one where?
 *
 * To do this we break the complex component down into a further 3 types; start, middle and end. They are determined
 * based on which is the current page.
 *
 * #### Start
 *
 * If the current page is one of the first 4 pages we define the pagination type as 'complex start'. If, for example,
 * the current page is `[2]` and we took the guidance at face value we could have generated the paginator as
 *
 * `<- Previous 1 [2] 3 ... 42 Next ->`
 *
 * This control only displays 5 page items. But once the current page is `[5]` or more we are required to show ellipsis
 * at both ends.
 *
 * `<- Previous 1 ... 4 [5] 6 ... 42 Next ->`
 *
 * Now we're displaying 7 page items. Our approach removes the inconsistency and always shows 7 page items. This means
 * when `[2]` is the current page the paginator will display.
 *
 * `<- Previous 1 [2] 3 4 5 ... 42 Next ->`
 *
 * #### Middle
 *
 * This applies where the current page is greater than 4 and less than the number of pages minus 4 (for example, if the
 * number of pages is 42 this means the current page is greater than 4 and less than 39). If it is we define the
 * pagination type as 'complex middle'.
 *
 * When this is the case the selected page is in the 'middle' and an ellipsis needs to be shown at both ends.
 *
 * `<- Previous 1 ... 4 [5] 6 ... 42 Next ->`
 *
 * ##### End
 *
 * When the current page is one of the last 4 pages we define the pagination type as 'complex end'. If, for example,
 * the number of pages is 42 and the current page is 39 we'll generate the following paginator.
 *
 * `<- Previous 1 ... 38 [39] 40 41 42 Next ->`
 *
 * @param {number} numberOfRecords - the total number of records or results of the thing being paginated
 * @param {string} pageNumber - the page number of results selected for viewing
 * @param {string} path - the URL path the paginator should use, for example, `'/search-sbi'`
 * @param {number} numberOfShownItems - The number of items currently being shown (e.g. items on the current page). This
 * is different to the 'default' page size because the last page may have fewer items than the default page size.
 * @param {string} message - A label appended to the end of the 'Showing x of y' string (e.g. "businesses", "results").
 * @param {object} queryArgs - the current query arguments to be added to the pagination links
 *
 * @returns {object} if no pagination is needed just the `numberOfPages` is returned else a `component:` property is
 * also included that can be directly passed to the `govukPagination()` in the view.
 */
const paginationPresenter = (numberOfRecords, pageNumber, path, numberOfShownItems, message, queryArgs = {}) => {
  // Round up the number of pages to the nearest whole number as we can't have a fraction of a page
  const numberOfPages = Math.ceil(numberOfRecords / PAGE_SIZE)
  const builtQueryString = buildQueryString(queryArgs)

  const currentPageNumber = pageNumber ? Number(pageNumber) : 1
  const { startItem, endItem, paginationTotal } = showingRange(numberOfRecords, numberOfShownItems, currentPageNumber)
  const showingMessage = showingXofY(numberOfRecords, numberOfShownItems, message, currentPageNumber)

  if (numberOfPages < 2) {
    return { currentPageNumber, numberOfPages, showingMessage, startItem, endItem, paginationTotal }
  }

  const component = createComponent(currentPageNumber, numberOfPages, path, builtQueryString)

  return { component, currentPageNumber, numberOfPages, showingMessage, startItem, endItem, paginationTotal }
}


/**
 * Creates the pagination component object with items and previous/next links
 */
const createComponent = (currentPageNumber, numberOfPages, path, queryString) => {
  const items = buildItems(currentPageNumber, numberOfPages, path, queryString)

  const component = { items }

  // Only show 'previous' link if not on the first page
  if (currentPageNumber !== 1) {
    component.previous = { href: `${path}?page=${currentPageNumber - 1}${queryString}` }
  }

  // Only show 'next' link if not on the last page
  if (currentPageNumber !== numberOfPages) {
    component.next = { href: `${path}?page=${currentPageNumber + 1}${queryString}` }
  }

  return component
}

/**
 * Builds the array of page items based on the pagination type
 *
 * Determines which pagination layout to use (simple for <=7 pages, complex for >7 pages)
 * and generates the appropriate list of page numbers, ellipses, and links.
 */
const buildItems = (currentPageNumber, numberOfPages, path, queryString) => {
  const type = paginatorType(currentPageNumber, numberOfPages)

  let items

  // Choose the right pagination layout based on the current position and total pages
  if (type === COMPLEX_START_PAGINATOR) {
    items = complexPaginatorStart(currentPageNumber, numberOfPages, path, queryString)
  } else if (type === COMPLEX_MIDDLE_PAGINATOR) {
    items = complexPaginatorMiddle(currentPageNumber, numberOfPages, path, queryString)
  } else if (type === COMPLEX_END_PAGINATOR) {
    items = complexPaginatorEnd(currentPageNumber, numberOfPages, path, queryString)
  } else {
    items = simplePaginator(currentPageNumber, numberOfPages, path, queryString)
  }

  return items
}

/**
 * Creates pagination items for when we're on one of the first 4 pages
 *
 * Shows pages 1-5, then ellipsis, then the last page.
 * Example: `[1] 2 3 4 5 ... 42`
 *
 * @param {number} currentPageNumber - the currently selected page number
 * @param {number} numberOfPages - the total number of pages available
 * @param {string} path - the base URL path for pagination links
 * @param {string} queryString - any additional query parameters to append to links
 *
 * @returns {array} array of 7 page items and ellipses
 */
const complexPaginatorStart = (currentPageNumber, numberOfPages, path, queryString) => {
  return [
    item(1, currentPageNumber, path, queryString),
    item(2, currentPageNumber, path, queryString),
    item(3, currentPageNumber, path, queryString),
    item(4, currentPageNumber, path, queryString),
    item(5, currentPageNumber, path, queryString),
    { ellipsis: true },
    item(numberOfPages, currentPageNumber, path, queryString)
  ]
}

/**
 * Converts query arguments object into a URL query string with leading '&'
 *
 * @param {object} queryArgs - object containing query parameters (e.g. { search: 'test', status: 'active' })
 *
 * @returns {string} formatted query string with leading '&' (e.g. '&search=test&status=active'), or empty string if no args
 */
const buildQueryString = (queryArgs) => {
  const params = new URLSearchParams(queryArgs)
  const queryParamsString = params.toString()

  // Return with '&' prefix if there are params, or empty string if none
  return queryParamsString ? `&${queryParamsString}` : ''
}

/**
 * Creates pagination items for when we have 7 or fewer pages
 *
 * Shows all page numbers from 1 to numberOfPages.
 * Example: `[1] 2 3 4 5 6 7`
 *
 * @param {number} currentPageNumber - the currently selected page number
 * @param {number} numberOfPages - the total number of pages available
 * @param {string} path - the base URL path for pagination links
 * @param {string} queryString - any additional query parameters to append to links
 *
 * @returns {array} array of page items with no ellipses
 */
const simplePaginator = (currentPageNumber, numberOfPages, path, queryString) => {
  const items = []

  // Add an item for each page number
  for (let i = 1; i <= numberOfPages; i++) {
    items.push(item(i, currentPageNumber, path, queryString))
  }

  return items
}

/**
 * Creates pagination items for when we're in the middle pages (roughly in the middle of the range)
 *
 * Shows first page, ellipsis, current page with page before and after, ellipsis, then last page.
 * Example: `1 ... 4 [5] 6 ... 42`
 *
 * @param {number} currentPageNumber - the currently selected page number
 * @param {number} numberOfPages - the total number of pages available
 * @param {string} path - the base URL path for pagination links
 * @param {string} queryString - any additional query parameters to append to links
 *
 * @returns {array} array of 7 page items and ellipses
 */
const complexPaginatorMiddle = (currentPageNumber, numberOfPages, path, queryString) => {
  return [
    item(1, currentPageNumber, path, queryString),
    { ellipsis: true },
    item(currentPageNumber - 1, currentPageNumber, path, queryString),
    item(currentPageNumber, currentPageNumber, path, queryString),
    item(currentPageNumber + 1, currentPageNumber, path, queryString),
    { ellipsis: true },
    item(numberOfPages, currentPageNumber, path, queryString)
  ]
}

/**
 * Creates pagination items for when we're on one of the last 4 pages
 *
 * Shows first page, ellipsis, then pages (numberOfPages - 4) through numberOfPages.
 * Example: `1 ... 38 39 [40] 41 42`
 *
 * @param {number} currentPageNumber - the currently selected page number
 * @param {number} numberOfPages - the total number of pages available
 * @param {string} path - the base URL path for pagination links
 * @param {string} queryString - any additional query parameters to append to links
 *
 * @returns {array} array of 7 page items and ellipses
 */
const complexPaginatorEnd = (currentPageNumber, numberOfPages, path, queryString) => {
  return [
    item(1, currentPageNumber, path, queryString),
    { ellipsis: true },
    item(numberOfPages - 4, currentPageNumber, path, queryString),
    item(numberOfPages - 3, currentPageNumber, path, queryString),
    item(numberOfPages - 2, currentPageNumber, path, queryString),
    item(numberOfPages - 1, currentPageNumber, path, queryString),
    item(numberOfPages, currentPageNumber, path, queryString)
  ]
}

/**
 * Determines which pagination layout type to use based on current position and page count
 *
 * - Returns 'simple' if 7 or fewer pages (show all pages, no ellipses)
 * - Returns 'start' if on one of the first 4 pages (show pages 1-5 and last page)
 * - Returns 'end' if on one of the last 4 pages (show first page and pages from numberOfPages-4 to end)
 * - Returns 'middle' for all other cases (show first, current with neighbors, and last page)
 *
 * @param {number} currentPageNumber - the currently selected page number
 * @param {number} numberOfPages - the total number of pages available
 *
 * @returns {string} one of: 'simple', 'start', 'middle', or 'end'
 */
const paginatorType = (currentPageNumber, numberOfPages) => {
  // If 7 or fewer pages, show all of them without ellipses
  if (numberOfPages <= 7) {
    return SIMPLE_PAGINATOR
  }

  // If in the first 4 pages, use 'start' layout
  if (currentPageNumber <= 4) {
    return COMPLEX_START_PAGINATOR
  }

  // If in the last 4 pages, use 'end' layout
  if (currentPageNumber >= numberOfPages - 3) {
    return COMPLEX_END_PAGINATOR
  }

  // Otherwise, we're in the middle pages
  return COMPLEX_MIDDLE_PAGINATOR
}

/**
 * Creates a single page item object for the pagination component
 *
 * @param {number} pageNumber - the page number this item represents
 * @param {number} currentPageNumber - the currently selected page number
 * @param {string} path - the base URL path for the link
 * @param {string} queryString - any additional query parameters to append to the link
 *
 * @returns {object} page item object with number, href, and current flag
 */
const item = (pageNumber, currentPageNumber, path, queryString) => {
  return {
    number: pageNumber.toString(),
    href: `${path}?page=${pageNumber}${queryString}`,
    current: pageNumber === currentPageNumber
  }
}

/**
 * Returns a human-readable pagination summary string
 *
 * Examples:
 * - "Showing 1 to 20 of 78 results" (when showing first page)
 * - "Showing 61 to 78 of 78 results" (when showing last page with fewer items)
 * - "Showing all 15 results" (when everything fits on one page)
 *
 * This text is typically used as the caption for the table displaying the records.
 *
 * @param {number} paginationTotal - the total number of records across all pages
 * @param {number} currentAmount - the number of items shown on the current page
 * @param {string} message - a label to append (e.g. "results", "businesses", "communications")
 * @param {number} currentPageNumber - the currently selected page number
 *
 * @returns {string} human-readable pagination summary
 */
const showingXofY = (paginationTotal, currentAmount, message, currentPageNumber) => {
  // If there's more than one page, show the range
  if (paginationTotal > PAGE_SIZE) {
    const startItem = ((currentPageNumber - 1) * PAGE_SIZE) + 1
    const endItem = startItem + currentAmount - 1

    return `Showing ${startItem} to ${endItem} of ${paginationTotal} ${message}`
  }

  // Otherwise everything fits on one page, so show all
  return `Showing all ${paginationTotal} ${message}`
}

/**
 * Calculates the start and end item numbers for the current page
 *
 * Used to determine which items (by number) are being displayed on the current page.
 * Example: If page 2 is selected and PAGE_SIZE is 20, startItem would be 21.
 *
 * @param {number} paginationTotal - the total number of records across all pages
 * @param {number} currentAmount - the number of items shown on the current page
 * @param {number} currentPageNumber - the currently selected page number
 *
 * @returns {object} object with startItem, endItem, and paginationTotal for display
 */
const showingRange = (paginationTotal, currentAmount, currentPageNumber) => {
  // If there are no records, return all zeros
  if (paginationTotal === 0) {
    return {
      startItem: 0,
      endItem: 0,
      paginationTotal: 0
    }
  }

  // Calculate which items are shown on this page
  const startItem = ((currentPageNumber - 1) * PAGE_SIZE) + 1
  const endItem = startItem + currentAmount - 1

  return {
    startItem,
    endItem,
    paginationTotal
  }
}

export {
  paginationPresenter
}
