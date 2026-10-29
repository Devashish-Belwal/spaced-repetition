1. What are the key security attributes of HTTP cookies (`httpOnly`, `secure`, and `sameSite`), and how do they mitigate XSS and CSRF attacks?

**Deep explanation:** Cookie security attributes protect sensitive credentials (such as JWTs or session identifiers) from client-side interception and cross-origin abuse:
- **`httpOnly: true`**: Instructs the browser that the cookie must not be accessible via client-side scripts such as `document.cookie`. This provides a critical defense-in-depth layer against Cross-Site Scripting (XSS); even if an attacker successfully injects malicious script into the frontend application, they cannot programmatically read or exfiltrate the session cookie.
- **`secure: true`**: Restricts cookie transmission exclusively to encrypted HTTPS connections (typically conditioned in code as `process.env.NODE_ENV === "production"`). This prevents cleartext transmission over HTTP, thwarting Man-in-the-Middle (MitM) eavesdropping and packet sniffing on unsecured networks.
- **`sameSite`**: Governs whether cookies are attached to cross-site requests, acting as the primary browser defense against Cross-Site Request Forgery (CSRF):
  - `Strict`: The cookie is never sent in cross-site contexts, even when a user clicks a regular top-level link leading to your site from an external domain.
  - `Lax` (modern browser default): The cookie is blocked on cross-site subresource requests (such as `<img>`, `<iframe>`, and cross-site `POST` submissions), but is sent when navigating to the origin via top-level "safe" methods (such as standard `GET` links).
  - `None`: The cookie is sent on all cross-site requests. Modern browser standards mandate that `sameSite: "none"` must always be paired with `secure: true`.

**Interview answer:** "`httpOnly` prevents JavaScript access via `document.cookie` to mitigate XSS token exfiltration, `secure` ensures cookies are transmitted only over encrypted HTTPS, and `sameSite` (Strict/Lax/None) restricts cross-origin request transmission to safeguard against CSRF attacks."
