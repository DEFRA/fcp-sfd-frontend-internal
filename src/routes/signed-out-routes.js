import { signedOutPresenter } from '../presenters/signed-out-presenter.js'

export const signedOut = {
  method: 'GET',
  path: '/signed-out',
  options: { auth: false },
  handler: (_request, h) => {
    return h.view('signed-out', signedOutPresenter())
  }
}
