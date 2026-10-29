1. How do stacking contexts affect z-index?

**Deep explanation:** `z-index` orders boxes only within the same stacking context. Certain properties—positioned elements with z-index, transforms, opacity below 1, isolation, and others—create new contexts that behave as atomic layers in their parent.

**Interview answer:** Z-index is local to a stacking context; descendants cannot escape their context to compete directly with outside siblings.

2. Why can a child with a large z-index appear behind another element?

**Deep explanation:** The child's entire stacking context may sit below the other element's context. A huge child z-index cannot outrank the parent context's position. Inspect context-creating ancestors and compare the parent contexts, not just the children.

**Interview answer:** Its ancestor stacking context is lower, so the child's large z-index only wins locally.

3. What causes margin collapsing, and how can you control it?

**Deep explanation:** Adjacent vertical margins of block boxes in normal flow can combine, including parent-child and empty-block margins. Flex/grid layouts, borders, padding, inline content, clearance, or a new block formatting context prevent particular collapses. Prefer `gap` for component spacing.

**Interview answer:** Vertical block margins can collapse in normal flow; I control it with layout contexts, padding/borders, or gap.

4. How do intrinsic sizing, min-content, and max-content affect layout?

**Deep explanation:** Intrinsic sizes come from content rather than a fixed container. `min-content` is the smallest size without avoidable overflow; `max-content` is the preferred unwrapped size. Grid/flex algorithms use these contributions, which explains unexpected minimum widths and overflow.

**Interview answer:** Min-content is the tightest viable width; max-content is the ideal unwrapped width, and layout algorithms use both as constraints.

5. Why can a flex item overflow despite having flex-shrink enabled?

**Deep explanation:** Flex items default to `min-width:auto`, which often preserves their min-content width. Shrinking stops at that automatic minimum, so long text or nested content overflows. Use `min-width:0` or suitable overflow/wrapping on the item.

**Interview answer:** Flex-shrink cannot pass the item's automatic minimum; `min-width:0` commonly allows the intended shrinking.

6. How do grid auto-placement and explicit tracks interact?

**Deep explanation:** Explicit tracks come from `grid-template-*`; positioned items occupy them first, then auto-placement fills remaining cells according to `grid-auto-flow`. Items outside the explicit grid create implicit tracks sized by `grid-auto-rows/columns`. Dense packing can reorder visually.

**Interview answer:** Explicit tracks define the planned grid; auto-placement fills free cells and creates implicit tracks when needed.

7. When would you use minmax, auto-fit, and auto-fill?

**Deep explanation:** `minmax()` gives tracks flexible bounds. With `repeat()`, `auto-fill` creates as many tracks as fit and retains empty ones; `auto-fit` collapses empty tracks so populated columns expand. `repeat(auto-fit, minmax(…))` is useful for fluid card grids.

**Interview answer:** I use minmax for bounded flexibility, auto-fit when items should stretch, and auto-fill when empty track structure should remain.

8. How would you build a responsive layout without many breakpoints?

**Deep explanation:** Use fluid sizing with Grid/Flexbox, `minmax()`, `clamp()`, wrapping, intrinsic dimensions, and responsive media. Let content determine when layout fails, then add only necessary breakpoints. This reduces device-specific rules and improves resilience.

**Interview answer:** I start with intrinsic, fluid layout primitives and add content-driven breakpoints only where the design actually breaks.

9. How do container queries differ from media queries?

**Deep explanation:** Media queries inspect the viewport or device preferences; container queries inspect an ancestor container's size or style. Components can therefore adapt to where they are placed, not just the screen. Size queries require an appropriate containment context.

**Interview answer:** Media queries respond to the environment; container queries let a reusable component respond to its own available space.

10. How would you use logical properties for right-to-left layouts?

**Deep explanation:** Use `margin-inline`, `padding-block`, `inset-inline-start`, and logical sizes instead of hard-coded left/right/top/bottom. They follow writing mode and text direction automatically. Icons with directional meaning may still need explicit mirroring.

**Interview answer:** I use inline/block logical properties so spacing and positioning adapt automatically to RTL and other writing modes.

11. How do custom properties participate in the cascade?

**Deep explanation:** Custom properties are ordinary cascaded, inherited values whose token streams are substituted by `var()` at computed-value time. They can be overridden by scope, state, media query, or theme. Invalid substitutions may invalidate the consuming declaration; fallbacks mitigate that.

**Interview answer:** CSS variables cascade and inherit like properties, then `var()` resolves them where used, with optional fallbacks.

12. How would you implement light and dark themes?

**Deep explanation:** Define semantic custom properties, set defaults, override them under `prefers-color-scheme`, and allow an explicit user choice via a root attribute. Persist that choice and set `color-scheme` so native controls match. Test contrast in both themes.

**Interview answer:** I theme semantic tokens, default to system preference, permit a persisted override, and validate contrast and native controls.

13. How do cascade layers affect specificity management?

**Deep explanation:** `@layer` establishes a precedence order before specificity is compared; unlayered author styles normally outrank layered styles. Layers can separate reset, third-party, component, and override rules so consumers do not need specificity wars. Order should be declared centrally.

**Interview answer:** Cascade layers create explicit style precedence independent of selector weight, making overrides predictable.

14. How would you style an interactive state without making color the only signal?

**Deep explanation:** Pair color with shape, underline, border, icon, text, or position changes. Hover must have keyboard equivalents, focus must be clearly visible, and disabled/error states need semantic communication. Verify contrast and do not rely on subtle opacity alone.

**Interview answer:** I combine color with another visible cue and provide equivalent hover, focus, selected, error, and disabled states.

15. How would you support reduced motion and high-contrast preferences?

**Deep explanation:** Under `prefers-reduced-motion: reduce`, remove nonessential animation and replace spatial movement with brief fades or instant changes. Use `forced-colors` and system colors where appropriate, preserve outlines, and test rather than assuming brand colors survive high-contrast modes.

**Interview answer:** I honor reduced-motion and forced-colors queries, retain essential feedback, and test with the actual OS modes.

16. How do transitions and keyframe animations differ?

**Deep explanation:** Transitions interpolate a property when its value changes and are ideal for state changes. Keyframes define multi-stage, repeatable timelines independent of a single property change. Both should favor compositable properties and respect motion preferences.

**Interview answer:** Transitions animate between two states; keyframes define a controlled multi-step timeline.

17. Which animations tend to trigger layout, paint, or compositing?

**Deep explanation:** Width, height, position, and many geometric properties can trigger layout; color, shadows, and backgrounds commonly trigger paint. `transform` and `opacity` can often run on compositor layers, but layer promotion costs memory and is not guaranteed. Profile real devices.

**Interview answer:** Geometry often causes layout, visual decoration causes paint, and transform/opacity are usually compositor-friendly—but I verify in DevTools.

18. How would you prevent layout shift while images and fonts load?

**Deep explanation:** Give images/video intrinsic `width` and `height` or `aspect-ratio`, reserve dynamic-content space, and avoid injecting content above the viewport. For fonts, preload only critical files and select fallbacks with compatible metrics using size/metric overrides.

**Interview answer:** I reserve media and dynamic-content dimensions and use metric-compatible font loading so late resources do not move existing content.

19. How would you use srcset, sizes, and picture for responsive images?

**Deep explanation:** `srcset` lists image candidates with width or density descriptors; `sizes` tells the browser the expected rendered width so it chooses efficiently. `picture` supplies art direction or format alternatives through `source`. Keep `img` as the fallback and alt-text owner.

**Interview answer:** Srcset offers candidates, sizes describes display width, and picture handles art direction or format selection.

20. How do defer, async, and module scripts affect page loading?

**Deep explanation:** Classic `defer` downloads in parallel and executes after parsing, in document order. `async` executes as soon as ready, without order guarantees. Module scripts are deferred by default, use module dependency graphs, and execute once; `async` can alter module timing too.

**Interview answer:** Defer preserves post-parse order, async prioritizes earliest readiness, and modules are dependency-aware and deferred by default.

21. How would you load fonts without making text unusable during loading?

**Deep explanation:** Use `font-display: swap` or `optional`, subset formats/weights, and preload only truly critical fonts. Provide robust fallback stacks and align fallback metrics to reduce shifts. Avoid hiding text during slow or failed downloads.

**Interview answer:** I show fallback text immediately, load a small critical font set, and tune fallback metrics to limit reflow.

22. How would you build an accessible modal dialog?

**Deep explanation:** Prefer native `dialog` with `showModal()` when supported. Give it an accessible name, move focus inside, constrain keyboard focus, make outside content inert, support Escape/close controls, and restore focus to the opener. Do not close unexpectedly.

**Interview answer:** I name the modal, manage and trap focus, make the background inert, support Escape, and restore opener focus on close.

23. How would you build accessible tabs and keyboard navigation?

**Deep explanation:** Use the ARIA tabs pattern: `tablist`, `tab`, and `tabpanel`, with `aria-selected`, `aria-controls`, and roving `tabindex`. Arrow keys move among tabs; activation may be automatic only when panels load instantly. Keep DOM and visual order aligned.

**Interview answer:** I implement the ARIA tabs pattern with roving tabindex, arrow navigation, selected state, and properly associated panels.

24. How would you validate a form and announce errors accessibly?

**Deep explanation:** Validate at sensible times, retain user input, show a summary plus inline messages, and associate each error using `aria-describedby` or native descriptions. Mark invalid fields, focus the summary after submission, and announce updates without excessive live-region noise.

**Interview answer:** I provide specific inline errors and a focused summary, programmatically associate messages, and preserve user-entered values.

25. How do ARIA roles, states, and properties differ?

**Deep explanation:** Roles define what an element is; states describe changeable conditions such as expanded or selected; properties describe relationships or characteristics such as labels and controls. Native HTML is preferred because it supplies semantics and behavior together. ARIA changes semantics, not behavior.

**Interview answer:** Roles identify the widget, states describe its current condition, and properties describe stable characteristics or relationships.

26. When can adding ARIA make an interface less accessible?

**Deep explanation:** Incorrect roles can override useful native semantics, stale states can lie, and unsupported patterns can create keyboard expectations the code does not meet. Redundant ARIA may cause duplicate announcements. Use native elements first and test the accessibility tree and interactions.

**Interview answer:** ARIA hurts when it conflicts with native semantics or promises behavior/state the implementation does not provide.

27. How would you keep a visually hidden label available to assistive technology?

**Deep explanation:** Use a proven visually-hidden utility that clips a tiny positioned box without `display:none` or `visibility:hidden`. Reveal it on focus if it is an actionable skip link. Prefer visible labels whenever possible because they help more users.

**Interview answer:** I use a tested visually-hidden class that removes pixels, not semantics, and never hide labels with display none.

28. How would you build a table that remains usable on a narrow screen?

**Deep explanation:** Preserve semantic table markup and header associations. Put genuinely wide tables in a labeled horizontal scroll region with visible affordance or reorganize known data into accessible cards; do not blindly change table elements to `display:block`. Keep priority columns visible when possible.

**Interview answer:** I preserve table semantics, enable discoverable horizontal scrolling, and selectively adapt columns only when relationships remain clear.

29. How would you debug a sticky element that does not stick?

**Deep explanation:** Confirm a threshold such as `top` exists, then identify the actual scroll container. Ancestor overflow, insufficient container height, grid/flex stretching, transforms, or the sticky element being taller than available space can prevent visible sticking. Inspect containing blocks in DevTools.

**Interview answer:** I check the inset, scroll ancestor, available travel space, and ancestor overflow or layout constraints.

30. How would you handle long words and translated content without breaking layout?

**Deep explanation:** Avoid fixed text dimensions; allow flex/grid items to shrink and wrap. Use `overflow-wrap:anywhere`, language-aware `hyphens:auto`, and sensible min/max sizing. Test longer translations, RTL, large text, and unbroken URLs; clipping important text is not acceptable.

**Interview answer:** I build flexible containers, enable safe wrapping/hyphenation, and test long translations and URLs at enlarged text sizes.

31. How do pseudo-classes and pseudo-elements differ?

**Deep explanation:** Pseudo-classes select an existing element by state or relationship, such as `:hover`, `:checked`, or `:has()`. Pseudo-elements target a conceptual subpart such as `::before`, `::first-line`, or `::marker`. Generated content should not carry essential information.

**Interview answer:** Pseudo-classes select element conditions; pseudo-elements style virtual parts of an element.

32. How would you safely embed third-party content in an iframe?

**Deep explanation:** Use the narrowest `sandbox` permissions, a restrictive `allow` policy, trustworthy HTTPS origins, meaningful titles, and suitable referrer policy. Avoid combining permissions that effectively escape sandboxing. Validate `postMessage` origins and data, and lazy-load offscreen frames.

**Interview answer:** I sandbox with least privilege, restrict browser features, title the frame, and strictly validate cross-window messages.

33. How would you use native details and dialog elements appropriately?

**Deep explanation:** `details`/`summary` suit independently expandable disclosure content and provide keyboard semantics automatically. `dialog` suits modal or non-modal dialogs when opened through its API. Supply clear labels and focus behavior; do not force these elements into unrelated patterns such as navigation tabs.

**Interview answer:** I use details for disclosure and dialog for focused dialog interactions, preserving their native semantics and focus behavior.

34. How would you structure CSS for a reusable component library?

**Deep explanation:** Establish tokens, low-specificity foundations, isolated component APIs, explicit variants/states, and documented composition rules. Use layers or modules to control scope and precedence. Avoid styling consumers by fragile DOM depth, and include accessibility, RTL, theming, and visual tests.

**Interview answer:** I organize tokens, foundations, components, variants, and utilities with predictable scope, low specificity, and documented accessible APIs.

35. How would you detect CSS that is no longer used?

**Deep explanation:** Combine runtime coverage across representative routes/states with static analysis and repository search. Dynamic classes, experiments, and lazy UI create false positives, so observe production telemetry or remove incrementally behind tests. Bundle-size budgets prevent regrowth.

**Interview answer:** I use coverage plus static search across real states, then remove candidates incrementally with visual and integration tests.
