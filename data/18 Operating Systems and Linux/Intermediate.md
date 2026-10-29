1. How do preemptive scheduling and cooperative scheduling differ?

**Deep explanation:** Preemptive scheduling lets the OS interrupt a task for fairness or priority; cooperative scheduling switches only when a task yields, blocks, or exits. Preemption improves responsiveness but increases synchronization complexity, while cooperation is simpler but lets one bad task monopolize the CPU.

**Interview answer:** Preemptive scheduling lets the OS forcibly switch tasks; cooperative scheduling depends on tasks yielding. Preemption is more responsive, while cooperation is simpler but vulnerable to CPU hogs.

2. How do mutexes, semaphores, and condition variables differ?

**Deep explanation:** A mutex gives one thread exclusive ownership of a critical section. A semaphore counts permits or signals events and has no ownership rule. A condition variable lets threads sleep until shared state may satisfy a predicate; it is paired with a mutex and checked in a loop.

**Interview answer:** A mutex protects exclusive access, a semaphore counts permits, and a condition variable lets threads wait efficiently for a state change while using a mutex.

3. What conditions are required for a deadlock?

**Deep explanation:** Coffman's four conditions are mutual exclusion, hold-and-wait, no preemption, and circular wait. All must coexist. Enforcing a global lock order breaks circular wait and is a common prevention technique.

**Interview answer:** Deadlock requires mutual exclusion, hold-and-wait, no forced preemption, and circular wait. Breaking any one prevents deadlock.

4. How do deadlock, livelock, and starvation differ?

**Deep explanation:** Deadlocked tasks are blocked waiting on each other. Livelocked tasks keep reacting but make no progress. A starved task waits indefinitely while others progress. Lock ordering, randomized backoff, and fair scheduling respectively help address them.

**Interview answer:** Deadlock is blocked nonprogress, livelock is active nonprogress, and starvation is one task being continually denied a resource.

5. How would you identify a zombie process?

**Deep explanation:** Use `ps -o pid,ppid,state,cmd`; state `Z` or `<defunct>` identifies an exited child whose parent has not called `wait()`. Fix or restart the parent—killing the zombie cannot help because it is already dead.

**Interview answer:** I look for `Z` or `<defunct>` in `ps`, identify the PPID, and fix the parent that failed to reap the child.

6. How do fork and exec differ?

**Deep explanation:** `fork()` creates a child with a copy-on-write view of the parent's memory and inherited descriptors. `exec()` replaces the calling process image while retaining its PID and descriptors not marked close-on-exec. Shells commonly fork, configure redirection, then exec.

**Interview answer:** `fork()` creates a process; `exec()` replaces the current process's program. A shell usually forks and execs in the child.

7. How do copy-on-write pages affect process creation?

**Deep explanation:** After `fork()`, parent and child share physical pages until either writes. A write fault copies only that page. This makes fork fast and memory-efficient, especially before `exec()`, but widespread writes later cause copying and memory growth.

**Interview answer:** Copy-on-write makes fork cheap by sharing pages until a write forces a private copy.

8. How do paging, swapping, and memory mapping differ?

**Deep explanation:** Paging manages virtual memory in fixed-size pages mapped to physical frames. Swapping evicts memory pages to disk under pressure. Memory mapping associates address ranges with files, devices, or anonymous storage, enabling ordinary loads/stores and optional sharing.

**Interview answer:** Paging is virtual-memory translation, swapping moves pages to disk, and mapping binds virtual addresses to files, devices, or anonymous memory.

9. How would you investigate high memory use without a large application heap?

**Deep explanation:** Compare system use, RSS, and PSS with `free`, `smem`, and `/proc/PID/smaps_rollup`. Inspect native allocations, mappings, thread stacks, shared memory, page cache, slab, huge pages, and cgroup charges; managed heap reports omit many of these.

**Interview answer:** I inspect RSS/PSS, mappings, native memory, stacks, shared memory, page cache, slab, and cgroup accounting using `smaps_rollup`, `smem`, `free`, and `slabtop`.

10. How do resident memory, virtual memory, and shared memory differ?

**Deep explanation:** Virtual memory is all mapped address space, including reservations and nonresident pages. Resident memory is the portion in RAM. Shared pages are mapped by multiple processes, so RSS double-counts them; PSS apportions their cost.

**Interview answer:** Virtual memory is mapped address space, RSS is the part in RAM, and shared memory is used by multiple processes; PSS gives fairer accounting.

11. How would you diagnose a process killed by the OOM killer?

**Deep explanation:** Check `journalctl -k` or `dmesg` for the victim and memory report. Determine whether the event was global or cgroup-scoped via `memory.events`, then inspect limits, RSS trends, swap, workload, and `oom_score_adj`.

**Interview answer:** I confirm the OOM in kernel logs, distinguish system from cgroup OOM, and inspect limits, memory growth, swap, and selection score.

12. How would you distinguish CPU saturation from I/O wait?

**Deep explanation:** CPU saturation shows high user/system time and runnable queues. I/O pressure shows blocked tasks, device latency, queue depth, and often `%wa`. Correlate `vmstat`/`mpstat`, `pidstat`, and `iostat`; `%wa` alone can mislead.

**Interview answer:** CPU saturation has busy CPUs and runnable work; I/O wait has blocked tasks and device latency. I correlate CPU, process, and device metrics.

13. How would you interpret Linux load average?

**Deep explanation:** Load averages are smoothed 1-, 5-, and 15-minute counts of runnable and uninterruptible tasks. Compare them with logical CPU count, then inspect task states because high load can mean CPU contention or blocked I/O.

**Interview answer:** Load average counts runnable plus uninterruptible tasks. I compare it with CPU count and determine whether CPU demand or blocked I/O caused it.

14. How would you investigate a service that has exhausted file descriptors?

**Deep explanation:** Compare `/proc/PID/limits` with descriptors in `/proc/PID/fd` or `lsof -p`. Classify accumulating sockets, files, and pipes to find leaks. Inspect systemd `LimitNOFILE` and system limits, but do not hide a leak by merely raising them.

**Interview answer:** I count and classify descriptors, compare them with the process limit, watch for growth, fix leaks, then raise limits only if demand is legitimate.

15. How do blocking, nonblocking, and asynchronous I/O differ?

**Deep explanation:** Blocking I/O suspends the caller. Nonblocking I/O returns immediately, often with `EAGAIN`, and an event loop retries after readiness. Asynchronous I/O submits an operation and reports completion later; readiness and completion are distinct concepts.

**Interview answer:** Blocking waits in the call, nonblocking returns and retries when ready, and asynchronous I/O reports completion after submission.

16. How do select, poll, and epoll differ conceptually?

**Deep explanation:** `select` uses limited bit sets and scans them; `poll` removes that limit but still scans the full array. Linux `epoll` keeps an interest set in-kernel and returns ready events, scaling better for many mostly idle descriptors.

**Interview answer:** `select` and `poll` rescan all descriptors; `epoll` maintains kernel interest and returns ready ones, usually scaling better.

17. How would you use strace to investigate a stuck process?

**Deep explanation:** Attach briefly with `strace -f -tt -T -p PID`. Inspect all threads for long or repeated syscalls: `futex` suggests locking, while `poll`, `read`, or network calls reveal awaited resources. Resolve descriptors through `/proc/PID/fd` and account for tracing overhead.

**Interview answer:** I trace threads with timestamps and durations, identify the blocking or repeated syscall, resolve its descriptors, and correlate it with logs.

18. How would you find which process owns a port?

**Deep explanation:** Use `ss -ltnp` for TCP or `ss -lunp` for UDP, filtered by port; `lsof -i :PORT` can confirm. Root may be needed, and containers may require checking another network namespace.

**Interview answer:** I use `ss` or `lsof`, then check privileges and network namespaces if the owner is not visible.

19. How would you investigate disk usage that remains high after deleting a large file?

**Deep explanation:** An unlinked file retains blocks while a process holds it open. A `df`/`du` mismatch suggests this; find it with `lsof +L1`. Gracefully signal or restart the owner so it closes or reopens the file.

**Interview answer:** I compare `df` and `du`, use `lsof +L1` for deleted open files, and make the owner close or reopen them.

20. How do hard links and symbolic links behave differently?

**Deep explanation:** A hard link is another name for one inode, survives removal of other names, and normally cannot cross filesystems or target directories. A symlink stores a pathname, can cross filesystems and target directories, but may dangle.

**Interview answer:** Hard links share an inode; symlinks store a path. Hard links survive renames/removals of other names, while symlinks can dangle.

21. How do filesystem permissions interact with directory traversal?

**Deep explanation:** Directory execute means traversal, read means listing, and write plus execute permits entry changes. Every parent needs execute permission. Deletion depends mainly on the containing directory, not the file's write bit; sticky directories add ownership restrictions.

**Interview answer:** Execute traverses a directory, read lists it, and write plus execute changes entries. Every parent must be traversable.

22. What are setuid, setgid, and the sticky bit used for?

**Deep explanation:** Setuid executables use the owner's effective UID. Setgid uses the file's group; on directories it makes new entries inherit that group. Sticky writable directories restrict deletion to entry owners, the directory owner, or root.

**Interview answer:** Setuid changes effective user, setgid changes or inherits group, and sticky protects files in shared writable directories.

23. How would you write a shell script that handles spaces and failed commands safely?

**Deep explanation:** Quote expansions, use arrays and `"$@"`, and use NUL-delimited filename processing. Check important failures explicitly, commonly enable `set -u` and `pipefail`, treat `set -e` cautiously, and clean `mktemp` resources with traps.

**Interview answer:** I quote variables, use arrays and NUL delimiters, explicitly check failures, enable `pipefail`, and clean temporary resources with traps.

24. What pitfalls arise from set -e and pipelines in shell scripts?

**Deep explanation:** `set -e` has exceptions in conditionals, loops, substitutions, and other contexts. Pipelines normally report only the last command's status, hiding earlier failures unless `pipefail` is enabled. Expected failures such as unmatched `grep` still need explicit handling.

**Interview answer:** `set -e` is context-dependent, and pipelines hide earlier failures without `pipefail`; I explicitly handle expected and critical statuses.

25. How would you prevent two cron invocations from overlapping?

**Deep explanation:** Use an atomic advisory lock such as `flock -n /run/lock/job.lock command`, or wait with a timeout. Kernel-released locks avoid stale PID-file races. The lock must cover the entire job.

**Interview answer:** I wrap the whole job with `flock`, choosing skip or timeout behavior, so crashes release the lock automatically.

26. How would you configure and inspect a systemd service?

**Deep explanation:** Define `[Unit]`, `[Service]`, and `[Install]` settings, then run `daemon-reload`, start, and optionally enable it. Inspect effective configuration and logs using `systemctl status`, `cat`, `show`, `journalctl -u`, and validate with `systemd-analyze verify`.

**Interview answer:** I create or override the unit, reload systemd, start/enable it, then inspect status, effective settings, properties, and journal logs.

27. How would you rotate logs without losing or duplicating important output?

**Deep explanation:** Prefer atomic rename-and-create rotation followed by the application's documented reopen signal, preserving ownership and mode. Compress after the old file closes. Avoid `copytruncate` when correctness matters because concurrent writes can be lost or duplicated.

**Interview answer:** I rename, create a correctly owned replacement, and signal the process to reopen; I avoid `copytruncate` because it has a race window.

28. How would you troubleshoot SSH authentication failures?

**Deep explanation:** Compare `ssh -vvv` with server authentication logs. Verify user, offered key, algorithms, effective `sshd_config`, `authorized_keys` ownership/modes, account restrictions, and SELinux context. Too many agent keys can also exhaust `MaxAuthTries`.

**Interview answer:** I correlate verbose client output with server logs, then verify identity, key selection, policy, permissions, account rules, and security labels.

29. How would you transfer a large directory while avoiding unnecessary recopying?

**Deep explanation:** Use `rsync` in archive mode with partial-transfer support and a dry run. It skips unchanged files and may transfer changed blocks. Treat trailing slashes carefully and use `--delete` only deliberately; checksums cost extra CPU and I/O.

**Interview answer:** I use `rsync -a` with partial transfers and a dry run, checking trailing-slash and deletion semantics before execution.

30. How would you distinguish a DNS failure from a routing failure on Linux?

**Deep explanation:** Test resolution with `getent` or `dig`, then connect to a known IP. Working IP connectivity isolates DNS; failed IP connectivity leads to `ip route get`, interface, gateway, firewall, trace, and packet-capture checks.

**Interview answer:** I test DNS separately, then test a known IP. If IP works it is resolution; if not, I inspect routes, interfaces, gateways, and firewalls.

31. How would you inspect resource limits with ulimit?

**Deep explanation:** `ulimit -a` and flags such as `-n`, with `-S`/`-H`, show shell limits. Because limits are inherited, verify a running process using `/proc/PID/limits`; systemd services may instead use unit `Limit*` directives.

**Interview answer:** I inspect soft and hard shell limits with `ulimit`, verify the actual process in `/proc/PID/limits`, and check systemd `Limit*` settings.

32. How do namespaces and control groups support container isolation?

**Deep explanation:** Namespaces isolate views of PIDs, mounts, networking, IPC, users, and hostnames. Cgroups account for and limit CPU, memory, I/O, and process counts. Containers combine them with capabilities, seccomp, and LSM policy while sharing the host kernel.

**Interview answer:** Namespaces isolate what processes see; cgroups control what resources they consume. Containers combine both but still share the kernel.

33. How would you inspect a process inside a different namespace?

**Deep explanation:** Find its host PID, inspect `/proc/PID/ns`, then use `nsenter -t PID` with the necessary mount, network, PID, user, or IPC flags. Permissions are required, and entering only some namespaces can create a confusing mixed view.

**Interview answer:** I identify the host PID and use `nsenter` for the required namespaces, accounting for privileges and PID-namespace behavior.

34. How would you investigate permission errors involving SELinux or AppArmor?

**Deep explanation:** After Unix permissions, inspect SELinux AVC audit records or AppArmor `DENIED` journal messages. Identify the process, object, and action; verify SELinux labels or AppArmor profiles, then make a narrow labeling or policy fix rather than disabling enforcement.

**Interview answer:** I check denial logs and labels/profiles, determine the exact blocked action, and apply the smallest correct policy fix.

35. How would you choose between a monotonic clock and wall-clock time in a daemon?

**Deep explanation:** Monotonic time does not jump with clock corrections, so use it for durations, deadlines, and retries. Wall time represents calendar time, so use it for timestamps and schedules. Choose explicitly whether suspend time should count.

**Interview answer:** I use monotonic time for elapsed-time logic and wall time for human timestamps or calendar schedules.
