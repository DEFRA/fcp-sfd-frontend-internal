import { fetchBusinessChangeService } from '../../services/business/fetch-business-change-service.js'
import { updateBusinessNameChangeService } from '../../services/business/update-business-name-change-service.js'
import { businessNameCheckPresenter } from '../../presenters/business/business-name-check-presenter.js'
import { validateSbi } from '../pre-handlers.js'

const getBusinessNameCheck = {
  method: 'GET',
  path: '/business/{sbi}/business-name-check',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth, info } = request
    const { sbi } = params
    const email = auth.credentials?.email

    const businessNameChange = await fetchBusinessChangeService(yar, sbi, email, 'changeBusinessName')
    const pageData = businessNameCheckPresenter(businessNameChange, info.referrer)

    return h.view('business/business-name-check', pageData)
  }
}

const postBusinessNameCheck = {
  method: 'POST',
  path: '/business/{sbi}/business-name-check',
  options: {
    pre: [validateSbi]
  },
  handler: async (request, h) => {
    const { params, yar, auth } = request
    const { sbi } = params
    const email = auth.credentials?.email

    await updateBusinessNameChangeService(yar, sbi, email)

    return h.redirect(`/business/${sbi}/details`)
  }
}

export const businessNameCheckRoutes = [
  getBusinessNameCheck,
  postBusinessNameCheck
]
