---
name: standards
description: Standard skills and patterns an agent should apply when working in this codebase
---

# Standards skill

## Context

This document defines the standards an agent must apply when reviewing or writing code in this project.

## Core principles

- Solve the problem as stated — do not over-engineer or anticipate future requirements
- Follow existing patterns in the codebase before introducing new ones
- Verify work before marking a task complete
- Prefer VS Code tasks for routine workflows (up, test, lint). If running commands directly, use Docker for app/test flows and follow `.github/copilot-instructions.md` command guidance.

## Reading code

- Read the full function and its callers before making changes
- Check for existing utilities before writing new ones
- Use `grep` / search to find all usages of a symbol before renaming or removing it

## Writing code

- Match the style and conventions of the surrounding code
- All internal `import` paths must include the `.js` extension
- All `import` statements must be at the top of the file, after any `@module` JSDoc and before any function definitions
- No error handling for scenarios that cannot happen
- No abstractions for a single use case
- Private functions must be ordered alphabetically by name
- For comments and JSDoc, see [Writing comments](#writing-comments)

## Writing comments

### Descriptions

- Explain *why* the code exists or what its name and signature don't make obvious, not *what* it does. If a description only repeats the name, leave it out
- Write for a junior developer or apprentice who is new to the codebase. Use short, plain sentences. Only use a technical term (e.g. JWKS, CSRF, RS256) when it is needed, and explain it in a few words (e.g. "CSRF (a forged request from another site)")
- Be specific about inputs and outputs. When several similar things are involved (e.g. access token and refresh token), name each one and say which goes in and which comes out
- Don't use one word with two meanings in a sentence. Prefer "Gets a new access token from Microsoft Entra ID using a refresh token" over "Refreshes tokens using a refresh token"
- Note constraints a caller must know (e.g. a refresh token is single use, so the new one must replace the old one)
- Only describe usage you have verified (e.g. a constant only used by tests is not a production permission rule). Check usages before writing

### `@module` blocks

- Add to files with real logic: services, presenters, mappers, utils, plugins, auth helpers and pre-handlers
- Do not add to config files (`src/config/`), constants, route files in `src/routes/` or any file that only exports a config object or static values. `@module` identifies a module for generated documentation; it is not a description of an exported value
- The name is the camelCase file name (e.g. `fetch-business-change-service.js` is `@module fetchBusinessChangeService`). Where the file's main export has a different name, use the exported name
- A blank ` *` line separates the description from the tag
- Do not add `'use strict'` — ESM modules are always strict

### Function JSDoc

- Required on exported functions that take parameters, return something non-obvious or have side effects. Use `@param {type} name - description` and `@returns {type}`
- Otherwise omit it unless the name and signature leave something a caller needs to know unexplained
- The function block must add detail (parameters, returns, behaviour), not restate the `@module` description. If a single-function file's module description already says what it does, omit the function block (or vice versa)

### Inline comments

- Only where the *why* is genuinely non-obvious

### Example

[business-vat-change-presenter.js](../../../src/presenters/business/business-vat-change-presenter.js):

```js
/**
 * Formats data ready for presenting in the `/business/{sbi}/vat-registration-number-change` page
 *
 * @module businessVatChangePresenter
 */

import { SEARCH_SBI } from '../../constants/search-links.js'

/**
 * Adds any unsaved VAT number from the session so the form keeps the user's changes
 *
 * @param {object} data - The business data, including any pending VAT number change held in the session
 * @param {string} [payload] - The VAT number submitted by the user, when the form is re-rendered after a validation failure
 *
 * @returns {object} The page data for the view
 */
const businessVatChangePresenter = (data, payload) => {
```

## Testing

- Load `../testing/SKILL.md` when work or review includes tests.
- Use section 2 in [Standards review checklist](./review-checklist.md) for testing review criteria.

## Refactoring

- Refactor in a separate commit from behaviour changes
- Do not rename or restructure things incidentally while fixing bugs

## Reviewing code

See [Standards review checklist](./review-checklist.md) for review-specific checks and expectations.

## Quality gates

Before completing any task:

1. Lint checks pass
2. Tests pass
3. No `console.log`, `console.dir`, or `describe.only` present
4. No commented out code
5. No unintended files changed

## References

See [External standards references](./external-references.md).
