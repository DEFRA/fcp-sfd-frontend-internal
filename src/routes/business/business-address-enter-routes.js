import { utils, schemas, constants } from '@defra/fcp-sfd-frontend-engine'
import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { businessAddressEnterPresenter } from '../../presenters/business/business-address-enter-presenter.js'
import { setSessionData } from '../../utils/session/set-session-data.js'

const getBusinessAddressEnter = {
  method: 'GET',
  path: '/business/{sbi}/business-address-enter',
  handler: async (request, h) => {
    const { yar, auth, params, info } = request
    const { sbi } = params

    const { error } = schemas.business.sbi.validate({ sbi })

    if (error) {
      return h.redirect('/search-sbi')
    }

    const email = auth.credentials?.email

    const businessDetails = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessAddress')
    const pageData = businessAddressEnterPresenter(businessDetails, undefined, info.referrer)

    return h.view('business/business-address-enter', pageData)
  }
}

const postBusinessAddressEnter = {
  method: 'POST',
  path: '/business/{sbi}/business-address-enter',
  options: {
    validate: {
      payload: schemas.business.address,
      options: { abortEarly: false },
      failAction: async (request, h, err) => {
        const { params, yar, auth, payload, info } = request
        const { sbi } = params

        const email = auth.credentials?.email
        const errors = utils.formatValidationErrors(err.details || [])
        const businessDetails = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessAddress')
        const pageData = businessAddressEnterPresenter(businessDetails, payload, info.referrer)

        return h.view('business/business-address-enter', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    },
    handler: (request, h) => {
      const { params, yar, payload } = request
      const { sbi } = params

      setSessionData(yar, 'businessDetailsUpdate', 'changeBusinessAddress', payload)

      return h.redirect(`/business/${sbi}/business-address-check`)
    }
  }
}

export const businessAddressEnterRoutes = [
  getBusinessAddressEnter,
  postBusinessAddressEnter
]

