# Deliberately Outdated Dependencies

This application intentionally uses outdated packages with known vulnerabilities for Fortify Software Composition Analysis (SCA) scanning demonstrations. **Do NOT update these packages.**

| Package | Version | CVE / Advisory | Reason for keeping |
|---------|---------|-----------------|-------------------|
| `axios` | 0.21.1 | GHSA-42xw-2xvc-qx8m (SSRF) | Demonstrates SCA finding |
| `lodash` | 4.17.15 | CVE-2021-23337 (command injection) | Demonstrates SCA finding |
| `minimist` | 1.2.0 | CVE-2021-44906 (prototype pollution) | Demonstrates SCA finding |
| `node-serialize` | 0.0.4 | GHSA-3fjf-gc3x-cvc5 (RCE via deserialization) | Required for insecure deserialization vuln |
| `handlebars` | 4.0.11 | CVE-2019-19919 (template injection) | Demonstrates SCA finding |
| `jsonwebtoken` | 8.5.1 | CVE-2022-23529 (insecure defaults) | Demonstrates SCA finding |
| `xml2js` | 0.4.19 | CVE-2023-0842 (prototype pollution) | Demonstrates SCA finding |
| `express-fileupload` | 1.1.6 | CVE-2020-7699 (Prototype Pollution / CISA KEV) | Demonstrates SCA CISA KEV finding |
| `save-dev` | 0.0.1-security | GHSA-7fhm-3j9v-2x4c (arbitrary code execution) | Demonstrates SCA malware finding |

# INSECURE: Vulnerable dependencies intentionally pinned (CWE-1035)
# Purpose: Demonstrates SCA/Debricked findings for known-vulnerable packages
# Fix: Update to latest patched versions; implement automated dependency scanning in CI
