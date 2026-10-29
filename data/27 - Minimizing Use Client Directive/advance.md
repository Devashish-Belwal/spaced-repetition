1. What architectural patterns allow developers to push "use client" down to the leaves of the tree when client widgets must wrap or position static server layouts?

**Deep explanation:** A common architectural challenge occurs when interactive client components need to act as layouts, wrappers, or providers for static content—such as collapsible sidebars, animated modal dialogs, or theme wrappers. If the client component directly imports the static components, the bundler pulls those static components into the client bundle.

To resolve this, React relies on the **composition pattern using `children` (or other ReactNode props)**:
```tsx
// CollapsibleSidebar.tsx (Client Component)
"use client";
import { useState } from "react";

export function CollapsibleSidebar({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={collapsed ? "collapsed" : "expanded"}>
      <button onClick={() => setCollapsed(!collapsed)}>Toggle Sidebar</button>
      <nav>{children}</nav>
    </aside>
  );
}

// Page.tsx (Server Component)
import { CollapsibleSidebar } from "./CollapsibleSidebar";
import { StaticNavigationLinks } from "./StaticNavigationLinks";

export default function Page() {
  return (
    <CollapsibleSidebar>
      {/* StaticNavigationLinks is rendered on the server with zero client JS */}
      <StaticNavigationLinks />
    </CollapsibleSidebar>
  );
}
```
In this pattern, `Page` is a Server Component that imports both `CollapsibleSidebar` and `StaticNavigationLinks`. The server evaluates and renders `<StaticNavigationLinks />` into React Server Component payload (virtual DOM instructions) on the server. That rendered output is passed to `<CollapsibleSidebar>` as `children`. Because `CollapsibleSidebar` never imports `StaticNavigationLinks`, the static component's source code and dependencies remain strictly on the server, maintaining zero client bundle footprint while enabling rich client-side interactivity.

**Interview answer:** `You can keep static layouts on the server by passing them as children to an interactive client wrapper rather than having the client component directly import them. This allows the server to evaluate static components with zero client bundle impact while the client wrapper manages interactive state.`