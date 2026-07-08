export const featureToggleConfig = {
  featureToggle: {
    useDalTestEmail: {
      doc: 'Enables the DAL test email feature',
      format: Boolean,
      default: false,
      env: 'USE_DAL_TEST_EMAIL'
    },
    personalDetailsInterrupterEnabled: {
      doc: 'Enables the personal details interrupter journey',
      format: Boolean,
      default: false,
      env: 'PERSONAL_DETAILS_INTERRUPTER_ENABLED'
    },
    businessDetailsInterrupterEnabled: {
      doc: 'Enables the business details interrupter journey',
      format: Boolean,
      default: false,
      env: 'BUSINESS_DETAILS_INTERRUPTER_ENABLED'
    }
  }
}
