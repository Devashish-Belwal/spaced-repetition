1. How does the composition pattern (using `children` or render props) allow Server Components to be nested inside Client Components?

**Deep explanation:** To nest server-rendered content inside interactive Client Components without violating the module boundary, React relies on the **composition pattern** (also called slotting or inversion of control). Instead of having the Client Component directly import the Server Component, a parent Server Component imports both and passes the Server Component as a prop—typically `children` or named slots.

```tsx
// Server Component (e.g., app/dashboard/page.tsx)
import ClientCollapsibleSection from "./ClientCollapsibleSection";
import ServerAnalyticsFeed from "./ServerAnalyticsFeed";

export default function Page() {
  return (
    <ClientCollapsibleSection>
      <ServerAnalyticsFeed />
    </ClientCollapsibleSection>
  );
}
```

```tsx
// Client Component (ClientCollapsibleSection.tsx)
"use client";
import { useState } from "react";

export default function ClientCollapsibleSection({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="collapsible-card">
      <button onClick={() => setIsOpen(!isOpen)}>Toggle Details</button>
      {isOpen && <div className="content">{children}</div>}
    </div>
  );
}
```

**Key mechanisms of this pattern:**
- **Decoupled Dependencies:** `ClientCollapsibleSection` has no static import of `ServerAnalyticsFeed`. Its only dependency is on the generic `children` prop (`React.ReactNode`). Therefore, `ServerAnalyticsFeed` is never bundled into the client code.
- **Evaluation Lifecycle:** The parent Server Component evaluates first on the server. It executes `ServerAnalyticsFeed`, performs any server-side data fetching, and resolves the element tree. The resulting rendered output is passed into `ClientCollapsibleSection`.
- **Arbitrary Slots:** This pattern is not limited to `children`. Any prop can accept a Server Component (e.g., `<ClientLayout header={<ServerHeader />} sidebar={<ServerSidebar />} />`), allowing complex layouts with interactive shells and server-rendered contents.

**Interview answer:** "You can render Server Components inside Client Components by passing them as `children` or prop slots from a parent Server Component. This decouples the modules so the Client Component only receives already-rendered React elements, preventing the Server Component from being bundled into client-side JavaScript."