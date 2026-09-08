# Spec-Driven Development

This repo uses a lightweight, hand-authored adaptation of spec-driven development (inspired by
[github/spec-kit](https://github.com/github/spec-kit), without depending on its CLI).

## Layout

```text
specs/
├── memory/constitution.md      # Project principles — read this first
├── templates/
│   ├── spec-template.md        # Copy for a new feature's spec.md
│   ├── plan-template.md        # Copy for a new feature's plan.md
│   └── tasks-template.md       # Copy for a new feature's tasks.md
└── <NNN>-<feature-slug>/       # One folder per feature, e.g. 001-agent-rate-limit/
    ├── spec.md
    ├── plan.md
    └── tasks.md
```

## Workflow

1. **Spec**: copy `templates/spec-template.md` to `specs/<NNN>-<slug>/spec.md` and fill it in.
2. **Plan**: copy `templates/plan-template.md` to `specs/<NNN>-<slug>/plan.md`, run through the
   Constitution Check gate against [`memory/constitution.md`](memory/constitution.md).
3. **Tasks**: copy `templates/tasks-template.md` to `specs/<NNN>-<slug>/tasks.md`, break the plan
   into checklist tasks, and check them off as you implement.
4. Reference the `specs/<NNN>-<slug>/` folder in the related issue and PR for traceability (see
   `.github/ISSUE_TEMPLATE/` and `.github/PULL_REQUEST_TEMPLATE.md`).

`<NNN>` is a zero-padded sequential number (`001`, `002`, ...); `<slug>` is a short kebab-case name.
