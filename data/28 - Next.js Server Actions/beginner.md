1. What are Next.js Server Actions, what does the `'use server'` directive signify, and how does Next.js handle them under the hood?

**Deep explanation:** Next.js Server Actions are asynchronous functions that execute exclusively on the server, designed to handle data mutations, form submissions, and server-side logic directly from React components without requiring manual API route handlers (`/api/*`). The `'use server'` directive can be placed at the top of an entire file to mark all exported functions as Server Actions, or inside an async function body within a Server Component to mark that individual function as a Server Action.

Under the hood, Next.js does not treat Server Actions as ordinary function calls. At build and compilation time, the Next.js bundler identifies functions marked with `'use server'`, extracts their server-side implementation from client bundles, and automatically generates an encrypted, hashed Remote Procedure Call (RPC) endpoint. When a client component or form triggers a Server Action:
- The browser dispatches an HTTP `POST` request to the current URL with specific internal headers (e.g., `Next-Action` header containing the action ID).
- Arguments passed to the action (such as native `FormData` or serialized JavaScript objects) are transmitted in the request body as `multipart/form-data` or JSON.
- The server decodes the action ID, routes the request to the compiled server function, executes the logic (e.g., database writes, third-party API mutations), and returns serialized result data or updated Server Component UI payloads.

This abstraction bridges the client-server boundary seamlessly while preventing server secrets, database credentials, and backend logic from ever leaking into the client JavaScript bundle.

**Interview answer:** "Next.js Server Actions are asynchronous server-side functions defined with the `'use server'` directive that allow components to perform mutations without manual API route boilerplate. Under the hood, Next.js compiles them into secure HTTP POST-based RPC endpoints, automatically managing serialization and keeping database and backend logic out of client bundles."