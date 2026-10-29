1. How would you create a small production image using a multi-stage build?

**Deep explanation:**
Build and test in a stage containing compilers and package managers, then copy only the artifact and required runtime files into a pinned minimal image. Use `.dockerignore`, run non-root, and verify required libraries and certificates are present. This reduces size and attack surface.

**Interview answer:**
I build and test in a builder stage, then copy only the production artifact and runtime dependencies into a pinned minimal image. I also use `.dockerignore`, a non-root user, and scan and smoke-test the result.

2. How would you structure layers to improve build caching?

**Deep explanation:**
Put stable, expensive steps before frequently changing files. Copy dependency manifests and lockfiles, install dependencies, and only then copy source; source edits can reuse the dependency layer. Keep the context small and use BuildKit cache mounts for package caches.

**Interview answer:**
I order layers from least to most frequently changed: base setup, dependency files, dependency installation, then source. BuildKit cache mounts preserve useful caches without baking them into the image.

3. How would you keep secrets out of image layers and build logs?

**Deep explanation:**
Never use `ARG`, `ENV`, copied files, or command text for secrets because history and cached layers may retain them. Use BuildKit secret or SSH mounts, prevent command echoing, and inject runtime secrets through the platform. Scan the context and image for leaks.

**Interview answer:**
I use BuildKit secret mounts during builds and runtime secret injection after deployment. Secrets never enter build arguments, environment layers, copied files, or logged commands.

4. How would you handle signals and PID 1 behavior inside a container?

**Deep explanation:**
Run the application as PID 1 with exec-form `ENTRYPOINT` or `CMD` so it receives `SIGTERM`. It should stop new work, drain requests, and exit within the grace period. If it cannot reap child processes, add a minimal init such as `tini`.

**Interview answer:**
I use exec form so signals reach the application directly, implement graceful `SIGTERM` handling, and use a minimal init if child reaping is needed.

5. How would you implement a container health check without hiding application failures?

**Deep explanation:**
Separate startup, readiness, and liveness semantics. Readiness stops traffic during temporary inability to serve; liveness should detect an unrecoverable local hang, not restart pods whenever a remote dependency fails. Use cheap probes, timeouts, and conservative thresholds.

**Interview answer:**
I use startup probes for slow initialization, readiness to gate traffic, and liveness only for locally unrecoverable states. This avoids hiding failures or creating restart storms during dependency outages.

6. How would you scan and patch base-image vulnerabilities?

**Deep explanation:**
Scan in CI and the registry, generate an SBOM, and prioritize exploitable runtime findings. Pin trusted bases by digest while automation proposes patched digests and triggers regular rebuilds even without code changes. Retest before promotion and document compensating controls when no fix exists.

**Interview answer:**
I scan images continuously, record an SBOM, and gate actionable findings. Bases are digest-pinned, but automated refreshes regularly rebuild and test against patched versions.

7. How would you choose between a distroless image and a general-purpose image?

**Deep explanation:**
Distroless reduces packages, shell access, and attack surface, but requires external debugging practices. A slim general-purpose image is appropriate when OS tools or dynamic dependencies are genuinely required. Consider compatibility, patching, diagnosis, and compliance—not size alone.

**Interview answer:**
I prefer distroless for a stable, understood runtime with an ephemeral-debug workflow. I choose a slim general-purpose base only when runtime tooling or compatibility justifies it.

8. How would you debug an application in a minimal image without installing permanent tools?

**Deep explanation:**
Use logs, metrics, traces, and pod events first. For deeper inspection, attach an approved ephemeral debug container sharing the relevant namespaces, or reproduce the image with a matching debug variant. Do not mutate the production container, because that loses reproducibility.

**Interview answer:**
I use observability first, then an ephemeral debug container or matching debug image. I keep the deployed container immutable and never install permanent diagnostic packages into it.

9. How would you build images for multiple CPU architectures?

**Deep explanation:**
Use Buildx/BuildKit to build platform variants such as `amd64` and `arm64`, then publish a manifest list under one tag. Native builders are fastest; QEMU is convenient but slower. Test every architecture because successful cross-compilation does not prove runtime correctness.

**Interview answer:**
I use Buildx to publish per-platform images as one multi-architecture manifest, prefer native builders where practical, and run architecture-specific tests before promotion.

10. How would you ensure image builds are reproducible?

**Deep explanation:**
Pin base digests, lock dependencies and toolchains, avoid unbounded downloads, and control build arguments and network inputs. Normalize timestamps if byte-for-byte equality matters. Build cleanly, record provenance and an SBOM, and compare repeat outputs.

**Interview answer:**
I make every input immutable and explicit—base digest, lockfiles, toolchain, and arguments—then build in a clean environment and record provenance. Repeat builds should produce the expected digest or documented differences.

11. How do Deployments, StatefulSets, DaemonSets, Jobs, and CronJobs differ?

**Deep explanation:**
A Deployment manages interchangeable replicas and rolling updates. A StatefulSet provides stable identities and often per-pod storage; a DaemonSet runs on every eligible node. A Job runs finite work to completion, and a CronJob creates Jobs on a schedule.

**Interview answer:**
Deployments are for stateless replicas, StatefulSets for stable identity and storage, DaemonSets for node agents, Jobs for finite work, and CronJobs for scheduled Jobs.

12. How would you deploy a stateful database using Kubernetes primitives?

**Deep explanation:**
Use a StatefulSet, headless Service, and volume claim templates for stable identity and durable per-replica storage. Add probes, graceful termination, topology placement, resource guarantees, backups, and disruption controls. Replication, quorum, restore, and upgrades remain database-aware concerns, often handled by an operator.

**Interview answer:**
I use a StatefulSet, headless Service, and per-pod PVCs with safe probes and placement. I use proven database-native automation or an operator for replication, backup, restore, and upgrades.

13. How do PersistentVolumes, PersistentVolumeClaims, and StorageClasses relate?

**Deep explanation:**
A PV represents storage; a PVC requests capacity, access mode, and optionally a class. A StorageClass defines the provisioner and policies such as tier, binding, expansion, and reclamation. Dynamic provisioning creates a matching PV for a PVC.

**Interview answer:**
A PVC requests storage, a PV is the bound resource, and a StorageClass defines how storage is provisioned and managed.

14. How would you expose an application using Ingress or Gateway API resources?

**Deep explanation:**
Put a Service in front of pods, then define host/path and TLS routing through an installed Ingress controller or Gateway API implementation. Ingress is widely supported; Gateway API provides richer routing and clearer infrastructure-versus-application ownership through Gateway and Route resources.

**Interview answer:**
I expose pods with a ClusterIP Service and route external traffic using TLS plus host/path rules. I prefer Gateway API for richer routing and role separation when the cluster supports it.

15. How would you debug a Service that cannot reach healthy pods?

**Deep explanation:**
Verify pods are ready and listening, compare selectors with labels, inspect EndpointSlices, and confirm ports and protocol. Test DNS, pod IP, and Service IP from a debug pod. Then check NetworkPolicies, CNI, kube-proxy, and node routing to isolate the failing layer.

**Interview answer:**
I check readiness, selector-label matches, EndpointSlices, and port mapping first. Then I test DNS, direct pod connectivity, and Service connectivity before inspecting policy and cluster networking.

16. How do labels and selectors connect Kubernetes resources?

**Deep explanation:**
Labels are key-value metadata; selectors dynamically match objects. Services find backend pods, controllers manage replicas, and scheduling rules choose pods or nodes through selectors. Overlapping or incorrect selectors can misroute traffic or ownership, so schemas must be stable and scoped.

**Interview answer:**
Labels describe objects, and selectors connect Services, controllers, and scheduling rules to matching objects. I use a consistent schema and carefully scope selectors.

17. How would you configure service discovery and internal DNS?

**Deep explanation:**
Create Services and configure clients with stable Service DNS names rather than pod IPs. Short names work within a namespace; cross-namespace callers should qualify the namespace. Headless Services expose individual pod addresses, and StatefulSets can provide stable pod DNS.

**Interview answer:**
I use Service DNS names, namespace-qualified across namespaces, and headless Services only for client-side pod discovery. I troubleshoot DNS and network reachability separately.

18. How would you configure rolling updates and rollback behavior?

**Deep explanation:**
Configure RollingUpdate with availability-appropriate surge and unavailable limits, correct probes, a progress deadline, retained revision history, and immutable image digests. Monitor service metrics and pause or roll back on regression. Database migrations must remain backward-compatible because Deployment rollback does not undo them.

**Interview answer:**
I combine rolling updates with accurate probes, capacity-aware rollout limits, progress deadlines, immutable images, and metric-based monitoring. I roll back the workload revision on regression and handle database compatibility separately.

19. How do maxSurge and maxUnavailable affect a rollout?

**Deep explanation:**
`maxSurge` limits extra pods above desired replicas, trading temporary capacity for faster replacement. `maxUnavailable` limits missing capacity, trading availability for speed and lower resource use. Percentage rounding matters with small replica counts.

**Interview answer:**
`maxSurge` controls extra new pods; `maxUnavailable` controls how much desired capacity may be absent. I tune both to the availability target and available cluster headroom.

20. How would you prevent a rollout from routing traffic to an unready application?

**Deep explanation:**
Use an accurate readiness probe so unready pods are removed from Service endpoints, plus a startup probe for slow initialization. On shutdown, fail readiness before exiting, drain in-flight work, and allow enough grace for endpoint propagation; a short `preStop` delay can help.

**Interview answer:**
I gate traffic with readiness, protect slow starts with a startup probe, and make termination mark the pod unready before gracefully draining and exiting.

21. How would you choose CPU and memory requests from measurements?

**Deep explanation:**
Measure representative sustained and peak usage, choose CPU requests with headroom, and set memory above a realistic high percentile plus safety margin. CPU throttles when constrained; memory-limit breaches cause OOM kills. Validate latency, scheduling, throttling, and OOM behavior under load, then revisit values.

**Interview answer:**
I derive requests from production or load-test percentiles with headroom, treating memory more conservatively because it is not compressible. I continuously tune using SLO, throttling, eviction, and OOM data.

22. How do HPA, VPA, and cluster autoscaling address different needs?

**Deep explanation:**
HPA changes replica count from resource or custom metrics. VPA recommends or changes per-pod requests, sometimes recreating pods. Cluster autoscaling changes node capacity when pods cannot schedule or nodes are underused. Their signals must be coordinated to avoid feedback loops.

**Interview answer:**
HPA scales pod count, VPA sizes pods, and cluster autoscaling changes nodes. I coordinate their metrics so they complement instead of fighting each other.

23. How would you scale a queue consumer using backlog metrics?

**Deep explanation:**
Export queue depth or oldest-message age and scale with HPA custom metrics or KEDA. Set targets from measured processing rate and desired drain time, bound replica counts, and stabilize scale-down. Account for retries and visibility timeouts, and make processing idempotent.

**Interview answer:**
I scale on backlog per consumer or message age rather than CPU, tune the target from throughput and drain-time goals, cap growth, slow scale-down, and keep consumers idempotent.

24. How would you apply pod anti-affinity or topology spread constraints?

**Deep explanation:**
Topology spread constraints distribute replicas across zones or nodes using a maximum skew. Anti-affinity prevents matching pods from sharing a failure domain. Required rules improve separation but can leave pods Pending; preferred rules trade perfect balance for schedulability.

**Interview answer:**
I spread replicas across zones and nodes and use anti-affinity for specific co-location risks. I use hard constraints only when cluster topology guarantees they can be met.

25. How would you use taints and tolerations appropriately?

**Deep explanation:**
Taints repel pods; tolerations allow but do not attract them. Use them for dedicated, specialized, or degraded nodes, and pair tolerations with node affinity when a workload must land there. Choose `NoSchedule`, `PreferNoSchedule`, or `NoExecute` deliberately because `NoExecute` can evict pods.

**Interview answer:**
I taint special-purpose nodes and give only approved workloads tolerations. When those workloads must use the nodes, I also add affinity because toleration alone does not select them.

26. How would you restrict pod-to-pod traffic with NetworkPolicies?

**Deep explanation:**
Confirm the CNI enforces policy, establish default-deny ingress and egress, then add explicit allows by namespace/pod selectors and ports. Preserve DNS, observability, control-plane, and required external traffic. Policies are additive, so test both allowed and denied paths.

**Interview answer:**
I start with default deny and explicitly allow required flows using scoped selectors and ports. I verify CNI support and test DNS plus every intended dependency.

27. How would you grant a workload minimal permissions through a ServiceAccount?

**Deep explanation:**
Give each workload a dedicated ServiceAccount and bind a narrowly scoped Role through a namespace RoleBinding. Avoid wildcard verbs, resources, and cluster scope. Disable token automount if the API is unused; otherwise use short-lived projected tokens and audit effective permissions.

**Interview answer:**
I use a dedicated ServiceAccount with the smallest namespace-scoped Role possible, disable token mounting when unused, and verify permissions with `kubectl auth can-i`.

28. How would you rotate application secrets without rebuilding images?

**Deep explanation:**
Inject secrets at runtime from Kubernetes or an external secret manager. Applications can reload mounted files, or a controller can trigger a rollout; environment variables require recreation. Overlap old and new credentials, verify adoption, then revoke the old credential.

**Interview answer:**
I deliver secrets at runtime and use file reload or a controlled rollout. I keep an overlap window, confirm the new credential is active, and only then revoke the old one.

29. How would you diagnose CrashLoopBackOff, ImagePullBackOff, and Pending pods?

**Deep explanation:**
Begin with pod events. For CrashLoopBackOff, inspect current and previous logs, exit state, probes, config, and OOM status. For ImagePullBackOff, check the reference, registry access, and credentials. For Pending, inspect scheduler events for resources, affinity, taints, PVCs, quotas, or topology constraints.

**Interview answer:**
I classify the failure from events, use previous logs and termination state for crashes, registry and credential checks for pulls, and scheduler events for Pending constraints.

30. How would you investigate OOMKilled containers and CPU throttling?

**Deep explanation:**
For OOMs, inspect termination reason, memory working set, limits, node pressure, and heap/native profiles. For throttling, correlate throttled time, limits, runnable work, and latency; low averages can hide bursts. Fix leaks or inefficiency, then size resources and concurrency with load tests.

**Interview answer:**
I correlate termination and memory profiles for OOMs, and throttling metrics with limits and latency for CPU. Then I tune code, concurrency, requests, and limits under representative load.

31. How would you drain a node for maintenance?

**Deep explanation:**
Cordon the node, confirm spare capacity, then drain through eviction so disruption budgets and graceful termination are respected. Handle DaemonSets, unmanaged pods, and local data explicitly. After maintenance, uncordon and verify workloads recover.

**Interview answer:**
I cordon, verify capacity, and drain using eviction while handling DaemonSets and local storage deliberately. After maintenance I uncordon and confirm healthy rescheduling.

32. What does a PodDisruptionBudget protect against, and what does it not guarantee?

**Deep explanation:**
A PDB limits voluntary disruptions such as drains through `minAvailable` or `maxUnavailable`. It does not prevent node loss, crashes, OOMs, or partitions, create replicas, or spread them across failure domains. An overly strict budget can block maintenance.

**Interview answer:**
A PDB limits voluntary evictions so too many replicas are not disrupted together. It does not guarantee availability or protect against involuntary failures.

33. How would you prevent overlapping CronJob executions?

**Deep explanation:**
Set `concurrencyPolicy: Forbid` to skip a new run while one is active, or `Replace` when the newest should supersede it. Add deadlines and timeouts, but still make work idempotent because retries can duplicate effects. Use a distributed lock for strict business-level exclusion.

**Interview answer:**
I use `concurrencyPolicy: Forbid`, deadlines, and cleanup limits. I still design the job to be idempotent and use a distributed lock if stronger exclusion is required.

34. How would you collect logs, metrics, and traces across pods?

**Deep explanation:**
Emit structured logs to stdout/stderr for node-level collection, expose metrics for scraping, and instrument traces with OpenTelemetry. Propagate trace IDs and attach stable service, namespace, version, and cluster metadata. Control sensitive data, cardinality, sampling, retention, and cost.

**Interview answer:**
I centralize structured logs, scrape metrics, and collect OpenTelemetry traces with propagated context. Consistent metadata and correlation IDs connect the signals, while sampling and retention control cost.

35. How would you package and parameterize Kubernetes manifests using Helm or Kustomize?

**Deep explanation:**
Helm creates versioned charts with templates and dependencies, useful for reusable applications but prone to excessive template complexity. Kustomize applies declarative overlays and patches to plain YAML, keeping output easier to understand. Render, schema-check, policy-test, and diff the final manifests in CI.

**Interview answer:**
I use Helm for a distributable configurable package and Kustomize for readable base-and-overlay customization. Either way, CI renders, validates, and reviews the final manifests before promoting immutable versions.
