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

## 2026-03-13 - Hashing for Constant-Time Comparison
**Vulnerability:** Comparing variable-length secrets (like passwords or usernames) using timing-safe functions directly is difficult because `timingSafeEqual` requires equal-length buffers.
**Learning:** Directly comparing strings of different lengths still leaks length information via early return in standard comparison, and `timingSafeEqual` throws if lengths differ.
**Prevention:** Hash both the input and the expected secret using a fixed-length algorithm (like SHA-256) before passing them to `crypto.timingSafeEqual`. This ensures equal length and protects against timing attacks on variable-length inputs.

## 2026-03-14 - Unauthenticated API Proxy
**Vulnerability:** The `/api/insforge` route was an unauthenticated pass-through proxy to the backend, allowing anyone to bypass frontend administrative checks and perform database operations (DELETE, POST, etc.) directly.
**Learning:** Even if the UI is protected, any public proxy or API endpoint must also enforce authorization if it exposes sensitive backend capabilities. Substring matching for public paths (e.g., `path.includes('subscribers')`) is dangerous as it can be easily bypassed.
**Prevention:** Implement session-based authorization at the proxy level. Use strict equality checks for allowed public paths and ensure backend URLs are managed through secure server-side environment variables (avoiding `NEXT_PUBLIC_` for sensitive targets).
