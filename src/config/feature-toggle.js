export const featureToggleConfig = {
  featureToggle: {
    dalConnection: {
      doc: 'Turns the dal connector on or off as source of crown-host data',
      format: Boolean,
      default: false,
      env: 'DAL_CONNECTION'
    }
  }
}
