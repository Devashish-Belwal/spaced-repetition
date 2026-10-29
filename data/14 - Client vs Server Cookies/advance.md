1. How do browsers manage cookie storage mechanics and transmission, and what combination of cookie attributes is required for secure authentication?

**Deep explanation:** Unlike Web Storage APIs (`localStorage` and `sessionStorage`), which are client-only key-value tables completely decoupled from the network layer, cookies are managed by a specialized browser storage subsystem integrated directly into HTTP networking. When a server issues a `Set-Cookie` response header, the browser parses the directive, associates it with the origin, and manages its lifecycle based on its attributes:
- **`HttpOnly`:** Restricts access solely to HTTP/HTTPS network requests, concealing the cookie from `document.cookie` to prevent XSS-based theft.
- **`Secure`:** Enforces transport security by instructing the browser to transmit the cookie exclusively over encrypted TLS/HTTPS connections, preventing eavesdropping and man-in-the-middle (MITM) credential sniffing over cleartext HTTP.
- **`SameSite` (`Strict`, `Lax`, or `None`):** Governs whether cookies are attached to cross-site requests. `Strict` blocks cookies on all cross-site requests, `Lax` allows cookies on top-level cross-site GET navigations (providing a balanced user experience while protecting state-changing requests), and `None` permits cross-site transmission (mandating the `Secure` attribute).
- **`Domain` and `Path`:** Define the scope of the cookie. Omitting the `Domain` attribute scopes the cookie strictly to the origin host without including subdomains, preventing subdomain compromise attacks.
- **`Max-Age` / `Expires`:** Defines expiration; omitting both creates a session cookie that the browser removes once the browsing session terminates.

In an Express application, a secure session or authentication cookie should be configured as follows:
```javascript
res.cookie('sessionId', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 1000 * 60 * 60 * 24 // 24 hours
});
```

**Interview answer:** "Browsers store cookies in an internal cookie jar and automatically attach matching cookies to outbound requests based on scope and security attributes. For secure authentication, cookies should combine `HttpOnly` to block client-side script access, `Secure` to enforce HTTPS transmission, and `SameSite=Lax` or `Strict` to mitigate cross-site request forgery."
