1. How does Bun's native environment variable handling compare to Node.js workflows (such as `dotenv`), and how should developers manage type-safe environment configurations?

**Deep explanation:** In traditional Node.js applications, reading environment variables from `.env` files requires external libraries such as `dotenv` or `dotenv-expand` (e.g., calling `require('dotenv').config()`), or passing Node 20's CLI flag `--env-file=.env`. Without these utilities, Node.js only reflects variables already exported into the operating system shell.

Bun re-architects environment handling by integrating automatic `.env` discovery and parsing directly into the runtime core:
- **Automatic Multi-Stage Resolution:** Bun natively parses and loads `.env` files upon boot without external packages. It adheres to an automatic cascading precedence: `.env.local` (local developer overrides) overrides `.env.[NODE_ENV]` (e.g., `.env.production` or `.env.development`), which in turn overrides the base `.env` file. Both `process.env` and `Bun.env` are pre-populated before the first line of application code executes.
- **Eliminating Boilerplate:** Because Bun manages `.env` loading internally, packages like `dotenv` become redundant and introduce unnecessary overhead in Bun projects.
- **Type Safety and IDE Integration:** By default, TypeScript types index signatures on `process.env` as `string | undefined`. To ensure compile-time safety and prevent runtime errors when accessing custom tokens (like `process.env.EVALUATOR_RESET_TOKEN`), developers should use TypeScript ambient declaration merging:
  ```typescript
  declare global {
    namespace NodeJS {
      interface ProcessEnv {
        EVALUATOR_RESET_TOKEN: string;
      }
    }
  }
  ```
  In production systems, pairing ambient typings with schema validation libraries (such as Zod or Valibot) at startup ensures that missing or malformed environment variables trigger fast-fail errors before traffic reaches application endpoints.

**Interview answer:** "Unlike traditional Node.js where third-party packages like `dotenv` are necessary to load `.env` files, Bun natively loads and cascades `.env` files out-of-the-box before execution begins. For type safety and stability, developers should combine `process.env` with TypeScript ambient interface declarations and runtime schema validation to ensure required environment variables are present and correctly typed."
