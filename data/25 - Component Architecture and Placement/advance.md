1. Why does Next.js recommend "pushing Client Components to the leaves" of the component tree, and how do you compose Server and Client Components to preserve zero-bundle benefits?

**Deep explanation:** In React Server Components, the `'use client'` directive is contagious down the import graph: when a file contains `'use client'`, all modules and subcomponents imported into that file automatically become part of the client bundle, even if those child components do not use client features. 

If developers place `'use client'` high up in the component tree (such as on a root layout or a data-heavy container), the entire tree underneath that boundary is pulled into the browser bundle. This negates the zero-bundle advantage, bloats bundle size with libraries that could have run on the server, and prevents child components from making direct server-side database queries.

**The "Push to the Leaves" Architectural Pattern:**
To maintain an optimal balance between performance and interactivity, developers should keep top-level page components, layouts, data-fetching layers, and static UI as Server Components. Interactivity is isolated into small, focused leaf components at the edges of the component tree (e.g., an interactive `LikeButton`, `SearchInput`, or `AddToCartButton`).

**Composition Strategy (Passing Server Components as Children/Props):**
While a Client Component cannot directly `import` a Server Component (doing so converts the imported component into a Client Component), you can compose them by passing Server Components as `children` or JSX props from an outer Server Component:

```tsx
// app/dashboard/page.tsx (Server Component by default)
import InteractiveModal from './InteractiveModal'; // Client Component ('use client')
import ServerDataFeed from './ServerDataFeed';   // Server Component (queries DB)

export default function DashboardPage() {
  return (
    <InteractiveModal>
      {/* Passed as a child slot; executed and rendered entirely on the server */}
      <ServerDataFeed /> 
    </InteractiveModal>
  );
}
```

In this pattern:
- `DashboardPage` (Server) imports and runs `ServerDataFeed` on the server, querying the database directly with zero client JS.
- `InteractiveModal` (Client) manages client state (such as open/close visibility or animations) and receives the pre-rendered RSC output of `ServerDataFeed` via its `children` prop.
- The heavy server logic remains isolated on the server, and only the minimal JavaScript required for the modal interaction ships to the client.

**Interview answer:** "Pushing Client Components to the leaves prevents the `'use client'` boundary from pulling entire subtrees and unnecessary libraries into the client bundle. When an interactive client container must wrap server-rendered content, you should pass the Server Component as a `children` prop from a parent Server Component rather than importing it directly into the client file."