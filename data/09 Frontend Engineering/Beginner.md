1. What happens between entering a URL and seeing a page?

**Deep explanation:** The browser parses the URL, checks caches, resolves the domain through DNS, opens a connection (usually TCP plus TLS for HTTPS), and sends an HTTP request. After receiving the response, it parses HTML, fetches referenced resources, builds the DOM and CSSOM, calculates layout, paints pixels, and composites layers. Redirects, service workers, and caches can alter this path.

**Interview answer:** The browser resolves the domain, establishes a secure connection, sends an HTTP request, and receives HTML. It then fetches dependencies, builds the DOM and CSSOM, performs layout and paint, and composites the result on screen.

2. What are the DOM and CSSOM?

**Deep explanation:** The DOM is a tree representation of the parsed HTML and exposes document content to JavaScript. The CSSOM is a tree-like representation of parsed CSS rules. The browser combines both into a render tree containing visible, styled nodes; changing either may trigger style recalculation, layout, or painting.

**Interview answer:** The DOM represents the page's HTML structure, while the CSSOM represents its parsed styles. The browser combines them to determine what should be rendered and how it should look.

3. How do parsing, layout, painting, and compositing differ?

**Deep explanation:** Parsing converts HTML and CSS text into the DOM and CSSOM. Layout calculates each rendered element's size and position. Painting records visual details such as text, colors, borders, and shadows. Compositing assembles painted layers—often using the GPU—into the final image. A change may require only compositing, or it may force the more expensive layout and paint stages.

**Interview answer:** Parsing builds browser data structures, layout calculates geometry, painting draws visual details, and compositing combines layers into the final frame. Avoiding unnecessary layout and paint usually improves performance.

4. How do browser tasks and rendering opportunities interact?

**Deep explanation:** JavaScript callbacks run as tasks on the main thread, with microtasks drained after each task. Between tasks, the browser may perform style calculation, layout, paint, and display a frame. A long task blocks input handling and delays rendering, so heavy work should be split, deferred, or moved to a worker when appropriate. `requestAnimationFrame` schedules visual updates before a rendering opportunity.

**Interview answer:** JavaScript tasks and rendering share the main thread. The browser generally renders between tasks, so long-running JavaScript delays input and frames; I keep tasks short and use `requestAnimationFrame` for visual updates.

5. How do event capturing and bubbling differ?

**Deep explanation:** An event travels from the document toward the target during capture, reaches the target, then travels back through ancestors during bubbling. Listeners use bubbling by default; passing `{ capture: true }` listens during capture. Most common UI events bubble, but some—such as `focus`—do not, although related alternatives like `focusin` do.

**Interview answer:** Capturing runs listeners from outer ancestors down toward the target; bubbling runs them from the target back up. Listeners default to bubbling unless capture is explicitly enabled.

6. What is event delegation?

**Deep explanation:** Event delegation attaches one listener to a stable ancestor and uses `event.target` or `closest()` to identify the matching descendant. It reduces listener count and automatically supports descendants added later. The handler must guard against irrelevant targets, and delegation requires an event that reaches the ancestor.

**Interview answer:** Event delegation uses one ancestor listener to handle events from many descendants through bubbling. It is useful for dynamic lists and avoids attaching a listener to every item.

7. How do preventDefault and stopPropagation differ?

**Deep explanation:** `event.preventDefault()` cancels the browser's default action, such as following a link or submitting a form, when the event is cancelable. `event.stopPropagation()` stops the event from continuing through capture or bubble ancestors. Neither implies the other; `stopImmediatePropagation()` additionally prevents later listeners on the same element from running.

**Interview answer:** `preventDefault()` cancels the browser action associated with an event. `stopPropagation()` stops the event traveling to other elements; they solve different problems and can be used independently.

8. How would you select, create, update, and remove DOM elements?

**Deep explanation:** Select with APIs such as `querySelector` and `querySelectorAll`; create with `document.createElement`; update properties such as `textContent`, attributes, classes, or styles; insert with `append`, `prepend`, or `replaceChildren`; and remove with `element.remove()`. Prefer `textContent` over untrusted `innerHTML` to avoid injection, and batch large updates to reduce repeated layout work.

**Interview answer:** I use selectors like `querySelector`, create nodes with `createElement`, update safe properties such as `textContent` and `classList`, insert with `append`, and delete with `remove`. I avoid putting untrusted data into `innerHTML`.

9. How do localStorage, sessionStorage, cookies, and IndexedDB differ?

**Deep explanation:** `localStorage` is synchronous string storage that persists until cleared; `sessionStorage` is scoped to a tab session. Cookies are small and may be sent with HTTP requests, making secure attributes such as `HttpOnly`, `Secure`, and `SameSite` important. IndexedDB is asynchronous, supports structured data and indexes, and suits larger offline datasets. Storage availability and quotas vary, so failures should be handled.

**Interview answer:** `localStorage` persists simple strings, `sessionStorage` lasts for the tab, cookies can accompany requests and are suited to server-related state, and IndexedDB handles larger structured client-side data asynchronously.

10. What is the same-origin policy?

**Deep explanation:** The same-origin policy restricts scripts from one origin—defined by scheme, host, and port—from freely reading data belonging to another. It isolates sites and protects authenticated user data. Controlled exceptions include CORS, `postMessage`, and resource-specific rules; embedding or sending a request does not always mean its response can be read.

**Interview answer:** The same-origin policy prevents a page from freely reading data from a different scheme, host, or port. It is a core browser security boundary, with controlled mechanisms such as CORS and `postMessage` for cross-origin interaction.

11. What is CORS intended to control?

**Deep explanation:** Cross-Origin Resource Sharing lets a server declare which origins may read its responses in browser JavaScript. For certain methods or headers, the browser sends a preflight `OPTIONS` request first. CORS is enforced by browsers and is not authentication, authorization, or protection against requests made by servers or non-browser clients.

**Interview answer:** CORS is a server-controlled browser mechanism that allows selected origins to read cross-origin responses. It relaxes the same-origin policy; it is not a replacement for authentication or authorization.

12. How would you display loading, empty, success, and error states?

**Deep explanation:** Model the request as explicit states rather than inferring them from missing data. Show a stable loading indicator, a helpful empty message when a successful result has no items, the content on success, and an actionable error with retry where appropriate. Preserve existing data during background refreshes, avoid layout shifts, and announce important changes accessibly with suitable live regions.

**Interview answer:** I represent loading, empty, success, and error as distinct states and render each intentionally. Errors explain what happened and offer recovery, while background refreshes usually keep existing content visible.

13. How would you validate a form without losing the user's input?

**Deep explanation:** Keep field values in the DOM or application state and store validation errors separately. Validate basic rules in the browser for fast feedback, validate again on the server, and map server errors back to the relevant fields without resetting the form. Show errors near inputs, focus the first invalid field on submission, and do not disable paste or erase valid values.

**Interview answer:** I preserve submitted values, validate on both client and server, and display errors beside the relevant fields. A failed submission updates error state rather than resetting the form, so the user can correct only what is wrong.

14. How would you handle an HTTP error returned by fetch?

**Deep explanation:** `fetch` rejects for network-level failures, but HTTP statuses such as 404 or 500 still resolve. Check `response.ok` or `response.status`, safely parse the expected error body, and throw or return a structured application error. Handle cancellation separately, provide user-appropriate feedback, and retry only safe or idempotent operations with limits and backoff.

**Interview answer:** I check `response.ok` because `fetch` does not reject for HTTP error statuses. I parse any structured error, map it to a useful UI state, distinguish network failures and cancellation, and retry only when it is safe.

15. How would you encode URL query parameters safely?

**Deep explanation:** Use `URL` and `URLSearchParams` rather than manual string concatenation. They correctly encode reserved characters and make repeated parameters manageable: `url.searchParams.set('q', value)`. Encoding prevents malformed URLs, but the server must still validate values because encoding is not security validation.

**Interview answer:** I build the URL with `URL` and add parameters through `URLSearchParams`. That handles percent-encoding correctly; the server still validates the resulting values.

16. How would you manage navigation and browser history?

**Deep explanation:** Use normal links for real destinations so keyboard behavior, accessibility, and fallback navigation work. Client-side routers commonly use `history.pushState` for new entries, `replaceState` for replacing the current entry, and the `popstate` event for back and forward navigation. The server must return the application shell for valid client routes, and navigation should manage focus, titles, scrolling, and unsaved changes.

**Interview answer:** I prefer semantic links and use the History API or a router for client navigation. I handle `popstate`, configure server fallbacks, and update focus, title, and scroll so navigation behaves like a real page transition.

17. What are bundlers and transpilers used for?

**Deep explanation:** A bundler follows the module graph and produces deployable assets, often adding code splitting, tree shaking, hashing, and asset processing. A transpiler converts source syntax or language features—such as TypeScript or newer JavaScript—into code supported by target environments. Modern tools may combine both roles, but they address dependency packaging and source transformation respectively.

**Interview answer:** Bundlers package the application's dependency graph and optimize assets. Transpilers convert source code, such as TypeScript or modern JavaScript, into syntax supported by the target browsers.

18. How do development and production builds differ?

**Deep explanation:** Development builds prioritize fast rebuilds and debugging, with readable output, detailed warnings, and hot reload. Production builds prioritize delivery: minification, dead-code removal, optimized chunks and assets, stable content hashes, and reduced diagnostics. Production-like testing matters because optimizations and environment configuration can expose issues absent in development.

**Interview answer:** Development builds favor speed and debuggability; production builds favor small, optimized, cacheable output. I test the production build because its optimizations and configuration can behave differently.

19. What are source maps used for?

**Deep explanation:** Source maps map generated or minified code locations back to original source files, enabling readable stack traces and breakpoint debugging. They can be uploaded privately to an error-monitoring service or served publicly. Because maps may expose source code and paths, their production distribution should match the project's security and debugging needs.

**Interview answer:** Source maps connect bundled or minified code back to the original source, making debugging and production stack traces understandable. I control whether they are public or uploaded privately because they can reveal source details.

20. How would you avoid exposing secrets in frontend environment variables?

**Deep explanation:** Anything shipped to a browser can be inspected, regardless of environment-variable naming or minification. Keep secrets on a trusted backend and let the frontend call a narrowly scoped server endpoint. Public identifiers may be embedded, but sensitive credentials require server-side storage, authorization, rate limiting, and possibly short-lived scoped tokens.

**Interview answer:** I assume every frontend value is public. Secrets stay on the server; the browser calls an authenticated backend, which uses the secret and returns only the data or short-lived capability the client needs.

21. What makes a page responsive?

**Deep explanation:** A responsive page adapts to viewport size, content, user preferences, and input method. Use fluid layouts with Grid or Flexbox, relative sizing, sensible breakpoints or container queries, responsive images, and a viewport meta tag. Build from small screens upward, allow text to reflow and zoom, and test real content rather than targeting specific device names.

**Interview answer:** Responsive design uses flexible layouts, scalable media, and content-driven breakpoints so the interface works across available sizes. I also preserve zoom, readable text, and usable controls rather than designing only for named devices.

22. How would you inspect network requests in browser developer tools?

**Deep explanation:** Open the Network panel, reproduce the action, and filter by resource type or URL. Inspect the request URL, method, headers, query or payload, cookies, status, response body, initiator, redirects, cache behavior, and timing waterfall. Preserve the log for navigations and disable cache when diagnosing caching, while taking care not to share sensitive headers or data.

**Interview answer:** I reproduce the issue with the Network panel open, then inspect the request, payload, status, response, headers, initiator, and timing. I also check redirects, caching, and whether the browser blocked the request.

23. How would you find a JavaScript error reported by a user?

**Deep explanation:** Collect reproducible details: page, action, time, browser, environment, account context, and the exact symptom. Check monitoring logs and stack traces, use source maps to locate original code, correlate with network failures and recent releases, then reproduce under similar conditions. Add focused logging or a regression test once the cause is known, while avoiding collection of sensitive user data.

**Interview answer:** I gather the user's steps and environment, check error monitoring and source-mapped stack traces, correlate the event with network logs and releases, and reproduce it under matching conditions. Then I fix the cause and add a regression test where practical.

24. What is a progressive web app?

**Deep explanation:** A progressive web app is a web application enhanced with capabilities such as installation, offline behavior, background handling, and app-like presentation where the platform supports them. It commonly uses HTTPS, a web app manifest, responsive design, and a service worker. Features should be progressively enhanced so the core experience still works when a capability is unavailable.

**Interview answer:** A PWA is a web app that progressively adds installability, offline support, and other app-like capabilities using technologies such as a manifest and service worker. Its essential experience should still work without those enhancements.

25. What is a service worker?

**Deep explanation:** A service worker is an event-driven script that runs separately from the page and can intercept requests, manage caches, and support features such as offline operation, push, and background sync. It has an install/activate lifecycle, requires a secure context except on localhost, and cannot directly manipulate the DOM. Cache versioning and update behavior must be designed carefully to avoid serving stale assets.

**Interview answer:** A service worker is a background browser worker that can intercept network requests and manage cached responses. It enables offline and background features, but requires careful lifecycle and cache-update handling.

26. How would you request browser permissions respectfully?

**Deep explanation:** Ask only when a feature genuinely needs the capability and after a clear user action, not automatically on page load. Explain the benefit and what data will be used before triggering the browser prompt, request the narrowest permission possible, and provide a usable alternative. Permission decisions should never be manipulated through misleading UI.

**Interview answer:** I ask in context, after the user chooses a feature, and explain why the permission is needed. I request the minimum scope and provide a fallback if the user declines.

27. How would you handle a user denying a browser permission?

**Deep explanation:** Treat denial as a normal state rather than an exception loop. Keep the rest of the interface usable, explain which feature is unavailable, offer a privacy-preserving alternative, and show settings instructions only if the user later chooses to enable it. Do not repeatedly prompt; browsers may prevent future prompts after denial anyway.

**Interview answer:** I respect the denial, keep unrelated functionality working, and offer an alternative where possible. If the user later wants the feature, I explain how to enable it in browser settings without repeatedly prompting them.

28. What are LCP, INP, and CLS intended to measure?

**Deep explanation:** Largest Contentful Paint measures how quickly the main visible content appears. Interaction to Next Paint measures responsiveness across user interactions by observing the delay until the next rendered frame. Cumulative Layout Shift measures unexpected visual movement. Together they cover loading, interactivity, and visual stability; field data is important because real devices and networks differ from lab tests.

**Interview answer:** LCP measures main-content loading, INP measures interaction responsiveness, and CLS measures unexpected layout movement. They represent loading speed, responsiveness, and visual stability.

29. How would you make a page usable with only a keyboard?

**Deep explanation:** Use semantic interactive elements so controls are naturally focusable and operable with Enter or Space. Keep a logical focus order, provide a visible focus indicator and skip link, manage focus in dialogs and route changes, and avoid keyboard traps. Test all actions using Tab, Shift+Tab, Enter, Space, Escape, and relevant arrow-key patterns without a mouse.

**Interview answer:** I start with semantic HTML, ensure every action is reachable and operable by keyboard, keep focus order logical and focus visible, and manage focus correctly for dialogs and navigation. Then I test the complete flow without a mouse.

30. How would you distinguish a frontend bug from an API failure?

**Deep explanation:** Reproduce the issue with the console and Network panel open. If the request is missing or malformed, client code is likely responsible; if a correct request receives an incorrect status, schema, or data, investigate the API. If the response is correct but displayed incorrectly, the frontend is likely at fault. Compare the same request in an API client or logs, remembering that authentication, CORS, proxies, and integration assumptions can cross the boundary.

**Interview answer:** I trace the flow from UI action to network request to rendered result. A missing or malformed request points toward the frontend, a bad response to a valid request points toward the API, and a correct response rendered wrongly points back to the frontend.
