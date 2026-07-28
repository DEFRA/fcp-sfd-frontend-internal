import { resolveBackLink } from '../base-presenter.js'

const businessNameChangePresenter = (data, payload, referrer) => {
  const fallbackHref = data.info?.sbi ? `/business/${data.info.sbi}/details` : '/search-sbi'

  return {
    backLink: {
      backLink: true,
      href: resolveBackLink(referrer, fallbackHref)
    },
    pageTitle: 'What is your business name?',
    metaDescription: 'Update the name for your business.',
    changeBusinessName: payload ?? data.changeBusinessName ?? data.info.businessName,
    businessName: data.info.businessName ?? null,
    sbi: data.info.sbi ?? null,
    userName: data.customer?.userName ?? null
  }
}

export { businessNameChangePresenter }
