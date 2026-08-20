// The business legal status can only be updated by an internal user, hence this
// schema living in the internal repo rather than the engine
import Joi from 'joi'
import { BUSINESS_LEGAL_STATUS_CODES } from '../constants/business-legal-status.js'

export const businessLegalStatusSchema = Joi.object({
  // Restricting to our own known codes means an invalid/tampered value is treated the same as no selection
  businessLegalStatus: Joi.string()
    .valid(...BUSINESS_LEGAL_STATUS_CODES)
    .required()
    .messages({
      'string.empty': 'Select a legal status',
      'any.required': 'Select a legal status',
      'any.only': 'Select a legal status'
    })
})
