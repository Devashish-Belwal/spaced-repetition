1. How do you implement broadcasting in `ws`, and why is verifying `readyState` critical when iterating over `wss.clients`?

**Deep explanation:** Unlike higher-level socket frameworks like Socket.IO, `ws` is a minimalist, low-level protocol implementation. It does not provide built-in abstractions such as rooms, namespaces, or an automatic `broadcast()` method. Instead, broadcasting is implemented manually using the `wss.clients` collection.

`wss.clients` is a native JavaScript `Set<WebSocket>` that automatically tracks all active, open, and connecting WebSocket instances connected to the `WebSocketServer`.

### 1. Broadcasting to All Connected Clients
To broadcast a message to every connected client:
```javascript
function broadcastToAll(wss, data) {
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}
```

### 2. Broadcasting to Everyone Else (Excluding Sender)
In chat and collaborative editing applications, updates typically must be dispatched to all peers except the client that initiated the action:
```javascript
function broadcastToOthers(wss, senderWs, data) {
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  for (const client of wss.clients) {
    if (client !== senderWs && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}
```

### Why Checking `client.readyState === WebSocket.OPEN` Is Critical
A WebSocket instance transitions through four discrete states represented by integer constants on `WebSocket`:
- `WebSocket.CONNECTING` (`0`): Connection handshake in progress; calling `send()` queues data or throws an error.
- `WebSocket.OPEN` (`1`): Connection established and ready for communication.
- `WebSocket.CLOSING` (`2`): Closing handshake in progress.
- `WebSocket.CLOSED` (`3`): Connection closed or failed.

If a client abruptly disconnects or begins a closing handshake, its instance remains in `wss.clients` until the `'close'` event finalizes removal from the set. Attempting to call `client.send()` on a socket whose `readyState` is `CLOSING` or `CLOSED` throws an unhandled exception (`Error: WebSocket is not open: readyState 2/3`), which can crash the Node.js event loop if unhandled.

### Performance and Scaling Considerations
- **Pre-serialization:** When broadcasting JSON, invoke `JSON.stringify()` **once** before entering the loop rather than inside each iteration to prevent redundant serialization across hundreds or thousands of clients.
- **Horizontal Scaling Limit:** Because `wss.clients` is stored in the local Node.js process heap memory, broadcasting across a cluster or multiple server instances requires an external publish/subscribe message broker (such as Redis Pub/Sub, RabbitMQ, or NATS) to relay messages between server instances.

**Interview answer:** "`ws` maintains connected sockets in a `wss.clients` set, requiring manual iteration to broadcast messages either globally or by excluding the sender with `client !== senderWs`. Checking `client.readyState === WebSocket.OPEN` before calling `send()` is mandatory because sending data on closing or closed sockets throws fatal runtime exceptions."

2. What is the WebSocket connection state machine, and what is the key behavioral difference between `ws.close()` and `ws.terminate()`?

**Deep explanation:** The WebSocket connection lifecycle is defined by a strict state machine implemented through the `ws.readyState` property:
1. `WebSocket.CONNECTING` (`0`): The TCP socket has connected, and the HTTP `101 Switching Protocols` handshake is currently underway.
2. `WebSocket.OPEN` (`1`): Handshake completed; bidirectional framing is operational. The socket is tracked inside `wss.clients`.
3. `WebSocket.CLOSING` (`2`): A close frame has been initiated by either client or server, and the connection is waiting for the reciprocal close frame.
4. `WebSocket.CLOSED` (`3`): The underlying TCP stream is fully destroyed, and resources are deallocated. The socket is purged from `wss.clients`.

```
[ CONNECTING (0) ] ---> [ OPEN (1) ] ---> [ CLOSING (2) ] ---> [ CLOSED (3) ]
         \                                                            ^
          \------------------- (ws.terminate) -----------------------/
```

### `ws.close([code, [reason]])` (Graceful Closure)
`ws.close()` triggers a clean, standard-compliant closure protocol according to RFC 6455:
- It transmits an `opcode 0x8` close control frame containing an optional status code (e.g., `1000` for Normal Closure, `1001` for Going Away, `1008` for Policy Violation) and a UTF-8 reason string.
- Immediately shifts `readyState` to `WebSocket.CLOSING` (`2`).
- Allows any outbound message frames currently buffered in flight to finish transmitting.
- Waits for the peer to acknowledge with a reciprocal close frame before closing the TCP socket, emitting the `'close'` event:
  ```javascript
  ws.on('close', (code, reason) => {
    console.log(`Socket closed cleanly: code=${code}, reason=${reason.toString()}`);
  });
  ```

### `ws.terminate()` (Hard Kill)
`ws.terminate()` bypasses the RFC close frame handshake entirely:
- It immediately invokes `socket.destroy()` on the underlying TCP stream.
- In-flight buffers and pending frames are discarded instantly without waiting for network acknowledgments.
- Shifts `readyState` directly to `WebSocket.CLOSED` (`3`) and emits `'close'` with code `1006` (Abnormal Closure).

### Error Handling Requirement
Every WebSocket instance **must** have an attached `'error'` listener:
```javascript
ws.on('error', (err) => {
  console.error('WebSocket client error:', err);
});
```
Because `WebSocket` inherits from Node.js `EventEmitter`, an unhandled `'error'` event emitted during a network fault, TCP reset, or frame parsing failure will throw an uncaught exception, immediately terminating the entire Node.js server process.

**Interview answer:** "`ws.close()` performs a graceful teardown by sending an RFC close control frame, flushing queued frames, and awaiting reciprocal peer acknowledgment before closing the TCP socket. In contrast, `ws.terminate()` immediately destroys the underlying TCP socket without a handshake, which is essential for terminating unresponsive or zombie connections."
