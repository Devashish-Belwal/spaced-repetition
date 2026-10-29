1. What is the architectural decision framework for determining whether a component should be a Server Component or a Client Component in React Server Components (RSC) and Next.js App Router, and why is the default paradigm to "Prefer Server"?

**Deep explanation:** In React Server Components (RSC) and the Next.js App Router, component placement follows a systematic decision tree based on component responsibilities:
```
Do I need state?
   ├── Yes → Client Component ('use client')
   └── No
        ↓
Do I need useEffect / context / browser APIs?
        ├── Yes → Client Component ('use client')
        └── No
             ↓
Do I need direct DB access / secrets / server-only APIs?
             ├── Yes → Server Component (default)
             └── No → Prefer Server
```

The baseline guideline is to adopt a **default Server Component mindset**. In Next.js App Router, every component inside the `app` directory is a Server Component unless explicitly marked with the `'use client'` directive. When a component does not strictly require client-side execution, developers should "Prefer Server" because of significant architectural advantages:
- **Zero Client JavaScript Bundle Footprint:** Server Components execute entirely on the server (or at build time for static generation). Their code, imports, and heavy third-party dependencies (e.g., date-fns, markdown parsers, or HTML sanitizers) are never sent over the network to the user's browser. The client receives only a lightweight React Server Component (RSC) payload (a serialized stream representing the virtual DOM structure) alongside rendered HTML.
- **Improved Core Web Vitals:** Less JavaScript over the wire translates directly into lower Total Blocking Time (TBT), faster First Contentful Paint (FCP), and swifter Time to Interactive (TTI), particularly on low-powered mobile devices or high-latency networks.
- **Direct Backend and Secret Access:** Server Components run close to data sources, eliminating client-server network waterfalls, minimizing API latency, and securely utilizing sensitive credentials (database connection strings, private API tokens) without risking client-side exposure.
- **Automatic Code Splitting:** Client Components imported within the tree are automatically code-split into distinct chunks by bundlers like Webpack or Turbopack.

Only when a component requires client-side state, lifecycle side effects, or direct browser interaction should developers opt into the client runtime by adding `'use client'`.

**Interview answer:** "In Next.js App Router, all components default to Server Components to ship zero JavaScript to the browser and execute data fetching close to the backend. You should only opt into `'use client'` when state, lifecycle hooks, context, or browser APIs are strictly required; otherwise, always prefer Server Components to keep client bundles minimal."