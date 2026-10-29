1. How would you recover work after a shared branch was force-pushed incorrectly?

**Deep explanation:**
Freeze further pushes and find the lost tip in another clone, `git reflog`, CI, pull-request refs, or provider audit data. Create a recovery branch at it immediately, compare both histories, then integrate missing commits or restore the agreed tip with `git push --force-with-lease`. Tell all consumers how to resynchronize so stale clones do not overwrite the repair.

**Interview answer:**
I would stop pushes, recover the old tip from reflogs or another clone, and anchor it with a branch. After comparing histories, I would integrate the missing work or restore it with a leased force-push, then coordinate every consumer's reset or rebase.

2. How would you rewrite sensitive history while coordinating all repository consumers?

**Deep explanation:**
Rotate the exposed credential first because rewriting cannot make a live secret safe. Inventory branches, tags, forks, mirrors, caches, and deployments; announce a freeze; rewrite every affected ref with a tool such as `git filter-repo`; validate it; and force-update with old-tip checks. Consumers must clean or replace clones, and old history must be prevented from being pushed back.

**Interview answer:**
I would rotate the secret first, freeze writes, rewrite and verify all affected refs, then perform a controlled force-push. I would give clone, fork, mirror, and CI owners exact cleanup steps and monitor for reintroduction of old commits.

3. What limitations remain after deleting a secret from Git history?

**Deep explanation:**
The secret may remain in clones, forks, pull-request refs, caches, backups, logs, artifacts, or unreachable objects awaiting garbage collection. Rewriting also changes commit IDs and invalidates signatures. Therefore deletion reduces discoverability but never replaces credential rotation and incident response.

**Interview answer:**
History deletion cannot prove every copy is gone, so I treat the secret as permanently compromised. I rotate it and investigate forks, caches, logs, backups, and artifacts even after the rewrite succeeds.

4. How would you design a reliable merge queue for a busy repository?

**Deep explanation:**
The queue should build a temporary candidate from the latest target plus queued changes, run required checks, and merge only that exact tested commit. It must rebuild candidates when the base moves, isolate failures, split bad batches, support cancellation and fairness, and expose clear status. Batching improves throughput but makes failure attribution harder.

**Interview answer:**
I would test queued changes against the current target and merge only the exact candidate that passed. The queue would rebuild on base changes, isolate failed batches, and balance throughput, fairness, and clear observability.

5. How would you prevent individually passing pull requests from breaking after integration?

**Deep explanation:**
PR checks often run against stale bases and cannot prove compatibility with concurrent changes. Use a merge queue or required update that tests the combined candidate, plus contract, integration, migration, and end-to-end tests at important boundaries. Observable, reversible deployments cover interactions the test suite misses.

**Interview answer:**
I would test the actual integrated candidate, not only each PR head. A merge queue, cross-component tests, and reversible deployments keep stale green checks from being mistaken for integration safety.

6. How would you enforce dependency boundaries in a large monorepo?

**Deep explanation:**
Define the allowed domain or layer graph and encode it in build visibility, module linting, or architecture tests. Packages should expose stable public APIs, reject deep imports and new cycles, and have owners for boundary decisions. Baseline legacy violations and tighten them incrementally so existing debt does not block all work.

**Interview answer:**
I would make the intended dependency graph machine-enforceable in builds and CI, with public package APIs and failures for new illegal edges or cycles. Existing violations would be baselined and paid down progressively.

7. How would you use sparse checkout and partial clone for a very large repository?

**Deep explanation:**
Partial clone, such as `--filter=blob:none`, defers downloading object contents; sparse checkout limits paths materialized in the worktree. Use cone-mode patterns for relevant directories and verify remote support. Test builds and scripts because full-tree scans or offline work can trigger large on-demand fetches or fail.

**Interview answer:**
I would combine a blob-filtered partial clone with cone-mode sparse checkout. Then I would test tooling for hidden whole-repository assumptions and monitor unexpected on-demand object fetches.

8. How would you investigate repository corruption while preserving recoverable objects?

**Deep explanation:**
Stop writes and copy the repository, including `.git`, before attempting repair. Run `git fsck --full`, inspect reflogs, dangling objects, pack indexes, alternates, disk health, and trusted clones. Anchor recoverable commits with refs before pruning or repacking, restore missing objects from verified sources, and validate the repaired graph.

**Interview answer:**
I would preserve a copy, disable writes and cleanup, then use `git fsck`, reflogs, and object inspection to locate damage. I would create refs for recoverable objects and restore missing data from a trusted clone or backup before cleanup.

9. How would you recover an orphaned commit after normal references disappear?

**Deep explanation:**
Search reflogs first because they record recent resets, rebases, and branch deletion. If the hash is unknown, inspect dangling commits from `git fsck --lost-found`. Once identified with `git show`, create a branch or tag immediately; recovery becomes less likely after reflog expiration and garbage collection.

**Interview answer:**
I would search reflogs, then inspect dangling commits reported by `git fsck`. As soon as I find the commit, I create a branch at its hash so it remains reachable.

10. How would you verify provenance using signed commits and release artifacts?

**Deep explanation:**
Verify signatures against trusted, current identities—not merely cryptographic validity—and build the verified revision in a controlled pipeline. Generate and sign provenance binding source, builder, inputs, and immutable artifact digest. Consumers should verify the ref, signer policy, attestation, and downloaded digest.

**Interview answer:**
I would verify a protected release ref against trusted signer identities, build that exact revision, and sign an attestation tying it to the artifact digest. Deployment verifies both the policy chain and the immutable digest.

11. How would you avoid trusting a commit signature as proof that code is safe?

**Deep explanation:**
A valid signature proves a key signed certain bytes; it does not prove the key was uncompromised, the signer was authorized, review was sufficient, or the code is correct. Combine signatures with identity lifecycle, branch protection, independent review, security testing, reproducible builds, and runtime controls.

**Interview answer:**
A signature establishes integrity and an asserted identity, not safety. I use it as one signal alongside trusted-key management, review, tests, security analysis, and verified artifacts.

12. How would you evaluate automated dependency updates before merging them?

**Deep explanation:**
Verify package identity, registry, version intent, changelog, lockfile scope, transitive changes, ownership transfers, and install scripts. Run compatibility, security, license, and reproducibility checks. Low-risk patches may auto-merge under strong tests; major, build-tool, or security-critical changes deserve manual review and staged rollout.

**Interview answer:**
I would inspect provenance and lockfile changes, review release and transitive impact, and run compatibility, security, license, and build checks. Only low-risk updates with strong coverage qualify for auto-merge.

13. How would you design ownership rules without creating review bottlenecks?

**Deep explanation:**
Assign teams rather than single people, keep multiple qualified owners per critical area, and vary approval requirements by risk. Provide delegation, escalation, timeout, and emergency paths with auditing. Track review latency and remove stale ownership entries so routing reflects actual expertise.

**Interview answer:**
I would use team ownership with at least two active owners for critical areas and risk-based approval rules. Delegation, fallback paths, and latency metrics prevent expertise from becoming a single-person gate.

14. How would you move code between repositories while preserving useful history?

**Deep explanation:**
First decide whether full or path-limited history, tags, authorship, or only provenance is valuable. Filter relevant paths in a temporary clone using `git filter-repo`, optionally relocate them, then import and merge into the destination. Since hashes and signatures change, retain an old-to-new mapping and test the resulting build.

**Interview answer:**
I would define the history worth preserving, create a path-filtered rewrite in a temporary clone, and import it while retaining authorship and a commit mapping. I would validate the build and coordinate the cutover because hashes change.

15. How would you migrate a repository's default branch without breaking automation?

**Deep explanation:**
Inventory hard-coded branch names in CI, deployments, protections, webhooks, badges, scripts, submodules, and external integrations. Create and protect the new branch, update and test consumers using provider default-branch variables where possible, then switch during a communicated cutover and monitor failures. Give contributors exact local tracking commands.

**Interview answer:**
I would inventory every old-name dependency, create and protect the new branch, update and test automation, and switch the default in a scheduled cutover. I would monitor integrations and publish local migration commands.

16. How would you maintain a long-running fork with upstream security fixes?

**Deep explanation:**
Track an upstream remote, keep fork-specific commits small and documented, and synchronize regularly with supported releases. Monitor advisories and fast-track relevant fixes with regression tests. Upstream suitable changes whenever possible because each permanent divergence increases merge and validation cost.

**Interview answer:**
I would maintain a small documented delta, track upstream releases and advisories, and integrate security fixes quickly with targeted tests. Regular synchronization and upstreaming changes reduce long-term fork cost.

17. How would you design a release process that maps deployed binaries to exact source revisions?

**Deep explanation:**
Build once in CI from a protected immutable commit or signed tag, embed revision metadata, and produce a digest, SBOM, and signed provenance. Promote that same artifact instead of rebuilding per environment. Record environment, artifact digest, source commit, configuration, and migration versions for every deployment.

**Interview answer:**
I would build once from an immutable revision, bind it to the artifact digest with signed provenance, and promote the identical artifact. Deployment records map the environment and configuration to that exact digest and source commit.

18. How would you handle database migrations when reverting an application commit is insufficient?

**Deep explanation:**
Database state can be irreversible or incompatible with old code, so plan schema and application rollback together. Prefer expand-and-contract: add compatible structures, deploy dual-compatible code, migrate data, and remove old structures later. During incidents, a tested forward fix is often safer than a destructive down migration; backup restoration needs a rehearsed data-recovery plan.

**Interview answer:**
I would not assume a Git revert restores database state. I use backward-compatible expand-and-contract migrations and usually prefer a tested forward fix, with backup or data repair handled through a separate recovery procedure.

19. How would you investigate a regression introduced only by a merge resolution?

**Deep explanation:**
Reproduce at the merge commit, then compare the result against both parents with `git diff <merge>^1 <merge>`, `^2`, and `git show --cc`. These reveal content introduced during conflict resolution rather than either branch. Test the corrected resolution and add a regression test for the cross-branch interaction.

**Interview answer:**
I would reproduce on the merge and inspect its combined diff plus differences from both parents. After correcting the semantic resolution, I would add an integration test that captures the interaction.

20. How would you validate semantic equivalence after a large automated refactor?

**Deep explanation:**
Keep the mechanical refactor separate from behavior changes, then use unit, integration, property, snapshot, and differential tests comparing old and new outputs on representative and generated inputs. Inspect transformation exceptions and measure critical side effects and performance. Stage rollout with telemetry when test coverage cannot prove equivalence.

**Interview answer:**
I would isolate the mechanical change, compare old and new behavior with differential and property tests, run the full suite, and inspect exceptions. Critical paths also get performance checks and staged rollout telemetry.

21. How would you decide whether a conflict should be resolved by the author or domain owner?

**Deep explanation:**
The author can resolve mechanical conflicts and explain their intent; domain owners should decide conflicts involving invariants, security, compatibility, or another team's design. Complex cases should be paired rather than handed off. Tests must demonstrate the intended combined behavior.

**Interview answer:**
I let the author handle mechanical conflicts but involve the domain owner whenever resolution requires domain or architectural judgment. Risky conflicts are resolved collaboratively and verified with focused tests.

22. How would you review security-sensitive changes from an external contributor?

**Deep explanation:**
Treat the code and CI changes as untrusted. Run them in a sandbox without production secrets or write tokens, require internal security-aware review, inspect dependencies, workflows, generated files, and obfuscated behavior, and reproduce critical results internally. External CI success never grants privileged execution.

**Interview answer:**
I would use an unprivileged environment with no secrets, require internal expert review, and inspect workflows and dependencies as carefully as source. I would independently reproduce security-critical results before merging.

23. How would you preserve local uncommitted work before a risky repository operation?

**Deep explanation:**
Inspect `git status`, including untracked and ignored assets. Prefer a temporary branch with a WIP commit; otherwise use a named stash with `-u` and copy ignored or non-Git files separately. Verify the saved commit or stash, and create an external archive for especially valuable work.

**Interview answer:**
I would inventory all local state, make a temporary branch and WIP commit where possible, and preserve untracked or ignored assets separately. I verify the backup before running the risky operation.

24. How would you diagnose a CI checkout that does not include the expected commit history?

**Deep explanation:**
Inspect `HEAD`, remotes, refs, shallow status, and the event's requested ref. Check checkout depth, tag fetching, partial-clone filters, submodules, and whether CI uses a synthetic merge commit. Fetch the precise missing refs or deepen history only as needed because a full clone may be costly.

**Interview answer:**
I would compare the actual `HEAD`, refs, and shallow boundaries with checkout configuration and the event payload. Then I fetch only the missing commits, tags, or depth required by the job.

25. How would you design repository access and token permissions for automated bots?

**Deep explanation:**
Give every bot a distinct workload identity, short-lived credential, least-privilege repository scope, and environment-specific permissions. Default to read-only and constrain writes to required refs or APIs. Protect sensitive branches, isolate secrets from untrusted PRs, audit actions, rotate credentials, and provide rapid revocation.

**Interview answer:**
I would use separate short-lived bot identities, default to read-only, and narrowly scope necessary writes. Branch protection, secret isolation, auditing, rotation, and immediate revocation complete the design.

26. How would you manage generated files that must be versioned but frequently conflict?

**Deep explanation:**
Make generation deterministic and pin generator versions, inputs, formatting, and stable ordering. Treat source files as authoritative; CI should regenerate and fail on a diff. Resolve conflicts in source and regenerate rather than hand-editing output. Splitting large outputs can reduce conflict surface.

**Interview answer:**
I would make generation deterministic, verify committed output in CI, and resolve conflicts in the source before regenerating. Stable ordering and smaller output units reduce repeated conflicts.

27. How would you compare release tags with immutable artifact identifiers?

**Deep explanation:**
A tag is a convenient source name but may be moved unless policy prevents it; even a signed tag does not identify built bytes. A content digest identifies an immutable artifact. Bind commit, protected signed tag, and digest through provenance, and deploy by digest while using tags for human navigation.

**Interview answer:**
I treat the tag as a source reference and the artifact digest as the deployment identity. I protect and sign tags, bind them to digests through provenance, and deploy by digest.

28. How would you detect accidental differences between a hotfix branch and production?

**Deep explanation:**
Identify production from deployment metadata and artifact digest rather than assuming a branch equals reality. Compare commit sets, patch equivalence, and final trees between that revision and the hotfix; also compare configuration, migrations, build inputs, and generated artifacts. Forward-port the hotfix to the main line and verify convergence.

**Interview answer:**
I would resolve the exact production revision, then compare commits, patches, trees, configuration, and migrations with the hotfix. After deployment I ensure the fix is propagated back and the lines converge.

29. How would you improve collaboration when review latency exceeds implementation time?

**Deep explanation:**
Measure queue time, pickup time, review rounds, and reviewer load to locate delays. Use smaller PRs, early reviewer assignment, rotations, response expectations, wider ownership, automated mechanical checks, and short synchronous reviews for complex issues. Track defects too, because fast rubber-stamping only moves cost downstream.

**Interview answer:**
I would measure where reviews wait, then use smaller changes, reviewer rotations, early ownership, clear response expectations, and automation. Complex issues get synchronous review, while quality metrics prevent speed from becoming rubber-stamping.

30. How would you explain a safe recovery plan before modifying shared Git history?

**Deep explanation:**
Document the reason, affected refs and hashes, intended result, risks, owners, freeze window, and success criteria. Create verified backup refs or bundles, rehearse in a disposable clone, use leases, and define rollback plus consumer resynchronization commands. Monitor afterward for stale pushes and retain backups until critical consumers are verified.

**Interview answer:**
I would present current and target histories, impacted consumers, tested commands, backups, rollback, freeze window, and validation criteria. I would proceed only after owners agree and every consumer has clear resynchronization steps.
