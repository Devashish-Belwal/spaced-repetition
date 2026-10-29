1. How are incoming and outgoing messages handled in `ws`, and why does the `'message'` event provide raw `Buffer` instances by default?

**Deep explanation:** The WebSocket protocol transmits data divided into discrete binary or text frames governed by opcodes (e.g., `0x1` for text, `0x2` for binary data, `0x8` for close, `0x9` for ping, `0xA` for pong). 

In `ws` (version 8+), the listener `ws.on('message', (data, isBinary) => ...)` passes incoming data as a Node.js `Buffer` (or an array of `Buffer` chunks if fragmented) rather than automatically coercing it to a JavaScript UTF-8 string:
- **Zero-Copy Performance:** Converting network bytes into a JavaScript V8 string requires UTF-8 validation and memory allocation. Defaulting to raw `Buffer` enables zero-copy operations, allowing high-throughput applications handling binary data (such as Protobufs, MessagePack, audio/video streams, or raw byte arrays) to process payloads without unnecessary CPU overhead.
- **Explicit Deserialization:** To handle standard text or JSON payloads, developers must explicitly decode the buffer:
  ```javascript
  ws.on('message', (data, isBinary) => {
    const messageString = isBinary ? data : data.toString('utf-8');
    try {
      const payload = JSON.parse(messageString);
      console.log('Received payload:', payload);
    } catch (err) {
      console.error('Malformed JSON received:', err);
    }
  });
  ```

For outgoing messages:
- `ws.send(data[, options][, callback])` accepts a string, `Buffer`, `ArrayBuffer`, or typed array view.
- WebSockets provide no native serialization layer; transmitting structured objects requires calling `JSON.stringify(object)` prior to sending.
- **Client vs Server Frame Masking:** RFC 6455 mandates that all frames sent from client to server **must** be masked using a 32-bit masking key to protect intermediate proxy caches against cache-poisoning attacks. Frames sent from server to client **must not** be masked. The `ws` library manages server-side unmasking and transmission automatically.
- **Backpressure and Buffering:** If the underlying TCP socket write buffer is saturated, `ws.send()` buffers frames in Node.js process memory. Developers can monitor `ws.bufferedAmount` (the number of bytes queued but not yet transmitted) to implement backpressure controls and prevent out-of-memory errors during bursts.

```javascript
// Outgoing transmission example
const payload = JSON.stringify({ type: 'CHAT_MESSAGE', text: 'Hello World' });

ws.send(payload, (error) => {
  if (error) {
    console.error('Failed to deliver message frame:', error);
  }
});
```

**Interview answer:** "In `ws`, message events emit raw `Buffer` objects by default to maximize throughput and avoid the CPU and memory overhead of automatic UTF-8 string conversions for binary streams. Sending messages requires passing a string or Buffer into `ws.send()`, meaning structured objects must be serialized via `JSON.stringify()`, while frame masking and framing protocol compliance are handled under the hood."

2. How does the browser's native WebSocket client interact with a `ws` backend, and how do client-side message parsing, binary types, and reconnection strategies differ from Node.js?

**Deep explanation:** In the browser, WebSockets are supported natively via the W3C/WHATWG `WebSocket` API without requiring third-party libraries. While `ws` in Node.js operates as an `EventEmitter`, the browser WebSocket implements the standard DOM `EventTarget` interface.

### Client Lifecycle and Event Handling
```javascript
const socket = new WebSocket('ws://localhost:3000/ws');

// Triggered when HTTP 101 Switching Protocols completes
socket.onopen = (event) => {
  console.log('Connected to server');
  socket.send(JSON.stringify({ type: 'GREETING', text: 'Hello Server!' }));
};

// Receiving messages
socket.onmessage = (event) => {
  // In the browser, event.data is already decoded into a string for text frames
  const message = JSON.parse(event.data);
  console.log('Received from server:', message);
};

// Handling connection errors
socket.onerror = (event) => {
  // Browsers intentionally conceal detailed network error reasons for security
  console.error('WebSocket error encountered');
};

// Handling disconnection
socket.onclose = (event) => {
  console.log(`Disconnected: clean=${event.wasClean}, code=${event.code}, reason=${event.reason}`);
};
```

### Key Behavioral Differences Between Browser and Node.js (`ws`):
- **String Decoding:** In the browser, text frames are automatically decoded into a JavaScript UTF-8 string available on `event.data`. In `ws`, `'message'` emits a raw Node.js `Buffer`.
- **Binary Data Handling:** When receiving binary data (`opcode 0x2`), the browser defaults to wrapping the payload in a `Blob`. If binary manipulation is required, developers set `socket.binaryType = 'arraybuffer'` before receiving messages, delivering an `ArrayBuffer` on `event.data`.
- **Automatic Pong Handling:** Browsers handle protocol-level `Ping` frames (`0x9`) in the browser engine networking layer, automatically returning a `Pong` (`0xA`) without exposing ping events to JavaScript application code.

### Client-Side Reconnection Strategy
The native browser WebSocket API does **not** automatically reconnect when the connection drops or the server restarts. A robust production client must implement reconnection with **exponential backoff** and **jitter** to avoid the "thundering herd" problem when a server recovers:

```javascript
class ResilientWebSocket {
  constructor(url) {
    this.url = url;
    this.reconnectAttempts = 0;
    this.maxDelay = 30000;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onclose = (e) => {
      if (e.code !== 1000) { // Do not reconnect on intentional clean close
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.ws.close();
    };
  }

  scheduleReconnect() {
    // Exponential backoff: 1s, 2s, 4s, 8s... capped with random jitter
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxDelay);
    const jitter = delay * 0.2 * Math.random();
    const totalDelay = delay + jitter;

    console.log(`Reconnecting in ${Math.round(totalDelay)}ms...`);
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), totalDelay);
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }
}
```

**Interview answer:** "The browser uses the native `EventTarget` WebSocket API where incoming text messages are automatically decoded as strings rather than Buffers, and ping/pong heartbeats are handled automatically by the browser engine. Because native browser WebSockets do not auto-reconnect, production frontends must implement exponential backoff with jitter on `onclose` to reconnect cleanly without overloading the server."
