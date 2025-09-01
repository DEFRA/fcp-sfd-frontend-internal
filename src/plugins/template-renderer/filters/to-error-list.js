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
