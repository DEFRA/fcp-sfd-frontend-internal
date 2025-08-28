import Joi from 'joi'

export const phoneSchema = Joi.object({
  landline: Joi.string().allow(null),
  mobile: Joi.string().allow(null)
})
