export const entraConfig = {
  entra: {
    wellKnownUrl: {
      doc: 'The Entra well known URL.',
      format: String,
      nullable: true,
      default: null,
      env: 'ENTRA_WELL_KNOWN_URL'
    },
    clientId: {
      doc: 'The Entra client ID.',
      format: String,
      nullable: true,
      default: null,
      env: 'ENTRA_CLIENT_ID'
    },
    clientSecret: {
      doc: 'The Entra client secret.',
      format: String,
      nullable: true,
      default: null,
      env: 'ENTRA_CLIENT_SECRET'
    },
    redirectUrl: {
      doc: 'The Entra redirect URl.',
      format: String,
      nullable: true,
      default: null,
      env: 'ENTRA_REDIRECT_URL'
    },
    signOutRedirectUrl: {
      doc: 'The Entra sign out redirect URl.',
      format: String,
      nullable: true,
      default: null,
      env: 'ENTRA_SIGN_OUT_REDIRECT_URL'
    },
    refreshTokens: {
      doc: 'True if Entra refresh tokens are enabled.',
      format: Boolean,
      default: true,
      env: 'ENTRA_REFRESH_TOKENS'
    }
  }
}
