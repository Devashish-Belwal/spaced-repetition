1. How would you find the median of two sorted arrays in logarithmic time?

**Deep explanation:**

Binary-search a partition in the smaller array. Choose cuts so the left halves contain half the elements and `max(leftA, leftB) <= min(rightA, rightB)`. The median is the maximum left value for odd total length, otherwise the average of the maximum left and minimum right values. Use sentinels at boundaries; time is `O(log min(m,n))` and space `O(1)`.

**Interview answer:**

Binary-search a partition in the smaller array. Choose cuts so the left halves contain half the elements and `max(leftA, leftB) <= min(rightA, rightB)`.

2. How would you calculate trapped rainwater using constant extra space?

**Deep explanation:**

Use two pointers and running maxima `leftMax` and `rightMax`. Advance the side with the smaller current height; that side's water is already bounded by its running maximum, so add `maxSoFar - height`. This is `O(n)` time and `O(1)` space.

**Interview answer:**

Use two pointers and running maxima `leftMax` and `rightMax`. Advance the side with the smaller current height; that side's water is already bounded by its running maximum, so add `maxSoFar - height`.

3. How would you find the largest rectangle in a histogram?

**Deep explanation:**

Maintain an increasing stack of bar indices. When a shorter bar arrives, pop each taller bar and compute its maximal width between the new stack top and the current index. Append a zero-height sentinel to flush the stack. Complexity is `O(n)` time and `O(n)` space.

**Interview answer:**

Maintain an increasing stack of bar indices. When a shorter bar arrives, pop each taller bar and compute its maximal width between the new stack top and the current index.

4. How would you find a maximum rectangle of ones in a binary matrix?

**Deep explanation:**

Treat every row as the base of a histogram: update each column's consecutive-one height, resetting it to zero on a matrix zero. Run the largest-histogram-rectangle algorithm after each row. For an `r x c` matrix this costs `O(rc)` time and `O(c)` space.

**Interview answer:**

Treat every row as the base of a histogram: update each column's consecutive-one height, resetting it to zero on a matrix zero. Run the largest-histogram-rectangle algorithm after each row.

5. How would you maintain the median of a continuous data stream?

**Deep explanation:**

Keep a max-heap for the lower half and a min-heap for the upper half. Insert into the appropriate heap, then rebalance so their sizes differ by at most one. The median is one heap top or the average of both tops; insertion is `O(log n)` and lookup is `O(1)`.

**Interview answer:**

Keep a max-heap for the lower half and a min-heap for the upper half. Insert into the appropriate heap, then rebalance so their sizes differ by at most one.

6. How would you calculate sliding-window maxima in linear time?

**Deep explanation:**

Store candidate indices in a decreasing deque. Remove expired indices from the front and values no larger than the incoming value from the back; the front is the current maximum. Each index enters and leaves once, giving `O(n)` time and `O(k)` space.

**Interview answer:**

Store candidate indices in a decreasing deque. Remove expired indices from the front and values no larger than the incoming value from the back; the front is the current maximum.

7. How would you find the minimum window containing all required characters?

**Deep explanation:**

Use a variable sliding window with required and window frequency maps. Expand until all required character counts are satisfied, then shrink while preserving validity, recording the shortest window. Track how many distinct requirements are satisfied to make each update `O(1)`; total time is `O(n + m)`.

**Interview answer:**

Use a variable sliding window with required and window frequency maps. Expand until all required character counts are satisfied, then shrink while preserving validity, recording the shortest window.

8. How would you count subarrays with a target sum when negatives are allowed?

**Deep explanation:**

Maintain a prefix sum and a frequency map of previously seen prefixes. At each position, add the count of `prefix - target`, then record the current prefix. Initialize frequency zero to one. This handles negatives in `O(n)` expected time and `O(n)` space.

**Interview answer:**

Maintain a prefix sum and a frequency map of previously seen prefixes. At each position, add the count of `prefix - target`, then record the current prefix.

9. How would you find the shortest subarray reaching a target with negative numbers?

**Deep explanation:**

Compute prefix sums and keep their indices in an increasing deque. While the current prefix minus the front prefix reaches the target, update the answer and pop the front; while the back prefix is at least the current prefix, pop it as dominated. This is `O(n)` time and space.

**Interview answer:**

Compute prefix sums and keep their indices in an increasing deque. While the current prefix minus the front prefix reaches the target, update the answer and pop the front; while the back prefix is at least the current prefix, pop it as dominated.

10. How would you count inversions efficiently?

**Deep explanation:**

Use merge sort. During merge, whenever a right-half value precedes the remaining left-half values, add the number of unmerged left values. The count and sorting both complete in `O(n log n)` time with `O(n)` auxiliary space.

**Interview answer:**

Use merge sort. During merge, whenever a right-half value precedes the remaining left-half values, add the number of unmerged left values.

11. How would you implement an LFU cache with constant-time average updates?

**Deep explanation:**

Map keys to nodes containing value and frequency, and map each frequency to a doubly linked LRU list. Track `minFrequency`; access moves a node to the next frequency list, and eviction removes the least-recent node from the minimum-frequency list. Hash maps plus linked lists give `O(1)` average get and put.

**Interview answer:**

Map keys to nodes containing value and frequency, and map each frequency to a doubly linked LRU list. Track `minFrequency`; access moves a node to the next frequency list, and eviction removes the least-recent node from the minimum-frequency list.

12. How would you build a randomized set with constant-time average insertion and sampling?

**Deep explanation:**

Store values in a dynamic array and map each value to its array index. Delete by swapping the target with the last element, updating that element's index, and popping. Choose a uniformly random array index for sampling; insert, delete, and sample are `O(1)` average.

**Interview answer:**

Store values in a dynamic array and map each value to its array index. Delete by swapping the target with the last element, updating that element's index, and popping.

13. How would you sample k items uniformly from an unknown-length stream?

**Deep explanation:**

Use reservoir sampling: keep the first `k` items, then for the `i`th item (`i > k`) draw uniformly from `[1,i]` and replace that reservoir position if the draw is at most `k`. Induction shows every item has final probability `k/n`. Space is `O(k)`.

**Interview answer:**

Use reservoir sampling: keep the first `k` items, then for the `i`th item (`i > k`) draw uniformly from `[1,i]` and replace that reservoir position if the draw is at most `k`. Induction shows every item has final probability `k/n`.

14. How would you detect duplicates when the input exceeds memory?

**Deep explanation:**

Partition records on disk by a stable hash so equal values land in the same bucket, then process each bucket in memory with a hash set; recursively repartition oversized buckets. Alternatively external-sort and scan adjacent records. Account for skew and hash collisions by comparing full keys.

**Interview answer:**

Partition records on disk by a stable hash so equal values land in the same bucket, then process each bucket in memory with a hash set; recursively repartition oversized buckets. Alternatively external-sort and scan adjacent records.

15. How would you sort terabytes of records using limited RAM?

**Deep explanation:**

Use external merge sort: read RAM-sized chunks, sort each, and write sorted runs; then perform buffered multiway merges using a min-heap. Choose merge fan-in from available memory and file-descriptor limits. Cost is dominated by sequential I/O over `O(log_f(number of runs))` merge passes.

**Interview answer:**

Use external merge sort: read RAM-sized chunks, sort each, and write sorted runs; then perform buffered multiway merges using a min-heap. Choose merge fan-in from available memory and file-descriptor limits.

16. How would you implement a segment tree with lazy propagation?

**Deep explanation:**

Store each node's aggregate plus a pending update tag. A full-cover update modifies the aggregate and composes its tag; before partial descent, push the tag to children, then recompute the parent after recursion. Define tag composition carefully, especially when assignment and addition coexist. Range updates and queries take `O(log n)`.

**Interview answer:**

Store each node's aggregate plus a pending update tag. A full-cover update modifies the aggregate and composes its tag; before partial descent, push the tag to children, then recompute the parent after recursion.

17. How would you choose between a Fenwick tree and a segment tree?

**Deep explanation:**

Use a Fenwick tree for compact, simple prefix aggregates with invertible operations, such as sums; it has low constants, `O(n)` space, and `O(log n)` updates/queries. Use a segment tree for general associative range queries, custom node state, or lazy range updates. Both are logarithmic, but segment trees are more flexible and larger.

**Interview answer:**

Use a Fenwick tree for compact, simple prefix aggregates with invertible operations, such as sums; it has low constants, `O(n)` space, and `O(log n)` updates/queries. Use a segment tree for general associative range queries, custom node state, or lazy range updates.

18. How would you answer lowest-common-ancestor queries after preprocessing?

**Deep explanation:**

For static trees, preprocess depth and `2^j` ancestors using binary lifting. Lift the deeper node, then lift both from the largest jump downward until their parents agree. Preprocessing costs `O(n log n)`, each query `O(log n)`. Euler tour plus RMQ can provide `O(1)` queries with suitable RMQ preprocessing.

**Interview answer:**

For static trees, preprocess depth and `2^j` ancestors using binary lifting. Lift the deeper node, then lift both from the largest jump downward until their parents agree.

19. How would you maintain kth-smallest queries while values are inserted and deleted?

**Deep explanation:**

Use a balanced order-statistics tree augmented with subtree sizes. Insert and delete update sizes along rotations/paths; select descends by comparing `k` with the left subtree size. All operations take `O(log n)`. With a bounded/compressed value domain, a Fenwick or segment tree over frequencies also works.

**Interview answer:**

Use a balanced order-statistics tree augmented with subtree sizes. Insert and delete update sizes along rotations/paths; select descends by comparing `k` with the left subtree size.

20. How would you find strongly connected components in a directed graph?

**Deep explanation:**

Tarjan's algorithm runs one DFS, assigning discovery indices and low-link values while maintaining a stack. When `low[u] == index[u]`, pop through `u` to form one SCC. Each vertex and edge is processed once, so time is `O(V+E)` and space is `O(V)`.

**Interview answer:**

Tarjan's algorithm runs one DFS, assigning discovery indices and low-link values while maintaining a stack. When `low[u] == index[u]`, pop through `u` to form one SCC.

21. How would you find bridges and articulation points?

**Deep explanation:**

Run DFS with discovery times and low-link values. A tree edge `(u,v)` is a bridge when `low[v] > disc[u]`; a non-root `u` is an articulation point when some child has `low[v] >= disc[u]`, while a root is one if it has multiple DFS children. Complexity is `O(V+E)`.

**Interview answer:**

Run DFS with discovery times and low-link values. A tree edge `(u,v)` is a bridge when `low[v] > disc[u]`; a non-root `u` is an articulation point when some child has `low[v] >= disc[u]`, while a root is one if it has multiple DFS children.

22. How would you handle shortest paths with negative edges and detect negative cycles?

**Deep explanation:**

Use Bellman-Ford: relax every edge up to `V-1` times, stopping early if nothing changes. If an edge can still relax on pass `V`, a reachable negative cycle exists; follow predecessor links `V` steps to enter and reconstruct it. Time is `O(VE)` and space `O(V)`.

**Interview answer:**

Use Bellman-Ford: relax every edge up to `V-1` times, stopping early if nothing changes. If an edge can still relax on pass `V`, a reachable negative cycle exists; follow predecessor links `V` steps to enter and reconstruct it.

23. When would Floyd-Warshall outperform repeated single-source shortest-path searches?

**Deep explanation:**

Choose Floyd-Warshall for dense, modest-sized graphs when all-pairs distances are required, negative edges may exist, and `O(V^2)` memory is acceptable. Its simple `O(V^3)` loops often beat running Bellman-Ford from every source and can beat repeated Dijkstra on dense graphs. It also detects negative cycles via negative diagonal entries.

**Interview answer:**

Choose Floyd-Warshall for dense, modest-sized graphs when all-pairs distances are required, negative edges may exist, and `O(V^2)` memory is acceptable. Its simple `O(V^3)` loops often beat running Bellman-Ford from every source and can beat repeated Dijkstra on dense graphs.

24. How would you find a shortest path when the graph has edge weights zero or one?

**Deep explanation:**

Use 0-1 BFS with a deque. Relax a zero-weight edge by pushing its endpoint to the front and a one-weight edge by pushing it to the back. This preserves nondecreasing distance processing and runs in `O(V+E)`, avoiding a heap.

**Interview answer:**

Use 0-1 BFS with a deque. Relax a zero-weight edge by pushing its endpoint to the front and a one-weight edge by pushing it to the back.

25. How would you design and validate an admissible heuristic for A-star search?

**Deep explanation:**

Use a lower bound on remaining cost, such as Manhattan distance for four-direction movement with unit minimum cost. Prove `h(n) <= trueCost(n,goal)`; preferably also prove consistency: `h(u) <= w(u,v)+h(v)`. Test against exact shortest distances on small generated cases, including obstacles and boundary conditions.

**Interview answer:**

Use a lower bound on remaining cost, such as Manhattan distance for four-direction movement with unit minimum cost. Prove `h(n) <= trueCost(n,goal)`; preferably also prove consistency: `h(u) <= w(u,v)+h(v)`.

26. How would you solve maximum flow and use it for bipartite matching?

**Deep explanation:**

Build a residual graph and run Dinic's algorithm: BFS constructs level graphs and DFS sends blocking flows, typically `O(V^2E)` in general. For bipartite matching, connect source to left vertices, left-to-right candidate edges, and right vertices to sink, all with capacity one. Unit flow edges identify matches; Hopcroft-Karp is more specialized at `O(E sqrt V)`.

**Interview answer:**

Build a residual graph and run Dinic's algorithm: BFS constructs level graphs and DFS sends blocking flows, typically `O(V^2E)` in general. For bipartite matching, connect source to left vertices, left-to-right candidate edges, and right vertices to sink, all with capacity one.

27. How would you detect whether a graph is bipartite and return a conflicting cycle?

**Deep explanation:**

BFS/DFS-color every component with two colors while storing parents and depths. An edge joining equal-colored vertices proves failure. Reconstruct an odd cycle by walking both endpoints toward their lowest common ancestor through parent links, joining those paths with the conflicting edge. Detection is `O(V+E)`.

**Interview answer:**

BFS/DFS-color every component with two colors while storing parents and depths. An edge joining equal-colored vertices proves failure.

28. How would you find an Eulerian trail in a directed graph?

**Deep explanation:**

Check degree conditions: for a trail, one vertex may have `out=in+1`, one `in=out+1`, and all others equal; nonzero-degree vertices must be connected in the appropriate underlying/reachability sense. Then use Hierholzer's algorithm, consuming unused outgoing edges and adding vertices on backtracking. Time is `O(E)`.

**Interview answer:**

Check degree conditions: for a trail, one vertex may have `out=in+1`, one `in=out+1`, and all others equal; nonzero-degree vertices must be connected in the appropriate underlying/reachability sense. Then use Hierholzer's algorithm, consuming unused outgoing edges and adding vertices on backtracking.

29. How would you reconstruct an itinerary using every ticket exactly once?

**Deep explanation:**

Model tickets as directed multigraph edges and compute an Eulerian trail with Hierholzer's algorithm. To obtain the lexicographically smallest valid itinerary, consume outgoing destinations from a min-heap (or reverse-sorted list) and append airports during backtracking, then reverse the result. Verify the result uses exactly `E+1` vertices.

**Interview answer:**

Model tickets as directed multigraph edges and compute an Eulerian trail with Hierholzer's algorithm. To obtain the lexicographically smallest valid itinerary, consume outgoing destinations from a min-heap (or reverse-sorted list) and append airports during backtracking, then reverse the result.

30. How would you implement a persistent data structure supporting historical queries?

**Deep explanation:**

Use path copying: each update creates new nodes only along the modified root-to-leaf path and reuses untouched subtrees. Store each version's root. A persistent segment tree, for example, supports point updates and range queries in `O(log n)` time and new space per update, while old versions remain immutable.

**Interview answer:**

Use path copying: each update creates new nodes only along the modified root-to-leaf path and reuses untouched subtrees. Store each version's root.

31. How would you solve interval dynamic programming for matrix-chain multiplication?

**Deep explanation:**

Let `dp[i][j]` be the minimum multiplication cost for matrices `i..j`. For increasing interval lengths, try every split `k`: `dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]`. Record the best split for reconstruction. Time is `O(n^3)` and space `O(n^2)`.

**Interview answer:**

Let `dp[i][j]` be the minimum multiplication cost for matrices `i..j`. For increasing interval lengths, try every split `k`: `dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]`.

32. How would you solve a traveling-salesperson variant using bitmask dynamic programming?

**Deep explanation:**

Use Held-Karp DP: `dp[mask][v]` is the minimum cost to start at the designated source, visit exactly `mask`, and end at `v`. Transition from `mask without v` through every predecessor, then add the return edge if a tour is required. Complexity is `O(n^2 2^n)` time and `O(n 2^n)` space.

**Interview answer:**

Use Held-Karp DP: `dp[mask][v]` is the minimum cost to start at the designated source, visit exactly `mask`, and end at `v`. Transition from `mask without v` through every predecessor, then add the return edge if a tour is required.

33. How would you optimize a dynamic program from quadratic to linear space?

**Deep explanation:**

Identify which earlier states each transition reads. If row `i` depends only on row `i-1`, keep two rows; if update order prevents overwriting dependencies, use one row and iterate in the safe direction. Preserve extra choice information only if reconstruction is required. Space becomes `O(n)` without changing time.

**Interview answer:**

Identify which earlier states each transition reads. If row `i` depends only on row `i-1`, keep two rows; if update order prevents overwriting dependencies, use one row and iterate in the safe direction.

34. How would you count valid numbers in a range using digit dynamic programming?

**Deep explanation:**

Define `count(x)` with DP state `(position, tight, started, propertyState)`, processing digits from most significant to least. `tight` limits choices to `x`'s prefix; `started` handles leading zeros. Memoize non-tight states, and answer `[L,R]` as `count(R)-count(L-1)`.

**Interview answer:**

Define `count(x)` with DP state `(position, tight, started, propertyState)`, processing digits from most significant to least. `tight` limits choices to `x`'s prefix; `started` handles leading zeros.

35. How would you solve wildcard matching and regular-expression matching?

**Deep explanation:**

Use DP over text and pattern prefixes. For wildcard matching, `?` consumes one character and `*` either consumes none or extends its match. For regex with `.` and postfix `*`, a star skips its atom or consumes one matching character while staying on that pattern state. Both take `O(nm)` time; rows can be compressed.

**Interview answer:**

Use DP over text and pattern prefixes. For wildcard matching, `?` consumes one character and `*` either consumes none or extends its match.

36. How would you find the longest palindromic substring in linear time?

**Deep explanation:**

Use Manacher's algorithm. Transform the string with separators to unify odd/even palindromes, maintain the rightmost palindrome's center and boundary, and initialize each radius from its mirror before expanding. Each expansion advances the global boundary amortized linearly, yielding `O(n)` time and space.

**Interview answer:**

Use Manacher's algorithm. Transform the string with separators to unify odd/even palindromes, maintain the rightmost palindrome's center and boundary, and initialize each radius from its mirror before expanding.

37. How would you implement substring search with KMP or a rolling hash?

**Deep explanation:**

KMP preprocesses the pattern's longest-prefix-suffix table and uses it to avoid rechecking text, giving deterministic `O(n+m)` time. Rabin-Karp compares rolling hashes in `O(n+m)` expected time and verifies characters on hash matches. KMP is preferable when worst-case guarantees matter.

**Interview answer:**

KMP preprocesses the pattern's longest-prefix-suffix table and uses it to avoid rechecking text, giving deterministic `O(n+m)` time. Rabin-Karp compares rolling hashes in `O(n+m)` expected time and verifies characters on hash matches.

38. How would you guard a rolling-hash algorithm against collisions?

**Deep explanation:**

Use two independent large moduli or a well-designed wide hash with a randomized base, and compare the actual substring whenever hashes match. Randomization makes adversarial collision construction harder; direct verification preserves correctness. Avoid overflow mistakes by using appropriate-width arithmetic or explicit modular multiplication.

**Interview answer:**

Use two independent large moduli or a well-designed wide hash with a randomized base, and compare the actual substring whenever hashes match. Randomization makes adversarial collision construction harder; direct verification preserves correctness.

39. How would you build suffix-based indexes for repeated substring queries?

**Deep explanation:**

Build a suffix array plus LCP array for compact static indexing: sort suffixes in `O(n log n)` with doubling, then binary-search patterns in `O(m log n)` (or better with LCP acceleration). A suffix tree/automaton offers faster query capabilities at higher implementation complexity. Choose based on query type and memory.

**Interview answer:**

Build a suffix array plus LCP array for compact static indexing: sort suffixes in `O(n log n)` with doubling, then binary-search patterns in `O(m log n)` (or better with LCP acceleration). A suffix tree/automaton offers faster query capabilities at higher implementation complexity.

40. How would you match many patterns against a text stream?

**Deep explanation:**

Build an Aho-Corasick trie, then BFS-compute failure links and inherited output lists. Process each text character by following trie/failure transitions and report patterns at the resulting state. Construction is linear in total pattern length times alphabet-transition costs; scanning is `O(text length + matches)`.

**Interview answer:**

Build an Aho-Corasick trie, then BFS-compute failure links and inherited output lists. Process each text character by following trie/failure transitions and report patterns at the resulting state.

41. How would you prove a greedy algorithm using an exchange argument?

**Deep explanation:**

Take an optimal solution that agrees with the greedy choices for the longest prefix. Show its next differing choice can be exchanged for the greedy choice without violating feasibility or worsening the objective. Repeating exchanges produces an optimal solution identical to the greedy result, proving correctness.

**Interview answer:**

Take an optimal solution that agrees with the greedy choices for the longest prefix. Show its next differing choice can be exchanged for the greedy choice without violating feasibility or worsening the objective.

42. How would you identify when a problem requires approximation rather than exact search?

**Deep explanation:**

First recognize an NP-hard core through a known reduction or formulation and estimate whether exact exponential, pseudo-polynomial, parameterized, or integer-programming methods fit the constraints. If not, define the acceptable guarantee and use an approximation with a proven ratio, or a heuristic when guarantees are unnecessary. State assumptions and validate solution quality empirically.

**Interview answer:**

First recognize an NP-hard core through a known reduction or formulation and estimate whether exact exponential, pseudo-polynomial, parameterized, or integer-programming methods fit the constraints. If not, define the acceptable guarantee and use an approximation with a proven ratio, or a heuristic when guarantees are unnecessary.

43. How would you implement a Bloom filter and estimate its false-positive rate?

**Deep explanation:**

Maintain an `m`-bit array and set `k` hash-derived positions per inserted key; membership returns “possibly present” only if all are set, with no false negatives under insertion-only use. After `n` inserts, false-positive probability is approximately `(1-e^{-kn/m})^k`; optimal `k` is about `(m/n) ln 2`.

**Interview answer:**

Maintain an `m`-bit array and set `k` hash-derived positions per inserted key; membership returns “possibly present” only if all are set, with no false negatives under insertion-only use. After `n` inserts, false-positive probability is approximately `(1-e^{-kn/m})^k`; optimal `k` is about `(m/n) ln 2`.

44. How would you estimate distinct values in a stream without storing every value?

**Deep explanation:**

Use HyperLogLog. Hash each item, use leading bits to select a register, and store the maximum observed leading-zero rank from the remaining bits. A bias-corrected harmonic mean of `2^register` values estimates cardinality with relative error about `1.04/sqrt(m)` for `m` registers.

**Interview answer:**

Use HyperLogLog. Hash each item, use leading bits to select a register, and store the maximum observed leading-zero rank from the remaining bits.

45. How would you find heavy hitters with sublinear memory?

**Deep explanation:**

Use Misra-Gries with `k-1` counters to find all items whose frequency exceeds `n/k`: increment tracked items, add into free slots, otherwise decrement all counters. Candidates require a second pass for exact counts. In one-pass approximate settings, Count-Min Sketch estimates frequencies with bounded additive error.

**Interview answer:**

Use Misra-Gries with `k-1` counters to find all items whose frequency exceeds `n/k`: increment tracked items, add into free slots, otherwise decrement all counters. Candidates require a second pass for exact counts.

46. How would you solve a nearest-neighbor problem in two-dimensional space?

**Deep explanation:**

For static balanced spatial data, build a k-d tree and recursively search the nearer side first, pruning the other side when its bounding region cannot beat the best distance. Average queries are often logarithmic but worst case is linear. For guaranteed planar structures or high dimensions, choose Voronoi/Delaunay or approximate methods appropriately.

**Interview answer:**

For static balanced spatial data, build a k-d tree and recursively search the nearer side first, pruning the other side when its bounding region cannot beat the best distance. Average queries are often logarithmic but worst case is linear.

47. How would you count intersecting intervals with a sweep-line algorithm?

**Deep explanation:**

Create start and end events, sort them, and maintain the number of active intervals. At each start, add the active count to the answer, then activate it; at each end, deactivate it. Define tie ordering from endpoint semantics: for closed intervals process starts before ends, and for half-open intervals process ends first. Complexity is `O(n log n)`.

**Interview answer:**

Create start and end events, sort them, and maintain the number of active intervals. At each start, add the active count to the answer, then activate it; at each end, deactivate it.

48. How would you use meet-in-the-middle to solve a large subset-sum instance?

**Deep explanation:**

Split `n` elements into two halves and enumerate each half's subset sums in `O(2^{n/2})`. Sort one list, then for each sum in the other binary-search for an exact complement or best feasible complement. This reduces time from `O(2^n)` to roughly `O(2^{n/2} n)` at similar exponential space.

**Interview answer:**

Split `n` elements into two halves and enumerate each half's subset sums in `O(2^{n/2})`. Sort one list, then for each sum in the other binary-search for an exact complement or best feasible complement.

49. How would you handle adversarial input that degrades a hash-table solution?

**Deep explanation:**

Use a keyed randomized hash chosen per process, resize at a controlled load factor, and cap collision behavior with treeified buckets or a worst-case structure. For untrusted keys, prefer hardened library maps or balanced trees when deterministic `O(log n)` is acceptable. Never rely solely on expected `O(1)` under attacker-controlled hashing.

**Interview answer:**

Use a keyed randomized hash chosen per process, resize at a controlled load factor, and cap collision behavior with treeified buckets or a worst-case structure. For untrusted keys, prefer hardened library maps or balanced trees when deterministic `O(log n)` is acceptable.

50. How would you justify correctness, complexity, and edge cases under interview time pressure?

**Deep explanation:**

State the invariant or DP meaning before coding, explain initialization, preservation by each operation/transition, and why termination yields the answer. Then give tight time and space bounds by counting operations. Walk through empty/minimal input, duplicates, boundaries, overflow, invalid/unreachable states, and one representative example.

**Interview answer:**

State the invariant or DP meaning before coding, explain initialization, preservation by each operation/transition, and why termination yields the answer. Then give tight time and space bounds by counting operations.

51. How would you implement an order-statistics tree with insert, delete, and rank operations?

**Deep explanation:**

Augment each balanced BST node with subtree size, including duplicate multiplicity if needed. Rotations and mutations recompute sizes locally. `select(k)` compares `k` with left size; `rank(x)` accumulates skipped left subtrees while descending. Balancing keeps insert, delete, rank, and select at `O(log n)`.

**Interview answer:**

Augment each balanced BST node with subtree size, including duplicate multiplicity if needed. Rotations and mutations recompute sizes locally.

52. How would you use binary lifting to answer ancestor queries?

**Deep explanation:**

Precompute `up[v][j]`, the `2^j`th ancestor of every node, with `up[v][j]=up[up[v][j-1]][j-1]`. To find the kth ancestor, lift `v` for each set bit of `k`. Preprocessing is `O(n log n)`, each query `O(log n)`, and missing ancestors use a sentinel.

**Interview answer:**

Precompute `up[v][j]`, the `2^j`th ancestor of every node, with `up[v][j]=up[up[v][j-1]][j-1]`. To find the kth ancestor, lift `v` for each set bit of `k`.

53. How would you solve dynamic connectivity when edges are removed offline?

**Deep explanation:**

If operations are only deletions, process them in reverse: start with edges never deleted, turn each reversed deletion into a DSU union, and answer reversed queries. For arbitrary add/remove intervals, place each edge into segment-tree nodes covering its active time range and DFS the tree with rollback DSU. Complexity is near-linear or `O((E+Q) log Q log V)` without union-by-rank refinements.

**Interview answer:**

If operations are only deletions, process them in reverse: start with edges never deleted, turn each reversed deletion into a DSU union, and answer reversed queries. For arbitrary add/remove intervals, place each edge into segment-tree nodes covering its active time range and DFS the tree with rollback DSU.

54. How would you use rollback disjoint-set union without ordinary path compression?

**Deep explanation:**

Use union by size/rank but do not path-compress, so each union changes only a constant number of fields. Push those old values onto a history stack; record a snapshot size and undo until the stack returns to it. Find remains `O(log n)`, while rollback is `O(1)` per reverted union.

**Interview answer:**

Use union by size/rank but do not path-compress, so each union changes only a constant number of fields. Push those old values onto a history stack; record a snapshot size and undo until the stack returns to it.

55. How would you solve a tree dynamic program that combines child subproblems?

**Deep explanation:**

Root the tree and process it postorder. Define `dp[u]` precisely as the best/count/state for `u`'s subtree under each relevant condition, initialize from `u`, and merge child states one at a time. The merge must account for whether child choices interact; complexity is the sum of merge-state products across edges.

**Interview answer:**

Root the tree and process it postorder. Define `dp[u]` precisely as the best/count/state for `u`'s subtree under each relevant condition, initialize from `u`, and merge child states one at a time.

56. How would you reroot a tree dynamic program to compute an answer for every root?

**Deep explanation:**

First run a postorder DP to compute subtree contributions. Then run a preorder pass carrying the contribution from outside each child's subtree; derive the child's whole-tree answer by removing its contribution from the parent aggregate and adding the parent-side contribution. Prefix/suffix aggregates handle non-invertible merges in total `O(n)` or `O(n * state)` time.

**Interview answer:**

First run a postorder DP to compute subtree contributions. Then run a preorder pass carrying the contribution from outside each child's subtree; derive the child's whole-tree answer by removing its contribution from the parent aggregate and adding the parent-side contribution.

57. How would you use heavy-light decomposition for path queries?

**Deep explanation:**

Compute parent, depth, subtree size, and each node's heavy child, then assign chain heads and linearized positions. A path splits into `O(log n)` chain segments; query/update those ranges with a segment tree, repeatedly lifting the deeper chain head. Typical path queries take `O(log^2 n)`, or `O(log n)` with specialized aggregation.

**Interview answer:**

Compute parent, depth, subtree size, and each node's heavy child, then assign chain heads and linearized positions. A path splits into `O(log n)` chain segments; query/update those ranges with a segment tree, repeatedly lifting the deeper chain head.

58. How would you compare sparse tables with segment trees for static range queries?

**Deep explanation:**

Sparse tables preprocess immutable data in `O(n log n)`. Idempotent queries such as min/max take `O(1)` by overlapping two blocks; general associative queries take `O(log n)`. Segment trees use `O(n)` space, answer in `O(log n)`, and support updates, so they are preferable for dynamic data.

**Interview answer:**

Sparse tables preprocess immutable data in `O(n log n)`. Idempotent queries such as min/max take `O(1)` by overlapping two blocks; general associative queries take `O(log n)`.

59. How would you optimize a dynamic program using a monotonic queue?

**Deep explanation:**

When a transition asks for the min/max of prior DP values over a sliding valid range, keep candidate indices in a deque ordered by DP value. Remove expired indices from the front and dominated candidates from the back before inserting each state. Each state enters and exits once, reducing a window scan from quadratic to linear time.

**Interview answer:**

When a transition asks for the min/max of prior DP values over a sliding valid range, keep candidate indices in a deque ordered by DP value. Remove expired indices from the front and dominated candidates from the back before inserting each state.

60. How would you derive and apply the convex-hull trick to a suitable recurrence?

**Deep explanation:**

Rewrite the transition as `dp[i] = query(x_i)` over lines `y = m_j*x + b_j`, where each prior state supplies `m_j,b_j`. Maintain the lower/upper envelope and query the best line. Monotone slopes and query points allow a deque in `O(n)`; arbitrary order uses Li Chao tree or dynamic hull in `O(n log C)`/`O(n log n)`. Handle equal slopes and overflow.

**Interview answer:**

Rewrite the transition as `dp[i] = query(x_i)` over lines `y = m_j*x + b_j`, where each prior state supplies `m_j,b_j`. Maintain the lower/upper envelope and query the best line.

61. How would you solve weighted interval scheduling and reconstruct the selected intervals?

**Deep explanation:**

Sort intervals by finish time and binary-search `p(i)`, the last compatible predecessor. Use `dp[i]=max(dp[i-1], weight[i]+dp[p(i)])`. Record whether interval `i` was chosen; backtrack to `p(i)` when chosen, otherwise to `i-1`. Time is `O(n log n)` and space `O(n)`.

**Interview answer:**

Sort intervals by finish time and binary-search `p(i)`, the last compatible predecessor. Use `dp[i]=max(dp[i-1], weight[i]+dp[p(i)])`.

62. How would you reconstruct an optimal solution from a space-optimized dynamic program?

**Deep explanation:**

Either store compact decisions/predecessors during the forward pass, recompute needed rows while backtracking, or use divide-and-conquer reconstruction such as Hirschberg's algorithm. Hirschberg combines forward and backward linear-space DP to identify a midpoint split recursively, retaining optimal time order and linear working space.

**Interview answer:**

Either store compact decisions/predecessors during the forward pass, recompute needed rows while backtracking, or use divide-and-conquer reconstruction such as Hirschberg's algorithm. Hirschberg combines forward and backward linear-space DP to identify a midpoint split recursively, retaining optimal time order and linear working space.

63. How would you implement consistent randomized shuffling and test for obvious bias?

**Deep explanation:**

Use Fisher-Yates: for `i` from `n-1` down to `1`, swap position `i` with a uniform random index in `[0,i]`. Inject or seed a documented PRNG only when reproducibility is required. Test many shuffles using position-frequency and permutation-frequency chi-square checks, while recognizing statistical tests cannot prove perfect uniformity.

**Interview answer:**

Use Fisher-Yates: for `i` from `n-1` down to `1`, swap position `i` with a uniform random index in `[0,i]`. Inject or seed a documented PRNG only when reproducibility is required.

64. How would you select the kth value from several sorted data sources?

**Deep explanation:**

For `s` sources, place each source's first item in a min-heap and pop/push successors `k` times, costing `O(k log s)` and `O(s)` space—ideal for streams. For random-access arrays and large `k`, binary-search the value domain by counting elements `<= mid` in each source, then locate the smallest value with cumulative count at least `k`.

**Interview answer:**

For `s` sources, place each source's first item in a min-heap and pop/push successors `k` times, costing `O(k log s)` and `O(s)` space—ideal for streams. For random-access arrays and large `k`, binary-search the value domain by counting elements `<= mid` in each source, then locate the smallest value with cumulative count at least `k`.

65. How would you design an external-memory graph traversal for data larger than RAM?

**Deep explanation:**

Store adjacency lists and frontier/visited structures in partitioned, sequentially readable files. For BFS, batch frontier vertices, externally sort or hash-partition neighbor IDs, deduplicate against disk-backed visited data, and produce the next frontier; compressed bitmaps help when IDs are dense. Optimize I/O passes and locality, since random disk access—not CPU—is the main cost.

**Interview answer:**

Store adjacency lists and frontier/visited structures in partitioned, sequentially readable files. For BFS, batch frontier vertices, externally sort or hash-partition neighbor IDs, deduplicate against disk-backed visited data, and produce the next frontier; compressed bitmaps help when IDs are dense.
