1. How are credentials handled in cross-origin requests, and why does the CORS specification strictly prohibit pairing `credentials: true` with a wildcard (`*`) origin?

**Deep explanation:** When cross-origin requests need to transmit authenticated data—such as HTTP cookies, HTTP authentication, or TLS client certificates—both the client frontend and Express backend must explicitly opt in:
- **Frontend configuration:** Client applications must set `credentials: "include"` when using the Fetch API, or `withCredentials: true` when using Axios or `XMLHttpRequest`. By default, browsers omit cookies and credentials from cross-origin requests.
- **Backend configuration:** The Express backend must include `credentials: true` in the `cors()` configuration, which adds the `Access-Control-Allow-Credentials: true` response header.

**The Wildcard Prohibition:**
The CORS specification strictly forbids combining `Access-Control-Allow-Credentials: true` with `Access-Control-Allow-Origin: *`. If a server responds with both headers, modern browsers reject the response and prevent client JavaScript from reading it.

This rule exists to defend against credential theft and unauthorized data exfiltration. If a wildcard origin were allowed with credentials, any malicious third-party site on the web could trigger requests to your API while the user is logged in. The browser would attach the user's ambient session cookies, and the malicious site's scripts would be permitted to read the sensitive response data. To allow credentials safely, the Express backend must validate the requesting origin and reflect the exact matching origin back in `Access-Control-Allow-Origin` (e.g., `origin: "https://app.example.com"`).

**Interview answer:** "Transmitting credentials across origins requires `credentials: true` on the Express backend and `credentials: 'include'` or `withCredentials: true` on the frontend. The CORS specification strictly forbids combining `credentials: true` with a wildcard `*` origin to prevent malicious sites from extracting authenticated session cookies and private user data."

2. How do you configure multiple or dynamic origins in Express, and what are the security risks of naive origin reflection?

**Deep explanation:** Modern architectures often require an Express backend to serve multiple origins (e.g., production frontend, admin dashboard, and local staging). The `cors` package supports this through origin whitelists or dynamic validator functions:

1. **Array whitelist:**
```javascript
const allowedOrigins = [
  "https://app.example.com",
  "https://admin.example.com",
  "http://localhost:3000"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```
When an array is supplied, `cors` checks the incoming `Origin` header against the list. If matched, it reflects that specific origin back in `Access-Control-Allow-Origin`.

2. **Dynamic validator function:**
```javascript
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, curl, server-to-server) where origin is undefined
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
```

**Security Vulnerabilities to Avoid:**
- **Blind Origin Reflection:** Setting `origin: true` or echoing `req.headers.origin` directly without validating against a strict whitelist is functionally equivalent to using an insecure wildcard with `credentials: true`, opening authenticated endpoints to data exfiltration.
- **Flawed RegEx / String Matching:** Using loose checks like `origin.includes("example.com")` allows attackers to bypass validation using domains like `attacker-example.com` or `example.com.malicious.io`. Origins should always be matched strictly against exact strings or anchored regular expressions (`^...$`).
- **Handling Undefined Origins:** Non-browser clients (such as mobile apps, server-to-server calls, or Postman) do not send an `Origin` header (`origin === undefined`). APIs must consciously decide whether to allow these requests or mandate token/API key authentication.

**Interview answer:** "Multiple origins can be configured in Express by passing an array of allowed URLs or a dynamic callback function to `cors({ origin: allowedOrigins })`. A critical security vulnerability to avoid is naive origin reflection or loose substring matching, which allows malicious domains containing your brand name to steal authenticated user sessions."
