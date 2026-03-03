## 2026-03-03 - [CRITICAL] Hardcoded API Key in Setup Script
**Vulnerability:** A hardcoded InsForge API key (`ik_...`) was found in `scripts/setup-insforge.mjs`.
**Learning:** Development scripts used for database initialization or infrastructure setup often contain hardcoded secrets if not properly reviewed, as they are seen as "utility" scripts rather than core application code.
**Prevention:** Always use environment variables for secrets, even in setup scripts. Add explicit checks to ensure these variables are set before proceeding.
