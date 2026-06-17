export const featureToggleConfig = {
  featureToggle: {
    useDalTestEmail: {
      doc: 'Enables the DAL test email feature',
      format: Boolean,
      default: false,
      env: 'USE_DAL_TEST_EMAIL'
    }
  }
}
