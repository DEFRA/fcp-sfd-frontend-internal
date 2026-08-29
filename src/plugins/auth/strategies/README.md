# Authentication Strategies

This directory contains two authentication strategies for authenticating users in the SFD Frontend Internal application:

1. **client-secret.js** - Legacy OAuth 2.0 with client credentials
2. **federated-credentials.js** - Modern OIDC with AWS workload identity

## Quick Comparison

| Aspect | Client Secret | Federated Credentials |
|--------|---------------|-----------------------|
| **Provider** | @hapi/bell | @defra/hapi-auth-oidc |
| **Credentials** | Client ID + Secret | AWS workload identity token |
| **Token Type** | Long-lived, stored in app | Short-lived, validated per-request |
| **Security** | Secret must be managed & rotated | No secrets stored, cryptographic validation |
| **Testing** | Requires mock OIDC endpoints | MockProvider available |
| **Discovery** | Manual configuration | Automatic via OIDC discovery |

## Client Secret Strategy (`client-secret.js`)

Traditional OAuth 2.0 authentication flow using client credentials.

### How It Works

1. User visits /auth/sign-in
2. Redirected to Entra login page (via @hapi/bell)
3. After login, Entra redirects back with authorization code
4. App exchanges code for access token using client secret
5. Token stored in session cache + cookie
6. On each request, token is validated and refreshed if expired

### Key Files
- `src/plugins/auth/strategies/client-secret.js` - Strategy registration
- `src/routes/auth/client-secret-routes.js` - Routes (/auth/sign-in, /auth/sign-in-oidc, etc.)

### Environment Variables
```
ENTRA_CLIENT_ID=<your-client-id>
ENTRA_CLIENT_SECRET=<your-client-secret>
ENTRA_REDIRECT_URL=https://app.example.com/auth/sign-in-oidc
ENTRA_WELL_KNOWN_URL=https://login.microsoftonline.com/<tenant>/.well-known/openid-configuration
```

## Federated Credentials Strategy (`federated-credentials.js`)

Modern OIDC authentication using AWS workload identity tokens.

### How It Works

1. User visits /auth/sign-in
2. @defra/hapi-auth-oidc plugin calls `request.login(h)` to redirect to Entra
3. After login, Entra redirects to /auth/callback
4. App fetches AWS workload identity token (no secrets involved)
5. Entra validates the token cryptographically
6. Token exchanged for access token
7. Token stored in session cache, validated on each request
8. Plugin automatically handles token refresh

### Key Files
- `src/plugins/auth/strategies/federated-credentials.js` - Strategy registration
- `src/routes/auth/federated-routes.js` - Routes (/auth/sign-in, /auth/callback, /auth/sign-out, /auth/sign-out-oidc)

### Environment Variables
```
ENTRA_CLIENT_ID=<your-client-id>
ENTRA_WELL_KNOWN_URL=https://login.microsoftonline.com/<tenant>/.well-known/openid-configuration
ENTRA_REDIRECT_URL=https://app.example.com
ENTRA_FEDERATED_AUDIENCE=sts.amazonaws.com
ENTRA_FEDERATED_MOCK=false (true for local development)
```

## Key Differences

### Routes
- **Client Secret**: `/auth/sign-in`, `/auth/sign-in-oidc`, `/auth/sign-out`, `/auth/sign-out-oidc`
- **Federated**: `/auth/sign-in`, `/auth/callback`, `/auth/sign-out`, `/auth/sign-out-oidc`

The key difference is that federated uses `/auth/callback` (handled by the plugin) instead of `/auth/sign-in-oidc` (manual handling).

### Token Refresh
- **Client Secret**: Manually via `refreshTokens()` in validateToken function
- **Federated**: Automatic via `request.ensureValidToken()` provided by the plugin

### Session Management
Both strategies maintain the same session structure for backwards compatibility:
```javascript
{
  isAuthenticated: true,
  sessionId: 'user-session-id',
  email: 'user@example.com',
  roles: ['role1', 'role2'],
  token: 'access-token',
  refreshToken: 'refresh-token'
}
```

## Switching Between Strategies

Use the feature toggle in your environment:

```
USE_FEDERATED_CREDENTIALS=false  // Uses client-secret strategy
USE_FEDERATED_CREDENTIALS=true   // Uses federated-credentials strategy
```

The switch happens automatically in:
- `src/plugins/auth/index.js` - Selects which strategy to register
- `src/routes/auth/index.js` - Selects which routes to use

## Security Considerations

### Client Secret
- ⚠️ Secrets must be securely stored and rotated
- ⚠️ Long-lived tokens increase attack surface if exposed
- ✓ Works in any environment without dependencies

### Federated Credentials
- ✓ No secrets to store or rotate
- ✓ Short-lived tokens reduce exposure window
- ✓ Cryptographic validation ensures only authorized services can obtain tokens
- ⚠️ Requires AWS workload identity configuration (CDP platform)
- ⚠️ Audience value must match Entra federated credential configuration

## Related Documentation

- [FEDERATED_CREDENTIALS.md](../../FEDERATED_CREDENTIALS.md) - Complete implementation guide
- [src/plugins/auth/](../auth/) - Auth plugin documentation
- [src/routes/auth/](../../routes/auth/) - Auth routes documentation
