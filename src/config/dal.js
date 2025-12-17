export const dalConfig = {
  dalConfig: {
    endpoint: {
      doc: 'API endpoint to retrieve data from the data access layer (DAL)',
      format: String,
      default: null,
      env: 'DAL_ENDPOINT'
    },
    tenantId: {
      doc: 'Unique ID of the Azure Active Directory the application uses to sign in and get tokens',
      format: String,
      default: null,
      env: 'DAL_TENANT_ID'
    },
    tokenEndpoint: {
      doc: 'Token endpoint for retrieving an identity and authentication token for the Data Access Layer.',
      format: String,
      default: null,
      env: 'DAL_TOKEN_ENDPOINT'
    },
    clientId: {
      doc: 'Client ID for authenticating with the DAL',
      format: String,
      default: null,
      env: 'DAL_CLIENT_ID'
    },
    clientSecret: {
      doc: 'Client secret for authentication with the DAL',
      format: String,
      default: null,
      env: 'DAL_CLIENT_SECRET',
      sensitive: true
    }
  }
}
