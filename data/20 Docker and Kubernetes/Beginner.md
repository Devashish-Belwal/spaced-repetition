1. How do containers differ from virtual machines?

**Deep explanation:** Containers share the host kernel while isolating processes, filesystems, and networking. Virtual machines emulate hardware and run a full guest OS. Containers start faster and use fewer resources; VMs generally offer stronger isolation and can use a different kernel.

**Interview answer:** Containers package applications while sharing the host kernel; VMs include an entire guest OS. Containers are lighter and faster, while VMs provide stronger isolation and OS flexibility.

2. How do Docker images and containers differ?

**Deep explanation:** An image is an immutable template containing application files, dependencies, and startup metadata. A container is a runtime instance with isolated processes and a temporary writable layer. Many containers can come from one image.

**Interview answer:** An image is the read-only blueprint; a container is a running or stopped instance with runtime state and a writable layer.

3. What is a Dockerfile?

**Deep explanation:** A Dockerfile is an ordered set of instructions for building an image. It declares the base, copied files, build commands, environment, user, and default process. Version control makes the build repeatable.

**Interview answer:** A Dockerfile is a version-controlled recipe that Docker executes to build a container image layer by layer.

4. How do FROM, RUN, COPY, CMD, and ENTRYPOINT differ?

**Deep explanation:** `FROM` selects the base image, `RUN` executes a build-time command, and `COPY` adds files from the build context. `ENTRYPOINT` defines the runtime executable; `CMD` supplies an overridable default command or arguments.

**Interview answer:** `FROM` chooses the base, `RUN` performs build work, and `COPY` adds files. `ENTRYPOINT` sets the executable and `CMD` provides overridable defaults.

5. What is a container image layer?

**Deep explanation:** A layer is an immutable filesystem change produced during a build. Layers are stacked, cached, and shared across images, saving time and storage. Changing an early instruction invalidates it and later cached layers.

**Interview answer:** An image layer is an immutable filesystem delta that Docker can stack, cache, and reuse.

6. What is a build context?

**Deep explanation:** The build context is the set of files sent to the builder and available to instructions such as `COPY`. Files outside it normally cannot be copied. Keeping it small improves speed and reduces accidental disclosure.

**Interview answer:** The build context is the set of files Docker can access during a build, usually the directory passed to `docker build`.

7. What should a .dockerignore exclude?

**Deep explanation:** Exclude files the build does not need: VCS data, caches, build outputs, logs, editor files, local configuration, and especially secrets. This reduces transfer time, cache invalidation, image bloat, and leakage risk.

**Interview answer:** Exclude generated files, caches, VCS metadata, local settings, and secrets so the context stays small, stable, and safe.

8. How would you build and run a container image?

**Deep explanation:** Run `docker build -t myapp:1.0 .`, then `docker run --name myapp myapp:1.0`. Add `-d`, `-p`, `-e`, or `-v` for detached mode, ports, environment variables, or storage.

**Interview answer:** I use `docker build -t myapp:1.0 .` and then `docker run --name myapp myapp:1.0`, adding runtime options as needed.

9. How would you map a host port to a container port?

**Deep explanation:** Use `-p HOST_PORT:CONTAINER_PORT`, for example `docker run -p 8080:80 nginx`. Host port 8080 forwards to port 80 in the container. Binding `127.0.0.1:8080:80` restricts access to the host.

**Interview answer:** Use `docker run -p 8080:80 image`; it publishes container port 80 on host port 8080.

10. How do bind mounts and named volumes differ?

**Deep explanation:** A bind mount maps an explicit host path, giving direct access but coupling the container to host layout and permissions. A named volume is Docker-managed and is generally preferable for persistent data. Bind mounts are convenient for source code in development.

**Interview answer:** Bind mounts expose a specific host path; named volumes are Docker-managed and usually better for portable persistent data.

11. Why is data in a container's writable layer temporary?

**Deep explanation:** The writable layer belongs to one container, not its image. Removing or replacing that container removes the layer. Durable state belongs in a volume or external service so containers remain replaceable.

**Interview answer:** The writable layer disappears when its container is removed, so persistent data must use volumes or external storage.

12. How would you pass configuration into a container?

**Deep explanation:** Use environment variables, arguments, or mounted configuration files. Keeping configuration outside the image lets one artifact work across environments. Sensitive values should come from a secret manager, never image layers or source control.

**Interview answer:** I inject configuration through environment variables, arguments, or mounted files and use a secret store for sensitive values.

13. Why should containers avoid running as root when possible?

**Deep explanation:** A compromised root process has greater impact on mounted resources and can exploit runtime or kernel weaknesses more effectively. A dedicated non-root user, minimal capabilities, and a read-only filesystem reduce the blast radius.

**Interview answer:** Non-root execution follows least privilege and limits damage if the process is compromised; I grant only required permissions.

14. How would you inspect container logs and exit codes?

**Deep explanation:** Use `docker logs <container>` with options such as `--follow` or `--tail`. `docker inspect <container>` exposes `.State.ExitCode`, errors, and OOM status; `docker ps -a` gives a quick status view.

**Interview answer:** I use `docker logs` for output and `docker inspect` or `docker ps -a` for status, exit code, and OOM information.

15. What is Docker Compose useful for?

**Deep explanation:** Compose defines related services, networks, volumes, and configuration in YAML and starts them together. It is convenient for reproducible development and testing, but it is not a full cluster orchestrator like Kubernetes.

**Interview answer:** Compose declaratively runs a multi-container application—such as an API, database, and cache—especially for local development and tests.

16. What is a container registry?

**Deep explanation:** A registry stores and distributes versioned images. CI pushes them and deployment systems pull them by tag or digest. Registries may provide authentication, access control, scanning, retention, and signing.

**Interview answer:** A registry is a service for storing, securing, versioning, and distributing container images.

17. How do image tags and digests differ?

**Deep explanation:** A tag such as `app:latest` is a readable, mutable pointer that can move. A digest such as `sha256:...` is content-derived and identifies one exact immutable image. Digest pinning makes deployments reproducible.

**Interview answer:** Tags are readable but mutable aliases; digests are immutable content identifiers used when exact reproducibility matters.

18. What problem does Kubernetes solve?

**Deep explanation:** Kubernetes orchestrates containers across machines. From declarative desired state, it schedules workloads, maintains replicas, restarts failures, rolls out changes, and connects services. This reduces manual operations but adds platform complexity.

**Interview answer:** Kubernetes automates deployment, scaling, networking, updates, and recovery for containerized applications across a cluster.

19. What are a cluster, node, and pod?

**Deep explanation:** A cluster is the control plane plus worker machines. A node is one worker machine. A pod is the smallest schedulable unit and contains one or more tightly coupled containers sharing networking and configured storage.

**Interview answer:** A cluster is the whole Kubernetes environment, a node is a worker machine, and a pod is the smallest deployed unit.

20. How do pods and containers relate?

**Deep explanation:** Kubernetes schedules pods rather than individual containers. Containers in a pod share an IP and volumes and always run on the same node. Most pods have one main container; sidecars support tightly coupled behavior.

**Interview answer:** A pod wraps one or more co-located containers that share networking and storage and are managed together.

21. What is a Deployment?

**Deep explanation:** A Deployment declares a stateless pod template and desired replica count and manages ReplicaSets to realize them. It supports rolling updates, rollback, scaling, and replacement of failed pods.

**Interview answer:** A Deployment manages stateless pod replicas and provides declarative scaling, rolling updates, rollback, and self-healing.

22. What is a ReplicaSet?

**Deep explanation:** A ReplicaSet continually ensures that a specified number of pods matching a selector exist. It creates or removes pods to correct the count. Deployments normally manage ReplicaSets, so they are rarely authored directly.

**Interview answer:** A ReplicaSet maintains the desired number of matching pod replicas, usually under a Deployment.

23. What is a Service?

**Deep explanation:** Pod IPs change as pods are replaced. A Service selects pods by labels and provides stable DNS and a virtual IP, distributing traffic to ready endpoints and decoupling clients from pod lifecycles.

**Interview answer:** A Service gives changing pods a stable network identity and load-balances traffic to selected ready pods.

24. How do ClusterIP, NodePort, and LoadBalancer services differ?

**Deep explanation:** `ClusterIP` is internal-only and the default. `NodePort` exposes the same high port on each node. `LoadBalancer` asks supported infrastructure for an external load balancer, with availability and cost depending on the environment.

**Interview answer:** ClusterIP is internal, NodePort exposes every node, and LoadBalancer provisions an external entry point through supported infrastructure.

25. What is an Ingress?

**Deep explanation:** Ingress defines HTTP/HTTPS routing to Services based on hosts and paths, often with TLS termination. An Ingress controller must implement the rules; the resource alone does nothing. One entry point can serve many applications.

**Interview answer:** Ingress defines host- and path-based external HTTP routing to Services, implemented by an installed Ingress controller.

26. How do ConfigMaps and Secrets differ?

**Deep explanation:** Both inject values as environment variables or files. ConfigMaps hold non-sensitive configuration; Secrets are intended for credentials and tokens. Secret data is only base64-encoded by default, so encryption at rest and strict RBAC remain important.

**Interview answer:** ConfigMaps store ordinary configuration; Secrets store sensitive values but still require encryption and least-privilege access.

27. What are namespaces used for?

**Deep explanation:** Namespaces logically partition namespaced resources for teams or environments and support scoped RBAC, quotas, and network policies. They are not complete isolation by themselves, and resources such as nodes remain cluster-scoped.

**Interview answer:** Namespaces organize and separate resources and let us apply access controls, quotas, and policies to workload groups.

28. What are resource requests and limits?

**Deep explanation:** A request is the CPU or memory used for scheduling and reserved as the expected baseline. A limit caps usage: extra CPU is throttled, while exceeding memory can cause an OOM kill. Bad values cause waste or instability.

**Interview answer:** Requests guide scheduling and reserve expected capacity; limits cap consumption. CPU is throttled, while excess memory can terminate the container.

29. How do liveness, readiness, and startup probes differ?

**Deep explanation:** Liveness detects a stuck container and triggers restart. Readiness controls whether it receives Service traffic without restarting it. Startup protects slow-starting applications by delaying the other probe behavior until initialization succeeds.

**Interview answer:** Liveness decides when to restart, readiness decides when to send traffic, and startup allows slow initialization before the others take effect.

30. How would you inspect a pod that is not running?

**Deep explanation:** Use `kubectl get pod <name> -o wide` and `kubectl describe pod <name>` for status, conditions, and events. Then inspect `kubectl logs <name> -c <container>` and `--previous` after crashes. Follow the reported state into scheduling, image, configuration, probe, resource, or storage checks.

**Interview answer:** I start with `kubectl get` and `kubectl describe`, especially events, then check current or previous logs and investigate the subsystem indicated by the pod state.
