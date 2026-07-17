# Authentication Strategies

This folder contains two different ways to authenticate users. Both do the same job—keeping users logged in securely—but they work differently under the hood.

## Quick Comparison

| | **client-secret.js** | **federated-credentials.js** |
|---|---|---|
| **Uses** | Bell plugin + Entra | OIDC plugin + Entra |
| **Best for** | Traditional OAuth 2.0 flow | Modern workload identity & federated credentials |
| **Token refresh** | Manual (we write the code) | Automatic (plugin handles it) |
| **Status** | Legacy approach | Modern approach |

## client-secret.js: The Traditional Approach

**What it does:**
- Logs users in via Entra using a client secret stored on the server
- Think of the client secret like a password the server uses to prove it's legitimate to Entra

**How it works:**
1. User visits the app → redirected to Entra login
2. User logs in with their corporate credentials
3. Entra sends back a token (JWT)
4. We store this token in a session cookie and server cache
5. On each request, we check if the token is still valid
6. If it's expired, we use the refresh token to get a new one

**Why use it:**
- Simple, straightforward OAuth 2.0 flow
- Works for regular web applications

---

## federated-credentials.js: The Modern Approach

**What it does:**
- Logs users in using OIDC (a newer standard than OAuth 2.0)
- Supports "federated credentials"—ways to prove identity without a shared secret (e.g., workload identity in Azure)
- Can use a mock provider for testing

**How it works:**
1. App gets a token from AWS that proves the app's identity (not the user—the app itself)
2. User visits the app → redirected to Entra login
3. App uses the AWS token to request a user token from Entra
4. Entra sends back a token for the user
5. We store the token in a session cookie
6. The OIDC plugin automatically validates and refreshes the token on each request (no manual work needed)

**Why use it:**
- **Federated credentials**: Instead of storing a client secret, the app proves its identity using Azure workload identity or other methods—more secure for cloud deployments
- **Cleaner code**: The plugin handles token management automatically
- **Better for the future**: OIDC is the modern standard

---

## Key Differences Explained Simply

### Token Refresh
- **client-secret**: We manually check if the token is expired and refresh it using the refresh token (we write the `validateToken()` function)
- **federated-credentials**: Uses the `@defra/hapi-auth-oidc` package, which automatically handles token validation and refresh behind the scenes—we just call it and it takes care of the rest

### Security
- **client-secret**: Relies on a client secret (a shared password) stored on the server
- **federated-credentials**: Gets a temporary token from AWS that proves the app is running on AWS, then uses that token to authenticate with Entra (no secret stored on the server)

### Mocking for Tests
- **client-secret**: No built-in mock—harder to test
- **federated-credentials**: Includes a MockProvider for easy testing without hitting Entra

---

## Which One Should I Use?

If you're **building new features**, use **federated-credentials.js**—it's more modern and secure.

If you're **maintaining existing code**, check which strategy is currently active in the server configuration. Both work fine; federated-credentials is just the better long-term choice.

---

## Related Files

- `../auth/get-oidc-config.js` — Gets the Entra endpoints
- `../auth/refresh-tokens.js` — Refreshes expired tokens (used by client-secret)
- `../../../config/index.js` — Configuration for both strategies
