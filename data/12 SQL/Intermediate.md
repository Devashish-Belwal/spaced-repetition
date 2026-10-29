1. How would you find the second-highest distinct salary?

**Deep explanation:** Rank salaries descending with `DENSE_RANK()` and filter for rank 2. Equal salaries share a rank, so ties do not distort the second distinct value. A `DISTINCT` query with `OFFSET 1` is another option, though syntax varies.

**Interview answer:** I would use `DENSE_RANK` over salary descending and select rank 2, which handles duplicate salaries correctly.

2. How would you return the top three salaries within each department?

**Deep explanation:** Use `DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC)` and filter ranks up to 3. This includes ties; use `ROW_NUMBER` with a deterministic tie-breaker if exactly three employees are required.

**Interview answer:** I would rank within each department and keep the first three ranks, clarifying whether ties should be included.

3. How do ROW_NUMBER, RANK, and DENSE_RANK differ?

**Deep explanation:** `ROW_NUMBER` uniquely numbers every row. `RANK` gives ties the same rank and leaves gaps, such as 1, 1, 3. `DENSE_RANK` gives ties the same rank without gaps: 1, 1, 2.

**Interview answer:** `ROW_NUMBER` is unique, `RANK` shares ranks and skips numbers, and `DENSE_RANK` shares ranks without gaps.

4. How would you calculate a running total?

**Deep explanation:** Use `SUM(amount) OVER (PARTITION BY account_id ORDER BY event_time, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`. The unique tie-breaker makes ordering deterministic, and explicit `ROWS` avoids peer behavior from a default `RANGE` frame.

**Interview answer:** I would use a windowed `SUM`, partition by the entity, order deterministically, and frame from the first row through the current row.

5. How would you calculate a seven-day moving average?

**Deep explanation:** With one row per day, use `AVG(value) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`. If days are missing, first join to a calendar or use an interval-based frame; otherwise it is a seven-row, not seven-day, average.

**Interview answer:** I would ensure one row per calendar day, then average the current day and six preceding days with a window frame.

6. How would you compare each row with its previous and next row?

**Deep explanation:** Use `LAG` for the previous value and `LEAD` for the next, with the same partition and deterministic ordering. Boundary rows return `NULL`.

**Interview answer:** I would use `LAG` and `LEAD` over the appropriate partition and stable order.

7. How do window functions differ from GROUP BY aggregation?

**Deep explanation:** `GROUP BY` collapses rows into one result per group. Window functions calculate across related rows while preserving detail rows, enabling ranks, totals, and comparisons beside each row.

**Interview answer:** Grouping reduces cardinality; window functions retain row detail and add calculations across a partition.

8. How do ROWS and RANGE window frames differ?

**Deep explanation:** `ROWS` uses physical row positions. `RANGE` uses ordering values and includes peer rows with equal values, so duplicate timestamps can make a running calculation advance for several rows at once.

**Interview answer:** `ROWS` is position-based; `RANGE` is value-based and includes peers.

9. How would you find gaps in a sequence of IDs?

**Deep explanation:** Sort IDs and compare each with `LAG(id)`. When the difference exceeds one, the missing range is previous ID plus one through current ID minus one. Use a numbers table if every missing value must be expanded.

**Interview answer:** I would use `LAG` and flag differences greater than one, then derive each gap's boundaries.

10. How would you group consecutive dates into activity streaks?

**Deep explanation:** Deduplicate dates, assign `ROW_NUMBER`, and subtract that many days from each date. Consecutive dates produce the same derived key, which can be grouped to obtain streak start, end, and length.

**Interview answer:** I would use the gaps-and-islands pattern: date minus row number becomes a constant key for each streak.

11. How would you find users active on consecutive days?

**Deep explanation:** Reduce events to one row per user-day, then compare each date with `LAG(activity_date)` partitioned by user. A one-day difference identifies consecutive activity.

**Interview answer:** I would deduplicate user-days, use `LAG` per user, and select dates one day after the previous date.

12. How would you calculate monthly customer retention?

**Deep explanation:** Create distinct customer-month activity, self-join each month to the same customer's following month, and divide retained customers by the starting month's active customers. Clarify whether the requirement is month-over-month or acquisition-cohort retention.

**Interview answer:** I would join distinct customer-month rows to the next month and divide returning customers by the original active population.

13. How would you calculate conversion rates without double-counting users?

**Deep explanation:** Define eligibility and the conversion window, then aggregate to one row per user with a conversion flag. Divide converted users by eligible users. This prevents multiple events or many-to-many joins from inflating counts.

**Interview answer:** I would establish one row per eligible user, derive a conversion flag, and calculate the average of that flag.

14. How would you calculate median order value in your SQL dialect?

**Deep explanation:** Prefer `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY order_value)`; it may interpolate between middle values. `PERCENTILE_DISC` returns an observed value. Without percentile support, rank values and average the central one or two rows.

**Interview answer:** I would use the dialect's 50th-percentile function and clarify whether an interpolated or observed median is wanted.

15. How would you select the latest event for each account?

**Deep explanation:** Assign `ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY event_time DESC, event_id DESC)` and keep row 1. The unique secondary key resolves equal timestamps.

**Interview answer:** I would number each account's events newest first with a unique tie-breaker and select row 1.

16. How would you remove duplicate rows while preserving a chosen record?

**Deep explanation:** Rank rows within the duplicate business key using the explicit preservation rule, then delete ranks above 1. Preview first, use a transaction, and add a unique constraint afterward when possible.

**Interview answer:** I would use `ROW_NUMBER` by duplicate key, order by the keep rule, delete rows above 1, and enforce uniqueness.

17. How do correlated subqueries differ from joins?

**Deep explanation:** A correlated subquery references its outer row and expresses per-row lookup, aggregation, or existence. A join combines sets and can multiply rows. Optimizers may decorrelate subqueries, so check the plan rather than assuming one is faster.

**Interview answer:** Correlated subqueries operate in each outer row's context; joins combine row sets and may change cardinality.

18. How do EXISTS and IN differ when NULL values are present?

**Deep explanation:** `EXISTS` asks only whether a row exists, so selected NULL values do not matter. `IN` compares values using three-valued logic; NULL can yield unknown, especially under negation.

**Interview answer:** `EXISTS` tests row existence, while `IN` compares values and can become unknown when NULL participates.

19. Why can NOT IN produce surprising results with NULL values?

**Deep explanation:** `x NOT IN (1, NULL)` includes `x <> NULL`, which is unknown, so the predicate is not true. Use correlated `NOT EXISTS`, or exclude NULL explicitly when appropriate.

**Interview answer:** A NULL in the subquery can make `NOT IN` unknown for every row, so I prefer `NOT EXISTS`.

20. How would you use a common table expression to clarify a complex query?

**Deep explanation:** Split the query into named stages with one responsibility each, such as eligible rows, aggregates, then ranking. CTEs improve readability, but may be inlined or materialized depending on the database, so inspect the plan.

**Interview answer:** I use CTEs as named transformations, keeping each stage focused, and verify dialect-specific materialization behavior.

21. How would you query a hierarchy using a recursive CTE?

**Deep explanation:** Use an anchor query for roots and a recursive member that joins prior rows to children. Carry depth and path information, and detect cycles when the data is not guaranteed to be acyclic.

**Interview answer:** I would anchor on roots, recursively join children, and carry depth and a path for ordering and cycle protection.

22. How would you avoid multiplying totals when joining several one-to-many relationships?

**Deep explanation:** Joining multiple child tables directly creates a cross product per parent. Aggregate each child to one row per parent in separate CTEs or derived tables, then join those results.

**Interview answer:** I would pre-aggregate every one-to-many table to the parent key before joining.

23. How would you implement keyset pagination over a nonunique timestamp?

**Deep explanation:** Order by a stable composite key such as `(created_at DESC, id DESC)`, return both cursor values, and seek after that pair on the next page. A matching composite index avoids large offset scans.

**Interview answer:** I would paginate by timestamp plus unique ID and pass both values as the cursor.

24. How would you query JSON fields while preserving useful indexes?

**Deep explanation:** Index the exact JSON path or expression used by frequent predicates, using the dialect's JSON, functional, or generated-column indexes. Avoid wrapping the indexed expression in incompatible casts or functions. Promote heavily queried attributes to typed columns when useful.

**Interview answer:** I would use indexable JSON operators and an index matching the exact path expression, or a typed generated column.

25. How would you choose the column order for a composite index?

**Deep explanation:** Base it on real query patterns. Equality-constrained columns usually precede range and sort columns; add coverage only where beneficial. The leftmost-prefix rule means leading columns determine which query shapes the index supports.

**Interview answer:** I generally put equality columns first, then range or ordering columns, guided by the workload and leftmost-prefix rule.

26. What makes a predicate sargable?

**Deep explanation:** A sargable predicate can become an index search, such as a half-open timestamp range. Functions or implicit casts on the indexed column often prevent this; rewrite them or create a matching expression index.

**Interview answer:** A predicate is sargable when the optimizer can use it for an index seek; I keep indexed columns bare where possible.

27. How would you interpret an EXPLAIN plan?

**Deep explanation:** Trace scans, joins, filters, sorts, and aggregates. With `EXPLAIN ANALYZE`, compare estimated and actual rows; large gaps indicate statistics or correlation problems. Focus on high-time nodes, repeated loops, spills, and unexpected access paths.

**Interview answer:** I compare estimated with actual cardinality, then inspect expensive access paths, joins, repeated work, and memory spills.

28. How do index scans, sequential scans, and index-only scans differ?

**Deep explanation:** A sequential scan reads the table broadly and can be best for many rows. An index scan locates matches via the index, then usually fetches table pages. An index-only scan can answer from a covering index, subject to the database's visibility rules.

**Interview answer:** Sequential scans read the table, index scans find rows then fetch them, and index-only scans satisfy the query from the index when possible.

29. How do nested-loop, hash, and merge joins differ?

**Deep explanation:** Nested loops suit a small outer input with indexed inner lookups. Hash joins suit larger equality joins but need memory. Merge joins walk sorted inputs and are effective when useful ordering already exists.

**Interview answer:** Nested loops are good for small indexed probes, hash joins for large equality joins, and merge joins for sorted inputs.

30. How would you find overlapping reservation intervals?

**Deep explanation:** For half-open intervals, overlap means `a.start < b.end AND b.start < a.end`. Join within the same resource and add `a.id < b.id` to avoid self-pairs and duplicates. Confirm whether touching endpoints count.

**Interview answer:** I would use the two-sided interval condition and an ID ordering so each overlapping pair appears once.

31. How would you prevent two transactions from decrementing inventory below zero?

**Deep explanation:** Make validation and decrement atomic: update only where `quantity >= requested`, then require one affected row. Add a `quantity >= 0` constraint; use locking or stronger isolation if a larger workflow spans statements.

**Interview answer:** I would issue one conditional update, check the affected-row count, and enforce nonnegative quantity with a constraint.

32. How would you implement an upsert without race conditions?

**Deep explanation:** Put a unique constraint on the conflict key and use the database's atomic upsert syntax, such as `ON CONFLICT`. A SELECT-then-INSERT sequence races because another transaction can insert between statements.

**Interview answer:** I would enforce a unique key and use the database's native atomic upsert rather than check then insert.

33. How would you create a report that includes dates with no transactions?

**Deep explanation:** Drive the query from a calendar table or generated date series and left join daily transaction totals. `COALESCE` missing totals to zero, and keep transaction filters out of the final `WHERE` so the outer join remains intact.

**Interview answer:** I would start from a calendar, left join aggregated transactions, and convert missing totals to zero.

34. How would you query time-zone-aware data for a user's local day?

**Deep explanation:** Store instants in UTC and retain the user's IANA zone. Convert local midnight and the following midnight to UTC, then query a half-open range. This handles daylight-saving days that are not 24 hours.

**Interview answer:** I would convert the user's local day boundaries to UTC and filter with an index-friendly half-open UTC range.

35. How would you avoid precision loss and integer division in calculated fields?

**Deep explanation:** Cast operands to suitably sized `DECIMAL` or `NUMERIC` before division, avoid floating point for exact money, and guard zero denominators with `NULLIF`. Round only at the defined business boundary.

**Interview answer:** I would cast to an appropriate decimal type before division, handle zero safely, and delay rounding.

36. How would you pivot rows into columns and unpivot them again?

**Deep explanation:** Portable pivots use conditional aggregation such as `SUM(CASE ...)`; native `PIVOT` may be available. Unpivot with `UNPIVOT`, a lateral values constructor, or `UNION ALL`. Dynamic columns require safely generated SQL.

**Interview answer:** I usually pivot with conditional aggregation and unpivot with the dialect's operator or a values-based transformation.

37. How would you calculate percentiles and cumulative distributions?

**Deep explanation:** Use `PERCENTILE_CONT` or `PERCENTILE_DISC` for percentile values. Use `CUME_DIST() OVER (ORDER BY value)` for the fraction at or below each row; partition when separate groups need distributions.

**Interview answer:** I would use ordered-set percentile functions for thresholds and `CUME_DIST` for cumulative proportions.

38. How would you identify orphan records while migrating legacy data?

**Deep explanation:** Use `NOT EXISTS` to find non-null child keys without a parent. Classify NULL keys separately because they may be valid optional relationships. Reconcile counts and add a validated foreign key after cleanup.

**Interview answer:** I would use a NULL-safe anti-join, report null foreign keys separately, and enforce referential integrity after remediation.

39. How would you batch a large data correction safely?

**Deep explanation:** Process deterministic primary-key ranges in small transactions and checkpoint progress. Make the change idempotent, monitor locks and replication lag, retain recovery data for risky changes, and validate counts and invariants throughout.

**Interview answer:** I would run an idempotent correction in small ordered batches, commit and checkpoint each batch, monitor impact, and validate results.

40. How would you test a SQL query against duplicates, NULLs, and empty inputs?

**Deep explanation:** Build fixtures for empty tables, duplicates, tied sort values, NULLs, unmatched rows, zero denominators, and boundaries. Assert exact rows and cardinality, and include many-to-many cases that expose accidental multiplication.

**Interview answer:** I would create focused edge-case fixtures and assert both exact output values and row counts.
