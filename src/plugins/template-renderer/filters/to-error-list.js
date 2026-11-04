/**
 * Converts validation errors into a list for the GOV.UK error summary
 *
 * @module toErrorList
 */

/**
 * Converts validation errors into a list for the GOV.UK error summary
 *
 * Errors with duplicate text are only included once. Each item links to the field it relates to.
 *
 * @param {object} [errors] - The validation errors, keyed by field name, each with a `text` property
 *
 * @returns {{text: string, href: string}[]} The error summary items
 */
export const toErrorList = (errors) => {
  if (!errors) {
    return []
  }

  const uniqueFields = new Set()

  return Object.entries(errors)
    .reduce((acc, [field, error]) => {
      if (!uniqueFields.has(error.text)) {
        uniqueFields.add(error.text)
        acc.push({
          text: error.text,
          href: `#${field}`
        })
      }
      return acc
    }, [])
}
