1. How do `maxAge` and `expires` differ in controlling cookie lifecycles, and what is the difference between session and persistent cookies?

**Deep explanation:** Cookie lifetimes are dictated by the presence or absence of expiration directives:
- **Session vs. Persistent Cookies:** If neither `maxAge` nor `expires` is set, the cookie is categorized as a *session cookie*. It lives strictly in ephemeral browser memory and is purged as soon as the user terminates the browser session or closes the browser window. When either attribute is provided, the browser writes the cookie to persistent disk storage, keeping it until its expiration threshold is reached.
- **`maxAge` vs. `expires`:**
  - `maxAge` (expressed in milliseconds in Express and converted to seconds in the HTTP specification) defines a relative time-to-live delta from the moment the browser receives the header (e.g., `maxAge: 15 * 60 * 1000` for 15 minutes). It is preferred because it is relative and resilient to client-server clock drift.
  - `expires` specifies a fixed, absolute expiration timestamp formatted as an HTTP-date string (RFC 1123, GMT/UTC). If the client device's clock is inaccurate or desynchronized from the server, cookies using `expires` may expire prematurely or persist unexpectedly. When both attributes are present, modern browsers give precedence to `Max-Age`.
- **Deletion:** A cookie is deleted by setting its expiration date to the past or specifying `maxAge: 0` (which Express wraps via `res.clearCookie(name, [options])`).

**Interview answer:** "Omitting expiration attributes creates a transient session cookie that is cleared upon browser close, while setting `maxAge` or `expires` writes a persistent cookie to disk. `maxAge` is preferred because it defines relative time-to-live from receipt, avoiding issues caused by client-server clock desynchronization inherent to `expires`."
