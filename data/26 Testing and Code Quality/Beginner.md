1. How do unit, integration, and end-to-end tests differ?

**Deep explanation:** Unit tests check one small component in isolation and are usually fast. Integration tests verify that components—such as an API and database—work together. End-to-end tests exercise a complete user flow through the real system; they provide broad confidence but are slower and more fragile.

**Interview answer:** Unit tests isolate one component, integration tests check interactions between components, and end-to-end tests validate complete user journeys. I use many fast unit tests, fewer integration tests, and a small set of critical end-to-end tests.

2. What behavior should a unit test verify?

**Deep explanation:** A unit test should verify an observable contract: given certain inputs or state, the unit returns a result, changes state, or collaborates with a dependency as expected. It should avoid asserting private implementation details, because harmless refactoring would then break the test.

**Interview answer:** I test the unit's public behavior—its output, state change, or required interaction—not its private implementation. Each test should cover one meaningful rule or outcome.

3. How do arrange, act, and assert structure a test?

**Deep explanation:** Arrange creates inputs, dependencies, and initial state. Act performs the single behavior under test. Assert checks the observable result. Keeping these phases visually distinct makes a test easier to understand and reveals tests that perform too many actions.

**Interview answer:** Arrange prepares the scenario, act invokes the behavior once, and assert verifies the outcome. This structure makes the test's intent and failure easy to read.

4. What makes a test deterministic?

**Deep explanation:** A deterministic test produces the same result whenever its code and inputs are unchanged. It controls variable influences such as time, randomness, concurrency, network services, shared databases, locale, and execution order. Injecting a clock or seeded random generator is often better than relying on global state.

**Interview answer:** A deterministic test gives the same result for the same setup. I control time, randomness, external services, shared state, and ordering so failures indicate a real code change rather than environmental variation.

5. How would you choose useful names for tests?

**Deep explanation:** A useful name describes the behavior, scenario, and expected result, such as `withdraw_rejects_amount_above_balance`. It should communicate the requirement without requiring the reader to inspect the test body. Names should use the project's established convention consistently.

**Interview answer:** I name tests around behavior: what is being tested, under which condition, and what should happen. For example, `login_returns_401_when_password_is_invalid`.

6. How do happy-path, edge-case, and failure-path tests differ?

**Deep explanation:** Happy-path tests cover normal valid use. Edge-case tests explore unusual but meaningful boundaries, such as zero, maximum size, or an empty collection. Failure-path tests verify rejected inputs or failed dependencies and confirm that errors are safe, clear, and correctly propagated.

**Interview answer:** Happy-path tests cover expected success, edge-case tests cover boundaries and unusual valid states, and failure-path tests cover invalid input or dependency failures. A balanced suite needs all three.

7. How would you test empty, missing, invalid, and boundary inputs?

**Deep explanation:** Treat these as distinct input classes. Test empty values such as `""` or `[]`, missing values such as an absent field or `null`, malformed or out-of-domain values, and values immediately below, at, and above each boundary. Assert both the response and any side effects that must not occur.

**Interview answer:** I identify the input contract, then test empty, absent, malformed, and out-of-range values separately. For boundaries, I test just below, exactly at, and just above the limit and verify the error or result plus side effects.

8. What is a test fixture?

**Deep explanation:** A fixture is the known state and supporting data needed to run a test, such as constructed objects, database rows, files, or configured dependencies. Fixtures reduce repeated setup, but oversized shared fixtures can hide what a test actually needs and create coupling.

**Interview answer:** A test fixture is the controlled data and environment a test starts with. I keep fixtures small and explicit so the scenario remains clear and tests do not depend on irrelevant shared state.

9. How do setup and teardown help isolate tests?

**Deep explanation:** Setup creates a clean starting state before each test; teardown releases resources or removes state afterward. This prevents one test from influencing another. Prefer fresh per-test resources and reliable cleanup, while remembering that teardown alone cannot repair poorly shared global state.

**Interview answer:** Setup gives each test a known starting point, and teardown cleans resources such as files, connections, or records. Together they prevent order-dependent tests and state leakage.

10. How do stubs, mocks, fakes, spies, and dummies differ?

**Deep explanation:** A stub returns predetermined responses. A mock is configured with expected interactions and verifies them. A fake is a working but simplified implementation, such as an in-memory repository. A spy records calls for later assertions. A dummy only fills a required parameter and is not used.

**Interview answer:** Stubs supply canned data, mocks verify expected interactions, fakes provide simplified working implementations, spies record calls, and dummies are unused placeholders. I choose the simplest test double that expresses the behavior clearly.

11. When can mocking too much make a test misleading?

**Deep explanation:** Heavy mocking can make a test validate the developer's assumptions about collaborators rather than their real behavior. A mocked database or HTTP client may accept calls the real system rejects, and interaction-heavy tests break during harmless refactoring. Use real lightweight collaborators or integration tests where compatibility matters.

**Interview answer:** Over-mocking can prove that my mocks agree with my implementation while the real components still fail together. It also couples tests to call details, so I mock true boundaries selectively and cover important integrations with real components.

12. What is code coverage measuring?

**Deep explanation:** Code coverage reports which code elements ran during a test suite. Depending on the metric, it can measure executed lines, statements, branches, functions, or conditions. Coverage highlights unexercised areas, but it does not judge whether assertions are meaningful or requirements are correct.

**Interview answer:** Coverage measures how much code the tests execute, such as lines or branches. I use it to find gaps, not as proof of test quality or correctness.

13. Why does full line coverage not prove correctness?

**Deep explanation:** A line may execute without its result being asserted, and one execution does not cover every input or control-flow outcome. Tests can also encode the wrong requirement or miss concurrency and integration failures. For example, calling a division function once covers its return line without checking division by zero.

**Interview answer:** Full line coverage only proves every line ran at least once. It does not prove all behaviors, branches, inputs, or requirements were tested, nor that assertions would catch incorrect results.

14. How do line, branch, and condition coverage differ?

**Deep explanation:** Line coverage tracks executed source lines. Branch coverage checks whether each control-flow outcome, such as both sides of an `if`, ran. Condition coverage checks whether each boolean subexpression became both true and false; for `A && B`, this examines `A` and `B` individually. Stronger metrics still do not replace thoughtful assertions.

**Interview answer:** Line coverage asks whether a line ran, branch coverage whether every decision outcome ran, and condition coverage whether each boolean part evaluated both ways. They expose different gaps, with branch and condition coverage usually revealing more than line coverage.

15. What is test-driven development?

**Deep explanation:** Test-driven development follows a short red-green-refactor cycle: write a failing test for the next behavior, implement the minimum code to pass, then improve the design while tests remain green. It encourages small steps and testable interfaces, but it does not remove the need for integration, exploratory, or acceptance testing.

**Interview answer:** TDD is red, green, refactor: write a failing behavior-focused test, add the smallest implementation that passes, then clean up safely. It helps shape testable designs and gives rapid feedback.

16. How do regression tests prevent a fixed bug from returning?

**Deep explanation:** Before or alongside a fix, create a test that reproduces the bug and fails for the old implementation. After the fix it passes and stays in the suite. Future changes that reintroduce the same behavior make the test fail in continuous integration.

**Interview answer:** I first capture the bug with a failing test, then fix the implementation and retain that test permanently. CI will then catch any later change that recreates the defect.

17. How would you test a pure function?

**Deep explanation:** A pure function depends only on its inputs and causes no side effects, so test it as an input-output mapping. Cover representative equivalence classes, boundaries, and invalid inputs where applicable. No mocks or elaborate setup should be necessary, and table-driven tests often express many cases clearly.

**Interview answer:** I call the pure function with representative, boundary, and invalid inputs and assert the exact outputs. Because it has no external dependencies or side effects, the tests should be small, deterministic, and usually need no mocks.

18. How would you test asynchronous behavior?

**Deep explanation:** Await the operation or a meaningful completion signal rather than sleeping for an arbitrary duration. Control schedulers, clocks, queues, or promises when possible, and test success, rejection, timeout, cancellation, and relevant ordering. Synchronization makes tests faster and less flaky than timing guesses.

**Interview answer:** I wait on the actual promise, event, or completion condition and avoid fixed sleeps. I control time or scheduling where possible and test success, failure, timeout, cancellation, and ordering when those are part of the contract.

19. How would you test an HTTP endpoint?

**Deep explanation:** Send requests through the application's HTTP boundary and verify status, headers, response body, validation, authentication, and persistent side effects. Test normal and error cases. For useful integration confidence, run against the real routing and serialization stack with controlled external dependencies and isolated data.

**Interview answer:** I exercise the endpoint through HTTP, then assert status code, headers, response schema and body, plus database or event side effects. I cover valid requests, validation errors, authorization, missing resources, and dependency failures.

20. How would you test a database constraint?

**Deep explanation:** Use the actual database engine and schema because substitutes may not enforce constraints identically. Insert valid data, then attempt violations such as duplicates, nulls, invalid foreign keys, or failed checks. Assert the transaction fails with the expected error and leaves the database consistent.

**Interview answer:** I test constraints against a real isolated database: prove valid data succeeds, attempt the violating write, assert the expected database error, and verify no partial or invalid state remains.

21. What is static analysis useful for?

**Deep explanation:** Static analysis examines source or compiled code without executing the program. It can detect type errors, unreachable code, unsafe null handling, security patterns, resource leaks, and style problems early. It is fast and automatable, but it cannot prove all runtime behavior or business correctness.

**Interview answer:** Static analysis catches classes of defects without running the code—for example type, nullability, security, and control-flow issues. I run it locally and in CI, while still relying on tests and review for runtime and business behavior.

22. How do formatting and linting differ?

**Deep explanation:** A formatter automatically makes code visually consistent—spacing, indentation, and line wrapping—with minimal judgment. A linter analyzes patterns that may indicate bugs, poor style, or maintainability issues. Some tools overlap, but formatting generally rewrites code while linting reports rule violations and may offer fixes.

**Interview answer:** Formatting standardizes layout automatically; linting flags suspicious or disallowed code patterns. I automate both so reviews can focus on design and correctness instead of style debates.

23. What should a code review focus on?

**Deep explanation:** Review whether the change solves the requirement correctly and safely, including edge cases, security, data integrity, concurrency, error handling, tests, readability, and operational impact. Check whether the design fits the codebase and is no more complex than necessary. Automated tools should handle routine formatting and basic checks.

**Interview answer:** I focus first on correctness and requirements, then edge cases, security, failure handling, tests, design, readability, and operational risk. I keep feedback specific, explain its impact, and distinguish blocking issues from optional suggestions.

24. How would you review error handling?

**Deep explanation:** Trace likely failures at each boundary and check that errors are caught only where they can be handled meaningfully. Ensure context is preserved, resources are cleaned up, retries are bounded and safe, user messages do not leak secrets, and logs are actionable. Silent catches and overly broad exception handling deserve scrutiny.

**Interview answer:** I check that expected failures are handled at the right layer, errors keep useful context, cleanup always happens, and retries are safe and bounded. I also verify logs are actionable, user responses are appropriate, and sensitive information is not exposed.

25. How would you review code for readability and unnecessary complexity?

**Deep explanation:** Follow the main path and ask whether names, boundaries, and control flow make intent obvious. Look for deeply nested conditions, duplicated logic, hidden side effects, oversized functions, premature abstractions, and unnecessary configuration. Simplification should preserve behavior and avoid turning every small detail into another abstraction.

**Interview answer:** I ask whether a new maintainer can understand the intent quickly. I look for clear names and cohesive functions, and challenge duplication, nesting, hidden side effects, speculative abstractions, and complexity that does not serve a current requirement.

26. What is technical debt?

**Deep explanation:** Technical debt is the future cost created by a design or implementation choice that makes later change harder. It can be intentional, such as accepting a shortcut to meet a deadline, or accidental. Like financial debt, it has ongoing “interest” through slower delivery, more defects, and operational risk, so it should be documented and prioritized by impact.

**Interview answer:** Technical debt is the extra future cost caused by shortcuts or design limitations in today's system. I make intentional debt visible, record its impact, and prioritize repayment based on risk and how much it slows future work.

27. How would you reproduce a reported bug reliably?

**Deep explanation:** Gather exact steps, inputs, expected and actual results, versions, configuration, logs, and timing. Recreate the relevant environment, reduce the scenario to the smallest reliable case, and change one variable at a time. Once reproducible, capture it in an automated test when practical.

**Interview answer:** I collect precise steps, data, environment, versions, logs, and expected versus actual behavior. I reproduce the environment, minimize the case, isolate variables, and then turn the reproduction into a failing test where possible.

28. How would you use a debugger instead of adding random log statements?

**Deep explanation:** Start from a reproducible failure and set a breakpoint near the first point where state may diverge. Step through control flow, inspect variables and the call stack, and use conditional breakpoints or watches to target the failing case. Work backward from the symptom to identify the earliest incorrect state rather than scattering output everywhere.

**Interview answer:** I reproduce the issue, place a breakpoint near the suspected boundary, and inspect state, call stack, and control flow as I step through. Conditional breakpoints and watches help me find the first incorrect state efficiently.

29. How would you distinguish a broken test from a broken implementation?

**Deep explanation:** Compare both test and implementation against the authoritative requirement. Check whether the test setup is isolated and realistic, whether its assertion observes public behavior, and whether recent changes intentionally altered the contract. Reproduce the behavior independently; do not automatically change whichever side is easier.

**Interview answer:** I return to the requirement, reproduce the behavior independently, and inspect the test's setup and assertions. If the implementation violates the contract, fix it; if the requirement changed or the test asserts an implementation detail, update the test.

30. What information belongs in a useful bug report?

**Deep explanation:** Include a clear title, environment and version, prerequisites, minimal reproduction steps, inputs, expected result, actual result, frequency, and impact. Add relevant logs, screenshots, traces, or sample data after removing secrets. Note workarounds and regression range when known so another person can reproduce and prioritize the issue.

**Interview answer:** A useful bug report includes environment and version, exact reproduction steps and data, expected and actual behavior, frequency, and impact. I attach sanitized evidence such as logs or screenshots and mention known workarounds or when the regression began.
