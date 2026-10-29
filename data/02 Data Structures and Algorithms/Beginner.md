1. How do arrays and linked lists differ in access, insertion, and memory use?

**Deep explanation:** Arrays store elements next to one another, so an index can be translated directly into a memory address for O(1) access. Inserting or deleting in the middle usually shifts later elements, making it O(n). Linked-list nodes may be scattered in memory and must be followed one by one for O(n) access, but a known node can be linked or unlinked in O(1). Lists also spend extra memory on pointers and usually have poorer cache locality.

**Interview answer:** “Arrays give O(1) indexed access but O(n) middle insertion or deletion. Linked lists have O(n) access but O(1) insertion or deletion once I have the relevant node. Arrays are contiguous and cache-friendly; linked lists use extra pointer memory.”

2. How would you find the minimum and maximum in an array?

**Deep explanation:** If the array is nonempty, initialize both values from its first element rather than using arbitrary sentinels. During one pass, compare every remaining element with the current minimum and maximum and update as needed. Every element must be inspected in the worst case, so O(n) time is optimal, and only two variables are needed.

**Interview answer:** “I’d initialize `min` and `max` to the first element, scan once, and update them when I see a smaller or larger value. That is O(n) time and O(1) space, with an explicit empty-array case.”

3. How would you reverse an array in place?

**Deep explanation:** Place one pointer at each end of the array. Swap those elements, increment the left pointer, and decrement the right pointer until the pointers meet or cross. Each element participates in at most one swap, and no second array is created.

**Interview answer:** “I’d use two pointers, swap the first and last elements, and move inward until they cross. It runs in O(n) time with O(1) extra space.”

4. How would you find the second-largest distinct element?

**Deep explanation:** Maintain two optional values: the largest and the second-largest distinct value seen so far. A value above the largest pushes the old largest into second place; a value strictly between them updates only second. Ignoring values equal to the largest is what makes the result distinct. If second was never assigned, no valid answer exists.

**Interview answer:** “I’d track the two largest distinct values in one pass, carefully ignoring duplicates of the maximum. This is O(n) time and O(1) space, and I’d report no result when fewer than two distinct values exist.”

5. How would you move all zeros to the end while preserving other elements' order?

**Deep explanation:** A write index marks where the next nonzero belongs. Scan left to right and copy each nonzero to that index, advancing it after each copy; because nonzeros are encountered in order, their relative order is preserved. Afterward, overwrite every remaining position with zero.

**Interview answer:** “I’d compact nonzero values forward with a write pointer, then fill the remaining suffix with zeros. It preserves order and takes O(n) time and O(1) space.”

6. How would you remove duplicates from a sorted array in place?

**Deep explanation:** Sorting places equal values together. Keep the first item, then scan with a read pointer; when the read value differs from the last unique value written, advance the write pointer and store it there. Positions after the returned logical length do not matter.

**Interview answer:** “Because duplicates are adjacent, I’d use read and write pointers and copy only values different from the last unique one. The new length is `write + 1`; time is O(n), space O(1).”

7. How would you merge two sorted arrays?

**Deep explanation:** The smallest remaining output must be at the front of one of the two sorted inputs. Compare those front elements, append the smaller, and advance that input’s pointer; once one input is exhausted, append the other input’s suffix. If one array has enough unused capacity, working from the back avoids overwriting unread values.

**Interview answer:** “I’d use one pointer per array, repeatedly take the smaller current element, then copy the remainder. That is O(n + m) time; with spare capacity in the first array, I can merge backward in place.”

8. How would you rotate an array by k positions?

**Deep explanation:** First reduce `k` modulo the array length so rotations larger than the array are handled; treat an empty array separately. For a right rotation, reversing everything brings the last `k` items to the front in reversed order. Reversing the first `k` items and then the remaining items restores both groups’ internal order.

**Interview answer:** “For a right rotation, I’d normalize `k`, reverse the whole array, then reverse the first `k` elements and the remaining suffix. It is O(n) time and O(1) space.”

9. How would you check whether a string is a palindrome?

**Deep explanation:** A palindrome reads the same from both directions, so compare matching positions from the outside inward. A single mismatch proves the answer is false; reaching the middle proves it is true. Requirements may call for normalizing case or skipping non-alphanumeric characters, which can be done while moving the pointers.

**Interview answer:** “I’d clarify normalization rules, then compare characters using two pointers from the ends. Any mismatch returns false; otherwise it is a palindrome in O(n) time and O(1) extra space.”

10. How would you count character frequencies in a string?

**Deep explanation:** Use each character as a key in a frequency map. For every character, read its current count—defaulting to zero—and increment it. A fixed-size array can replace the map when the character set is small and known, such as lowercase English letters.

**Interview answer:** “I’d scan once and increment each character’s count in a hash map. That is O(n) time and O(k) space for `k` distinct characters.”

11. How would you find the first nonrepeating character?

**Deep explanation:** Frequency alone does not identify which unique character appears first. Therefore, make one pass to count all characters and a second pass in original order to find the first count of one. If none exists, return an agreed sentinel or optional result.

**Interview answer:** “I’d count characters in one pass, then scan again and return the first with frequency one. It is O(n) time and O(k) space.”

12. How would you determine whether two strings are anagrams?

**Deep explanation:** Anagrams contain exactly the same characters with the same multiplicities. Normalize case or spaces if required, reject different lengths, then add counts for the first string and subtract for the second. Any missing character or nonzero final count means they are not anagrams.

**Interview answer:** “After clarifying normalization, I’d compare lengths and use a frequency map—increment for one string and decrement for the other. All counts must end at zero, giving O(n) time.”

13. How would you reverse the words in a sentence?

**Deep explanation:** Word reversal changes word order, not the characters inside each word. Tokenize the sentence according to the required whitespace rules, reverse the token list, and join it. If exact whitespace must be preserved, parse word and separator spans instead of using a simple split.

**Interview answer:** “I’d clarify whitespace behavior, split into words, reverse the word list, and join it. That takes O(n) time and typically O(n) extra space.”

14. How would you implement a stack using an array?

**Deep explanation:** A stack is last-in, first-out, so the dynamic array’s end is the natural top. Appending implements `push`, reading the last item implements `peek`, and removing it implements `pop`. Dynamic resizing makes occasional pushes expensive, but their amortized cost remains O(1); empty operations need defined error handling.

**Interview answer:** “I’d use the end of a dynamic array as the stack top. `push`, `pop`, and `peek` are O(1) amortized, and I’d check for underflow before reading or removing.”

15. How would you implement a queue using a linked list?

**Deep explanation:** A FIFO queue removes from the front and adds at the rear, so retain pointers to both ends. Enqueue attaches a new node after the tail; dequeue advances the head. The first insertion sets both pointers, and removing the final node must reset both to `null`.

**Interview answer:** “I’d keep head and tail pointers. Enqueue links after the tail, and dequeue removes the head; both are O(1), with special handling when the queue becomes empty.”

16. How do stacks, queues, and deques differ?

**Deep explanation:** These structures differ mainly in which end accepts operations. A stack exposes one end and therefore returns the most recently inserted item. A queue inserts at one end and removes at the other, returning the oldest item. A double-ended queue, or deque, supports both operations at both ends and can model either structure.

**Interview answer:** “A stack is LIFO, a queue is FIFO, and a deque allows insertion and removal at both ends.”

17. How would you check balanced parentheses with multiple bracket types?

**Deep explanation:** The most recently opened bracket must be closed first, which is exactly stack behavior. Push each opener; for a closer, reject if the stack is empty or its top is not the matching type, otherwise pop. Unclosed openers are detected by requiring an empty stack after the scan.

**Interview answer:** “I’d push opening brackets and, for each closer, check and pop the matching opener. Any mismatch or empty stack fails, and the stack must be empty at the end. Time is O(n).”

18. How would you reverse a singly linked list?

**Deep explanation:** Changing a node’s `next` pointer destroys the path to the remainder unless that pointer is saved first. For each node, save `next`, redirect the link toward `previous`, and then advance `previous` and `current`. When `current` becomes `null`, `previous` points to the reversed list’s head.

**Interview answer:** “I’d iterate with `previous`, `current`, and saved `next` pointers, reversing one link at a time. The final `previous` is the new head; O(n) time and O(1) space.”

19. How would you find a linked list's middle element?

**Deep explanation:** Because the fast pointer travels twice as quickly, the slow pointer covers half the list by the time fast reaches the end. Start both at the head and continue while fast and `fast.next` exist. On even-length lists, this usual initialization lands slow on the second of the two middle nodes.

**Interview answer:** “I’d use slow and fast pointers moving one and two steps. When fast reaches the end, slow is at the middle. It is O(n) time and O(1) space.”

20. How would you detect a cycle in a linked list?

**Deep explanation:** In an acyclic list, the fast pointer eventually reaches `null`. Inside a cycle, the faster pointer gains one node per iteration on the slower pointer, so they must eventually meet. This avoids the O(n) extra memory required by a visited-node set.

**Interview answer:** “I’d use Floyd’s tortoise-and-hare algorithm. Slow moves one step, fast moves two; meeting means a cycle, while fast reaching `null` means none. It uses O(1) space.”

21. How would you merge two sorted linked lists?

**Deep explanation:** A dummy node removes special handling for the first result node. Compare the heads, attach the smaller node after the result tail, and advance that list and the tail. Once one list is empty, its counterpart is already sorted and can be attached whole.

**Interview answer:** “I’d use a dummy head and tail, repeatedly attach the smaller head node, then append the remaining list. It is O(n + m) time and O(1) auxiliary space.”

22. What is a hash collision, and how can a hash table handle it?

**Deep explanation:** A finite table has fewer positions than the possible keys, so different keys can produce the same index even with a good hash function. Separate chaining keeps a collection of entries in each bucket; open addressing searches for another slot using a probe sequence. Equality checks distinguish keys, while resizing prevents too many collisions as the table fills.

**Interview answer:** “A collision is when different keys map to the same bucket. Hash tables handle it with chaining or open addressing, and they resize to keep the load factor—and average operation time—under control.”

23. How do maps and sets differ?

**Deep explanation:** A map answers “what value belongs to this key?” while a set answers “is this element present?” Both enforce uniqueness of their keys or elements. They may be hash-based for expected O(1) operations or tree-based for ordered O(log n) operations.

**Interview answer:** “A map stores key-value pairs with unique keys; a set stores unique values only. Hash implementations usually give O(1) average lookup, while ordered tree versions are typically O(log n).”

24. How would you solve two-sum with duplicate values?

**Deep explanation:** For each current value `x`, the needed partner is `target - x`. Looking for that partner among previously seen elements ensures the two positions are different, even when both values are equal, such as `3 + 3`. Store indices rather than only membership so the required pair can be returned.

**Interview answer:** “I’d scan once, check whether `target - x` is already in a value-to-index map, then store `x`. Checking before insertion handles duplicates with distinct indices. Expected time is O(n), space O(n).”

25. How does linear search differ from binary search?

**Deep explanation:** Linear search makes no ordering assumption and may inspect every item. Binary search compares with the middle and discards half the remaining range, but requires sorted data and efficient access to middle positions. Sorting solely for one search may cost more than simply scanning.

**Interview answer:** “Linear search works on unsorted data in O(n). Binary search needs sorted, random-access data and takes O(log n) by discarding half the range each step.”

26. How would you implement binary search without midpoint overflow?

**Deep explanation:** Adding two large indices can exceed the integer limit even though each index is valid. Computing `low + (high - low) / 2` stays within the current range and avoids that overflow. Each comparison moves `low` above `mid` or `high` below it, guaranteeing progress.

**Interview answer:** “I’d compute `mid = low + (high - low) / 2` to avoid overflow, then move the appropriate boundary past `mid`. The search is O(log n).”

27. How do stable and unstable sorting algorithms differ?

**Deep explanation:** If two records compare equal on the sort key, a stable algorithm leaves them in their original order. This lets multiple stable sorts compose—for example, sorting by name and then stably by department retains name order within each department. An unstable algorithm gives no such guarantee.

**Interview answer:** “A stable sort preserves the relative order of equal-key items; an unstable sort may reorder them. Stability matters for records and multi-key sorting.”

28. How do bubble sort, insertion sort, and selection sort compare?

**Deep explanation:** Bubble sort repeatedly swaps adjacent out-of-order pairs; with an early-exit check it detects already sorted data. Insertion sort grows a sorted prefix and is efficient for small or nearly sorted inputs. Selection sort repeatedly selects the smallest remaining item; it still performs O(n²) comparisons but makes only O(n) swaps.

**Interview answer:** “All three are generally O(n²). Insertion sort is usually best for small or nearly sorted data, selection sort minimizes swaps, and bubble sort swaps adjacent inversions. Bubble and insertion are stable by default; selection usually isn’t.”

29. How would you traverse a binary tree in preorder, inorder, and postorder?

**Deep explanation:** The traversal name indicates when the root is visited relative to its subtrees: preorder visits it before both, inorder between them, and postorder after both. Recursion naturally follows this structure, while an explicit stack avoids recursion depth limits. Inorder traversal of a binary search tree produces keys in sorted order.

**Interview answer:** “Preorder is root-left-right, inorder is left-root-right, and postorder is left-right-root. Each visits every node once, so it is O(n), using recursion or a stack.”

30. How would you perform level-order traversal of a tree?

**Deep explanation:** A queue processes nodes in the order they are discovered, which means all nodes at one depth are visited before the next depth. Begin with the root, then repeatedly remove the front node and add its children to the rear. To group results by level, process the queue size captured at the start of each level.

**Interview answer:** “I’d use BFS with a queue: enqueue the root, then dequeue, visit, and enqueue each node’s children. It is O(n) time and O(w) space for maximum width.”

31. How would you calculate a binary tree's height?

**Deep explanation:** A tree’s height is determined by its deeper subtree. Recursively compute both subtree heights and add one for the current node. State the convention clearly: under a node-count definition an empty tree has height 0 and a leaf has height 1; an edge-count definition differs by one.

**Interview answer:** “Using node-count height, an empty tree is 0 and a node is `1 + max(leftHeight, rightHeight)`. This visits each node once: O(n) time and O(h) stack space.”

32. What property distinguishes a binary search tree from a binary tree?

**Deep explanation:** “Binary” describes shape only: each node has zero, one, or two children. A binary search tree adds a global ordering invariant for every node, not merely its immediate children. That invariant permits search, insertion, and deletion in O(h), where a balanced tree has `h = O(log n)`.

**Interview answer:** “A binary tree only restricts nodes to at most two children. A BST also requires every left-subtree key to be smaller and every right-subtree key to be larger, with a defined rule for duplicates.”

33. How would you find the minimum element in a binary search tree?

**Deep explanation:** The BST ordering guarantees that any smaller value must lie to the left. Therefore, following left links as far as possible reaches the minimum without inspecting unrelated subtrees. An empty tree has no minimum and needs an explicit result or error.

**Interview answer:** “I’d keep following left children from the root. The leftmost node is the minimum, found in O(h) time and O(1) iterative space.”

34. What is a heap, and how does it differ from a sorted array?

**Deep explanation:** Completeness keeps the tree compact enough to store in an array using index relationships between parents and children. The heap property applies only between ancestors and descendants, so siblings and separate branches need not be ordered. This is enough to expose the minimum or maximum at the root while supporting efficient updates.

**Interview answer:** “A heap is a complete binary tree with a parent-child ordering rule. It gives O(1) access to the min or max and O(log n) insertion/removal, but unlike a sorted array, arbitrary elements are not globally ordered.”

35. How do adjacency lists and adjacency matrices represent graphs?

**Deep explanation:** In an adjacency list, each vertex owns a collection of only its incident neighbors, so traversal touches existing edges efficiently. An adjacency matrix has one cell for every possible vertex pair, which wastes space on sparse graphs but makes checking or updating a particular edge direct. Undirected edges appear in both directions in either representation.

**Interview answer:** “Adjacency lists use O(V + E) space and are best for sparse graphs. Matrices use O(V²) space but provide O(1) edge checks, so they can suit dense graphs.”

36. How would you implement BFS and DFS on an unweighted graph?

**Deep explanation:** Start at a source and mark vertices as soon as they are discovered so cycles do not cause repeated processing. BFS’s queue explores by increasing distance, while DFS follows one path deeply before backtracking. If the graph may be disconnected, start another traversal from each still-unvisited vertex.

**Interview answer:** “BFS uses a queue, DFS uses recursion or a stack, and both track visited vertices. With adjacency lists both are O(V + E); BFS also finds shortest unweighted paths.”

37. How would you count connected components in an undirected graph?

**Deep explanation:** One BFS or DFS reaches exactly the vertices in the starting vertex’s connected component. Scanning all vertices ensures isolated vertices and disconnected regions are not missed. Each new traversal therefore corresponds to one new component.

**Interview answer:** “I’d scan all vertices; whenever one is unvisited, increment the count and run BFS or DFS to mark that whole component. Overall time is O(V + E).”

38. What is a trie useful for?

**Deep explanation:** Each edge represents a character, and paths from the root represent prefixes. Nodes shared by words such as “car” and “card” store their common prefix once, while an end marker distinguishes complete words from prefixes. Operation time depends on key length rather than the number of stored words, but child links can consume substantial memory.

**Interview answer:** “A trie stores strings by shared prefixes. Search, insertion, and prefix lookup take O(L) for a length-`L` key, making it useful for autocomplete and dictionaries, though it can use a lot of memory.”

39. How would you compute a factorial recursively and iteratively?

**Deep explanation:** Factorial for a nonnegative integer multiplies all integers from 1 through `n`, with `0! = 1`. Recursion mirrors the mathematical definition but creates one call frame per value. Iteration accumulates the product in one variable and is usually safer; fixed-width numeric types may overflow quickly.

**Interview answer:** “Recursively I’d use `n * factorial(n - 1)` with base case `0! = 1`; iteratively I’d multiply from 2 to `n`. Both are O(n), but iteration uses O(1) auxiliary space and avoids stack growth.”

40. How would you calculate Fibonacci numbers without exponential repeated work?

**Deep explanation:** Naive recursion recalculates the same Fibonacci values many times, causing exponential work. Since each new value depends only on the preceding two, maintain those two values and advance them in a loop. Memoization is also O(n) time but retains all computed states and recursion frames.

**Interview answer:** “I’d iterate with the previous two Fibonacci values, producing each next value once. That improves naive exponential recursion to O(n) time and O(1) space.”

41. How does merge sort divide and combine an array?

**Deep explanation:** A one-element range is already sorted. Merge sort recursively reaches those base cases, then combines each pair of sorted halves with two pointers. There are O(log n) levels, and merging across each level processes O(n) elements, producing O(n log n) time regardless of initial order.

**Interview answer:** “Merge sort divides the array into halves down to single elements, then merges sorted halves with two pointers. It is stable, runs in O(n log n), and typically needs O(n) extra array space.”

42. How does quicksort partition an array?

**Deep explanation:** Partitioning places values according to their comparison with a chosen pivot; after it completes, the resulting subranges can be sorted independently. Lomuto commonly grows a “less than pivot” region, while Hoare moves pointers inward from both ends. A three-way partition is useful when many values equal the pivot.

**Interview answer:** “Quicksort chooses a pivot, partitions values to its smaller and larger sides, then recursively sorts the subranges. Common partition schemes are Lomuto, Hoare, and three-way partitioning for duplicates.”

43. What makes quicksort's worst case different from its expected case?

**Deep explanation:** Every partition processes its current range. When pivots split ranges reasonably evenly, only O(log n) levels are needed, leading to O(n log n) work. An extreme pivot removes just one element per level, creating O(n) levels and O(n²) total work; randomization makes persistent imbalance unlikely.

**Interview answer:** “Quicksort is expected O(n log n) with reasonably balanced partitions, but repeated extreme pivots create 0 and n−1 splits and O(n²) time. Random pivoting reduces that risk.”

44. How does heapsort use a heap to order an array?

**Deep explanation:** A max-heap keeps the largest remaining value at its root. Swapping that root with the end places one value in its final sorted position; reducing the heap boundary protects the sorted suffix. Sifting the new root down restores the heap before the next extraction.

**Interview answer:** “I’d build a max-heap, repeatedly swap the root with the end of the unsorted region, shrink the heap, and heapify down. Heapsort is O(n log n) and in-place, but not stable.”

45. When can counting sort outperform comparison sorting?

**Deep explanation:** Counting sort records how many times each discrete key occurs, then reconstructs the sorted result or computes stable output positions. It does not compare elements, so the comparison-sort lower bound does not apply. Its time and memory depend on the entire key range, making it unsuitable when that range is enormous relative to the input.

**Interview answer:** “Counting sort is useful for integer or discrete keys in a small range. It runs in O(n + k), so it can beat comparison sorting when range size `k` is reasonably close to `n`, at the cost of O(k) space.”

46. How does radix sort process a multi-digit key?

**Deep explanation:** Least-significant-digit radix sort first groups keys by their least significant digit, then repeats for increasingly significant digits. Each per-digit sort must be stable so later passes do not destroy ordering already established for lower digits. Counting sort is commonly used for each pass.

**Interview answer:** “Radix sort applies a stable sort to one digit or bit group at a time, commonly least significant first. With `d` digits and base `b`, it runs in O(d(n + b)).”

47. What is an in-place algorithm?

**Deep explanation:** “In place” focuses on auxiliary memory, not whether the input changes. An in-place algorithm usually rearranges or overwrites the original structure while using O(1) extra variables. Some definitions allow O(log n) stack space, so recursive algorithms should state which convention is being used.

**Interview answer:** “An in-place algorithm modifies the input using O(1), or sometimes very small, auxiliary space instead of allocating another input-sized structure. I’d clarify whether recursion-stack space is counted.”

48. What is the two-pointer technique useful for?

**Deep explanation:** The pointers may start at opposite ends, move in the same direction at different speeds, or represent read and write positions. The key is that each pointer moves monotonically, so elements are not repeatedly reconsidered. Typical uses include pair sums in sorted arrays, deduplication, partitioning, and cycle detection.

**Interview answer:** “The two-pointer technique moves two indices or references based on a condition, often avoiding nested scans. It is useful for sorted pair problems, partitioning, compaction, and linked-list slow/fast algorithms.”

49. What is a sliding window useful for?

**Deep explanation:** A window represents a contiguous subarray or substring. As an endpoint moves, update the window’s sum, counts, or other state by adding the entering item and removing the leaving one. Fixed windows solve exact-length problems; variable windows expand and shrink to maintain a condition, often reducing O(n²) enumeration to O(n).

**Interview answer:** “A sliding window maintains state for a moving contiguous range instead of recomputing it. It is useful for subarray or substring sums, counts, and longest/shortest valid ranges, often in O(n).”

50. How do recursion and backtracking differ?

**Deep explanation:** Recursion simply describes how calls are structured and can solve deterministic problems such as tree traversal. Backtracking explores a decision tree: choose an option, update state, recurse, then undo the update so another option can be tried. Constraint checks can prune branches that cannot produce valid solutions.

**Interview answer:** “Recursion is a function solving smaller instances by calling itself. Backtracking is a search strategy—usually recursive—that chooses, explores, and undoes choices, pruning invalid paths.”

51. How do memoization and tabulation differ?

**Deep explanation:** Both are dynamic-programming techniques that store solutions to overlapping subproblems. Memoization begins with the requested problem and recursively computes missing dependencies, which can be natural and sparse. Tabulation identifies a base-state order and fills every needed entry iteratively, often with lower overhead and opportunities to compress memory.

**Interview answer:** “Memoization is top-down recursion with caching; tabulation is bottom-up iteration in dependency order. Both avoid repeated work, but memoization may skip unused states while tabulation avoids recursion overhead.”

52. How would you reverse a string while preserving Unicode characters correctly?

**Deep explanation:** A displayed character may contain several code points—for example, a base letter plus a combining accent or a multi-code-point emoji. Reversing bytes corrupts encodings, and reversing code units or even code points can split these user-perceived characters. A Unicode grapheme-cluster segmenter identifies safe units to reverse.

**Interview answer:** “I’d segment the string into Unicode grapheme clusters, reverse those clusters, and join them. Reversing bytes or UTF-16 code units can corrupt emoji, surrogate pairs, and combining characters.”

53. How would you check whether one string is a rotation of another?

**Deep explanation:** If `b` is a rotation of `a`, moving a prefix of `a` to its end creates `b`. Every such arrangement appears within `a + a`, while equal lengths prevent shorter unrelated substrings from qualifying. For example, `erbottlewat` appears inside `waterbottlewaterbottle`.

**Interview answer:** “First require equal lengths, then test whether `b` is a substring of `a + a`. That captures every possible rotation; I’d also state the chosen behavior for two empty strings.”

54. How would you find the common elements of two sorted arrays?

**Deep explanation:** Because both arrays are sorted, if one current value is smaller, it cannot match the current or any earlier value in the other array, so safely advance that pointer. Equal values are common and advance both pointers. Clarify whether the output is a set intersection or a multiset intersection, since that controls duplicate handling.

**Interview answer:** “I’d use two pointers. Advance the side with the smaller value; on equality, emit the value and advance both. It is O(n + m), with duplicate handling based on set versus multiset requirements.”

55. How would you count occurrences of a target in a sorted array?

**Deep explanation:** Sorted duplicates form one contiguous block. A lower-bound search finds the first index whose value is at least the target, while an upper-bound search finds the first index whose value is greater. If the target exists, subtracting these boundaries gives the block length; otherwise the difference is zero.

**Interview answer:** “I’d binary-search for the target’s lower bound and upper bound; `upper - lower` is the count. This takes O(log n) time and O(1) iterative space.”
