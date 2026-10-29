1. How would you diagnose layout thrashing caused by CSS and JavaScript interaction?

**Deep explanation:** Record a performance trace and find repeated style recalculation/layout within a frame. Look for loops that interleave DOM reads such as `getBoundingClientRect()` with writes. Batch reads before writes, cache measurements, schedule visual updates with `requestAnimationFrame`, and reduce affected DOM scope.

**Interview answer:** I profile forced synchronous layouts, locate read-write interleaving, then batch measurements and mutations and verify frame time improves.

2. How would you analyze a page's paint and compositing costs?

**Deep explanation:** Use performance traces, paint flashing, layer tools, and device testing to identify large or frequent paints and excessive layers. Expensive shadows, filters, clipping, and large invalidation regions are common causes. Promote layers selectively because each layer consumes memory and upload bandwidth.

**Interview answer:** I profile paint events and layers, isolate costly effects/invalidation, optimize them, and confirm gains on representative hardware.

3. How can containment and content-visibility improve a long page?

**Deep explanation:** `contain` limits layout, paint, style, or size effects to a subtree, reducing browser work. `content-visibility:auto` can skip rendering offscreen sections while retaining them in the document. Provide `contain-intrinsic-size` to reserve space and avoid scrollbar jumps.

**Interview answer:** Containment narrows invalidation; content-visibility skips offscreen rendering. I reserve intrinsic space and test semantics and navigation.

4. How would you prevent performance optimizations from breaking find-in-page or accessibility?

**Deep explanation:** Prefer browser-aware skipping such as `content-visibility:auto` over removing DOM content. Do not use `display:none`, virtualization, or lazy insertion without testing search, focus, reading order, fragment navigation, and accessibility-tree exposure. Measure performance and functional behavior together.

**Interview answer:** I keep content semantically present where possible and explicitly test find, focus, navigation, and screen-reader access after optimization.

5. How would you design tokens shared across several products and brands?

**Deep explanation:** Separate primitive values from semantic roles and component tokens. Define a versioned schema with modes and brand mappings, platform transforms, ownership, documentation, validation, and deprecation rules. Products consume semantic contracts so brand changes do not leak raw values into components.

**Interview answer:** I use layered, semantic, versioned tokens with brand mappings and governance, keeping components independent of raw brand values.

6. How would you migrate a large stylesheet without unpredictable cascade regressions?

**Deep explanation:** Inventory selectors and dependencies, freeze precedence with explicit cascade layers, and migrate by bounded component or route. Run visual/accessibility tests and compare computed styles on representative states. Compatibility shims should be temporary, observable, and removed through a documented sequence.

**Interview answer:** I establish cascade boundaries, migrate incrementally, compare computed/visual output, and remove compatibility rules once consumers move.

7. How would you isolate styles across microfrontends?

**Deep explanation:** Choose isolation based on integration: Shadow DOM offers a hard styling boundary; CSS Modules/scoped names prevent collisions but still share global inheritance; iframes isolate most strongly at greater integration cost. Coordinate tokens, resets, portals, overlays, and ownership of global styles.

**Interview answer:** I select Shadow DOM, scoped CSS, or iframe isolation by required integration, with a shared token contract and controlled globals.

8. How do Shadow DOM boundaries affect styling and accessibility?

**Deep explanation:** Document selectors do not normally penetrate a shadow root; components expose styling through custom properties, `::part`, and host selectors. Events retarget across the boundary. Accessibility is composed from light and shadow trees, but labeling relationships, focus delegation, and browser/AT support require testing.

**Interview answer:** Shadow DOM encapsulates selectors but not the user experience; I expose intentional style hooks and test composed semantics and focus.

9. How would you define a browser-support policy for newer CSS features?

**Deep explanation:** Base the policy on audience analytics, product risk, accessibility needs, and support cost—not arbitrary browser names alone. Define minimum versions, required fallbacks, and acceptable degradation. Automate compatibility checks and review telemetry periodically as usage changes.

**Interview answer:** I tie support to user data and business risk, document fallback/degradation rules, automate checks, and revisit the policy regularly.

10. How would you use progressive enhancement when a CSS feature is unsupported?

**Deep explanation:** Start with a functional baseline, then layer richer layout or effects. Use `@supports` for feature-dependent rules and design fallbacks that preserve content and actions rather than pixel parity. Test actual behavior because parsing support does not always prove complete interoperability.

**Interview answer:** I deliver a usable baseline and add enhancements behind feature detection, accepting visual degradation but not lost functionality.

11. How would you validate a complex interface using a keyboard and screen reader?

**Deep explanation:** Test major flows with keyboard alone for order, traps, focus visibility, and state changes, then use multiple browser/screen-reader combinations appropriate to users. Inspect the accessibility tree, names, roles, states, landmarks, and live updates. Automated tools supplement but cannot replace task-based manual testing.

**Interview answer:** I test real tasks keyboard-first, then with representative screen readers, inspecting semantics, focus, announcements, and recovery paths.

12. How would you manage focus when content disappears during an asynchronous operation?

**Deep explanation:** Before removal, determine the logical successor: trigger, next item, heading, or stable container. Move focus only when the focused element disappears, announce relevant results via a restrained live region, and prevent focus from falling to `body`. Handle races and cancellation explicitly.

**Interview answer:** If focused content is removed, I move focus to a predictable surviving target and announce the update without stealing focus unnecessarily.

13. How would you make a virtualized data grid accessible?

**Deep explanation:** Virtualization must preserve logical row/column counts, positions, headers, selection, focus, and keyboard navigation despite a partial DOM. Use appropriate grid semantics and ARIA indices, keep the active cell stable, and offer non-virtualized or paginated access if assistive-technology behavior is unreliable.

**Interview answer:** I expose the full logical grid through correct counts, indices, headers, and focus behavior, and provide a robust fallback when needed.

14. How would you support zoom, text resizing, and reflow without losing functionality?

**Deep explanation:** Use flexible dimensions, relative typography, wrapping, and source order that remains logical when columns collapse. At 200% text and 400% browser zoom, avoid two-dimensional scrolling except where intrinsically necessary, and ensure controls, labels, and sticky regions do not overlap or clip.

**Interview answer:** I design fluid reflow, test 200% text and 400% zoom, and ensure every control and piece of content remains reachable.

15. How would you test a design across different writing directions and scripts?

**Deep explanation:** Test real localized strings in RTL and vertical/complex-script scenarios relevant to the product. Use logical properties, allow expansion, validate bidi isolation for mixed content, and check icon direction, truncation, line height, forms, and reading/focus order with native speakers when possible.

**Interview answer:** I test actual locales and scripts, logical layout, bidi behavior, expansion, typography, and interaction order—not merely mirrored English.

16. How would you manage font fallback while preserving layout stability?

**Deep explanation:** Choose fallbacks with similar metrics and tune `size-adjust`, ascent/descent, and line-gap overrides in `@font-face`. Subset and preload only critical fonts, use an appropriate `font-display`, and measure CLS plus readability across scripts. Never depend on one font containing every glyph.

**Interview answer:** I use metric-compatible fallback stacks and font metric overrides, load critical subsets efficiently, and measure layout shift across languages.

17. How would you assess the tradeoffs of CSS-in-JS, CSS modules, and utility classes?

**Deep explanation:** Evaluate runtime cost, SSR/hydration, caching, type/token integration, scoping, composition, debug output, and team workflow. CSS Modules give build-time locality; utilities constrain choices and speed composition; runtime CSS-in-JS enables dynamic co-location but can add execution and ordering complexity. Prototype representative cases.

**Interview answer:** I compare scope, runtime and SSR cost, reuse, theming, tooling, and team maintainability, then choose per product constraints.

18. How would you avoid hydration-related style flicker in a server-rendered application?

**Deep explanation:** Server and client must generate identical markup, style order, class hashes, theme state, and responsive assumptions. Extract critical styles deterministically, serialize user theme before first paint, use nonces consistently, and avoid client-only measurements during initial render. Treat hydration warnings as correctness bugs.

**Interview answer:** I make server/client style generation deterministic and establish theme and critical CSS before paint so hydration does not restyle the page.

19. How would you prioritize critical CSS without duplicating excessive styles?

**Deep explanation:** Identify above-the-fold rules per template from real coverage, inline a small stable critical layer, and load the cacheable full stylesheet without generating divergent copies. Budget inline bytes, deduplicate at build time, and validate across viewport/content variants to avoid brittle route-specific extraction.

**Interview answer:** I inline a measured, budgeted critical subset while keeping one cacheable canonical stylesheet and automated deduplication.

20. How would you diagnose a mobile-only viewport-height bug?

**Deep explanation:** Reproduce on real devices while browser chrome opens/closes, orientation changes, and the keyboard appears. Compare layout, visual, small, large, and dynamic viewport units; inspect fixed/sticky ancestors and safe areas. Prefer `svh`, `lvh`, or `dvh` according to the intended behavior.

**Interview answer:** I test real browser UI transitions, identify which viewport is intended, and replace fragile `100vh` assumptions with suitable modern units.

21. How would you account for safe areas and virtual keyboards on mobile devices?

**Deep explanation:** Use `env(safe-area-inset-*)` with viewport-fit where edge-to-edge rendering requires it. For keyboard-sensitive interfaces, observe the Visual Viewport or supported interactive-widget behavior, keep focused controls visible, and avoid permanently reserving keyboard space. Test orientation and embedded web views.

**Interview answer:** I incorporate safe-area environment insets and adapt to the visual viewport so focused content stays visible above the keyboard.

22. How would you design drag-and-drop interactions that also work without dragging?

**Deep explanation:** Provide buttons or menus to move items, with keyboard-operable source/destination selection and clear announcements. Preserve order semantics, focus, undo, and touch support. Dragging can enhance pointer use but must not be the only path to the operation.

**Interview answer:** I provide a fully operable move/reorder alternative with keyboard controls, status announcements, focus retention, and undo.

23. How would you prevent malicious user HTML from escaping its presentation boundary?

**Deep explanation:** Do not rely on CSS isolation for security. Sanitize with a maintained allowlist, block scripts/event handlers and dangerous URLs, enforce CSP/Trusted Types where applicable, and render truly untrusted active documents in a sandboxed separate-origin iframe. Validate on input and encode by output context.

**Interview answer:** I sanitize by allowlist, apply CSP/Trusted Types and contextual encoding, and sandbox high-risk content on a separate origin.

24. How would you support printing a complex interactive dashboard?

**Deep explanation:** Define print styles that remove controls, expand essential collapsed/scroll regions, simplify backgrounds, preserve table headers, and control page breaks with print fragmentation properties. Replace interactive charts with legible static equivalents where necessary, include URLs/context, and test browser print previews and PDF output.

**Interview answer:** I create a task-focused print representation, expand essential data, manage fragmentation, and test real printed/PDF output.

25. How would you test visual regressions without excessive false alarms?

**Deep explanation:** Stabilize fonts, data, animation, time, viewport, browser versions, and network before screenshot comparison. Compare component states as well as pages, mask genuinely nondeterministic regions sparingly, and tune thresholds by risk. Review diffs alongside semantic and interaction tests, not as the sole quality gate.

**Interview answer:** I make rendering deterministic, capture targeted states, use disciplined tolerances/masks, and triage diffs with functional tests.

26. How would you prevent animation from interfering with users' input responsiveness?

**Deep explanation:** Keep work off the main thread where possible, animate compositor-friendly properties, avoid many promoted layers, and cancel or retarget stale animations during rapid input. Measure INP and long tasks under realistic load, prioritize direct feedback, and honor reduced-motion preferences.

**Interview answer:** I prioritize input, use transform/opacity carefully, cancel obsolete work, and verify responsiveness with INP and device profiling.

27. How would you design responsive density changes for a data-heavy enterprise interface?

**Deep explanation:** Define density tokens for spacing, row height, typography, and control size while maintaining touch-target and readability requirements. Adapt by container/input capability and allow a user preference; do not simply shrink everything. Preserve hierarchy, column priority, focus visibility, and consistent information meaning.

**Interview answer:** I implement tokenized density modes that adapt without violating readable text, target size, hierarchy, or user preference.

28. How would you resolve conflicts between brand requirements and accessibility requirements?

**Deep explanation:** Translate the conflict into measurable criteria—contrast, target size, motion, semantics—and present tested brand-consistent alternatives. Accessibility is a product constraint, not an optional theme. Document decisions, involve design and affected users, and escalate unresolved compliance risk with evidence.

**Interview answer:** I quantify the accessibility failure, propose brand-aligned compliant alternatives, test with users, and do not ship an inaccessible requirement silently.

29. How would you measure whether an HTML refactor preserves the accessibility tree?

**Deep explanation:** Capture representative accessibility-tree snapshots and accessible names, roles, states, relationships, landmarks, and order before and after. Combine structural diffs with keyboard and screen-reader task tests because identical trees can still behave differently. Include dynamic states and multiple browser/AT combinations.

**Interview answer:** I diff accessibility semantics across key states, then validate focus, keyboard behavior, and announcements through real user flows.

30. How would you debug cross-browser differences in form controls and layout rounding?

**Deep explanation:** Reduce the case, compare computed styles and device-pixel ratios, and distinguish native control styling from CSS layout. Apply explicit `font`, appearance, sizing, and box-model rules only where consistency is required. Avoid depending on fractional equality; use tolerant layout and test browser/OS combinations.

**Interview answer:** I isolate the case, compare computed metrics and native appearance, normalize intentionally, and design around unavoidable fractional rounding.
