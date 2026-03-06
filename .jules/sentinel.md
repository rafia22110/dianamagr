# Sentinel Journal 🛡️

## 2026-03-02 - Hardcoded Secrets in Setup Scripts
**Vulnerability:** Critical API keys were hardcoded in `scripts/setup-insforge.mjs` for developer convenience.
**Learning:** Utility scripts are often overlooked during security audits but can leak sensitive infrastructure keys if committed.
**Prevention:** Always use `process.env` for keys in scripts and enforce their presence with `process.exit(1)` if missing.

## 2026-03-02 - Rejected Custom Authentication Implementation
**Vulnerability:** Attempted to implement a custom environment-variable-based authentication for the `/admin` route.
**Learning:** Custom session management using static, unencrypted cookies (e.g., `admin_session=true`) is easily spoofable and provides "security theater" rather than real protection. Additionally, Next.js `redirect()` should not be used inside `try-catch` blocks as it relies on throwing an error to function.
**Prevention:** Use industry-standard libraries (like `iron-session` or `NextAuth.js`) for authentication. Prefer signed/encrypted tokens over static cookie values.

## 2026-03-02 - timingSafeEqual Length Requirement
**Vulnerability:** Use of `crypto.timingSafeEqual` without length validation can cause application crashes (500 errors) when provided with signatures of incorrect length.
**Learning:** `timingSafeEqual` throws a `TypeError` if input buffers differ in length. This "fail-loudly" behavior can lead to DoS or provide a side-channel if error handling is inconsistent.
**Prevention:** Always perform a length check (ideally on strings before buffer allocation) before calling `timingSafeEqual`.
