# Federated Credentials Implementation Guide

This document describes the federated credentials feature that has been added to fcp-sfd-frontend-internal, enabling secure workload identity authentication to Entra ID without long-lived client secrets.

## Overview

This service now supports two authentication methods:

1. **Legacy**: Client Secret (OAuth 2.0) — traditional credential-based auth
2. **Modern**: Federated Credentials (Workload Identity) — short-lived token-based auth

Both methods are fully supported and can be toggled without redeployment via the `USE_FEDERATED_CREDENTIALS` feature toggle.

## Architecture

### Feature Toggle
The feature toggle `USE_FEDERATED_CREDENTIALS` is the single source of truth for which auth method is used:
- `false` (default) → Uses legacy @hapi/bell with client secrets
- `true` → Uses @defra/hapi-auth-oidc with federated credentials

### Legacy Flow (USE_FEDERATED_CREDENTIALS=false)
```
User Browser
    ↓
/auth/sign-in (Bell redirects to Entra)
    ↓
Azure AD Authorization Endpoint
    ↓
User logs in
    ↓
/auth/sign-in-oidc (Bell callback with credentials)
    ↓
Server validates token
    ↓
Session created in cache
    ↓
Cookie set, redirect to /search-sbi
```

### Federated Flow (USE_FEDERATED_CREDENTIALS=true)
```
User Browser
    ↓
/auth/sign-in (request.login(h))
    ↓
hapi-auth-oidc obtains AWS STS token
    ↓
hapi-auth-oidc exchanges token for Entra access token
    ↓
Azure AD Authorization Endpoint
    ↓
User logs in
    ↓
/auth/callback (hapi-auth-oidc callback)
    ↓
Server extracts claims from response
    ↓
Session created in cache
    ↓
Cookie set, redirect to /search-sbi
```

The key difference is that with federated credentials, the token exchange uses AWS STS as an identity broker and passes a short-lived JWT as `client_assertion` instead of a static `client_secret`.

## Configuration

### Environment Variables - Legacy (USE_FEDERATED_CREDENTIALS=false)

Required:
```env
ENTRA_TENANT_ID=<your-tenant-id>
ENTRA_CLIENT_ID=<your-client-id>
ENTRA_CLIENT_SECRET=<your-client-secret>
ENTRA_WELL_KNOWN_URL=<well-known-url>
ENTRA_REDIRECT_URL=https://yourservice/auth/sign-in-oidc
ENTRA_SIGN_OUT_REDIRECT_URL=https://yourservice/signed-out
USE_FEDERATED_CREDENTIALS=false
```

Optional:
```env
ENTRA_REFRESH_TOKENS=true
```

### Environment Variables - Federated (USE_FEDERATED_CREDENTIALS=true)

Required:
```env
ENTRA_TENANT_ID=<your-tenant-id>
ENTRA_CLIENT_ID=<your-client-id>
ENTRA_WELL_KNOWN_URL=<well-known-url>
ENTRA_FEDERATED_AUDIENCE=<audience-matching-federated-credential>
USE_FEDERATED_CREDENTIALS=true
```

Optional (dev only):
```env
ENTRA_FEDERATED_MOCK=true  # Use mock provider instead of AWS STS
ENTRA_OIDC_USE_HTTP=true   # Allow HTTP for OIDC discovery
ENTRA_OIDC_RESPONSE_MODE=query  # Or form_post (default: query for local)
ENTRA_OIDC_CALLBACK_URI=/auth/callback  # Callback path
ENTRA_FEDERATED_TOKEN_DURATION_SECONDS=900  # Token lifetime
```

### Validation

Configuration is validated at startup via convict schema (`src/config/entra.js`). The service will fail fast with clear error messages if:
- `USE_FEDERATED_CREDENTIALS=true` but `ENTRA_FEDERATED_AUDIENCE` is not set
- Required Entra configuration is missing for either mode

## Code Structure

### Key Files

**Feature toggle & wiring:**
- `src/plugins/auth/index.js` - Registers the appropriate auth strategy based on `USE_FEDERATED_CREDENTIALS`
- `src/routes/auth/index.js` - Exposes the appropriate auth routes based on the same toggle
**Configuration:**
- `src/config/entra.js` - Full Entra and federated credential config schema

**Plugin Registration:**
- `src/plugins/auth.js` - Conditionally registers authentication strategies

**Routes:**
- `src/routes/auth-routes.js` - Smart routing for both authentication flows

**Tests:**
- `test/unit/auth/credential-provider-factory.test.js` - Credential provider factory tests
- `test/unit/plugins/auth.test.js` - Auth plugin tests (updated with mocks)

### Backwards Compatibility

✅ **Fully backwards compatible**
- Existing deployments with `USE_FEDERATED_CREDENTIALS=false` work unchanged
- @hapi/bell strategy continues to work
- All session handling is identical
- No breaking changes to public APIs

## Migration Path

### Step 1: Pre-deployment (Current Code)
Deploy this code with `USE_FEDERATED_CREDENTIALS=false` (default). The system uses legacy authentication. Everything works as before.

### Step 2: Configure Federated Credential in Azure
Work with your Azure admin to:
1. Create a federated credential on the Entra Application Registration
2. Configure it with:
   - **Issuer**: `https://a19dfab3-318a-47fa-8133-57c7670003c7.tokens.sts.global.api.aws` (development)
   - **Subject**: `arn:aws:iam::332499610595:role/fcp-sfd-frontend-internal` (dev account + service name)
   - **Audience**: Choose a value (e.g., `sfd-internal`) and remember it

(Use the appropriate issuer/account for your environment from the [CDP documentation](https://portal.cdp-int.defra.cloud/documentation/how-to/federated-credentials/web-identity-app-reg.md#per-environment-values))

### Step 3: Test in Lower Environment
1. Set environment variables in development:
   ```env
   USE_FEDERATED_CREDENTIALS=true
   ENTRA_FEDERATED_AUDIENCE=sfd-internal
   ENTRA_FEDERATED_MOCK=true  # Use mock for local development
   ```

2. Test the authentication flow:
   - Navigate to `/auth/sign-in`
   - Verify mock login completes
   - Verify session is created

### Step 4: Gradual Rollout
1. Test in dev environment without mock
2. Verify logs show `Credential authentication: Using WebIdentityTokenProvider`
3. Move to test environment with real AWS STS token
4. Verify login works end-to-end
5. Gradually promote through remaining environments
6. Keep client secrets in Azure for safety window (rollback capability)

### Step 5: Rollback (if needed)
If issues occur:
1. Set `USE_FEDERATED_CREDENTIALS=false`
2. Redeploy
3. Service immediately falls back to client secret authentication
4. No code changes required

## Local Development

### With Mock Provider (Fastest)
```env
USE_FEDERATED_CREDENTIALS=true
ENTRA_FEDERATED_AUDIENCE=sfd-internal
ENTRA_FEDERATED_MOCK=true
ENTRA_OIDC_USE_HTTP=true
```

### With Real AWS STS (Requires CDP/AWS Access)
```env
USE_FEDERATED_CREDENTIALS=true
ENTRA_FEDERATED_AUDIENCE=sfd-internal
ENTRA_FEDERATED_MOCK=false
ENTRA_OIDC_USE_HTTP=true  # Still needed for local HTTP discovery
```

### Legacy (Always Works)
```env
USE_FEDERATED_CREDENTIALS=false
ENTRA_CLIENT_SECRET=<your-secret>
```

## Testing

### Unit Tests
```bash
npm run test
```

Tests include:
- Credential provider factory selection logic
- Config validation
- Both authentication flows
- Token refresh handling
- Session creation and validation

### Integration Testing
The service can be tested end-to-end with docker-compose:

```bash
# Test with legacy auth (default)
docker compose -f compose.yaml -f compose.test.yaml run --build --rm fcp-sfd-frontend-internal

# Test with federated credentials + mock
USE_FEDERATED_CREDENTIALS=true ENTRA_FEDERATED_AUDIENCE=sfd-internal ENTRA_FEDERATED_MOCK=true docker compose -f compose.yaml -f compose.test.yaml run --build --rm fcp-sfd-frontend-internal
```

## Troubleshooting

### "Federated credentials enabled but ENTRA_FEDERATED_AUDIENCE not configured"
**Cause**: `USE_FEDERATED_CREDENTIALS=true` but `ENTRA_FEDERATED_AUDIENCE` env var is missing
**Fix**: Set the environment variable to match the audience configured in Azure

### "Failed to import WebIdentityTokenProvider from @defra/hapi-auth-oidc"
**Cause**: Package not installed or import error
**Fix**:
- Run `npm install`
- Check package.json has `@defra/hapi-auth-oidc`
- Check node_modules directory is correct

### Login redirects to 401 Unauthorized after OIDC callback
**Cause**: Token validation or claim extraction failed
**Fix**:
- Check logs for detailed error
- Verify Entra configuration matches federated credential setup
- Verify audience matches between code and Azure config
- Check token claims include required fields (oid, name, email)

### Works with mock but not with real AWS STS
**Cause**: Network/proxy issue or AWS STS token malformed
**Fix**:
- Verify NODE_USE_ENV_PROXY is set correctly
- Check AWS STS endpoint is reachable
- Verify IAM role ARN in federated credential matches service role
- Review server logs for token generation errors

### Logs show "Using legacy client secret flow" but I set the feature toggle
**Cause**: Config not reloaded or feature toggle cache issue
**Fix**:
- Check environment variable is actually set: `echo $USE_FEDERATED_CREDENTIALS`
- Restart service/container
- Verify no caching layer is preventing config update

## Monitoring & Logging

### Log Indicators

**Successful legacy start:**
```
Credential authentication: Using legacy client secret flow
```

**Successful federated start with real tokens:**
```
Credential authentication: Using WebIdentityTokenProvider (federated credentials)
```

**Successful federated start with mock:**
```
Credential authentication: Using mock provider (development mode)
```

**Successful authentication (legacy):**
```
[auth routes] User authenticated via @hapi/bell, session: {sessionId}
```

**Successful authentication (federated):**
```
[auth routes] User authenticated via federated credentials, session: {sessionId}
```

### Security Considerations

✅ **No secrets logged**: Federated tokens and client secrets are never logged
✅ **Token validation**: All tokens are validated against issuer public keys
✅ **Short-lived tokens**: Federated tokens expire in 15 minutes (configurable)
✅ **Claim verification**: All required claims validated before session creation
✅ **HTTPS required**: Production deployments require HTTPS

## FAQ

**Q: Can I run both methods at the same time?**
A: No, the feature toggle is either on or off. However, you can keep both configured and switch between them by changing the env var.

**Q: What happens if AWS STS is unavailable?**
A: The service will fail at startup with clear error logging. No fallback is provided for security reasons.

**Q: Do I need to rotate the federated credential?**
A: No, federated credentials don't expire. However, you should rotate the Entra Application Registration keys regularly as usual.

**Q: Can I use federated credentials in development?**
A: Yes, either with the mock provider (no AWS STS needed) or with real AWS STS credentials if you have access to the CDP platform.

**Q: What's the performance difference?**
A: Negligible. Both methods involve one network round-trip to obtain a token. Federated credentials may be slightly faster due to AWS STS being on the same network as the compute environment.

## References

- [CDP Federated Credentials Overview](https://portal.cdp-int.defra.cloud/documentation/how-to/federated-credentials/overview.md)
- [CDP Web Identity Setup](https://portal.cdp-int.defra.cloud/documentation/how-to/federated-credentials/web-identity-app-reg.md)
- [CDP Node.js Integration](https://portal.cdp-int.defra.cloud/documentation/how-to/federated-credentials/node-integration.md)
- [@defra/hapi-auth-oidc Package](https://github.com/DEFRA/cdp-libraries/tree/main/packages/hapi-auth-oidc)

## Support

For issues or questions:
1. Check logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure Entra configuration matches the auth method being used
4. Review the troubleshooting section above
5. Contact the SFD dev team
