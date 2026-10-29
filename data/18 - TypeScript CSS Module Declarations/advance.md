1. How does `tsconfig.json` resolve global declaration files, how do frameworks handle asset typings, and why is restarting the TS server often necessary after adding a `.d.ts` file?

**Deep explanation:** For TypeScript to recognize an ambient declaration file such as `src/types/css.d.ts`, the file must be included within the compiler's compilation context defined in `tsconfig.json`:
- **`include` and `files`:** Most projects include source files via `"include": ["src/**/*"]`. If `css.d.ts` is inside the `src` directory and does not contain top-level `import` or `export` statements (which would turn it into an isolated ES module rather than an ambient script), its declarations are applied globally across the entire project.
- **`typeRoots` and `types`:** By default, TypeScript discovers all packages within `node_modules/@types`. If `"typeRoots"` is explicitly configured (e.g., `["./node_modules/@types", "./src/types"]`), it must include custom declaration paths, or TypeScript will bypass them. Similarly, setting an explicit `"types"` array restricts global inclusion to only the listed packages, ignoring unlisted declarations.

**Framework Integration:** Modern frontend frameworks pre-configure these ambient asset declarations so developers rarely need to write them manually:
- **Vite:** Generates `src/vite-env.d.ts` containing `/// <reference types="vite/client" />`, which includes built-in ambient declarations for `*.css`, `*.module.css`, SVGs, and images.
- **Next.js:** Automatically creates and updates `next-env.d.ts` containing `/// <reference types="next" />`, which defines global module definitions for CSS Modules and image imports.

**Why Restarting the TS Server is Required:** The TypeScript Language Server (`tsserver`) running inside editors like VS Code caches the project's dependency graph, abstract syntax trees (ASTs), and ambient symbol tables in memory for performance. When a new `.d.ts` file is manually created on disk or `tsconfig.json` paths are modified:
1. File watcher latency or restrictive cache boundaries may prevent the server from immediately integrating the new ambient types into its global scope.
2. In-memory diagnostic caches continue to flag the import with `ts(2882)` or `ts(2307)`.
Executing **TypeScript: Restart TS Server** (`Ctrl + Shift + P`) restarts the language service process, forcing a full scan of `tsconfig.json`, invalidating stale caches, and registering the new ambient declarations.

**Interview answer:** "A declaration file like `css.d.ts` is recognized only if it falls under the `include` or `typeRoots` globs in `tsconfig.json` as an ambient script without top-level imports or exports. Restarting the TS Server is often necessary because the language server caches project symbol graphs in memory, and a restart forces it to reload `tsconfig.json` and index newly added `.d.ts` files."
