/**
 * Generic multi-schema validation service.
 *
 * - Maps nested details into a flat structure
 * - Validates multiple Joi schemas independently
 * - Collects all validation errors
 * - Maps errors to form sections
 */
const validateDetailsService = (schemasToValidate, mappedDetails) => {
  const errors = []

  for (const schema of schemasToValidate) {
    const result = schema.validate(mappedDetails, {
      abortEarly: false,
      allowUnknown: true
    })

    if (result.error) {
      errors.push(...result.error.details)
    }
  }

  if (errors.length === 0) {
    return {
      isValid: true,
      sectionsNeedingUpdate: []
    }
  }

  return {
    isValid: false,
    sectionsNeedingUpdate: mapErrorsToSections(errors)
  }
}

/**
 * Turns validation errors into a list of form sections with problems.
 *
 * If multiple errors relate to the same field, the field is only
 * returned once.
 */
const mapErrorsToSections = (errorDetails) => {
  const errorFieldToSectionMap = {
    // Personal details fields
    first: 'name',
    last: 'name',
    middle: 'name',
    day: 'dob',
    month: 'dob',
    year: 'dob',
    personalEmail: 'email',
    personalTelephone: 'phone',
    personalMobile: 'phone',
    // Business details fields
    vatNumber: 'vat',
    businessName: 'name',
    businessEmail: 'email',
    businessTelephone: 'phone',
    businessMobile: 'phone',
    // Address
    address1: 'address',
    address2: 'address',
    address3: 'address',
    city: 'address',
    county: 'address',
    postcode: 'address',
    country: 'address'
  }

  // Create a set to store unique error paths
  const sections = new Set()

  for (const { path, type } of errorDetails) {
    const fieldName = path[0]

    if (errorFieldToSectionMap[fieldName]) {
      sections.add(errorFieldToSectionMap[fieldName])
    }

    // Flat-schema phone rule: neither telephone nor mobile provided
    if (path.length === 0 && type === 'object.missing') {
      sections.add('phone')
    }
  }

  // Convert the set of unique fields into an array
  return Array.from(sections)
}

export {
  validateDetailsService
}
