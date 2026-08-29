# Federated Credentials Authentication

This document provides a comprehensive guide to the federated credentials authentication feature in the SFD Frontend Internal application.

## Overview

The SFD Frontend Internal is transitioning from traditional OAuth 2.0 client secret authentication to modern federated credentials authentication using AWS workload identity. This enables secure, secret-free authentication with Microsoft Entra ID (Azure AD).

### Why Federated Credentials?

**Problems with Client Secrets:**
- Secrets must be securely stored, managed, and rotated
- Long-lived credentials increase risk if accidentally exposed
- Manual secret management becomes complex as services increase

**Benefits of Federated Credentials:**
- Removes need to manage long-lived client secrets
- Uses short-lived, cryptographically signed tokens
- Provides stronger verification of application identity
- Reduces operational overhead
- Foundation for future federated authentication flows

## Architecture

### Legacy Flow (Client Secret)

```
User → SFD Frontend → (Client ID + Secret) → Entra → Access Token → Cached in App
                                              ↓
                                        Token stored,
                                        manual refresh
```

### Modern Flow (Federated Credentials)

```
User → SFD Frontend → AWS Workload Identity → Token → Entra → Access Token → Cached in App
                                                       ↓
                                                  Cryptographic
                                                  validation
```

## Environment Configuration

### Client Secret (Legacy - Default)

```bash
# Required
ENTRA_CLIENT_ID=<application-client-id>
ENTRA_CLIENT_SECRET=<application-client-secret>
ENTRA_REDIRECT_URL=https://app.example.com/auth/sign-in-oidc
ENTRA_WELL_KNOWN_URL=https://login.microsoftonline.com/<tenant-id>/.well-known/openid-configuration

# Optional
ENTRA_SIGN_OUT_REDIRECT_URL=https://app.example.com/signed-out
ENTRA_REFRESH_TOKENS=true

# Feature toggle (default: false uses client-secret)
USE_FEDERATED_CREDENTIALS=false
```

### Federated Credentials (Modern)

```bash
# Required
ENTRA_CLIENT_ID=<application-client-id>
ENTRA_WELL_KNOWN_URL=https://login.microsoftonline.com/<tenant-id>/.well-known/openid-configuration
ENTRA_REDIRECT_URL=https://app.example.com
ENTRA_FEDERATED_AUDIENCE=sts.amazonaws.com

# Optional
ENTRA_SIGN_OUT_REDIRECT_URL=https://app.example.com/signed-out

# Local development (mocking)
ENTRA_FEDERATED_MOCK=true

# Feature toggle
USE_FEDERATED_CREDENTIALS=true
```

## Implementation Details

### File Structure

```
src/
├── plugins/auth/
│   ├── index.js                          # Plugin registration (switches strategies)
│   ├── get-cookie-options.js             # Shared session cookie config
│   └── strategies/
│       ├── README.md                     # Strategy documentation
│       ├── client-secret.js              # Legacy OAuth 2.0 strategy
│       └── federated-credentials.js      # Modern OIDC strategy (hapi-auth-oidc)
│
├── routes/auth/
│   ├── index.js                          # Route export (switches based on toggle)
│   ├── client-secret-routes.js           # Legacy routes
│   └── federated-routes.js               # Modern routes
│
└── config/
    ├── entra.js                          # Entra configuration schema
    └── feature-toggle.js                 # Feature toggle definitions
```

### Key Concepts

#### Session Management

Both strategies maintain identical session structure:

```javascript
{
  isAuthenticated: true,
  sessionId: 'user-session-id',           // From JWT sid claim
  email: 'user@example.com',
  loginHint: 'user@example.com',
  roles: ['role1', 'role2'],              // From JWT roles claim
  scope: ['role1', 'role2'],              // Array of roles
  token: 'access-token',
  refreshToken: 'refresh-token'
}
```

#### Feature Toggle Behavior

The `USE_FEDERATED_CREDENTIALS` environment variable controls which strategy is used:

- **false (default)**: Uses `client-secret.js` strategy with traditional OAuth 2.0 flow
- **true**: Uses `federated-credentials.js` strategy with modern OIDC + AWS workload identity

This toggle is checked during server startup in `src/plugins/auth/index.js` and `src/routes/auth/index.js`.

#### Authentication Routes

**Client Secret Strategy Routes:**
- `GET /auth/sign-in` - Initiates login (redirects to Entra)
- `GET /auth/sign-in-oidc` - Entra callback, creates session
- `GET /auth/sign-out` - Initiates logout (redirects to Entra)
- `GET /auth/sign-out-oidc` - Entra logout callback, clears session

**Federated Credentials Strategy Routes:**
- `GET /auth/sign-in` - Initiates login (calls request.login)
- `GET /auth/callback` - Entra callback, creates session (handled by hapi-auth-oidc plugin)
- `GET /auth/sign-out` - Initiates logout
- `GET /auth/sign-out-oidc` - Logout callback, clears session

### Token Validation

#### Client Secret Strategy

Token validation occurs on each request:

```javascript
// src/plugins/auth/strategies/client-secret.js
async function validateToken(request, session) {
  const userSession = await request.server.app.cache.get(session.sessionId)

  try {
    const decoded = Jwt.token.decode(userSession.token)
    Jwt.token.verifyTime(decoded)  // Check if expired
  } catch (err) {
    // Token expired, refresh it
    const { access_token, refresh_token } = await refreshTokens(userSession.refreshToken)
    userSession.token = access_token
    userSession.refreshToken = refresh_token
  }

  return { isValid: true, credentials: userSession }
}
```

#### Federated Credentials Strategy

Token validation also occurs on each request, but refresh is automatic:

```javascript
// src/plugins/auth/strategies/federated-credentials.js
async function validateToken(request, session) {
  const userSession = await request.server.app.cache.get(session.sessionId)

  try {
    // Plugin provides ensureValidToken() - refreshes if needed
    const refreshedToken = await request.ensureValidToken(userSession.token)
    if (refreshedToken !== userSession.token) {
      userSession.token = refreshedToken
      await request.server.app.cache.set(session.sessionId, userSession)
    }
  } catch (err) {
    return { isValid: false }
  }

  return { isValid: true, credentials: userSession }
}
```

## Local Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js >= 24
- npm packages installed

### Without Federated Credentials (Default)

```bash
# Set environment
export USE_FEDERATED_CREDENTIALS=false

# Run tests or development
npm test
npm run dev
docker compose up
```

### With Federated Credentials (Local Testing)

For local development without actual AWS/Entra infrastructure, use the mock provider:

```bash
# Set environment
export USE_FEDERATED_CREDENTIALS=true
export ENTRA_FEDERATED_MOCK=true
export ENTRA_FEDERATED_AUDIENCE=sts.amazonaws.com

# Run tests
npm test

# Or with Docker
docker compose -f compose.yaml -f compose.test.yaml run --build --rm 'fcp-sfd-frontend-internal'
```

The mock provider simulates AWS workload identity tokens without requiring actual CDP platform access.

### Docker Environment Variables

Set these in your `.env` file or pass to Docker:

```bash
# For development
USE_FEDERATED_CREDENTIALS=false

# For testing federated credentials locally
USE_FEDERATED_CREDENTIALS=true
ENTRA_FEDERATED_MOCK=true
ENTRA_FEDERATED_AUDIENCE=sts.amazonaws.com
```

## Testing

### Running All Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Testing Specific Strategies

```bash
# Test client-secret strategy
npx vitest run test/unit/plugins/auth/strategies/client-secret.test.js
npx vitest run test/unit/routes/auth/client-secret-routes.test.js

# Test federated-credentials strategy
npx vitest run test/unit/plugins/auth/strategies/federated-credentials.test.js
npx vitest run test/unit/routes/auth/federated-routes.test.js

# Integration tests
npx vitest run test/integration/narrow/routes/auth-routes-client-secret.test.js
npx vitest run test/integration/narrow/routes/auth-routes-federated.test.js
```

### Test Coverage

Both strategies have comprehensive unit and integration test coverage:

- Strategy registration and configuration
- Token validation and refresh
- Route handlers for each endpoint
- Session creation and management
- Error handling and edge cases

Expected coverage: 90%+ for auth-related code

## Migration Path

### Phase 1: Feature Development (Current)
- ✅ Feature toggle added
- ✅ Federated credentials strategy implemented
- ✅ Tests written for both strategies
- Currently on main branch with toggle defaulting to false

### Phase 2: Testing in Non-Production (Future)
- Enable toggle in dev/staging environments
- Monitor authentication flow
- Verify token refresh works correctly
- Collect logs and metrics

### Phase 3: Gradual Production Rollout (Future)
- Enable toggle gradually (blue-green deployment)
- Monitor metrics and errors
- Support both strategies simultaneously for rollback capability

### Phase 4: Cleanup (Post-Rollout)
- Once fully deployed and stable
- Remove client-secret strategy
- Remove feature toggle
- Remove legacy routes

## Troubleshooting

### "Federated credentials requested but not yet implemented" warning

**Cause:** `USE_FEDERATED_CREDENTIALS=true` but implementation is incomplete

**Solution:**
1. Ensure `src/plugins/auth/strategies/federated-credentials.js` exists
2. Ensure `src/routes/auth/federated-routes.js` exists
3. Check dependencies: `npm install` to get `@defra/hapi-auth-oidc`

### Session validation fails with federated credentials

**Cause:** Token validation is failing in validateToken()

**Debug steps:**
1. Check `ENTRA_FEDERATED_AUDIENCE` is set correctly
2. If using mock: ensure `ENTRA_FEDERATED_MOCK=true`
3. Check logs for JWT decode errors
4. Verify token structure in Entra JWT payload

### "request.login is not a function" error

**Cause:** Trying to use federated routes without the hapi-auth-oidc plugin

**Solution:**
1. Verify `@defra/hapi-auth-oidc` is installed: `npm list @defra/hapi-auth-oidc`
2. Check `src/plugins/auth/strategies/federated-credentials.js` is being registered
3. Ensure plugin registers before routes are loaded

### Authentication always failing with federated credentials

**Cause:** AWS workload identity token not being generated or validated

**Check:**
1. Is `ENTRA_FEDERATED_AUDIENCE` correct? (should be `sts.amazonaws.com`)
2. Are you in CDP environment or using mock? (`ENTRA_FEDERATED_MOCK=true` for local)
3. Check Entra federated credential configuration trusts AWS identity provider
4. Verify token issuer and subject in JWT claims

### Mixed strategy authentication issues

**Cause:** Session from one strategy trying to authenticate with another

**Solution:**
1. Don't mix strategies in same browser session
2. Clear cookies and session cache if switching toggles
3. During migration, maintain backwards compatibility

## Security Considerations

### Client Secret Strategy

- ✓ Industry standard OAuth 2.0 flow
- ⚠️ Secret must be protected: use secure environment variables, rotation policies
- ⚠️ If secret exposed: attacker can obtain tokens without user interaction
- ✓ Tokens are short-lived (typically 1 hour)
- ✓ Refresh tokens are long-lived but stored server-side only

### Federated Credentials Strategy

- ✓ No secrets to expose
- ✓ AWS workload identity is cryptographically validated
- ✓ Tokens are short-lived
- ✓ Only services with valid AWS identity can obtain tokens
- ⚠️ Requires trust relationship configured in Entra
- ⚠️ Audience value must match exactly

### Best Practices for Both

1. **Always use HTTPS** in production (isSecure: true)
2. **Validate tokens** on every request (validateToken function)
3. **Don't log tokens** in application logs
4. **Clear sessions** on logout to avoid token reuse
5. **Rotate secrets** regularly (client secret only)
6. **Monitor authentication failures** for suspicious patterns
7. **Use secure cookie settings** (httpOnly, sameSite)

## Logging and Monitoring

### What Gets Logged

Authentication events are logged through the Hapi server logger:

```javascript
server?.logger?.info('Token validation error: ' + err.message)
server?.logger?.warn('Federated credentials requested but...')
```

### What NOT to Log

Never include these in logs:
- Access tokens or refresh tokens
- User email addresses or other PII
- Full JWT payloads (decoded claims may contain sensitive data)
- Authentication credentials of any kind

### Monitoring Metrics

Track these metrics for both strategies:

- Login success/failure rates
- Token refresh frequency
- Session validation failures
- Invalid token errors
- Authentication latency

## FAQ

**Q: Why do we need this feature?**
A: Federated credentials eliminate the need to manage and rotate long-lived secrets, improving security and operational overhead.

**Q: Can I use federated credentials in production now?**
A: Not yet. It's implemented and tested, but rolled out gradually via feature toggle when ready for production deployment.

**Q: What happens during the transition?**
A: Both strategies can run simultaneously. Users are routed based on the feature toggle. No code changes needed on the frontend.

**Q: Can I switch back to client secrets?**
A: Yes! Set `USE_FEDERATED_CREDENTIALS=false` to use the client secret strategy.

**Q: How do I test federated credentials locally?**
A: Set `ENTRA_FEDERATED_MOCK=true` to use the mock provider instead of real AWS/Entra connections.

**Q: Will this affect existing user sessions?**
A: No. Session structure is identical, so existing sessions remain valid during toggle switch.

**Q: What if federated credentials fails in production?**
A: Set `USE_FEDERATED_CREDENTIALS=false` to immediately revert to client secret authentication.

**Q: Do I need to change any code to support this?**
A: No code changes needed on your side. The app automatically routes through the correct strategy based on the feature toggle.

## Related Documentation

- [src/plugins/auth/strategies/README.md](src/plugins/auth/strategies/README.md) - Strategy comparison and technical details
- [src/plugins/auth/index.js](src/plugins/auth/index.js) - Plugin registration logic
- [src/routes/auth/index.js](src/routes/auth/index.js) - Route selection logic
- [CLAUDE.md](CLAUDE.md) - Project overview and architecture
- GitHub PR #128 - Initial federated credentials implementation
