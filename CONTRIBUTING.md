# Contributing to IWA Pharmacy Direct

## Important Rules

1. **Preserve all intentional vulnerabilities** — never fix, sanitize, or harden intentionally insecure code.
2. Every intentional weakness MUST carry a marker comment:
   ```ts
   // INSECURE: <one-line why> (CWE-XX)
   // Purpose: <what security tool / lesson this demonstrates>
   // Fix: <how a real app would remediate>
   ```
3. Never commit real secrets. Use placeholder values only.
4. Add tests for new vulnerabilities in `tests/vulnerabilities/`.

## Development Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Testing

```bash
npm test           # unit + integration tests
npm run test:vulns # vulnerability regression tests
```
