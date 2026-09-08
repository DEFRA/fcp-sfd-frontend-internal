import { utils, schemas, constants } from '@defra/fcp-sfd-frontend-engine'
import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { businessAddressEnterPresenter } from '../../presenters/business/business-address-enter-presenter.js'
import { setSessionData } from '../../utils/session/set-session-data.js'
import { validateSbi } from '../pre-handlers.js'

const getBusinessAddressEnter = {
  method: 'GET',
  path: '/business/{sbi}/business-address-enter',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { yar, auth, params } = request
    const { sbi } = params
    const email = auth.credentials?.email

    const businessDetails = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessAddress')
    const pageData = businessAddressEnterPresenter(businessDetails)

    return h.view('business/business-address-enter', pageData)
  }
}

const postBusinessAddressEnter = {
  method: 'POST',
  path: '/business/{sbi}/business-address-enter',
  options: {
    pre: [validateSbi],
    validate: {
      payload: schemas.business.details.address,
      options: { abortEarly: false },
      failAction: async (request, h, err) => {
        const { yar, auth, payload, params } = request
        const { sbi } = params
        const email = auth.credentials?.email

        const errors = utils.formatValidationErrors(err.details || [])
        const businessDetails = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessAddress')
        const pageData = businessAddressEnterPresenter(businessDetails, payload)

        return h.view('business/business-address-enter', { ...pageData, errors }).code(constants.statusCodes.BAD_REQUEST).takeover()
      }
    }
  },
  handler: (request, h) => {
    const { params, yar, payload } = request
    const { sbi } = params

    setSessionData(yar, 'businessDetailsUpdate', 'changeBusinessAddress', payload)

    return h.redirect(`/business/${sbi}/business-address-check`)
  }
}

export const businessAddressEnterRoutes = [
  getBusinessAddressEnter,
  postBusinessAddressEnter
]
