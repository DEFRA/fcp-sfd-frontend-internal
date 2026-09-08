# Standards review checklist

Use this checklist when reviewing changed code. Apply findings only to changed files.

## 1. Correctness and behaviour

- The code does what the change says it does.
- Edge cases are handled (null, empty, boundary values).
- Error paths return useful messages without leaking internals.

## 2. Tests and coverage

See `../testing/SKILL.md` for testing patterns and conventions.

- New code has unit tests covering the happy path and key error paths.
- Test names describe the behaviour being verified.
- Coverage does not decrease; target is 90% minimum (SonarCloud quality gate).
- Route handlers include tests for validation failure, CSRF, and auth where applicable.
- Do not run the test suite as part of a review. Inspect test files and, if runtime verification is needed, ask the author to run `npm run docker:test`. Never suggest host `vitest` or `npm test`.

## 3. Security

- No secrets, API keys, or tokens are committed.
- User input is validated and sanitised.
- Dependencies are from trusted sources with no known vulnerabilities.
- Logging does not contain PII (names, addresses, emails, NI numbers, bank details).
- SonarCloud security hotspots are reviewed and resolved.
- No new vulnerabilities or code smells are introduced (SonarWay profile).

## 4. Performance and reliability

- No blocking operations on the event loop.
- Database queries are indexed and bounded.
- External calls include timeouts and retry logic.

## 5. Maintainability and readability

Apply the Writing code and Refactoring sections in [SKILL.md](./SKILL.md).

- No commented-out code.
- Functions and variables have descriptive names.
- Complex logic has explanatory comments or is split into named functions.
- Avoid magic numbers or strings; use named constants.

## 6. Architecture and boundaries

- Code follows the existing project structure.
- Dependencies flow inward (routes -> services -> DAL).
- No circular dependencies between modules.

## 7. Documentation

- Public functions have JSDoc comments.
- README is updated if setup steps or prerequisites change.
- Breaking changes are clearly documented.

## 8. Accessibility (frontend changes only)

- HTML meets WCAG 2.2 Level AA.
- Interactive elements are keyboard accessible.
- Images have alt text, and form fields have labels.
- Error summaries link to the corresponding form field.

## 9. AI customization files

- Applies when the change touches `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`, or `.github/skills/**/SKILL.md` and when it changes code that an existing instruction file describes.
- Every rule is verifiable in the code today. Open the file it cites and confirm the macro signature, symbol, option, or path actually exists.
- Examples match real call sites rather than an idealised version, and cover the variants in use.
- `applyTo` globs match the files the conventions actually govern.
- No rule contradicts another instruction file or `copilot-instructions.md`.
- Changing a layer that has an instruction file means checking that instruction still holds.
