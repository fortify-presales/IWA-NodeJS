# Copilot Instructions for IWA-NodeJS

## ⚠️ CRITICAL: This is an Intentionally Vulnerable Application

**DO NOT** fix, sanitize, or harden any code marked as intentionally insecure.
**DO NOT** remove vulnerability marker comments.
**DO NOT** update deliberately pinned vulnerable dependencies listed in DEPENDENCIES.md.

## Vulnerability Marker Convention

Every intentional vulnerability MUST have this comment block immediately above it:

```typescript
// INSECURE: <one-line description of the vulnerability> (CWE-XX)
// Purpose: <what security tool or security lesson this demonstrates>
// Fix: <how a real production app would remediate this>
```

## Adding New Vulnerabilities

1. Add the marker comment as shown above.
2. Add the vulnerability to `views/vulnerabilities.ejs`.
3. Add a regression test in `tests/vulnerabilities/`.
4. Document it in `DEMO.md` with exact payloads and expected results.

## What IS OK to fix

- Bugs that prevent the app from starting or crashing unexpectedly (unless they are intentional).
- TypeScript compilation errors.
- Build configuration issues.
- Test infrastructure problems.
