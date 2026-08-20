export const BUSINESS_LEGAL_STATUS = {
  charitableIncorporatedOrganisation: {
    text: 'Charitable incorporated organisation (CIO)',
    code: '102101'
  },
  charitableTrust: {
    text: 'Charitable trust',
    code: '102113'
  },
  communityInterestCompany: {
    text: 'Community interest company (CIC)',
    code: '102102'
  },
  governmentCentral: {
    text: 'Government (central)',
    code: '102103'
  },
  governmentLocal: {
    text: 'Government (local)',
    code: '102104'
  },
  limitedLiabilityPartnership: {
    text: 'Limited liability partnership (LLP)',
    code: '102105'
  },
  limitedPartnership: {
    text: 'Limited partnership',
    code: '102106'
  },
  nonUkCompany: {
    text: 'Non-UK company',
    code: '102107'
  },
  partnership: {
    text: 'Partnership',
    code: '102108'
  },
  privateLimitedCompany: {
    text: 'Private limited company (Ltd)',
    code: '102109'
  },
  publicLimitedCompany: {
    text: 'Public limited company (PLC)',
    code: '102110'
  },
  soleProprietorship: {
    text: 'Sole proprietorship',
    code: '102111'
  },
  crown: {
    text: 'The Crown',
    code: '102112'
  },
  unlimitedCompany: {
    text: 'Unlimited company (Ultd)',
    code: '102114'
  },
}

// Derived from BUSINESS_LEGAL_STATUS so the codes can't drift out of sync
export const BUSINESS_LEGAL_STATUS_CODES = Object.values(BUSINESS_LEGAL_STATUS).map(({ code }) => code)
