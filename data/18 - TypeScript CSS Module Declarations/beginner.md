1. Why does TypeScript report an error when importing CSS files, and how do ambient module declarations resolve this issue?

**Deep explanation:** TypeScript is fundamentally a static type checker designed to analyze ECMAScript modules, JavaScript, and TypeScript files (`.ts`, `.tsx`, `.js`, `.jsx`). By default, its module resolution algorithm does not recognize non-JavaScript assets such as `.css`, `.scss`, `.png`, or `.svg`. In contrast, modern bundlers (such as Webpack, Vite, and Next.js) utilize loaders and plugins to intercept these asset imports and bundle or inject them into the DOM at build/runtime.

Because the TypeScript compiler (`tsc`) runs independently of bundler transforms, encountering a side-effect import like `import './globals.css'` causes TypeScript to attempt to resolve `./globals.css.ts`, `./globals.css.d.ts`, or other supported extensions. When none is found, it raises error `ts(2882)` ("Cannot find module or type declarations for side-effect import...") or `ts(2307)` ("Cannot find module...").

To resolve this, developers use **ambient module declarations** inside a global type declaration file (e.g., `src/types/css.d.ts` or `src/globals.d.ts`):
```typescript
declare module "*.css";
```
This ambient declaration informs TypeScript that any module specifier matching the wildcard pattern `*.css` represents a valid module. Because no exports are defined inside the block, TypeScript permits side-effect imports (`import './globals.css'`) without emitting type errors, bridging the gap between TypeScript's static analysis and the bundler's runtime behavior.

**Interview answer:** "TypeScript only resolves JavaScript and TypeScript files by default, so it cannot resolve CSS asset imports processed by bundlers without explicit typing. Adding an ambient declaration like `declare module '*.css'` in a `.d.ts` file instructs the compiler that any CSS import is a valid module, satisfying type checking for side-effect imports."
