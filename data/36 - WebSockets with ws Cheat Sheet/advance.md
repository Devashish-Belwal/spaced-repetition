1. How does the WebSocket protocol establish a full-duplex connection over HTTP, and how do you integrate the `ws` library with an existing Express HTTP server on the same port?

**Deep explanation:** The WebSocket protocol (RFC 6455) provides persistent, low-latency, full-duplex bidirectional communication over a single TCP connection. Rather than creating a raw TCP socket directly, the connection initiates as a standard HTTP/1.1 request known as the **HTTP Upgrade handshake**.
- The client sends an HTTP GET request containing dedicated upgrade headers:
  ```http
  GET /chat HTTP/1.1
  Host: example.com
  Upgrade: websocket
  Connection: Upgrade
  Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
  Sec-WebSocket-Version: 13
  ```
- If the server accepts the connection, it responds with an HTTP status code `101 Switching Protocols`:
  ```http
  HTTP/1.1 101 Switching Protocols
  Upgrade: websocket
  Connection: Upgrade
  Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
  ```
- After this exchange, the underlying TCP socket transitions away from HTTP request-response semantics into WebSocket framing semantics, remaining open for bidirectional message frames until explicitly closed.

In Node.js, the `ws` library can run as a standalone server (`new WebSocketServer({ port: 8080 })`), which spins up its own internal Node.js HTTP server. However, in production architectures, applications typically need to serve REST APIs or static files via Express while sharing the exact same port (e.g., 3000 or 443) for WebSockets.

To integrate `ws` with Express without port conflicts:
1. Create a native HTTP server wrapping the Express application instance using `http.createServer(app)`.
2. Instantiate `WebSocketServer` with `{ noServer: true }`, which instructs `ws` not to create or bind to its own HTTP server.
3. Listen to the native HTTP server's `'upgrade'` event. This event fires whenever an incoming HTTP request includes `Connection: Upgrade`.
4. Inspect the request URL path or headers (e.g., parsing query parameters, validating JWTs, or checking session cookies on `req`).
5. If valid, invoke `wss.handleUpgrade(request, socket, head, (ws) => { wss.emit('connection', ws, request); })`. If invalid, immediately terminate the raw TCP stream with `socket.destroy()`.

```javascript
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const app = express();
const server = http.createServer(app);

// noServer: true prevents ws from auto-binding to a port or server
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  // URL path routing and authentication guard
  if (pathname === '/ws') {
    // wss.handleUpgrade completes the 101 Switching Protocols handshake
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    // Reject unauthorized paths or failed auth by tearing down the raw socket
    socket.destroy();
  }
});

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`Client connected from ${ip}`);
});

server.listen(3000, () => console.log('Server running on port 3000'));
```

**Interview answer:** "WebSockets establish full-duplex communication via an initial HTTP/1.1 handshake returning a `101 Switching Protocols` response, after which the underlying TCP socket switches to bidirectional framing. To share a single port with Express, instantiate `WebSocketServer` with `noServer: true` and intercept the native HTTP server's `'upgrade'` event, authenticating and routing the request before delegating to `wss.handleUpgrade`."

2. What causes "zombie connections" in WebSockets, and how does the Ping/Pong heartbeat mechanism prevent resource exhaustion in `ws`?

**Deep explanation:** In production TCP networking, a connection can become "half-open" or a **zombie connection**. This occurs when an endpoint silently drops off the network without sending a TCP FIN/RST packet or a WebSocket close frame—such as when a client loses Wi-Fi, enters an elevator, experiences an OS crash, or a mobile device switches towers.

Because TCP was designed to survive transient routing outages, the operating system kernel and Node.js process keep the server-side socket open indefinitely (or until an OS-level TCP keepalive timeout triggers after several hours). 

### Consequences of Zombie Sockets
- **Memory and File Descriptor Leaks:** Zombie sockets linger indefinitely in `wss.clients`, keeping memory allocated for buffers and consuming OS file descriptors.
- **Silent Message Drops:** The server continues iterating over dead sockets and calling `client.send()`, buffering frames into kernel memory that will never be acknowledged.
- **Inaccurate Metrics:** `wss.clients.size` reports hundreds or thousands of phantom connected users.

### The RFC 6455 Ping/Pong Heartbeat Pattern
The WebSocket specification defines two lightweight control frames:
- **Ping (`opcode 0x9`):** A heartbeat probe sent by either party.
- **Pong (`opcode 0xA`):** A mandatory response frame sent immediately upon receiving a Ping. In RFC compliance, WebSockets engines (both browser native clients and `ws`) automatically send a Pong when receiving a Ping.

### Idiomatic `ws` Heartbeat Implementation
Because dead sockets cannot respond, the server implements an active heartbeat monitor:
1. Mark each newly connected socket with an `isAlive = true` flag.
2. Listen for the native `'pong'` event on each socket to reset `isAlive = true`.
3. Run a recurring `setInterval` (e.g., every 30 seconds):
    - If `client.isAlive === false`, the socket missed the previous heartbeat window; terminate it immediately using `client.terminate()` (never `client.close()`, since an unresponsive peer cannot complete a graceful handshake).
    - If `client.isAlive === true`, mark `client.isAlive = false` and send a protocol probe using `client.ping()`.
4. Clear the interval when the server shuts down via `wss.on('close', ...)`.

```javascript
import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  // Browser automatically replies to ping with a pong frame
  ws.on('pong', heartbeat);
  
  ws.on('error', console.error);
});

const interval = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) {
      console.warn('Terminating unresponsive zombie connection');
      ws.terminate(); // Hard teardown
      continue;
    }

    ws.isAlive = false;
    ws.ping(); // Sends opcode 0x9 ping frame
  }
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});
```

**Interview answer:** "Zombie connections occur when a client abruptly loses network connectivity without sending a TCP FIN or close frame, leaving the server-side socket open indefinitely. We prevent resource exhaustion by running an active ping/pong heartbeat interval: if a client fails to reply with a pong before the next cycle, the server terminates the socket immediately using `ws.terminate()`."
