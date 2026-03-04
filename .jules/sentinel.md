# Sentinel Journal - Critical Security Learnings

## 2026-03-04 - [Hardcoded Secrets in Setup Scripts]
**Vulnerability:** A hardcoded API key (ik_...) was found in `scripts/setup-insforge.mjs` as a fallback for the `INSFORGE_API_KEY` environment variable.
**Learning:** Development and utility scripts are often overlooked during security reviews, but they can leak production credentials or sensitive keys if not properly sanitized.
**Prevention:** Always use environment variables for secrets and provide clear error messages if they are missing, rather than falling back to a hardcoded "default" or "testing" key.
