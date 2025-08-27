import Joi from 'joi'
import { BUSINESS_NAME_MAX } from '../../constants/validation-fields.js'

export const businessNameSchema = Joi.object({
  businessName: Joi.string()
    .required()
    .max(BUSINESS_NAME_MAX)
    .messages({
      'string.empty': 'Enter business name',
      'string.max': `Business name must be ${BUSINESS_NAME_MAX} characters or less`,
      'any.required': 'Enter business name'
    })
})
