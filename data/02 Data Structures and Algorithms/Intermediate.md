1. How would you find a maximum-sum contiguous subarray?

**Deep explanation:** Use Kadane's algorithm. Track the best sum ending at the current element, `current = max(value, current + value)`, and the best sum seen globally. Initialize both from the first element so an all-negative array returns its largest element. Time is O(n), space is O(1).

**Interview answer:** Use Kadane's algorithm.  Track the best sum ending at the current element, `current = max(value, current + value)`, and the best sum seen globally.

2. How would you find the longest substring without repeated characters?

**Deep explanation:** Use a sliding window and map each character to its latest index. When a repeated character lies inside the window, move the left boundary to one past its previous index; update the maximum window length after each step. Time is O(n), space is O(k) for the character set.

**Interview answer:** Use a sliding window and map each character to its latest index.  When a repeated character lies inside the window, move the left boundary to one past its previous index; update the maximum window length after each step.

3. How would you find all anagram positions in a larger string?

**Deep explanation:** Slide a fixed-size window equal to the pattern length while maintaining character frequencies. Compare its frequency state with the pattern, or track how many counts currently match, and record the window's start whenever all counts match. Time is O(n + alphabet size).

**Interview answer:** Slide a fixed-size window equal to the pattern length while maintaining character frequencies.  Compare its frequency state with the pattern, or track how many counts currently match, and record the window's start whenever all counts match.

4. How would you find the smallest subarray meeting a target sum?

**Deep explanation:** If values are nonnegative, expand a sliding window until its sum reaches the target, then shrink from the left while it remains valid, recording the minimum length. This is O(n). With arbitrary signed values, use prefix sums plus a monotonic deque instead.

**Interview answer:** If values are nonnegative, expand a sliding window until its sum reaches the target, then shrink from the left while it remains valid, recording the minimum length.  This is O(n).

5. How would negative values change a sliding-window sum solution?

**Deep explanation:** Negative values break the monotonic behavior that makes ordinary sliding windows correct: expanding can lower the sum and shrinking can raise it. For a shortest subarray with sum at least a target, use prefix sums and a deque of indices with increasing prefix sums, yielding O(n).

**Interview answer:** Negative values break the monotonic behavior that makes ordinary sliding windows correct: expanding can lower the sum and shrinking can raise it.  For a shortest subarray with sum at least a target, use prefix sums and a deque of indices with increasing prefix sums, yielding O(n).

6. How would you calculate the product of an array except each element itself?

**Deep explanation:** Store prefix products in the output, then traverse right-to-left while accumulating a suffix product and multiply it into each output entry. This avoids division, handles zeros naturally, and runs in O(n) time with O(1) auxiliary space excluding the result.

**Interview answer:** Store prefix products in the output, then traverse right-to-left while accumulating a suffix product and multiply it into each output entry.  This avoids division, handles zeros naturally, and runs in O(n) time with O(1) auxiliary space excluding the result.

7. How would you find a missing number and a duplicate number?

**Deep explanation:** For numbers 1 through n, compare the observed sum and sum of squares with their expected values. If `d - m` and `d² - m²` are known, divide the second by the first to obtain `d + m`, then solve for duplicate `d` and missing `m`. Use a wide integer type.

**Interview answer:** For numbers 1 through n, compare the observed sum and sum of squares with their expected values.  If `d - m` and `d² - m²` are known, divide the second by the first to obtain `d + m`, then solve for duplicate `d` and missing `m`.

8. How would you find all unique triples summing to zero?

**Deep explanation:** Sort the array, fix each distinct first value, and use two pointers for the remaining pair. Move pointers according to the sum and skip duplicate values after finding a triple. Time is O(n²); sorting plus duplicate skipping guarantees unique results.

**Interview answer:** Sort the array, fix each distinct first value, and use two pointers for the remaining pair.  Move pointers according to the sum and skip duplicate values after finding a triple.

9. How would you merge overlapping intervals?

**Deep explanation:** Sort intervals by start, then scan them. If the next start is at most the current merged end, extend the end; otherwise, emit the current interval and start a new one. Time is O(n log n), dominated by sorting.

**Interview answer:** Sort intervals by start, then scan them.  If the next start is at most the current merged end, extend the end; otherwise, emit the current interval and start a new one.

10. How would you insert an interval into a sorted nonoverlapping interval list?

**Deep explanation:** Copy intervals ending before the new interval, merge every interval whose start is at most the new end, append the merged interval, then copy the remainder. Because the input is already ordered and disjoint, this takes O(n) time.

**Interview answer:** Copy intervals ending before the new interval, merge every interval whose start is at most the new end, append the merged interval, then copy the remainder.  Because the input is already ordered and disjoint, this takes O(n) time.

11. How would you calculate how many meeting rooms are needed?

**Deep explanation:** Sort start times and end times separately. Sweep with two pointers: allocate a room when the next start precedes the next end, otherwise release one first. Track the maximum active count. Define explicitly whether a meeting ending at time t frees a room for one starting at t.

**Interview answer:** Sort start times and end times separately.  Sweep with two pointers: allocate a room when the next start precedes the next end, otherwise release one first.

12. How would you search a rotated sorted array with duplicates?

**Deep explanation:** Use modified binary search. When `left`, `mid`, and `right` are equal, shrink both ends because the sorted half is ambiguous; otherwise identify the sorted half and decide whether the target lies within it. Average time is O(log n), but duplicates can force O(n) worst case.

**Interview answer:** Use modified binary search.  When `left`, `mid`, and `right` are equal, shrink both ends because the sorted half is ambiguous; otherwise identify the sorted half and decide whether the target lies within it.

13. How would you find the first and last positions of a target?

**Deep explanation:** Run two binary searches: a lower bound for the first index with value at least the target and an upper bound for the first index greater than it. If the lower-bound value is not the target, return not found; otherwise the range is `[lower, upper - 1]`.

**Interview answer:** Run two binary searches: a lower bound for the first index with value at least the target and an upper bound for the first index greater than it.  If the lower-bound value is not the target, return not found; otherwise the range is `[lower, upper - 1]`.

14. How would you binary-search the minimum feasible shipping capacity?

**Deep explanation:** Search capacities from the maximum package weight to the total weight. A greedy feasibility check loads packages in order and counts required days; capacity is feasible when that count is within the limit. Since feasibility is monotonic, binary search finds the minimum in O(n log(sum - max)).

**Interview answer:** Search capacities from the maximum package weight to the total weight.  A greedy feasibility check loads packages in order and counts required days; capacity is feasible when that count is within the limit.

15. How would you find the kth-largest element without fully sorting?

**Deep explanation:** Use quickselect for expected O(n) time: partition around a pivot and recurse only into the side containing index `n - k`. A size-k min-heap is O(n log k) and gives predictable behavior; randomized pivots reduce quickselect's chance of O(n²) worst case.

**Interview answer:** Use quickselect for expected O(n) time: partition around a pivot and recurse only into the side containing index `n - k`.  A size-k min-heap is O(n log k) and gives predictable behavior; randomized pivots reduce quickselect's chance of O(n²) worst case.

16. How would you sort a linked list in O(n log n) time?

**Deep explanation:** Use merge sort. Split the list with slow and fast pointers, recursively sort both halves, and merge them by relinking nodes. It runs in O(n log n); a bottom-up version uses O(1) auxiliary node storage and avoids recursion-stack space.

**Interview answer:** Use merge sort.  Split the list with slow and fast pointers, recursively sort both halves, and merge them by relinking nodes.

17. How would you find the intersection of two linked lists?

**Deep explanation:** Traverse with two pointers, switching each pointer to the other list's head when it reaches null. Both then travel the same combined distance and meet at the shared node or at null. Compare node identity, not value; time is O(m + n), space O(1).

**Interview answer:** Traverse with two pointers, switching each pointer to the other list's head when it reaches null.  Both then travel the same combined distance and meet at the shared node or at null.

18. How would you clone a linked list containing random pointers?

**Deep explanation:** Either map each original node to its clone in two passes, or interleave clones after originals, assign each clone's random pointer through `original.random.next`, then detach the lists. The interleaving method takes O(n) time and O(1) auxiliary space.

**Interview answer:** Either map each original node to its clone in two passes, or interleave clones after originals, assign each clone's random pointer through `original. random.

19. How would you reverse linked-list nodes in groups of k?

**Deep explanation:** For each group, first locate its kth node; if fewer than k remain, leave them unchanged. Reverse pointers within the group, connect the previous group's tail to the new head, and advance. Time is O(n), space O(1).

**Interview answer:** For each group, first locate its kth node; if fewer than k remain, leave them unchanged.  Reverse pointers within the group, connect the previous group's tail to the new head, and advance.

20. How would you implement a queue using two stacks?

**Deep explanation:** Push new values onto an input stack. For dequeue or peek, if the output stack is empty, move all input values to it, reversing their order. Each value moves at most once between stacks, so operations are O(1) amortized.

**Interview answer:** Push new values onto an input stack.  For dequeue or peek, if the output stack is empty, move all input values to it, reversing their order.

21. How would you implement a stack supporting constant-time minimum queries?

**Deep explanation:** Store each pushed value with the minimum at or below it, or maintain a second stack of minima. Then push, pop, top, and minimum are all O(1). With a second stack, push duplicate minima too so popping remains correct.

**Interview answer:** Store each pushed value with the minimum at or below it, or maintain a second stack of minima.  Then push, pop, top, and minimum are all O(1).

22. How would you find the next greater element for every array position?

**Deep explanation:** Scan left-to-right with a stack of indices whose values form a decreasing sequence. While the current value exceeds the value at the stack top, pop that index and set its answer to the current value. Unpopped indices have no greater element. Time is O(n).

**Interview answer:** Scan left-to-right with a stack of indices whose values form a decreasing sequence.  While the current value exceeds the value at the stack top, pop that index and set its answer to the current value.

23. How would you evaluate an expression with parentheses and operator precedence?

**Deep explanation:** Tokenize first, then use two stacks or convert with the shunting-yard algorithm. Operators are applied according to precedence and associativity; parentheses trigger evaluation until the matching opening parenthesis. Handle unary operators explicitly rather than treating every minus as binary.

**Interview answer:** Tokenize first, then use two stacks or convert with the shunting-yard algorithm.  Operators are applied according to precedence and associativity; parentheses trigger evaluation until the matching opening parenthesis.

24. How would you implement an LRU cache with constant-time average operations?

**Deep explanation:** Combine a hash map from key to node with a doubly linked list ordered by recency. Reads and updates move a node to the front; insertion at capacity removes the tail and its map entry. Map lookup and list operations are O(1) average.

**Interview answer:** Combine a hash map from key to node with a doubly linked list ordered by recency.  Reads and updates move a node to the front; insertion at capacity removes the tail and its map entry.

25. How would you find the top k most frequent values?

**Deep explanation:** Count values with a hash map, then maintain a size-k min-heap keyed by frequency for O(n log k), or place values into frequency buckets for O(n) time and O(n) space. Define a tie-breaking rule if output order matters.

**Interview answer:** Count values with a hash map, then maintain a size-k min-heap keyed by frequency for O(n log k), or place values into frequency buckets for O(n) time and O(n) space.  Define a tie-breaking rule if output order matters.

26. How would you merge k sorted lists using bounded extra memory?

**Deep explanation:** Put each nonempty list's head into a min-heap of at most k nodes. Repeatedly remove the smallest node, append it to the result, and insert its successor. This reuses nodes, takes O(N log k) time, and O(k) auxiliary space.

**Interview answer:** Put each nonempty list's head into a min-heap of at most k nodes.  Repeatedly remove the smallest node, append it to the result, and insert its successor.

27. How would you validate a binary search tree with duplicate-key rules?

**Deep explanation:** Recurse while carrying lower and upper bounds plus whether each bound is inclusive. The duplicate policy determines inclusivity—for example, duplicates allowed only on the right means the left upper bound is exclusive and the right lower bound inclusive. Every node must satisfy its inherited bounds.

**Interview answer:** Recurse while carrying lower and upper bounds plus whether each bound is inclusive.  The duplicate policy determines inclusivity—for example, duplicates allowed only on the right means the left upper bound is exclusive and the right lower bound inclusive.

28. How would you find the lowest common ancestor of two tree nodes?

**Deep explanation:** In a general binary tree, recurse into both children: return the current node if it matches either target, and if both sides return non-null, the current node is the LCA. In a BST, use key ordering to descend toward the split point in O(height).

**Interview answer:** In a general binary tree, recurse into both children: return the current node if it matches either target, and if both sides return non-null, the current node is the LCA.  In a BST, use key ordering to descend toward the split point in O(height).

29. How would you reconstruct a tree from traversal sequences?

**Deep explanation:** With preorder and inorder, preorder identifies the root and inorder divides left and right subtrees. Build an inorder index map and recurse over index ranges for O(n) time. Unique reconstruction generally requires distinct values and inorder paired with preorder or postorder.

**Interview answer:** With preorder and inorder, preorder identifies the root and inorder divides left and right subtrees.  Build an inorder index map and recurse over index ranges for O(n) time.

30. How would you serialize and deserialize a binary tree?

**Deep explanation:** Use preorder or level-order traversal and include explicit null markers so shape is preserved. Serialize tokens with an unambiguous delimiter or length prefix; deserialize by consuming tokens in the same order. Both operations take O(n) time and space.

**Interview answer:** Use preorder or level-order traversal and include explicit null markers so shape is preserved.  Serialize tokens with an unambiguous delimiter or length prefix; deserialize by consuming tokens in the same order.

31. How would you check whether a binary tree is balanced?

**Deep explanation:** Use postorder traversal returning subtree height, but return a sentinel such as -1 immediately when a subtree is unbalanced. A node is balanced when both children are balanced and their heights differ by at most one. Each node is visited once: O(n).

**Interview answer:** Use postorder traversal returning subtree height, but return a sentinel such as -1 immediately when a subtree is unbalanced.  A node is balanced when both children are balanced and their heights differ by at most one.

32. How would you find all root-to-leaf paths with a target sum?

**Deep explanation:** Perform DFS while maintaining the current path and remaining sum. At a leaf, record a copy of the path if its value completes the target; backtrack by removing the node before returning. Time is O(n) plus the cost of copying reported paths.

**Interview answer:** Perform DFS while maintaining the current path and remaining sum.  At a leaf, record a copy of the path if its value completes the target; backtrack by removing the node before returning.

33. How would you count islands in a two-dimensional grid?

**Deep explanation:** Scan every cell. On unvisited land, increment the count and flood-fill its connected component with DFS or BFS, marking cells visited. With four-direction adjacency, time is O(rows × columns); use iterative traversal if recursion depth may be large.

**Interview answer:** Scan every cell.  On unvisited land, increment the count and flood-fill its connected component with DFS or BFS, marking cells visited.

34. How would you detect cycles in directed and undirected graphs?

**Deep explanation:** For a directed graph, DFS with three states detects an edge to a currently visiting node, or use Kahn's algorithm and see whether all nodes are processed. For an undirected graph, DFS detects a visited neighbor other than the parent; disjoint-set union is another option for edge lists.

**Interview answer:** For a directed graph, DFS with three states detects an edge to a currently visiting node, or use Kahn's algorithm and see whether all nodes are processed.  For an undirected graph, DFS detects a visited neighbor other than the parent; disjoint-set union is another option for edge lists.

35. How would you produce a valid course order from prerequisites?

**Deep explanation:** Model prerequisites as directed edges and perform topological sorting. Kahn's algorithm repeatedly removes zero-indegree courses and decreases neighbors' indegrees. If the result contains every course, it is valid; otherwise a cycle makes completion impossible. Complexity is O(V + E).

**Interview answer:** Model prerequisites as directed edges and perform topological sorting.  Kahn's algorithm repeatedly removes zero-indegree courses and decreases neighbors' indegrees.

36. How would you find a shortest path in an unweighted maze?

**Deep explanation:** Run BFS from the start because it explores positions in nondecreasing edge distance. Mark cells visited when enqueuing and store each cell's predecessor to reconstruct the route once the destination is reached. Time and space are O(rows × columns).

**Interview answer:** Run BFS from the start because it explores positions in nondecreasing edge distance.  Mark cells visited when enqueuing and store each cell's predecessor to reconstruct the route once the destination is reached.

37. How would you implement Dijkstra's algorithm and state its assumptions?

**Deep explanation:** Initialize the source distance to zero and use a min-priority queue. Repeatedly pop the smallest tentative distance, skip stale entries, and relax outgoing edges. With adjacency lists and a heap it is O((V + E) log V). It requires nonnegative edge weights.

**Interview answer:** Initialize the source distance to zero and use a min-priority queue.  Repeatedly pop the smallest tentative distance, skip stale entries, and relax outgoing edges.

38. How would you find a minimum spanning tree?

**Deep explanation:** Kruskal sorts edges by weight and adds an edge when disjoint-set union says it connects different components, taking O(E log E). Prim grows from a vertex using a min-heap, typically O(E log V). A spanning tree exists only if the undirected graph is connected.

**Interview answer:** Kruskal sorts edges by weight and adds an edge when disjoint-set union says it connects different components, taking O(E log E).  Prim grows from a vertex using a min-heap, typically O(E log V).

39. How would you use disjoint-set union to track connectivity?

**Deep explanation:** Give each element a parent and rank or size. `find` returns its representative using path compression; `union` joins representatives by rank or size. Connectivity is equality of representatives. Amortized operation cost is effectively constant, O(α(n)).

**Interview answer:** Give each element a parent and rank or size. `find`  returns its representative using path compression; `union` joins representatives by rank or size.

40. How would you generate subsets, permutations, and combinations without unwanted duplicates?

**Deep explanation:** Sort the input and backtrack. At each recursion depth, skip a value equal to the previous candidate at that same depth. Subsets and combinations advance a start index; permutations use a `used` array and also skip an equal value when its previous copy is unused.

**Interview answer:** Sort the input and backtrack.  At each recursion depth, skip a value equal to the previous candidate at that same depth.

41. How would you solve N-Queens using backtracking?

**Deep explanation:** Place one queen per row and backtrack over columns. Track occupied columns and both diagonals (`row - col` and `row + col`) in sets or bit masks for O(1) conflict checks. Remove each placement when returning to explore the next candidate.

**Interview answer:** Place one queen per row and backtrack over columns.  Track occupied columns and both diagonals (`row - col` and `row + col`) in sets or bit masks for O(1) conflict checks.

42. How would you solve a word-search puzzle with a trie?

**Deep explanation:** Insert all words into a trie, then start DFS from each board cell. Follow only trie edges matching adjacent cells, mark a cell during the current path, and emit words at terminal nodes. Prune exhausted trie branches and deduplicate terminals to avoid repeated work.

**Interview answer:** Insert all words into a trie, then start DFS from each board cell.  Follow only trie edges matching adjacent cells, mark a cell during the current path, and emit words at terminal nodes.

43. How would you solve coin change for minimum coins and number of combinations?

**Deep explanation:** These are separate DP formulations. For minimum coins, set `dp[0] = 0` and relax `dp[a] = min(dp[a], dp[a-coin] + 1)`. For unordered combination counts, iterate coins outermost and amounts upward, adding `ways[a-coin]` to `ways[a]`.

**Interview answer:** These are separate DP formulations.  For minimum coins, set `dp[0] = 0` and relax `dp[a] = min(dp[a], dp[a-coin] + 1)`.

44. How would you solve the longest increasing subsequence problem?

**Deep explanation:** Maintain `tails[i]`, the smallest possible ending value of an increasing subsequence of length `i + 1`. For each value, replace the first tail greater than or equal to it using binary search. The number of tails is the LIS length; time O(n log n).

**Interview answer:** Maintain `tails[i]`, the smallest possible ending value of an increasing subsequence of length `i + 1`.  For each value, replace the first tail greater than or equal to it using binary search.

45. How would you solve longest common subsequence and edit distance?

**Deep explanation:** Use 2D DP on prefixes. LCS copies the diagonal plus one when characters match, otherwise takes the maximum of top and left. Edit distance takes the minimum of insertion, deletion, and replacement costs. Both take O(mn) time and can use O(min(m,n)) space for length only.

**Interview answer:** Use 2D DP on prefixes.  LCS copies the diagonal plus one when characters match, otherwise takes the maximum of top and left.

46. How would you solve the zero-one knapsack problem?

**Deep explanation:** Let `dp[c]` be the best value achievable with capacity c. For each item, iterate capacities downward from the limit to its weight and update from `dp[c-weight] + value`; descending order prevents reusing an item. Time is O(items × capacity), space O(capacity).

**Interview answer:** Let `dp[c]` be the best value achievable with capacity c.  For each item, iterate capacities downward from the limit to its weight and update from `dp[c-weight] + value`; descending order prevents reusing an item.

47. How would you count paths through a grid containing obstacles?

**Deep explanation:** Use DP where an obstacle contributes zero paths and an open cell receives the sum from its top and left neighbors. Initialize the start to one if open. A single row array gives O(rows × columns) time and O(columns) space; counts may require a wide integer or modulus.

**Interview answer:** Use DP where an obstacle contributes zero paths and an open cell receives the sum from its top and left neighbors.  Initialize the start to one if open.

48. How would you decide whether greedy selection is valid for an interval problem?

**Deep explanation:** Identify an exchange argument: show that replacing the first choice of any optimal solution with the greedy choice never worsens the result, leaving the same type of subproblem. For maximum nonoverlapping intervals, choosing the earliest finishing interval satisfies this; choosing earliest start does not generally.

**Interview answer:** Identify an exchange argument: show that replacing the first choice of any optimal solution with the greedy choice never worsens the result, leaving the same type of subproblem.  For maximum nonoverlapping intervals, choosing the earliest finishing interval satisfies this; choosing earliest start does not generally.

49. How would you implement a prefix-sum structure for repeated range-sum queries?

**Deep explanation:** Build `prefix[0] = 0` and `prefix[i + 1] = prefix[i] + array[i]`. Then the inclusive sum from l through r is `prefix[r + 1] - prefix[l]`. Construction is O(n), each immutable query O(1); use a Fenwick or segment tree if updates are required.

**Interview answer:** Build `prefix[0] = 0` and `prefix[i + 1] = prefix[i] + array[i]`.  Then the inclusive sum from l through r is `prefix[r + 1] - prefix[l]`.

50. How would you count set bits and test whether an integer is a power of two?

**Deep explanation:** Brian Kernighan's loop repeatedly applies `x &= x - 1`, clearing the lowest set bit, so the iteration count is the popcount. A positive integer is a power of two exactly when `(x & (x - 1)) == 0`. Specify fixed-width behavior for negative integers.

**Interview answer:** Brian Kernighan's loop repeatedly applies `x &= x - 1`, clearing the lowest set bit, so the iteration count is the popcount.  A positive integer is a power of two exactly when `(x & (x - 1)) == 0`.

51. How would you implement quickselect and explain its expected complexity?

**Deep explanation:** Choose a preferably randomized pivot, partition values into positions below and above it, then continue only in the partition containing the desired index. Expected time is O(n) because the active range usually shrinks geometrically; worst case is O(n²), with O(1) extra space for in-place iterative partitioning.

**Interview answer:** Choose a preferably randomized pivot, partition values into positions below and above it, then continue only in the partition containing the desired index.  Expected time is O(n) because the active range usually shrinks geometrically; worst case is O(n²), with O(1) extra space for in-place iterative partitioning.

52. How would you implement stable counting sort for records with integer keys?

**Deep explanation:** Count each key, convert counts to cumulative ending positions, then traverse input records from right to left, placing each at `--position[key]` in an output array. Right-to-left placement preserves equal-key order. Complexity is O(n + key range) time and O(n + key range) space.

**Interview answer:** Count each key, convert counts to cumulative ending positions, then traverse input records from right to left, placing each at `--position[key]` in an output array.  Right-to-left placement preserves equal-key order.

53. How would you compare AVL trees and red-black trees?

**Deep explanation:** AVL trees enforce tighter height balance, giving faster lookups but potentially more rotations during updates. Red-black trees allow looser balance, generally making insertions and deletions cheaper while retaining O(log n) operations. AVL suits read-heavy workloads; red-black is common for mixed-update ordered maps.

**Interview answer:** AVL trees enforce tighter height balance, giving faster lookups but potentially more rotations during updates.  Red-black trees allow looser balance, generally making insertions and deletions cheaper while retaining O(log n) operations.

54. How would you delete a node from a binary search tree?

**Deep explanation:** Search by key. A leaf is removed directly; a node with one child is replaced by that child; a node with two children copies or moves its inorder successor (minimum in the right subtree) and then deletes that successor. Time is O(height), and parent/root links must be updated carefully.

**Interview answer:** Search by key.  A leaf is removed directly; a node with one child is replaced by that child; a node with two children copies or moves its inorder successor (minimum in the right subtree) and then deletes that successor.

55. How would you find the diameter and maximum path sum of a binary tree?

**Deep explanation:** Use postorder DFS. For diameter, return height and update a global maximum with `leftHeight + rightHeight` (in edges). For maximum path sum, return the best downward gain, clamp negative child gains to zero, and update globally with `node + leftGain + rightGain`.

**Interview answer:** Use postorder DFS.  For diameter, return height and update a global maximum with `leftHeight + rightHeight` (in edges).

56. How would you convert a sorted array into a balanced binary search tree?

**Deep explanation:** Recursively choose the middle element as root and build left and right subtrees from the two remaining ranges. This creates heights differing by at most one, takes O(n) time, and uses O(log n) recursion space for the balanced tree.

**Interview answer:** Recursively choose the middle element as root and build left and right subtrees from the two remaining ranges.  This creates heights differing by at most one, takes O(n) time, and uses O(log n) recursion space for the balanced tree.

57. How would you find the kth-smallest value in a binary search tree?

**Deep explanation:** Perform inorder traversal, which visits BST values in sorted order, and stop at the kth visited node. An iterative stack uses O(height) space and O(height + k) time. With subtree sizes stored in nodes, selection can be O(height).

**Interview answer:** Perform inorder traversal, which visits BST values in sorted order, and stop at the kth visited node.  An iterative stack uses O(height) space and O(height + k) time.

58. How would you find the longest consecutive sequence in an unsorted array?

**Deep explanation:** Put all values in a hash set. Start counting only from values whose predecessor is absent, then advance while consecutive successors exist. Each value participates in at most one sequence scan, so expected time is O(n) and space O(n).

**Interview answer:** Put all values in a hash set.  Start counting only from values whose predecessor is absent, then advance while consecutive successors exist.

59. How would you solve the container-with-most-water problem?

**Deep explanation:** Start pointers at both ends and compute area as width times the shorter height. Move the pointer at the shorter line inward, because keeping it while reducing width cannot improve the area. Continue until pointers meet. Time O(n), space O(1).

**Interview answer:** Start pointers at both ends and compute area as width times the shorter height.  Move the pointer at the shorter line inward, because keeping it while reducing width cannot improve the area.

60. How would you find a cycle's starting node in a linked list?

**Deep explanation:** Use Floyd's slow and fast pointers to find a meeting inside the cycle. Then reset one pointer to the head and advance both one step at a time; where they meet is the cycle entry. This takes O(n) time and O(1) space.

**Interview answer:** Use Floyd's slow and fast pointers to find a meeting inside the cycle.  Then reset one pointer to the head and advance both one step at a time; where they meet is the cycle entry.

61. How would you remove the nth node from the end in one pass?

**Deep explanation:** Add a dummy before the head. Advance a fast pointer n steps, then move fast and slow together until fast reaches the last node; remove `slow.next`. The dummy handles deleting the head uniformly. Validate n if inputs may be invalid.

**Interview answer:** Add a dummy before the head.  Advance a fast pointer n steps, then move fast and slow together until fast reaches the last node; remove `slow.

62. How would you evaluate a postfix expression?

**Deep explanation:** Scan tokens and push operands onto a stack. On an operator, pop the right operand and then the left operand, apply the operator, and push the result. At the end exactly one value should remain. Define integer division and malformed-input behavior explicitly.

**Interview answer:** Scan tokens and push operands onto a stack.  On an operator, pop the right operand and then the left operand, apply the operator, and push the result.

63. How would you solve daily temperatures using a monotonic stack?

**Deep explanation:** Keep a stack of unresolved indices with nonincreasing temperatures. For each new temperature, pop every colder index and set its wait to the current index difference, then push the current index. Each index is pushed and popped once, giving O(n) time.

**Interview answer:** Keep a stack of unresolved indices with nonincreasing temperatures.  For each new temperature, pop every colder index and set its wait to the current index difference, then push the current index.

64. How would you determine whether a string can be segmented into dictionary words?

**Deep explanation:** Let `dp[i]` mean the prefix ending before i is segmentable. Set `dp[0] = true`; for each end position, find a prior reachable position whose substring is in the dictionary. Time is typically O(n²) substring checks, reducible by limiting checks to the maximum word length.

**Interview answer:** Let `dp[i]` mean the prefix ending before i is segmentable.  Set `dp[0] = true`; for each end position, find a prior reachable position whose substring is in the dictionary.

65. How would you solve the house-robber problem for a circular street?

**Deep explanation:** The first and last houses cannot both be chosen. Solve the linear robber recurrence twice—once excluding the last house and once excluding the first—and take the maximum. Track only previous-two states for O(n) time and O(1) space; handle one house separately.

**Interview answer:** The first and last houses cannot both be chosen.  Solve the linear robber recurrence twice—once excluding the last house and once excluding the first—and take the maximum.

66. How would you maximize stock-trading profit with a limited number of transactions?

**Deep explanation:** Use DP states for each transaction count: the best balance while holding and the best profit while not holding. Update them for every price, yielding O(nk) time and O(k) space. If k is at least half the number of days, sum all positive adjacent gains instead.

**Interview answer:** Use DP states for each transaction count: the best balance while holding and the best profit while not holding.  Update them for every price, yielding O(nk) time and O(k) space.

67. How would you find a word ladder's shortest transformation sequence?

**Deep explanation:** Treat words as graph nodes joined when they differ by one character and run BFS from the start. Generate neighbors by changing each character or use wildcard buckets. Mark words visited when enqueued; store parents to reconstruct a sequence. Bidirectional BFS can greatly reduce exploration.

**Interview answer:** Treat words as graph nodes joined when they differ by one character and run BFS from the start.  Generate neighbors by changing each character or use wildcard buckets.

68. How would you implement a trie with deletion and prefix counts?

**Deep explanation:** Each trie node stores child links, a count of words passing through it, and an end count. Insertion increments counts along the path. Deletion first verifies the word exists, decrements counts, and removes child nodes only when their pass count becomes zero. Prefix count is the terminal prefix node's pass count.

**Interview answer:** Each trie node stores child links, a count of words passing through it, and an end count.  Insertion increments counts along the path.

69. How would you calculate an integer square root without floating-point arithmetic?

**Deep explanation:** Binary-search the greatest integer x such that `x² <= n`. Avoid multiplication overflow by compare using `x <= n / x`, treating zero separately. For a nonnegative fixed-width integer, this takes O(log n) time and O(1) space.

**Interview answer:** Binary-search the greatest integer x such that `x² <= n`.  Avoid multiplication overflow by compare using `x <= n / x`, treating zero separately.

70. How would you find a peak in an unsorted array using binary search?

**Deep explanation:** Compare the middle element with its right neighbor. If it is smaller, a peak must exist to the right; otherwise a peak exists at or to the left, so move that boundary inward. When boundaries meet, that index is a peak. Time O(log n), space O(1).

**Interview answer:** Compare the middle element with its right neighbor.  If it is smaller, a peak must exist to the right; otherwise a peak exists at or to the left, so move that boundary inward.
