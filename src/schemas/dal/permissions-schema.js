import Joi from 'joi'

export const rawPermissionsSchema = Joi.object({
  business: Joi.object({
    customer: Joi.object({
      permissionGroups: Joi.array().items({
        id: Joi.string().required(),
        level: Joi.string().required()
      })
    }),
    info: Joi.object({
      name: Joi.string().required()
    })
  }).required()
})
