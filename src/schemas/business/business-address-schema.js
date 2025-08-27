import Joi from 'joi'
import {
  ADDRESS_LINE_MAX,
  TOWN_CITY_MAX,
  COUNTY_MAX,
  POSTCODE_MAX,
  COUNTRY_MAX
} from '../../constants/validation-fields.js'

export const businessAddressSchema = Joi.object({
  address1: Joi.string()
    .required()
    .max(ADDRESS_LINE_MAX)
    .messages({
      'string.empty': 'Enter address line 1, typically the building and street',
      'string.max': `Address line 1 must be ${ADDRESS_LINE_MAX} characters or less`,
      'any.required': 'Enter address line 1, typically the building and street'
    }),
  address2: Joi.string()
    .allow('')
    .max(ADDRESS_LINE_MAX)
    .messages({
      'string.max': `Address line 2 must be ${ADDRESS_LINE_MAX} characters or less`
    }),
  city: Joi.string()
    .required()
    .max(TOWN_CITY_MAX)
    .messages({
      'string.empty': 'Enter town or city',
      'string.max': `Town or city must be ${TOWN_CITY_MAX} characters or less`,
      'any.required': 'Enter town or city'
    }),
  county: Joi.string()
    .allow('')
    .max(COUNTY_MAX)
    .messages({
      'string.max': `County must be ${COUNTY_MAX} characters or less`
    }),
  postcode: Joi.string()
    .allow('')
    .max(POSTCODE_MAX)
    .messages({
      'string.max': `Postal code or zip code must be ${POSTCODE_MAX} characters or less`
    }),
  country: Joi.string()
    .required()
    .max(COUNTRY_MAX)
    .messages({
      'string.empty': 'Enter a country',
      'string.max': `Country must be ${COUNTRY_MAX} characters or less`,
      'any.required': 'Enter a country'
    })
})
