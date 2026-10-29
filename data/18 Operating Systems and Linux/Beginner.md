1. What responsibilities does an operating system have?

**Deep explanation:** The operating system manages hardware and provides safe, convenient abstractions to applications. It schedules CPU time, manages memory, files, devices, networking, users, permissions, and process isolation. It also exposes system calls so programs can request privileged operations without directly controlling hardware.

**Interview answer:** An OS is the resource manager and abstraction layer between applications and hardware. It schedules processes, manages memory, files and devices, provides networking and security, and exposes these services through system calls.

2. How do user space and kernel space differ?

**Deep explanation:** Kernel space runs privileged OS code with unrestricted access to hardware and memory. User space runs applications with limited privileges and isolated address spaces, so one faulty program normally cannot corrupt the whole system. Applications cross this boundary through controlled interfaces such as system calls; crossing it has some overhead but protects stability and security.

**Interview answer:** Kernel space contains trusted, privileged OS code; user space contains restricted applications. Programs request kernel services through system calls, which preserves isolation and protects the system.

3. What is a system call?

**Deep explanation:** A system call is the controlled entry point through which a user-space program asks the kernel to perform an operation, such as `read`, `write`, `open`, `fork`, or `socket`. The CPU switches to privileged mode, the kernel validates the request, performs it, and returns a result or error. Library functions may wrap system calls, but not every library call requires one.

**Interview answer:** A system call is a program's request to the kernel for a privileged service, such as file I/O, process creation, or networking. The kernel validates the request and returns a result or error.

4. How do programs, processes, and threads differ?

**Deep explanation:** A program is executable code stored on disk. A process is a running instance of a program with its own virtual address space, resources, and security context. A thread is an execution path within a process; threads share the process's code, heap, and open files but have separate stacks and CPU register state. Threads are cheaper to communicate between but require synchronization around shared data.

**Interview answer:** A program is passive code, a process is a running instance with its own resources, and a thread is an execution unit inside a process. Threads share process memory and files but have their own stack and register state.

5. What is a process ID?

**Deep explanation:** A process ID, or PID, is a numeric identifier the kernel assigns to each running process. Tools and system calls use it to inspect, signal, wait for, or manage that process. PIDs are unique only while processes are alive and can be reused after a process exits; PID 1 has the special role of initializing user space and adopting orphaned processes.

**Interview answer:** A PID is the kernel-assigned number that identifies a running process. It is used for monitoring and signaling processes, and it may be reused after the process exits.

6. What is a context switch?

**Deep explanation:** A context switch occurs when the CPU stops running one thread or process and resumes another. The OS saves state such as registers and the instruction pointer, selects another runnable task, and restores its state. Context switches enable multitasking, but they cost time and can reduce cache and translation lookaside buffer locality; switching between threads of one process may be cheaper than switching address spaces.

**Interview answer:** A context switch is the OS saving one task's CPU state and restoring another's so the CPU can run it. It enables multitasking but adds scheduling and cache-related overhead.

7. How do concurrency and parallel execution differ at the operating-system level?

**Deep explanation:** Concurrency means multiple tasks make progress during overlapping periods, even if one CPU core interleaves them through scheduling. Parallelism means tasks literally execute at the same instant on different cores or CPUs. A concurrent design must handle coordination and shared state; extra cores can make it parallel, but synchronization and resource contention may limit speedup.

**Interview answer:** Concurrency is overlapping progress, possibly by interleaving tasks on one core. Parallelism is simultaneous execution on multiple cores. Concurrency is a scheduling and design property; parallelism requires hardware capacity.

8. What is virtual memory?

**Deep explanation:** Virtual memory gives each process its own logical address space and maps virtual pages to physical RAM through page tables. This provides isolation, controlled sharing, sparse address spaces, memory-mapped files, and the ability to move inactive pages to swap. It does not mean every allocated byte is currently in RAM, and translation plus paging introduce overhead.

**Interview answer:** Virtual memory gives each process an isolated address space that the kernel and hardware map to physical memory. It supports protection, sharing, memory-mapped files, and paging or swap.

9. What is a page fault?

**Deep explanation:** A page fault occurs when a process accesses a virtual page whose current mapping cannot satisfy the access. A minor fault can be resolved without disk I/O, for example by mapping an already cached page or allocating a zero-filled page. A major fault requires storage I/O and is much slower. An invalid access may instead cause the kernel to deliver `SIGSEGV`.

**Interview answer:** A page fault is raised when a virtual-memory access needs kernel intervention. The kernel may map or load the page, but if the access is invalid it can terminate the process with a segmentation fault.

10. How do stack and heap memory differ within a process?

**Deep explanation:** The stack normally stores call frames, local variables, return addresses, and saved registers; allocation and cleanup follow function-call order and are very fast. The heap holds dynamically allocated objects whose lifetimes are controlled explicitly or by a garbage collector. Stack space is limited and thread-local, while the heap is larger and shared by threads but can suffer fragmentation, leaks, and synchronization costs.

**Interview answer:** The stack holds per-thread call frames and short-lived local data with automatic, fast allocation. The heap holds dynamically allocated data with flexible lifetimes, but management is more expensive and can cause leaks or fragmentation.

11. What is a file descriptor in Linux?

**Deep explanation:** A file descriptor is a small nonnegative integer that indexes an open resource in a process, such as a file, pipe, socket, or device. Descriptors 0, 1, and 2 conventionally represent standard input, standard output, and standard error. Calls such as `read`, `write`, and `close` operate on descriptors, and inherited descriptors make shell redirection and pipelines possible.

**Interview answer:** A file descriptor is a process-local integer handle for an open file-like resource. Linux uses the same interface for files, pipes, sockets, and devices; 0, 1, and 2 are stdin, stdout, and stderr.

12. How do files, directories, and symbolic links differ?

**Deep explanation:** A regular file stores data. A directory maps names to filesystem entries and creates a hierarchy. A symbolic link is a special file containing a path to another entry; resolution follows that path, so it can cross filesystems and can become dangling if the target moves or disappears. Unlike a hard link, a symlink has its own inode and does not directly reference the target inode.

**Interview answer:** A file stores data, a directory stores name-to-entry mappings, and a symbolic link stores a path to another file or directory. Symlinks can cross filesystems but may become dangling.

13. How do absolute and relative paths differ?

**Deep explanation:** An absolute path starts at the filesystem root, such as `/var/log/app.log`, so its meaning does not depend on the current working directory. A relative path, such as `logs/app.log` or `../config`, is resolved from the current directory. Absolute paths are unambiguous; relative paths are often shorter and more portable within a project.

**Interview answer:** An absolute path starts at `/` and identifies a location independently of the current directory. A relative path is interpreted from the current working directory.

14. How would you navigate and inspect files from a shell?

**Deep explanation:** Use `pwd` to show the current directory, `cd` to change it, and `ls -la` to list entries including hidden files and metadata. Use `file` to identify a file type, `cat` for short text, `less` for paged viewing, and `head` or `tail` for the beginning or end. `stat` provides detailed size, timestamp, permission, and inode information.

**Interview answer:** I use `pwd`, `cd`, and `ls -la` to navigate and list files; `file` and `stat` for metadata; and `less`, `head`, or `tail` to inspect contents safely.

15. How would you find files by name and search their contents?

**Deep explanation:** `find /path -name '*.log'` searches directory trees by name and can also filter by type, size, time, or permissions. `rg 'pattern' /path` recursively searches text quickly while respecting ignore files by default; `grep -R` is a widely available alternative. Quote glob patterns so the shell does not expand them before `find` receives them.

**Interview answer:** I use `find` for filesystem attributes and names, for example `find . -name '*.log'`, and `rg` or `grep -R` to search file contents.

16. How do pipes and input/output redirection work?

**Deep explanation:** A pipe, `producer | consumer`, connects the producer's stdout to the consumer's stdin, allowing commands to stream data without an intermediate file. Redirection changes where a descriptor reads or writes: `< input`, `> output` truncates and writes, and `>> output` appends. `2>` redirects stderr, while `2>&1` makes stderr go to stdout's current destination; ordering matters.

**Interview answer:** A pipe sends one command's stdout into another command's stdin. Redirection attaches stdin or output descriptors to files—for example `<`, `>`, `>>`, and `2>` for stderr.

17. How do stdout and stderr differ?

**Deep explanation:** Stdout is the normal result stream on file descriptor 1, while stderr is the diagnostic and error stream on descriptor 2. Keeping them separate lets users pipe useful output to another command while still seeing errors, or redirect each independently. Both usually display on the terminal unless redirected.

**Interview answer:** Stdout carries normal program output on descriptor 1; stderr carries diagnostics on descriptor 2. They are separate so pipelines and redirection can handle results and errors independently.

18. How do Linux user, group, and other permission bits work?

**Deep explanation:** Each filesystem entry has an owning user, an owning group, and permission sets for user, group, and everyone else. `r`, `w`, and `x` mean read, write, and execute on files; on directories they mean list names, modify entries, and traverse or access entries. The kernel chooses the applicable class based on identity, with additional rules such as ACLs and special bits potentially affecting access.

**Interview answer:** Linux stores read, write, and execute bits for the owner, owning group, and others. Directory permissions differ slightly: read lists names, write changes entries, and execute allows traversal.

19. What do chmod, chown, and umask control?

**Deep explanation:** `chmod` changes permission bits, using symbolic modes such as `u+x` or octal modes such as `640`. `chown` changes the owning user and optionally group. `umask` removes permission bits from the defaults requested when new files and directories are created; for example, umask `022` commonly yields files `644` and directories `755` because files are not normally created executable.

**Interview answer:** `chmod` changes permissions, `chown` changes ownership, and `umask` masks out default permission bits for newly created files and directories.

20. How would you inspect running processes?

**Deep explanation:** `ps aux` or `ps -ef` provides a snapshot with PIDs, users, states, CPU time, and commands. `top` or `htop` provides a continuously updated view, while `pgrep` finds PIDs by name and `pstree` shows parent-child relationships. For one process, `/proc/<pid>` exposes command line, mappings, descriptors, and other kernel-maintained details.

**Interview answer:** I use `ps aux` for a snapshot, `top` or `htop` for a live view, `pgrep` to locate processes, and `/proc/<pid>` for detailed inspection.

21. How would you stop a process gracefully?

**Deep explanation:** First send `SIGTERM`, typically with `kill <pid>` or `systemctl stop <service>`, so the process can handle the signal, stop accepting work, flush data, and release resources. Wait and verify that it exits. Escalate to `SIGKILL` only if it remains stuck, because forced termination prevents cleanup and may leave incomplete work.

**Interview answer:** I send `SIGTERM` with `kill <pid>` or use the service manager, then wait and verify shutdown. I use `SIGKILL` only as a last resort if graceful shutdown fails.

22. How do SIGTERM and SIGKILL differ?

**Deep explanation:** `SIGTERM` requests termination and can be caught, handled, or ignored, allowing orderly cleanup. `SIGKILL` cannot be caught, blocked, or ignored; the kernel stops the process immediately. `SIGKILL` is reliable for ending user-space execution but can cause lost buffered data, abandoned temporary state, or inconsistent application-level operations.

**Interview answer:** `SIGTERM` is a catchable request for graceful shutdown. `SIGKILL` is an uncatchable, immediate kernel-enforced stop, so it should be reserved for processes that will not terminate normally.

23. How would you inspect CPU and memory use?

**Deep explanation:** `top` or `htop` shows live per-process CPU and memory usage plus system totals. `free -h` summarizes RAM and swap; the `available` value is usually more meaningful than `free` because Linux uses spare RAM for cache. `vmstat`, `pidstat`, and `sar` help distinguish CPU saturation, paging, I/O waits, and trends over time.

**Interview answer:** I start with `top` or `htop` and `free -h`, then use tools such as `vmstat`, `pidstat`, or `sar` to determine whether pressure comes from CPU, memory, paging, or I/O.

24. How would you check disk space and directory sizes?

**Deep explanation:** `df -h` reports free and used space for mounted filesystems, while `df -i` checks inode exhaustion. `du -sh /path` reports a directory's total apparent usage, and `du -h --max-depth=1 /path | sort -h` helps locate large subdirectories. Deleted files still held open can consume space without appearing in normal `du` output, so `lsof +L1` is useful when `df` and `du` disagree.

**Interview answer:** I use `df -h` for filesystem capacity and `du -sh` or depth-limited `du` for directory sizes. I also check inodes and open deleted files if the numbers do not match.

25. How would you inspect listening ports and active connections?

**Deep explanation:** `ss -lntup` shows listening TCP and UDP sockets and, with sufficient permission, their processes. `ss -antp` includes active TCP connections and states. `lsof -i` provides another process-oriented view. A listening socket indicates local readiness, not that a firewall, routing rule, or cloud security policy permits remote access.

**Interview answer:** I use `ss -lntup` for listening sockets and `ss -antp` for active TCP connections, then correlate the port with its owning process and check firewall or network policy if needed.

26. How would you read a service's logs?

**Deep explanation:** On a systemd system, `journalctl -u service-name` filters the journal by service; add `-f` to follow, `-n 100` for recent lines, or `--since` for a time window. Traditional applications may write under `/var/log`, where `less`, `tail -f`, and `rg` help inspect and filter files. Check log rotation and permissions when historical entries seem missing.

**Interview answer:** For systemd services I use `journalctl -u <service>`, often with `-f`, `-n`, or `--since`. For file-based logs I inspect `/var/log` with `less`, `tail`, and search tools.

27. What are environment variables and shell variables?

**Deep explanation:** A shell variable belongs to the current shell, for example `name=value`. An environment variable is exported into the environment inherited by child processes, for example `export NAME=value`; changing it in a child does not change the parent. Environment variables commonly configure programs, but secrets placed there may be exposed through diagnostics or process inspection and should be handled carefully.

**Interview answer:** Shell variables exist only in the current shell unless exported. Exported environment variables are inherited by child processes and are commonly used for configuration.

28. How do single and double quotes affect shell expansion?

**Deep explanation:** Single quotes preserve nearly every character literally, so `$VAR`, command substitution, spaces, and glob characters are not expanded. Double quotes preserve a value as one argument but still allow variable expansion, command substitution, and selected backslash escapes. Unquoted expansions can undergo word splitting and globbing, so `"$var"` is normally safer than `$var`.

**Interview answer:** Single quotes prevent shell expansion; double quotes allow variable and command expansion while preserving the result as one argument. I usually double-quote variable expansions to avoid splitting and globbing.

29. What is SSH used for?

**Deep explanation:** SSH provides encrypted, authenticated remote access over an untrusted network. It supports interactive shells, remote command execution, file transfer through SFTP or SCP, port forwarding, and automation. Key-based authentication is generally safer and more convenient than reusable passwords when private keys are protected and host keys are verified.

**Interview answer:** SSH is used for secure remote login, command execution, file transfer, tunneling, and automation. It encrypts traffic and supports password or, preferably, key-based authentication.

30. How would you schedule a recurring task using cron?

**Deep explanation:** Edit a user's crontab with `crontab -e` and add five time fields followed by the command, such as `0 2 * * * /absolute/path/backup.sh` for 2:00 AM daily. Cron runs with a limited environment, so use absolute paths, set required variables, redirect output, and make scripts idempotent or prevent overlapping runs. Systemd timers may offer stronger logging and dependency controls on modern systems.

**Interview answer:** I use `crontab -e` and add a five-field schedule plus an absolute command, for example `0 2 * * * /opt/bin/backup.sh`. I account for cron's limited environment, logging, failures, and overlapping runs.
