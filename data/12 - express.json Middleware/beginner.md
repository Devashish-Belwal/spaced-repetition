1. What is the `express.json()` middleware, why is it necessary to access `req.body`, and how does it process data at the Node.js stream level?

**Deep explanation:** In Node.js, an incoming HTTP request is represented as an instance of `http.IncomingMessage`, which implements the `stream.Readable` interface. Data sent by the client (such as a POST or PUT payload) does not arrive all at once; it arrives across the network as asynchronous binary chunks (`Buffer`s) emitted via `'data'` and `'end'` events. Because Express is designed to be minimal and unopinionated, it does not buffer or parse the incoming request body by default. Without body-parsing middleware, `req.body` is `undefined`.

`express.json()` (a built-in middleware based on `body-parser`, re-introduced in Express 4.16+) bridges this gap:
- **Stream consumption:** It listens to the incoming stream data chunks, accumulates them into a single buffer, and tracks total byte length.
- **Header inspection:** It checks the `Content-Type` header of the request; if it matches `application/json`, it decodes the buffered bytes using the specified character encoding (defaulting to UTF-8).
- **Deserialization:** It runs `JSON.parse()` on the accumulated string.
- **Attachment:** Upon successful parsing, it assigns the resulting JavaScript object to `req.body` and invokes `next()` so downstream route handlers can access the structured payload directly.

**Interview answer:** "In Node.js, HTTP request bodies arrive as asynchronous stream chunks of raw binary data. `express.json()` is middleware that buffers these stream chunks, deserializes the JSON payload using `JSON.parse()`, and populates `req.body` with the resulting JavaScript object; without it, `req.body` remains `undefined`."