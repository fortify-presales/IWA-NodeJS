## Summary

<!-- What does this PR do and why? -->

## Traceability

- Spec: `specs/[###-feature-slug]/spec.md` (or N/A for a small fix)
- Plan: `specs/[###-feature-slug]/plan.md` (or N/A)
- Tasks: `specs/[###-feature-slug]/tasks.md` (or N/A)
- Closes: #

## Checklist

- [ ] No documented/intentional vulnerability was fixed, sanitized, or removed (Constitution
      Principle I) — if this PR *intentionally* changes vulnerability behavior, that's called out
      above and reflected in `DEMO.md`.
- [ ] If this PR adds a new intentional vulnerability: `INSECURE:`/`Purpose:`/`Fix:` marker added,
      `packages/web/src/publicPages.tsx` table updated, regression test added under
      `packages/api/tests/vulnerabilities/`, and `DEMO.md` updated with exact payloads.
- [ ] `npm run build` and `npm run lint` pass locally.
- [ ] Relevant docs updated (`README.md`, `.env.example`, `DEMO.md`) if behavior/config changed.
