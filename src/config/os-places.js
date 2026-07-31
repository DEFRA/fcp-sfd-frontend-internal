export const osPlacesConfig = {
  osPlacesConfig: {
    clientId: {
      doc: 'Client ID for authenticating with OS Places',
      format: String,
      default: null,
      nullable: true,
      env: 'OS_PLACES_CLIENT_ID'
    },
    osPlacesStub: {
      doc: 'Use the OS Places Stub',
      format: Boolean,
      default: false,
      env: 'OS_PLACES_STUB'
    }
  }
}
