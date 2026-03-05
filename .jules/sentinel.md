# Sentinel Journal 🛡️

## 2026-03-02 - Hardcoded Secrets in Setup Scripts
**Vulnerability:** Critical API keys were hardcoded in `scripts/setup-insforge.mjs` for developer convenience.
**Learning:** Utility scripts are often overlooked during security audits but can leak sensitive infrastructure keys if committed.
**Prevention:** Always use `process.env` for keys in scripts and enforce their presence with `process.exit(1)` if missing.

## 2026-03-02 - Rejected Custom Authentication Implementation
**Vulnerability:** Attempted to implement a custom environment-variable-based authentication for the `/admin` route.
**Learning:** Custom session management using static, unencrypted cookies (e.g., `admin_session=true`) is easily spoofable and provides "security theater" rather than real protection. Additionally, Next.js `redirect()` should not be used inside `try-catch` blocks as it relies on throwing an error to function.
**Prevention:** Use industry-standard libraries (like `iron-session` or `NextAuth.js`) for authentication. Prefer signed/encrypted tokens over static cookie values.
