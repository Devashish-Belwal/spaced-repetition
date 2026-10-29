1. What does a version-control system track?

**Deep explanation:**
A version-control system records changes to files over time: what changed, who changed it, when, and usually why through commit messages. It preserves snapshots and relationships between them, letting a team compare versions, restore earlier states, and work concurrently. Git primarily tracks file contents and paths, not arbitrary filesystem metadata or empty directories.

**Interview answer:**
A version-control system tracks the history of changes to files, including their authors and timestamps. It lets teams compare versions, recover earlier work, and collaborate safely.

2. How do a Git repository, working tree, and staging area differ?

**Deep explanation:**
The repository is Git's stored history and metadata, normally kept in `.git`. The working tree is the checked-out set of files you currently view and edit. The staging area, or index, is an intermediate snapshot containing exactly what the next commit will record. A file can therefore differ between `HEAD`, the staging area, and the working tree.

**Interview answer:**
The repository stores committed history, the working tree contains the files I am editing, and the staging area holds the snapshot prepared for the next commit.

3. How do git add and git commit differ?

**Deep explanation:**
`git add` copies selected working-tree changes into the staging area; it does not create history. `git commit` creates a new repository snapshot from the staging area with metadata such as author, time, and message. If a file changes again after `git add`, the commit receives the staged version unless the newer change is added too.

**Interview answer:**
`git add` selects changes for the next snapshot, while `git commit` records the staged snapshot permanently in the repository history.

4. How would you inspect changes before committing?

**Deep explanation:**
Start with `git status` to see modified, staged, and untracked files. Use `git diff` for unstaged changes and `git diff --staged` for what will enter the next commit. Reviewing both catches accidental edits, debugging output, secrets, and incomplete changes before they become history.

**Interview answer:**
I use `git status`, then `git diff` for unstaged edits and `git diff --staged` for the exact changes that will be committed.

5. How would you read a repository's commit history?

**Deep explanation:**
`git log` shows commits with hashes, authors, dates, and messages. Options such as `--oneline`, `--graph`, `--decorate`, and `--all` provide a compact view of branches and merges. `git show <commit>` displays one commit's metadata and patch, while path filters can narrow history to a file.

**Interview answer:**
I use `git log`, often with `--oneline --graph --decorate --all`, and `git show <hash>` when I need the details of a specific commit.

6. What is a branch in Git?

**Deep explanation:**
A branch is a movable name pointing to a commit. As commits are created on that branch, the pointer advances. Branches make independent lines of work inexpensive because Git does not copy the whole project; it records commits and their parent relationships.

**Interview answer:**
A Git branch is a lightweight movable pointer to a commit, used to develop a line of work independently from other branches.

7. How would you create and switch branches?

**Deep explanation:**
`git switch -c feature/login` creates a branch from the current commit and switches to it. To switch to an existing branch, use `git switch feature/login`. The older equivalents are `git checkout -b feature/login` and `git checkout feature/login`; `switch` is clearer because it is dedicated to branch movement.

**Interview answer:**
I use `git switch -c <branch>` to create and enter a branch, and `git switch <branch>` to move to an existing one.

8. How do local branches and remote-tracking branches differ?

**Deep explanation:**
A local branch, such as `main`, is a branch you can check out and commit on. A remote-tracking branch, such as `origin/main`, is Git's local record of where a branch on a remote was last observed; it updates during fetch operations. It is not a live network reference, so it may be stale until `git fetch` runs.

**Interview answer:**
A local branch is where I make commits. A remote-tracking branch like `origin/main` is my local snapshot of the remote branch as of the last fetch.

9. How do clone, fetch, pull, and push differ?

**Deep explanation:**
`git clone` creates a local repository from a remote and configures that remote. `git fetch` downloads new objects and updates remote-tracking branches without integrating them. `git pull` fetches and then merges or rebases into the current branch. `git push` uploads local commits and requests an update to a remote branch.

**Interview answer:**
Clone creates the local copy, fetch downloads remote updates, pull fetches and integrates them, and push sends local commits to the remote.

10. What is a remote repository?

**Deep explanation:**
A remote repository is another Git repository referenced by a name and URL, commonly `origin`. It often acts as the team's shared synchronization point, but Git remains distributed: every normal clone has its own history and can commit offline. Commands such as fetch and push exchange commits and references with the remote.

**Interview answer:**
A remote repository is another Git repository, usually shared on a server, that my local repository exchanges branches and commits with.

11. How would you configure a branch's upstream?

**Deep explanation:**
An upstream associates a local branch with a remote-tracking branch so status, pull, and argument-free push know the default counterpart. On first push, use `git push -u origin feature/login`. For an existing remote branch, use `git branch --set-upstream-to=origin/feature/login feature/login`.

**Interview answer:**
I usually set it on first push with `git push -u origin <branch>`. That links the local branch to its remote counterpart for future pull and push operations.

12. What is a merge commit?

**Deep explanation:**
A merge commit combines histories and normally has two parents: the previous tip of the current branch and the tip being merged. It records that the lines of development were integrated, including any conflict resolutions. Git does not create one for a fast-forward merge because it can simply move the branch pointer forward.

**Interview answer:**
A merge commit records the integration of two development histories and usually has two parent commits. It is unnecessary when Git can fast-forward.

13. What causes a merge conflict?

**Deep explanation:**
A conflict occurs when Git cannot determine a safe automatic combination—for example, both branches change overlapping lines differently, or one deletes a file that the other edits. Concurrent edits alone do not guarantee conflict; changes to different regions often merge automatically. A human must choose the intended result.

**Interview answer:**
A merge conflict happens when competing changes cannot be combined automatically, such as different edits to the same lines or an edit-versus-delete situation.

14. How would you resolve a simple merge conflict?

**Deep explanation:**
Run `git status` to identify conflicted files, open them, and replace the conflict-marker regions with the correct combined content. Test or otherwise validate the result, then stage each resolved file with `git add`. Complete the operation with `git commit` for a merge or `git rebase --continue` during a rebase; abort if the integration should not proceed.

**Interview answer:**
I inspect the conflicted files, edit the marked sections into the intended result, test it, stage the resolved files, and then complete the merge or continue the rebase.

15. What belongs in a meaningful commit message?

**Deep explanation:**
The subject should be short, specific, and describe the change in an imperative style, such as “Handle expired session tokens.” A body is useful when the motivation, behavior, tradeoff, or non-obvious constraint needs explanation. The message should explain the purpose rather than repeat what the diff already makes obvious.

**Interview answer:**
A good commit message has a concise, specific subject and, when needed, a body explaining why the change was made and any important context or tradeoffs.

16. What is a pull request intended to communicate?

**Deep explanation:**
A pull request proposes integrating a set of changes and gives reviewers the context needed to judge them. It should communicate the problem, approach, scope, testing evidence, risks, and any deployment or migration concerns. It also creates a durable place for discussion and review; it is more than a notification that code exists.

**Interview answer:**
A pull request communicates what changed, why, how it was validated, and any risks, so reviewers can understand and evaluate the proposed integration.

17. How would you review a small change responsibly?

**Deep explanation:**
First understand the stated goal and read the entire diff in context. Check correctness, edge cases, tests, security, maintainability, and whether unrelated changes slipped in. Run relevant checks when practical, distinguish blocking issues from suggestions, and make comments specific and respectful. Approval should mean the change is safe enough to merge, not merely that the diff is short.

**Interview answer:**
I verify the intent, inspect the full diff and relevant surrounding code, check tests and edge cases, run focused checks, and leave clear comments that distinguish blockers from suggestions.

18. What files should normally be excluded from version control?

**Deep explanation:**
Exclude generated build output, dependency caches, temporary files, editor or OS noise, local environment files, logs, and secrets. Exact rules depend on the project: lockfiles and reproducible configuration often should be committed, while downloaded dependencies generally should not. The principle is to track source and intentional configuration, not reproducible or machine-specific artifacts.

**Interview answer:**
I normally exclude generated artifacts, caches, logs, editor files, machine-specific configuration, and all secrets, while keeping source and reproducibility files such as appropriate lockfiles.

19. How does .gitignore affect files that are already tracked?

**Deep explanation:**
`.gitignore` prevents matching untracked files from being offered for tracking; it does not remove files already in the index. A tracked file continues to appear in diffs even after an ignore rule is added. To stop tracking it, remove it from the index separately and commit that change.

**Interview answer:**
`.gitignore` only affects untracked files. Files already tracked remain tracked until I explicitly remove them from Git's index and commit that change.

20. How would you stop tracking a generated file without deleting the local copy?

**Deep explanation:**
Add an appropriate rule to `.gitignore`, then run `git rm --cached -- <file>` and commit both changes. `--cached` removes the path from the index but leaves the working-tree copy in place. For a directory, use `git rm -r --cached -- <directory>` after verifying the target.

**Interview answer:**
I add the path to `.gitignore`, run `git rm --cached -- <file>`, and commit the changes. The file stays on disk but is no longer tracked.

21. How would you discard one unintended local edit safely?

**Deep explanation:**
First inspect `git diff -- <file>` and make sure the unwanted change is only in the working tree. Then use `git restore -- <file>` to replace it with the staged version. If only part is unwanted, `git restore -p -- <file>` allows selective restoration. Because discarded edits are difficult to recover, confirm the scope before running it.

**Interview answer:**
After reviewing the diff, I use `git restore -- <file>` for the whole unstaged edit or `git restore -p -- <file>` to discard selected hunks.

22. How would you unstage a file without losing its changes?

**Deep explanation:**
Use `git restore --staged -- <file>`. This resets that path in the staging area to its `HEAD` version while leaving the working-tree content unchanged. The older `git reset HEAD -- <file>` is also common, but `restore --staged` states the intention more directly.

**Interview answer:**
I use `git restore --staged -- <file>`. It removes the file's changes from the next commit but keeps them in my working tree.

23. What is a Git tag?

**Deep explanation:**
A tag is a named reference typically used to mark a specific commit, such as a release version. Unlike a branch, it does not normally move as new commits are created. Tags are local until explicitly pushed, for example with `git push origin v1.2.0`.

**Interview answer:**
A Git tag is a stable name for a particular commit, commonly used to identify releases or other important points in history.

24. How do lightweight and annotated tags differ?

**Deep explanation:**
A lightweight tag is simply a name pointing to an object, usually a commit. An annotated tag is a full Git object containing a tagger, date, message, and optional cryptographic signature. Annotated tags are generally preferred for official releases because they preserve provenance; lightweight tags suit temporary or private markers.

**Interview answer:**
A lightweight tag is just a pointer, while an annotated tag includes metadata, a message, and optional signing. I prefer annotated tags for releases.

25. What is git stash useful for?

**Deep explanation:**
`git stash` temporarily saves uncommitted tracked changes and restores a cleaner working tree, which is useful when switching context or testing another branch. `git stash pop` reapplies and removes the stash, while `git stash apply` keeps it. Stashes are local and easy to forget, so durable work is usually better stored in a small branch and commit.

**Interview answer:**
`git stash` temporarily sets aside uncommitted work so I can switch context. It is useful for short interruptions, but I prefer commits on a branch for important work.

26. How would you inspect who changed a particular line?

**Deep explanation:**
Use `git blame <file>` to show the most recent commit and author responsible for each line; line ranges can narrow the output. Then inspect the relevant commit with `git show <hash>` to understand the surrounding change. Blame identifies the last textual change, not necessarily who designed the behavior or introduced the underlying bug.

**Interview answer:**
I use `git blame <file>` to find the last commit that changed the line, then `git show <hash>` to inspect its context rather than treating blame as proof of responsibility.

27. How would you compare two branches?

**Deep explanation:**
`git diff branch-a...branch-b` shows changes introduced on `branch-b` since the branches' merge base, which is often useful for review. `git diff branch-a..branch-b` compares the two tip snapshots directly. For commit differences, `git log branch-a..branch-b` lists commits reachable from `branch-b` but not `branch-a`.

**Interview answer:**
I usually use `git diff base...feature` to review feature changes since the common ancestor, and `git log base..feature` to see commits unique to the feature branch.

28. How would you avoid committing credentials?

**Deep explanation:**
Keep credentials in a secret manager or untracked environment file, add sensitive local files to `.gitignore`, and commit a safe example file with placeholder names when helpful. Use pre-commit or server-side secret scanning as defense in depth, and always review staged diffs. If a secret is committed, remove it from exposure and rotate or revoke it immediately; deleting it in a later commit is insufficient.

**Interview answer:**
I store credentials outside Git, ignore local secret files, review staged changes, and use secret scanning. If one is exposed, I rotate it immediately because Git history may retain it.

29. How would you collaborate when two developers edit the same file?

**Deep explanation:**
Coordinate ownership and intended changes early, keep branches and commits focused, and synchronize with the shared branch regularly. Git can automatically combine non-overlapping edits; overlapping changes require a conflict resolution that preserves both developers' intent. After integration, review and test the combined result because a clean textual merge can still produce incorrect behavior.

**Interview answer:**
We coordinate scope, keep changes small, sync frequently, and use Git to merge non-overlapping edits. If conflicts occur, we resolve them together when needed and test the combined behavior.

30. What should you check before pushing your work?

**Deep explanation:**
Review `git status`, the commits to be pushed, and their diffs to confirm the correct branch and scope. Run relevant formatting, tests, linting, and build checks; ensure no secrets, generated noise, or debugging code is included. Fetch remote updates when appropriate so you know whether the branch has diverged, and verify that commit messages and upstream destination are correct.

**Interview answer:**
I verify the branch, status, commits, and diff; run relevant tests and checks; scan for secrets or accidental files; and confirm the remote destination and whether I need to integrate newer remote changes.
