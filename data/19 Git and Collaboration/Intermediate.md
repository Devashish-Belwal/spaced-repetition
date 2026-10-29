1. How do merge, rebase, and squash affect history?

**Deep explanation:**
`merge` joins histories with a merge commit (unless Git can fast-forward), preserving the real branch topology and individual commits. `rebase` replays commits on a new base, producing new commit IDs and a linear history; it is useful for cleaning private work but rewrites history. `squash` combines several changes into one commit, simplifying review or rollback but discarding the original commit boundaries. The best choice depends on whether preserving development context or presenting a compact history matters more.

**Interview answer:**
Merge preserves branch history, rebase rewrites commits onto a new base for a linear history, and squash collapses multiple commits into one. I merge when topology matters, rebase private work for clarity, and squash when the intermediate commits add no lasting value.

2. When should you avoid rebasing a shared branch?

**Deep explanation:**
Avoid rebasing commits that other people have already based work on or pulled into their local branches. Rebase replaces commits with new ones, so collaborators must reconcile two versions of the same history, often through force pushes and confusing duplicate commits. Rebasing is normally safe on unpublished personal branches; on a shared branch, coordinate explicitly if rewriting is unavoidable.

**Interview answer:**
I avoid rebasing published commits that teammates may already use because it changes commit IDs and forces everyone to repair their history. I normally rebase only my private branch, or coordinate a planned rewrite with the whole team.

3. How do revert, reset, and restore differ?

**Deep explanation:**
`git revert` creates a new commit that applies the inverse of an earlier commit, so it safely undoes changes in shared history. `git reset` moves a branch reference and optionally changes the index and working tree, making it mainly suitable for local history repair. `git restore` copies file content from the index or another commit into the working tree and can also unstage files; it does not move the branch pointer.

**Interview answer:**
Revert safely undoes a commit by adding a new commit. Reset moves the current branch and can also rewrite the index or working tree. Restore operates on file contents or staging without moving branch history.

4. How do soft, mixed, and hard reset differ?

**Deep explanation:**
All three forms move `HEAD` and the current branch to the target commit. `--soft` leaves both the index and working tree unchanged, so the removed commits become staged changes. `--mixed`, the default, resets the index but preserves the working tree, leaving changes unstaged. `--hard` resets the branch, index, and working tree, discarding tracked local changes and therefore requiring extra caution.

**Interview answer:**
Soft reset moves the branch but keeps changes staged; mixed reset keeps them only in the working tree; hard reset makes the index and working tree match the target and discards tracked changes.

5. How would you recover a commit using the reflog?

**Deep explanation:**
The reflog records recent movements of local references such as `HEAD`, including commits lost after reset or rebase. Run `git reflog`, identify the desired commit by its hash or entry such as `HEAD@{3}`, inspect it with `git show`, and create a branch with `git branch recovery <hash>` or cherry-pick it. Reflog entries eventually expire and are local, so recovery should be done promptly.

**Interview answer:**
I run `git reflog`, find and verify the lost commit, then immediately anchor it with `git branch recovery <hash>`. From there I can merge or cherry-pick it back safely.

6. How would you split a large commit into smaller logical commits?

**Deep explanation:**
For an unpublished commit, use interactive rebase and mark it `edit`, then run `git reset HEAD^` to keep its changes while removing the commit. Stage related hunks with `git add -p`, commit each logical unit, and continue the rebase. Each resulting commit should build or test where practical, making review, bisecting, and selective reverts easier.

**Interview answer:**
I edit the commit through interactive rebase, reset it while keeping its changes, then use partial staging to create focused commits. I verify each commit and continue the rebase, avoiding this rewrite on shared history without coordination.

7. How would you reorder or edit commits with interactive rebase?

**Deep explanation:**
Run `git rebase -i <base>` and change the todo list: reorder lines to reorder commits, use `reword` for messages, `edit` for content, `squash` or `fixup` to combine commits, and `drop` to remove one. Resolve any conflicts, amend as needed, and use `git rebase --continue`. Because every affected descendant receives a new ID, this is best done before publishing the branch.

**Interview answer:**
I use `git rebase -i` from the commit before the range, edit the todo list, then resolve and continue until complete. I run tests afterward and only force-push with lease if the rewritten branch was already published and rewriting was agreed.

8. How would you move one commit to another branch using cherry-pick?

**Deep explanation:**
Check out the destination branch and run `git cherry-pick <commit>`, which applies the commit's patch and creates a new commit with a different ID. Resolve conflicts and continue with `git cherry-pick --continue`, or abort if necessary. If the source commit must truly be removed, rewrite or revert it separately depending on whether that source history is private or shared.

**Interview answer:**
I switch to the target branch, run `git cherry-pick <hash>`, resolve conflicts, and test. Cherry-pick copies the change; it does not remove the original, so I would separately revert or rewrite the source branch as appropriate.

9. How would you abort an incomplete merge or rebase?

**Deep explanation:**
Use the operation-specific abort command: `git merge --abort` for a merge and `git rebase --abort` for a rebase. These restore the state from before the operation in normal cases. Before starting risky history work, commit or stash unrelated changes, because overlapping pre-existing modifications can make restoration less straightforward.

**Interview answer:**
I use `git merge --abort` or `git rebase --abort`, then confirm the status and history. I keep the working tree clean before starting so aborting can reliably restore the prior state.

10. How would you resolve conflicts without accidentally discarding another developer's change?

**Deep explanation:**
First understand the base, ours, and theirs rather than blindly selecting one side. Inspect the full diff and surrounding code, talk to the author when intent is unclear, and combine semantics rather than merely removing conflict markers. Stage only the resolved files, review `git diff --cached`, and run tests—especially tests covering both behaviors. A merge tool can help, but ownership of the final behavior remains with the resolver.

**Interview answer:**
I inspect both versions and the common ancestor, understand each developer's intent, and produce a combined resolution when needed. Then I review the staged diff and test both behaviors rather than simply choosing ours or theirs.

11. How would you use git bisect to find a regression?

**Deep explanation:**
Start with `git bisect start`, mark a known bad commit and a known good commit, then test the midpoint Git selects. Mark each midpoint `good` or `bad`; binary search reduces the investigation to roughly `O(log n)` tests. For a deterministic check, use `git bisect run <script>` so Git automates the process. Inspect the identified commit and finish with `git bisect reset`.

**Interview answer:**
I mark known bad and good revisions with `git bisect`, test each selected midpoint, and label it good or bad until Git identifies the first bad commit. If possible, I automate the test with `git bisect run`, then reset and verify the suspected change.

12. How would you compare a rebased patch series with its original series?

**Deep explanation:**
Commit hashes and ordinary log diffs are noisy after a rebase because every replayed commit is new. Preserve a reference to the original tip, then use `git range-diff old-base..old-tip new-base..new-tip` to match patches and show how each changed. `range-diff` compares the series semantically, making missing, reordered, or modified patches easier to spot than a simple endpoint diff.

**Interview answer:**
I save the old tip and run `git range-diff` between the old and rebased ranges. It pairs corresponding patches and highlights actual patch changes, which is much clearer than comparing rewritten commit IDs.

13. How do fast-forward and non-fast-forward updates differ?

**Deep explanation:**
A fast-forward update moves a branch pointer forward when the current tip is already an ancestor of the new tip; no divergent history is combined. A non-fast-forward update replaces or diverges from the branch's current history, commonly after rebase, reset, or force-push, and may make existing commits unreachable from that branch. Servers often reject non-fast-forward pushes unless force is explicitly allowed.

**Interview answer:**
A fast-forward only advances the branch along its existing ancestry. A non-fast-forward update changes that ancestry, potentially removing visible commits, so it requires explicit force and much more coordination.

14. Why is force-with-lease safer than an unconditional force push?

**Deep explanation:**
`git push --force-with-lease` updates the remote only if its current branch tip matches the value the client expects. If someone pushed new work since the last fetch, the lease fails instead of overwriting it. Plain `--force` lacks that safety check. The protection depends on fresh and trustworthy remote-tracking information, so fetch and inspect before pushing rewritten history.

**Interview answer:**
Force-with-lease refuses to overwrite the remote if it changed unexpectedly, protecting teammates' new commits. I fetch, inspect the remote tip, and use it instead of unconditional force whenever a coordinated history rewrite is necessary.

15. How would you handle accidentally committed secrets?

**Deep explanation:**
Treat the secret as compromised immediately: revoke or rotate it first, because deleting Git history cannot undo copies, caches, or logs. Remove it from the current tree and, if required, rewrite all affected history with a tool such as `git filter-repo`, coordinating protected branches and force pushes. Add preventive controls such as secret scanning, pre-commit checks, and environment-based configuration. Notify security owners and follow the incident process.

**Interview answer:**
I rotate or revoke the credential first, then remove it from the repository and rewrite affected history if policy requires it. I coordinate the rewrite, notify security, and add scanning or configuration safeguards to prevent recurrence.

16. How would you maintain a release branch while continuing feature development?

**Deep explanation:**
Create a release branch from the stabilization point while new features continue on the main development line. Limit the release branch to tested fixes, version changes, and release preparation; merge or cherry-pick every relevant fix back to the main line so branches do not regress. Automate builds and tests for both branches, define support duration, and tag immutable releases.

**Interview answer:**
I branch at code freeze, keep the release branch stabilization-only, and continue features on main. Fixes are tested on the release branch and propagated back to main, with CI on both and tags for actual releases.

17. How would you backport a fix to several supported versions?

**Deep explanation:**
Land and test the canonical fix on the main line, then cherry-pick it onto each maintained release branch, oldest or most constrained first when compatibility risks are high. Adapt the patch rather than forcing it when APIs differ, retain a trace to the original commit or issue, and run that version's complete relevant test suite. Release each backport under its normal versioning and security process.

**Interview answer:**
I fix the main line first, then cherry-pick or adapt the patch onto each supported release branch. I test each version independently and record the relationship to the original fix because compatibility differences can make identical patches unsafe.

18. How would you choose between trunk-based development and long-lived feature branches?

**Deep explanation:**
Trunk-based development favors small, frequent integrations, strong CI, and feature flags, reducing merge drift and accelerating feedback. Long-lived branches isolate substantial or regulated work but accumulate integration risk, delayed feedback, and painful conflicts. Choose based on release controls, team integration maturity, architecture, and the ability to hide incomplete code; even when branches are necessary, keeping them short-lived reduces risk.

**Interview answer:**
I prefer trunk-based development when CI and feature flags support frequent safe integration. I use longer-lived branches only when isolation is genuinely required, recognizing that they increase merge and feedback risk and should still be synchronized often.

19. How would you use feature flags to keep incomplete work off for users?

**Deep explanation:**
Place the new behavior behind a flag whose default is off, while continuously integrating and testing both enabled and disabled paths. Target internal users or a small cohort before gradual rollout, and monitor outcomes with an immediate kill switch. Keep flags separate from authorization, document ownership and expiry, and remove both the flag and old path after the rollout to avoid permanent branching complexity.

**Interview answer:**
I merge incomplete work behind a default-off flag, enable it first for controlled users, monitor it, and retain a kill switch. I test both paths and assign an expiry so the flag and obsolete code are removed after rollout.

20. How would you use worktrees to work on two branches simultaneously?

**Deep explanation:**
`git worktree add ../hotfix hotfix-branch` creates another working directory tied to the same repository data, letting one directory remain on the feature branch while the other handles the hotfix. Each worktree has its own checkout and index, but shares objects and refs. A branch normally cannot be checked out in two worktrees at once. Remove finished worktrees with `git worktree remove` and prune stale metadata if needed.

**Interview answer:**
I use `git worktree add <path> <branch>` to create a second checkout, so I can work on a hotfix without stashing my feature work. Afterward I remove the worktree; the repository objects remain shared.

21. How do submodules and subtree-based dependency management differ?

**Deep explanation:**
Submodules store a pointer to a commit in another repository, preserving independent history and ownership but requiring explicit initialization, updates, and coordinated access. A subtree copies dependency content into the parent repository, making clones and builds simpler while increasing repository size and making upstream synchronization more manual. Submodules fit independently versioned components; subtrees often fit dependencies that consumers should receive transparently.

**Interview answer:**
Submodules reference an external repository commit and preserve separation, but add workflow complexity. Subtrees vendor the code into the main repository, simplifying checkout at the cost of duplication and less convenient upstream synchronization.

22. How would you handle large binary assets with Git LFS?

**Deep explanation:**
Configure tracking patterns with `git lfs track`, commit the resulting `.gitattributes`, and then add assets so Git stores small pointer files while the LFS service stores binary content. Confirm CI, deployment systems, forks, and contributors have LFS access and account for storage and bandwidth limits. Existing large history requires a deliberate `git lfs migrate` rewrite; merely enabling LFS does not shrink old commits.

**Interview answer:**
I track the relevant binary patterns with Git LFS and commit `.gitattributes`, then verify the hosting and CI paths fetch LFS objects. For existing history, I plan a coordinated LFS migration because new tracking does not remove old blobs.

23. How would you diagnose line-ending changes across operating systems?

**Deep explanation:**
Inspect `.gitattributes`, `core.autocrlf`, and the actual index versus working-tree bytes using commands such as `git ls-files --eol` and `git diff --ignore-space-at-eol`. Determine whether the noise comes from CRLF/LF conversion, editor settings, or a one-time normalization. Define repository rules in `.gitattributes`, align editor configuration, then perform normalization in a dedicated reviewed commit to avoid mixing it with functional changes.

**Interview answer:**
I use `git ls-files --eol` and inspect attributes and Git configuration to locate the conversion. Then I define canonical line endings in `.gitattributes` and make any normalization a separate commit so real code changes remain reviewable.

24. How would you use .gitattributes for text normalization and merge behavior?

**Deep explanation:**
`.gitattributes` provides repository-controlled, path-specific behavior. Rules such as `* text=auto`, `*.sh text eol=lf`, and `*.bat text eol=crlf` normalize text predictably across platforms. Attributes can also mark binaries with `-text`, select diff or merge drivers, and assign `linguist-generated`-style metadata for supporting tools. After changing normalization rules, `git add --renormalize .` can stage the intended canonical changes for careful review.

**Interview answer:**
I use `.gitattributes` to define line endings and text versus binary handling consistently for every clone. I can also assign custom diff or merge drivers by path, and I isolate any renormalization in its own reviewed commit.

25. How would you handle a repository that differs only by filename capitalization?

**Deep explanation:**
Case-insensitive filesystems may treat `File.ts` and `file.ts` as the same path even though Git can distinguish them, causing missing changes or checkout failures across platforms. Rename through an unambiguous temporary name—`git mv File.ts temp.ts`, commit or stage, then `git mv temp.ts file.ts`—and update imports with exact casing. Add CI on a case-sensitive system and naming rules to prevent collisions.

**Interview answer:**
I perform a two-step `git mv` through a temporary filename, update references, and verify on a case-sensitive environment. I also prevent two paths that differ only by case because they are not portable across common filesystems.

26. How would you identify files causing repository size growth?

**Deep explanation:**
Start with `git count-objects -vH` to measure object storage, then inspect packed objects using `git verify-pack` and map large blob IDs back to paths with `git rev-list --objects --all`. Tools such as `git filter-repo --analyze` can summarize historical sizes and path growth. Remember that deleting a file in the latest commit does not remove its historical blobs; shrinking history requires a coordinated rewrite and later garbage collection.

**Interview answer:**
I measure the object database, identify the largest blobs, and map them to historical paths, often using `git filter-repo --analyze`. If cleanup is justified, I plan a coordinated history rewrite rather than just deleting the current file.

27. How would you review a generated-code change alongside its source change?

**Deep explanation:**
Review the source or schema change first because it expresses intent, then reproduce generation with the documented tool version and verify the working tree remains clean. Treat unexpected generated differences as a supply-chain or reproducibility warning. Keep generated output in a distinct commit or clearly separated diff when team policy allows, use attributes or review tooling to de-emphasize it, and rely on CI to detect stale generated files.

**Interview answer:**
I review the source-of-truth change first, regenerate with the pinned toolchain, and confirm the output matches exactly. I separate or clearly mark generated diffs and use CI to ensure generated code is reproducible and current.

28. How would you make a pull request easy to review and revert?

**Deep explanation:**
Keep the pull request focused on one purpose, avoid unrelated formatting, and organize commits into logical, buildable steps. Explain the motivation, design, risk, tests, rollout, screenshots or migration details, and explicit rollback plan. Small stable commits improve navigation and bisecting, while a cohesive final merge or squash can make reverting straightforward; the repository's merge strategy should balance both needs.

**Interview answer:**
I keep the PR narrow, explain why and how it changes behavior, show tests and rollout risk, and avoid unrelated churn. I use logical commits and provide a concrete rollback path so reviewers can reason about it and operators can reverse it safely.

29. How would you separate functional changes from large formatting changes?

**Deep explanation:**
Apply and commit mechanical formatting separately from behavior changes, ideally before or after the functional series rather than mixed within it. Pin the formatter version and make the formatting commit contain no semantic edits. Reviewers can then ignore or quickly validate that commit, while `git blame --ignore-revs-file` can reduce long-term attribution noise. Coordinate the formatting window to minimize conflicts with active branches.

**Interview answer:**
I put automated formatting in a dedicated commit with a pinned formatter and keep behavior changes in separate commits. That preserves a meaningful diff, simplifies review, and lets blame tooling ignore the mechanical revision.

30. How would you keep required checks and branch protection from blocking legitimate emergency fixes?

**Deep explanation:**
Design an audited break-glass process before an incident: restrict bypass authority to a small on-call group, require incident linkage and peer approval where feasible, and keep essential fast tests runnable. Prefer expedited checks and staged rollout over disabling protection. Log every bypass, monitor the release, retain a rapid rollback, and require follow-up review and remediation. Emergency access should reduce recovery time without turning safeguards into optional policy.

**Interview answer:**
I establish a least-privilege, audited break-glass path with incident tracking, a second approver when possible, essential fast checks, monitoring, and rollback. Any bypass receives immediate follow-up review, so emergencies are fast without silently weakening normal protection.
