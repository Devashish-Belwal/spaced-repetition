1. Why does React state—including state distributed through React Context—reset when a user reloads the browser page, and how does the browser lifecycle contrast with SPA client-side navigation?

**Deep explanation:** React state (`useState`, `useReducer`) and React Context exist exclusively in the client-side JavaScript execution environment's volatile heap memory (RAM). When a user navigates between views using client-side routing (e.g., React Router's `useNavigate` or Next.js `<Link>`), the browser does not request a new document; JavaScript intercepts the transition using the HTML5 History API (`pushState`/`replaceState`), retaining the existing JavaScript runtime, component memory tree, and active Context providers.

In contrast, a browser page reload (hard navigation) triggers the browser's full document lifecycle:
1. **Teardown & Unload:** The browser destroys the current execution context, unloads the JavaScript virtual machine (V8/SpiderMonkey), clears allocated heap memory, and disposes of the entire Document Object Model (DOM).
2. **Document Fetch & Recompilation:** The browser initiates an HTTP GET request for the HTML document, parses the returned markup, downloads bundled JavaScript assets, and launches a fresh JavaScript runtime.
3. **Component Mounting:** React initializes from scratch. Root providers and child components execute with their default initial state values (e.g., `useState(initialValue)`). 

React Context is strictly an in-memory transport mechanism designed to avoid prop drilling within an active component tree during a single runtime session. It is not a persistence layer or database; it has no native capability to serialize or survive browser environment disposal.

**Interview answer:** "React state and Context live entirely in the browser's volatile heap memory, which is completely destroyed and reinitialized whenever a full page reload tears down the JavaScript runtime. Context is simply an in-memory dependency injection mechanism, not a persistence engine, so any data not synchronized to external storage resets to its initial state upon reload."
