import Joi from 'joi'
import { VAT_NUMBER_MAX } from '../../constants/validation-fields.js'

export const businessVatSchema = Joi.object({
  vatNumber: Joi.string()
    .messages({
      'string.max': `VAT registration number must be ${VAT_NUMBER_MAX} characters or fewer`,
      'string.empty': 'Enter a VAT registration number',
      'string.vat': 'Enter a VAT registration number in the format GB123456789 or 123456789'
    })
    .required()
})
