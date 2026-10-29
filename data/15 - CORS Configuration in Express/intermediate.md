1. What triggers a CORS preflight request, how does the browser-server handshake work, and how should preflights be handled in Express?

**Deep explanation:** Browsers automatically issue an HTTP preflight request using the `OPTIONS` method before executing any request that does not meet the criteria of a "simple request." A request requires preflighting if:
- It uses HTTP methods other than `GET`, `HEAD`, or `POST` (such as `PUT`, `PATCH`, or `DELETE`).
- It includes custom headers outside the CORS-safelisted set (such as `Authorization` or custom API headers).
- Its `Content-Type` header is anything other than `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain` (most commonly `application/json`).

During the preflight handshake:
1. The browser sends an `OPTIONS` request containing headers such as `Origin`, `Access-Control-Request-Method`, and `Access-Control-Request-Headers`.
2. The server evaluates these requirements and responds with headers specifying allowed access:
   - `Access-Control-Allow-Origin`: The permitted client origin.
   - `Access-Control-Allow-Methods`: Configured in Express via `methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]`.
   - `Access-Control-Allow-Headers`: Configured in Express via `allowedHeaders: ["Content-Type", "Authorization", "Accept"]`.
   - `Access-Control-Max-Age`: Directs the browser to cache preflight approval for a given duration (in seconds), reducing redundant network roundtrips.

In Express, preflight handling must be explicitly enabled across routes and placed before any authentication or route handlers:
```javascript
const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
};

// Enable preflight across all routes
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
```
If `app.options("*", cors())` is omitted or placed behind authentication middleware (such as JWT verification), the preflight `OPTIONS` request will be rejected with an unauthorized status code (e.g., 401/403) because browsers never attach credentials to preflights, causing the subsequent request to fail entirely.

**Interview answer:** "A preflight is an `OPTIONS` request sent automatically by browsers before non-simple requests—such as those using `application/json`, verbs like `PUT` or `DELETE`, or custom headers like `Authorization`. In Express, you handle preflights using `app.options('*', cors(options))` placed before any authentication or route handlers so the browser receives an immediate approval handshake."

2. What is the difference between `allowedHeaders` and `exposedHeaders` in Express CORS, and what happens when custom headers like `X-Total-Count` are not exposed?

**Deep explanation:** While both options configure HTTP headers in CORS, they govern opposite directions of the communication lifecycle and resolve different browser security boundaries:

- **`allowedHeaders` (`Access-Control-Allow-Headers`):**
  - **Direction:** Client request $\rightarrow$ Server.
  - **Purpose:** Used during the preflight handshake to specify which HTTP headers the frontend client is permitted to include in cross-origin requests.
  - **Default:** By default, browsers only permit CORS-safelisted request headers (`Accept`, `Accept-Language`, `Content-Language`, and basic `Content-Type` values). If a client sends custom headers such as `Authorization`, `X-Api-Key`, or `Content-Type: application/json`, the backend must explicitly declare them:
  ```javascript
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
  ```

- **`exposedHeaders` (`Access-Control-Expose-Headers`):**
  - **Direction:** Server response $\rightarrow$ Client.
  - **Purpose:** Specifies which headers in the server's HTTP response the browser's JavaScript environment (such as `fetch()` or `XMLHttpRequest`) is permitted to access.
  - **Default:** By default, browsers restrict frontend script access to only CORS-safelisted response headers: `Cache-Control`, `Content-Language`, `Content-Length`, `Content-Type`, `Expires`, `Last-Modified`, and `Pragma`.
  - **The Missing Header Bug:** If an Express server attaches custom response headers (such as pagination metadata like `res.setHeader("X-Total-Count", 250)`), the browser receives the header in network traffic, but `response.headers.get("X-Total-Count")` evaluates to `null` in client-side code unless explicitly exposed by the backend:
  ```javascript
  app.use(cors({
    exposedHeaders: ["X-Total-Count", "X-RateLimit-Remaining"]
  }));
  ```

**Interview answer:** "`allowedHeaders` defines which request headers the client is permitted to send to the server during a preflight handshake, whereas `exposedHeaders` whitelists which server response headers client JavaScript is allowed to read. Without `exposedHeaders`, custom headers like `X-Total-Count` will return `null` in the browser despite being transmitted across the network."
