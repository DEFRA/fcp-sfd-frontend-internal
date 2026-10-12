---
applyTo: "src/routes/**/*.js"
---

# Route instructions

- Destructure request properties at the start of a handler when they are used, and reference the destructured variables consistently rather than accessing the same properties through `request` inline:

  ```js
  const { params, yar, auth, payload } = request
  const { sbi } = params
  const email = auth.credentials?.email
  ```

- Validate params via the pre-handlers (`validateCrn` / `validateSbi` in `src/routes/pre-handlers.js`); validate payloads via Joi schemas from the engine (`schemas.<domain>.<field>`), with a `failAction` that re-renders the view with formatted errors and a `BAD_REQUEST` status.
- Keep handlers thin — fetch data and orchestrate via services, not inline in the route.
