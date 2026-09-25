[![Build and Test](https://github.com/fortify-presales/IWA-NodeJS/actions/workflows/ci.yml/badge.svg)](https://github.com/fortify-presales/IWA-NodeJS/actions/workflows/ci.yml)
[![Fortify on Demand Scan](https://github.com/fortify-presales/IWA-NodeJS/actions/workflows/fod.yml/badge.svg)](https://github.com/fortify-presales/IWA-NodeJS/actions/workflows/fod.yml)
[![Fortify ScanCentral Scan](https://github.com/fortify-presales/IWA-NodeJS/actions/workflows/scancentral.yml/badge.svg)](https://github.com/fortify-presales/IWA-NodeJS/actions/workflows/scancentral.yml)

# IWA Pharmacy Direct — Node.js

> ⚠️ **WARNING: This application is INTENTIONALLY VULNERABLE. DO NOT deploy to the internet or any production environment.**
> It is designed solely for security training, demonstrations, and testing of SAST/DAST/SCA tools.

## Overview

IWA Pharmacy Direct is a deliberately insecure e-commerce web application — a Node.js/TypeScript port of the
[IWA-Java](https://github.com/fortify/IWA-Java) Spring Boot demo app by OpenText/Fortify.
It is used to demonstrate and teach application security tools including:

- **Fortify SAST** — finds code-level vulnerabilities
- **Fortify DAST** — finds runtime vulnerabilities
- **Fortify Software Composition Analysis (SCA)** — open-source vulnerability scanning
- **Fortify on Demand (FoD)** — cloud-based SAST/DAST
- **ScanCentral SAST/DAST** — enterprise SAST/DAST scanning

All vulnerabilities are **intentional and must be preserved** for teaching purposes.

## Prerequisites

- Node.js 20 LTS
- npm 10+

## Installation

```bash
npm install
cp .env.example .env
```

## Running

### Development

```bash
npm run dev
# App runs on http://localhost:8888
# React UI is served at http://localhost:8888/app/
```

### Production

```bash
npm run build
npm start
# App runs on http://localhost:8080
# React UI is served at http://localhost:8080/app/
```

### Docker

```bash
docker-compose up
# App runs on http://localhost:8080
# React UI is served at http://localhost:8080/app/
```

### Azure Web App Deployment

See [DEPLOY.md](DEPLOY.md) for the Azure App Service container deployment guide.

## Seeded Credentials

| Username | Password     | Role(s)               |
| -------- | ------------ | --------------------- |
| admin    | Password123! | ROLE_ADMIN, ROLE_USER |
| user1    | Password123! | ROLE_USER             |
| user2    | Password123! | ROLE_USER             |
| api      | Password123! | ROLE_API              |
| test     | Password123! | ROLE_TEST             |

## Ports

| Profile     | Port |
| ----------- | ---- |
| development | 8888 |
| production  | 8080 |

## API

REST API available at `/api/v3/` with OpenAPI docs at `/swagger-ui`.

Key endpoints:

- `POST /api/v3/site/sign-in` — Authenticate and receive JWT
- `GET /api/v3/products` — Browse products
- `GET /api/v3/users` — User management (auth required)

## AI Assistant Browser Setup

The `/app/assistant/setup` page saves an OpenAI API key in browser `localStorage` for demos. The `/app/assistant` page reads the saved browser key and sends it to `POST /api/v3/agent/chat` as `X-OpenAI-API-Key`.

For public deployments, do not configure `OPENAI_API_KEY` in the container environment. This prevents visitors from using your private server-side key.

For private demos, you can still allow a shared server-side key by setting both variables in the container environment:

```bash
OPENAI_API_KEY=sk-...
ALLOW_SERVER_OPENAI_API_KEY=true
```

Without `ALLOW_SERVER_OPENAI_API_KEY=true`, the API ignores the server environment key and requires the browser-provided key.

Because this is an intentionally vulnerable app with XSS demos, use a restricted or disposable OpenAI project key for browser setup.

## Intentional Vulnerabilities

Visit `/app/vulnerabilities` in the running app for a full list of all 27 planted vulnerabilities with reproduction steps.
Legacy browser routes redirect to their React `/app/*` equivalents during the frontend migration.
See [DEMO.md](DEMO.md) for detailed exploitation walkthroughs.

## Frontend Runtime

The application UI is built with React and TypeScript from `frontend/src/` into `public/app/`. EJS, jQuery, Bootstrap, and legacy browser plugins are no longer part of the runtime. The `views/` directory is retained as historical training reference while intentionally vulnerable behaviors are preserved in the React frontend and backend routes.

## Fortify Scan Instructions

```bash
# SAST
./bin/sast-scan.sh

# ScanCentral SAST
./bin/scancentral-sast-scan.sh

# FoD SAST + SCA
./bin/fod-scan.sh
```

### WebInspect Login Macro

When recording a Fortify WebInspect login macro for the React SPA, use `/app/login` and one of the seeded browser users such as `user1` / `Password123!`.

SPA login and logout detection can be difficult because the raw HTML shell is rendered before React updates the page. To make the authenticated state detectable, the app emits a scanner-friendly logout marker when the session is missing:

```text
WEBINSPECT_LOGOUT_CONDITION IWA_LOGIN_REQUIRED
```

Unauthenticated protected SPA routes such as `/app/user/home` and `/app/admin` also return HTTP `401` with this header:

```text
X-IWA-Auth-State: logged-out
```

If WebInspect does not automatically infer the logout condition, configure the macro logout condition to match either the marker text or the `X-IWA-Auth-State: logged-out` response header.

## End-to-End Tests

```bash
npm run test:e2e
```

The Playwright suite builds the application, starts an isolated test server on port `8890`, and uses `data/e2e.sqlite` as its test database.

## Security Policy

This repository is **intentionally vulnerable** and is **out of scope** for vulnerability reports.
See [SECURITY.md](SECURITY.md) for details.

## License

Apache-2.0 — see [LICENSE](LICENSE).
