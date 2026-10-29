1. What are tables, rows, columns, and schemas?

**Deep explanation:** A table stores related data in a grid. Each row is one record, while each column is a named attribute with a data type. A schema is the logical namespace and structure that organizes database objects such as tables, views, and constraints; for example, `sales.orders` refers to the `orders` table in the `sales` schema.

**Interview answer:** A table holds related records, rows represent individual records, columns define their attributes and types, and a schema organizes and namespaces database objects.

2. How do primary keys, foreign keys, and unique constraints differ?

**Deep explanation:** A primary key uniquely identifies every row and cannot be `NULL`; a table has one primary-key constraint, though it may contain multiple columns. A foreign key requires a value to match a candidate key in another—or the same—table, preserving referential integrity. A unique constraint prevents duplicate values, with `NULL` behavior depending on the database.

**Interview answer:** A primary key is the row's main unique identifier, a foreign key links rows while enforcing referential integrity, and a unique constraint prevents duplicate values in its columns.

3. How do SELECT, INSERT, UPDATE, and DELETE differ?

**Deep explanation:** `SELECT` reads data, `INSERT` creates rows, `UPDATE` changes existing rows, and `DELETE` removes rows. The last three modify data and should normally run with appropriate constraints, predicates, permissions, and transactions.

**Interview answer:** `SELECT` reads rows, `INSERT` adds them, `UPDATE` changes them, and `DELETE` removes them.

4. How would you filter rows using WHERE?

**Deep explanation:** Add a `WHERE` clause after `FROM` with a Boolean condition, such as `SELECT * FROM employees WHERE department = 'Sales' AND active = TRUE;`. Only rows for which the condition evaluates to true are returned; false and unknown are excluded.

**Interview answer:** I use `WHERE` with a predicate, for example `SELECT * FROM employees WHERE salary >= 50000;`, so only matching rows are returned.

5. How do AND, OR, and NOT combine conditions?

**Deep explanation:** `AND` requires both conditions to be true, `OR` requires at least one, and `NOT` negates a condition. Because `AND` usually has higher precedence than `OR`, parentheses make intent explicit: `active = TRUE AND (role = 'Admin' OR role = 'Editor')`.

**Interview answer:** `AND` requires all combined conditions, `OR` accepts any, and `NOT` reverses a condition; I use parentheses to make precedence clear.

6. How do NULL and an empty string differ in SQL?

**Deep explanation:** `NULL` represents missing or unknown information; an empty string is a known text value containing zero characters. They therefore require different tests: `IS NULL` versus `= ''`. Some databases, notably Oracle, treat an empty string as `NULL`, so portability matters.

**Interview answer:** `NULL` means absent or unknown, while `''` is a present string of length zero; I test them with `IS NULL` and `= ''` respectively.

7. Why does comparing a value to NULL with equality not behave as expected?

**Deep explanation:** SQL uses three-valued logic: comparisons with an unknown value produce `UNKNOWN`, not true or false. Therefore `column = NULL` never evaluates true in a filter. Use `column IS NULL` or `column IS NOT NULL` instead.

**Interview answer:** Because `NULL` means unknown, equality with it evaluates to unknown. I use `IS NULL` or `IS NOT NULL`, never `= NULL`.

8. How do COUNT(*), COUNT(column), and COUNT(DISTINCT column) differ?

**Deep explanation:** `COUNT(*)` counts input rows, including rows containing `NULL`. `COUNT(column)` counts only rows where that column is non-`NULL`. `COUNT(DISTINCT column)` counts unique non-`NULL` values; distinct processing may require extra sorting or hashing.

**Interview answer:** `COUNT(*)` counts rows, `COUNT(column)` counts non-null values, and `COUNT(DISTINCT column)` counts unique non-null values.

9. How do GROUP BY and ORDER BY differ?

**Deep explanation:** `GROUP BY` combines rows sharing key values so aggregate functions such as `SUM` or `COUNT` can produce one result per group. `ORDER BY` sorts the final result and does not aggregate it. Grouping does not guarantee output order.

**Interview answer:** `GROUP BY` forms groups for aggregation; `ORDER BY` sorts the returned rows. If I need a guaranteed order, I explicitly use `ORDER BY`.

10. How do WHERE and HAVING differ?

**Deep explanation:** `WHERE` filters individual rows before grouping and usually cannot reference aggregate results. `HAVING` filters groups after `GROUP BY`, such as `HAVING COUNT(*) > 5`. Put non-aggregate filters in `WHERE` when possible to reduce work early.

**Interview answer:** `WHERE` filters rows before aggregation, while `HAVING` filters groups after aggregation, often using expressions like `COUNT(*)`.

11. How do INNER JOIN and LEFT JOIN differ?

**Deep explanation:** An `INNER JOIN` returns only rows with matching join keys on both sides. A `LEFT JOIN` returns every left-side row and matching right-side rows, filling right-side columns with `NULL` when no match exists. Multiple matches can produce multiple output rows.

**Interview answer:** `INNER JOIN` keeps only matches; `LEFT JOIN` keeps all left rows and supplies `NULL` for right-side columns when no match exists.

12. How do RIGHT JOIN, FULL OUTER JOIN, and CROSS JOIN behave?

**Deep explanation:** `RIGHT JOIN` preserves all rows from the right table and is the mirrored form of `LEFT JOIN`. `FULL OUTER JOIN` preserves unmatched rows from both sides. `CROSS JOIN` returns the Cartesian product—every left row paired with every right row—so `m × n` rows can grow quickly.

**Interview answer:** `RIGHT JOIN` preserves the right table, `FULL OUTER JOIN` preserves both tables, and `CROSS JOIN` creates every possible row pair.

13. What is a self-join useful for?

**Deep explanation:** A self-join joins a table to itself using different aliases. It is useful for relationships stored within one table, such as matching each employee to their manager: `employees e LEFT JOIN employees m ON e.manager_id = m.id`. It can also compare rows or find related pairs.

**Interview answer:** A self-join relates rows within the same table—for example, joining employees to their managers—using separate aliases for each role.

14. How do UNION and UNION ALL differ?

**Deep explanation:** Both append compatible result sets vertically. `UNION` removes duplicate rows, which generally requires sorting or hashing; `UNION ALL` retains duplicates and is usually faster. Corresponding columns must have compatible types and the same count.

**Interview answer:** `UNION` combines results and removes duplicates; `UNION ALL` keeps duplicates and is normally faster.

15. How would you select distinct combinations of columns?

**Deep explanation:** Apply `DISTINCT` to the complete selected column list: `SELECT DISTINCT country, city FROM customers;`. Uniqueness is evaluated on each `(country, city)` tuple, not separately per column.

**Interview answer:** I use `SELECT DISTINCT col1, col2 ...`; `DISTINCT` applies to the entire selected combination.

16. How would you find duplicate email addresses in a users table?

**Deep explanation:** Group by the normalized email and keep groups with more than one row: `SELECT email, COUNT(*) AS occurrences FROM users GROUP BY email HAVING COUNT(*) > 1;`. If email comparison should ignore case or whitespace, group by the appropriate normalized expression, such as `LOWER(TRIM(email))`.

**Interview answer:** `SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;` finds email values occurring more than once.

17. How would you find employees earning more than a specified salary?

**Deep explanation:** Filter on the salary column with a parameter: `SELECT * FROM employees WHERE salary > :minimum_salary;`. A parameter safely supplies the runtime threshold and lets the database reuse the query plan.

**Interview answer:** I would write `SELECT * FROM employees WHERE salary > :minimum_salary;` and bind the salary value as a parameter.

18. How would you calculate total sales per customer?

**Deep explanation:** Group sales by customer and sum the amount: `SELECT customer_id, SUM(amount) AS total_sales FROM sales GROUP BY customer_id;`. To include customers with no sales, start from `customers`, use a `LEFT JOIN`, and apply `COALESCE(SUM(s.amount), 0)`.

**Interview answer:** I group by customer and aggregate: `SELECT customer_id, SUM(amount) AS total_sales FROM sales GROUP BY customer_id;`.

19. How would you find customers who have never placed an order?

**Deep explanation:** Use an anti-join, commonly `NOT EXISTS`: `SELECT c.* FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);`. It directly expresses the requirement and avoids the `NULL` pitfalls that can affect `NOT IN`.

**Interview answer:** I use `NOT EXISTS` with a correlated subquery checking orders for each customer; customers for whom no matching order exists are returned.

20. How would you select the most recent ten orders deterministically?

**Deep explanation:** Sort newest first and add a unique tie-breaker: `SELECT * FROM orders ORDER BY created_at DESC, id DESC LIMIT 10;`. The unique secondary key makes the result deterministic when multiple orders share the same timestamp. Row-limiting syntax varies by database.

**Interview answer:** I order by timestamp descending plus a unique tie-breaker, then limit to ten: `ORDER BY created_at DESC, id DESC LIMIT 10`.

21. How would you update rows without accidentally updating every row?

**Deep explanation:** Write and verify a precise `WHERE` predicate before executing the `UPDATE`, ideally by running the equivalent `SELECT` first. Use a transaction, inspect the affected-row count, and roll back if it is unexpected: `UPDATE users SET active = FALSE WHERE id = :id;`.

**Interview answer:** I use a specific `WHERE` clause, preview matching rows with `SELECT`, run the update in a transaction, and verify the affected-row count before committing.

22. How do DELETE, TRUNCATE, and DROP differ in your database?

**Deep explanation:** `DELETE` removes selected rows and supports `WHERE`; it generally logs row-level changes and fires applicable delete behavior. `TRUNCATE` quickly removes all rows, commonly with restrictions and database-specific identity/transaction behavior. `DROP` removes the object definition itself. Exact locking, logging, rollback, trigger, and cascade semantics are vendor-specific.

**Interview answer:** `DELETE` removes chosen rows, `TRUNCATE` efficiently empties a table, and `DROP` removes the table object; I verify transaction and identity behavior for the specific database.

23. What is a transaction, and how do COMMIT and ROLLBACK work?

**Deep explanation:** A transaction groups operations into one logical unit governed by ACID properties. `COMMIT` makes its successful changes durable and visible according to isolation rules; `ROLLBACK` cancels uncommitted changes. For example, debiting one account and crediting another should succeed or fail together.

**Interview answer:** A transaction treats several operations as one unit. `COMMIT` permanently accepts them, while `ROLLBACK` undoes uncommitted work so partial changes are not left behind.

24. What is a database index?

**Deep explanation:** An index is an auxiliary data structure, often a B-tree, that helps the database locate, join, or order rows without scanning the whole table. It improves suitable reads but consumes storage and adds maintenance cost to inserts, updates, and deletes. Column order and query patterns determine usefulness.

**Interview answer:** An index speeds lookups and sometimes joins or sorting, but costs storage and makes writes more expensive, so I create indexes around real query patterns.

25. What is a view?

**Deep explanation:** A view is a named query presented like a virtual table. It can simplify repeated joins, provide a stable interface, and restrict exposed rows or columns, but ordinary views usually store no result data and do not inherently make queries faster. Materialized views are a separate, stored alternative.

**Interview answer:** A view is a reusable named query that behaves like a table, useful for abstraction and controlled access; a normal view usually does not store its result.

26. How do numeric, text, date, timestamp, and Boolean types differ?

**Deep explanation:** Numeric types store numbers and support arithmetic, with exact types such as integer/decimal and approximate types such as floating point. Text types store character data. `DATE` stores a calendar date, while `TIMESTAMP` stores date and time, sometimes with time-zone semantics. Boolean represents true/false, though physical support varies by database.

**Interview answer:** Numeric types support arithmetic, text stores characters, date stores a calendar day, timestamp adds time and possibly time-zone semantics, and Boolean represents true or false.

27. Why should monetary values use a suitable exact numeric representation?

**Deep explanation:** Binary floating-point values cannot exactly represent many decimal fractions, so repeated arithmetic can introduce rounding surprises. Fixed-precision decimal types such as `DECIMAL(19,4)`, or integer minor units when appropriate, preserve predictable values. Required range, fractional precision, currency rules, and rounding policy should drive the choice.

**Interview answer:** Money needs exact, predictable arithmetic, so I use a properly sized decimal type—or integer minor units—not binary floating point, with explicit rounding rules.

28. How would you express conditional logic using CASE?

**Deep explanation:** `CASE` returns a value based on ordered conditions: `CASE WHEN score >= 90 THEN 'A' WHEN score >= 80 THEN 'B' ELSE 'C' END`. The first matching branch wins, and `ELSE` handles unmatched cases; without it, the result is `NULL`.

**Interview answer:** I use `CASE WHEN condition THEN value ... ELSE value END`; SQL evaluates conditions in order and returns the first matching result.

29. How would you replace or handle NULL values with COALESCE?

**Deep explanation:** `COALESCE(a, b, c)` returns the first non-`NULL` expression. For example, `COALESCE(nickname, full_name, 'Unknown')` provides a display fallback, and `COALESCE(discount, 0)` supplies a numeric default. Its arguments must have compatible types, and replacing `NULL` should match business meaning.

**Interview answer:** I use `COALESCE`, which returns the first non-null argument—for example, `COALESCE(discount, 0)`.

30. Why should queries use parameters instead of concatenated user input?

**Deep explanation:** Parameters keep SQL structure separate from data, preventing user input from becoming executable SQL and mitigating SQL injection. They also handle quoting and types correctly and can improve plan reuse. Identifiers such as column names generally cannot be bound and must come from a strict allowlist.

**Interview answer:** Parameterized queries prevent input from changing the SQL structure, reduce injection risk, handle values safely, and often improve plan reuse.

31. How do CHECK constraints and foreign-key constraints enforce different rules?

**Deep explanation:** A `CHECK` constraint validates a condition about the row, such as `price >= 0`; remember that SQL checks commonly accept true or unknown, so nullability may need a separate `NOT NULL`. A foreign key validates that referenced values exist in a parent key and governs relationships between tables.

**Interview answer:** `CHECK` enforces a predicate on row values, while a foreign key ensures a referenced parent key exists and protects relationships between tables.

32. How do ON DELETE CASCADE, RESTRICT, and SET NULL affect related records?

**Deep explanation:** These foreign-key actions define what happens to child rows when a parent is deleted. `CASCADE` deletes matching children, `RESTRICT`—or similar no-action behavior—blocks deletion while references exist, and `SET NULL` clears the child foreign key, which requires nullable columns. The choice should reflect ownership and retention rules.

**Interview answer:** `CASCADE` deletes dependent rows, `RESTRICT` blocks deletion when dependents exist, and `SET NULL` keeps dependents but clears their foreign key.

33. What are stored procedures and database functions used for?

**Deep explanation:** They package logic close to the data for reuse, controlled access, validation, or fewer application/database round trips. Functions typically return a value or table and may be usable inside queries; procedures usually perform operations and may return result sets or output parameters. Exact capabilities and transaction rules vary by database, and heavy use can increase vendor coupling.

**Interview answer:** Stored procedures and functions centralize reusable database logic; functions generally return values usable in queries, while procedures commonly execute multi-step operations, subject to vendor-specific rules.

34. What is a trigger, and when does it execute?

**Deep explanation:** A trigger is database code automatically invoked by an event such as `INSERT`, `UPDATE`, or `DELETE`, either before, after, or instead of the operation depending on the database. Triggers can enforce auditing or invariants, but hidden side effects, recursion, and write overhead make them harder to reason about.

**Interview answer:** A trigger runs automatically when a configured database event occurs, such as before or after a row change; it is useful for auditing or invariants but can hide side effects.

35. What is a savepoint inside a transaction?

**Deep explanation:** A savepoint is a named marker within an active transaction. `ROLLBACK TO savepoint_name` undoes work performed after that marker without discarding earlier transaction work; the transaction can then continue. Syntax and effects on locks or nested behavior vary by database.

**Interview answer:** A savepoint marks an intermediate point in a transaction so I can roll back later operations without rolling back the entire transaction.
