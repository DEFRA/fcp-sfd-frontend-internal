import Joi from 'joi'

const VALID_VALUES = ['sbi', 'crn']
const ERROR_MESSAGE = 'Select what you want to search by'

export const searchCriteriaSchema = Joi.object({
  searchCriteria: Joi.string()
    .required()
    .valid(...VALID_VALUES)
    .messages({
      'any.required': ERROR_MESSAGE,
      'any.only': ERROR_MESSAGE,
      'string.empty': ERROR_MESSAGE
    })
})
