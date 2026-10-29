1. What is the fundamental difference between side-effect CSS imports and CSS Modules in TypeScript, and how can CSS Modules be strictly typed?

**Deep explanation:** In modern web development, stylesheets are imported in two fundamentally different ways:
1. **Side-Effect Imports (`import './globals.css'`):** These imports do not produce a JavaScript object or expose local identifiers. Instead, bundlers process the CSS file globally or append it into the document head. Because no values are imported into the JS scope, an empty ambient declaration `declare module "*.css";` suffices.
2. **CSS Modules (`import styles from './Button.module.css'`):** CSS Modules scope class names locally by transforming selectors into unique hashes (e.g., `.button` becomes `.Button_button__a1b2c`). The bundler transforms the CSS file into a JavaScript module that exports an object mapping original class names (as keys) to their scoped hash strings (as values).

If a project only uses a generic ambient module declaration:
```typescript
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```
TypeScript will treat any property access on `styles` (e.g., `styles.btnPrimary`) as a `string`. While this avoids compiler errors, the catch-all string index signature allows typos (e.g., `styles.btnPr1mary`) to pass undetected at compile time, leading to silent UI styling bugs.

To achieve strict type safety:
- **Dedicated Typings Generators:** Tools like `typed-css-modules`, `@teamsupercell/typings-for-css-modules-loader`, or Vite plugins like `vite-plugin-sass-dts` watch CSS/SCSS files and auto-generate adjacent `.module.css.d.ts` files containing exact string literal union types (e.g., `export const primaryBtn: string;`).
- **Language Service Plugins:** Plugins such as `typescript-plugin-css-modules` plug into the IDE's TypeScript language server to parse CSS class names on the fly, providing autocomplete and highlighting invalid class names directly in the editor without generating extra files on disk.

**Interview answer:** "Side-effect CSS imports apply global styles with no imported values, requiring only `declare module '*.css'`, whereas CSS Modules export an object mapping class names to scoped hash strings. While a generic `Record<string, string>` declaration silences errors, strict type safety requires generating dedicated `.module.css.d.ts` files or using TS language service plugins to validate class names at compile time."
