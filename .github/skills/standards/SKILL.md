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
- All `import` statements must be at the top of the file, after the `@module` JSDoc and before any function definitions
- No inline comments unless the *why* is genuinely non-obvious
- No error handling for scenarios that cannot happen
- No abstractions for a single use case
- Private functions must be ordered alphabetically by name

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
