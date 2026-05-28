# Feature Flag Console

A production-style **feature flag management console** that enables real-time control over application behavior without redeploying code. The system demonstrates how modern engineering teams **release features safely, enforce governance boundaries, and retain auditability** in production environments.
This project focuses on **operational correctness and engineering maturity**, not just toggling features.

---

## 🚀 Overview

Feature flags (also known as feature toggles) are a foundational pattern in large-scale systems. This project implements a centralized feature flag service with a web-based console, a GraphQL API, and a persistent audit log, mirroring how internal tooling is designed at high-growth and enterprise engineering organizations.

Beyond basic enable/disable behavior, the console models real-world constraints, including:

- Risk-based classification of flags
- Role-based access control
- Governance-critical controls
- Operator-focused UX and observability

---

## 🧩 Architecture

**Frontend**

- React + Vite
- Apollo Client (GraphQL)
- Tailwind CSS
- Deployed on Vercel

**Backend**

- NestJS
- GraphQL API for feature flags
- REST endpoints for audit logs and example consumer flows
- Prisma ORM
- Anthropic Claude API (AI risk advisor + audit summarizer)
- KafkaJS producer (fire-and-forget flag toggle events)
- Deployed on Render

**Database**

- PostgreSQL (Neon – serverless)
- Persistent storage for feature flags and audit events

**Event Streaming**

- Apache Kafka (via Docker Compose for local dev)
- Go consumer service — subscribes to `flag.toggled`, logs events with structured JSON logging (`slog`)

**Kubernetes**

- Production-ready manifests in `k8s/` for the Go consumer
- Deployment, ConfigMap, and HPA (HorizontalPodAutoscaler)

```
┌────────────┐      GraphQL / REST      ┌──────────────────────┐
│  Frontend  │  ───────────────────▶    │   Backend (NestJS)   │
│  (Vercel)  │                          └──┬────────┬───────────┘
└────────────┘                             │        │
                                     Prisma│        │ KafkaJS
                                           ▼        ▼
                                    ┌──────────┐  ┌──────────────┐
                                    │PostgreSQL│  │ Kafka Broker │
                                    │  (Neon)  │  └──────┬───────┘
                                    └──────────┘         │
                                                         │ flag.toggled
                                                         ▼
                                                ┌─────────────────────┐
                                                │  Kubernetes         │
                                                │  ┌───────────────┐  │
                                                │  │  Go Consumer  │  │
                                                │  │  (k8s Pod)    │  │
                                                │  └───────────────┘  │
                                                └─────────────────────┘
```

---

## 🤖 AI Integration (Phase 1)

### AI Risk Advisor

Every flag toggle triggers an AI risk assessment via the Anthropic Claude API. The result appears as a dismissible inline callout directly below the toggled flag row — no separate page, no modal.

- Color-coded by tier: **blue** for SAFE, **yellow** for SENSITIVE, **red** for CRITICAL
- Auto-dismisses after 10 seconds or on manual close
- Non-blocking: the toggle response resolves immediately; the risk note arrives when the AI call completes
- If the AI call fails, the toggle still succeeds silently

The backend passes the flag name, tier, old/new values, and the last 10 audit entries for that flag as context. The AI responds with a 2–3 sentence operational assessment.

### AI Audit Summarizer

The Audit Log page includes an AI-generated plain-English summary card at the top, covering the last 50 audit entries.

- Identifies the most-frequently toggled flag
- Detects potential rollbacks (flags toggled back and forth)
- Cached server-side for 60 seconds to avoid redundant API calls
- **Refresh Summary** button busts the cache and fetches a new summary on demand
- Shows an animated skeleton while loading

---

## 📡 Kafka Event Streaming (Phase 2)

Every flag toggle publishes a fire-and-forget event to a Kafka topic (`flag.toggled`) after the database write. The toggle response is never blocked on Kafka.

**Event payload:**
```json
{
  "flagName": "discounted_checkout",
  "oldValue": true,
  "newValue": false,
  "tier": "SENSITIVE",
  "source": "dashboard",
  "timestamp": "2025-10-22T14:30:00.000Z",
  "rolloutPercentage": 75
}
```

`rolloutPercentage` is optional — present only when the event includes a percentage value. The Go consumer logs it when present and omits it otherwise.

If Kafka is unavailable (e.g., running the backend without Docker), the producer warns once at startup and skips publishing — the toggle flow is unaffected.

### Go Consumer

A standalone Go service (`feature-flag-consumer/`) subscribes to the `flag.toggled` topic and handles each event:

1. **Structured logging** — emits a JSON log line per event using Go's standard `log/slog`
2. **Cache invalidation stub** — fires an HTTP request to the backend's `/config` endpoint to warm the config cache
3. **Webhook dispatcher stub** — logs `"would send webhook to: [url]"` (ready for real webhook wiring)

### Running Locally with Docker

```bash
# Start Zookeeper + Kafka + Go consumer
docker compose up

# In a separate terminal — backend connects to localhost:9092
cd feature-flag-backend && npm run start:dev
```

The Kafka broker is configured with two listeners:
- `localhost:9092` — for the NestJS backend running on the host
- `kafka:29092` — for the Go consumer running inside Docker

---

## ☸️ Kubernetes (Phase 3)

The `k8s/` folder contains production-ready manifests for deploying the Go consumer to a Kubernetes cluster.

### Manifests

**Deployment** (`k8s/consumer-deployment.yaml`)
- 2 replicas by default
- Liveness probe: `pgrep consumer` every 30 seconds
- Resource requests: 64Mi memory, 100m CPU
- Resource limits: 128Mi memory, 200m CPU
- Environment sourced entirely from the ConfigMap — no hardcoded values in the spec

**ConfigMap** (`k8s/consumer-configmap.yaml`)
- Externalizes `KAFKA_BROKER`, `KAFKA_TOPIC`, `KAFKA_GROUP`, and `BACKEND_URL`
- Swap values per environment (staging, production) without touching the Deployment spec

**HorizontalPodAutoscaler** (`k8s/consumer-hpa.yaml`)
- Scales between 1 and 10 replicas
- Triggers at 60% average CPU utilization
- In production, replace with [KEDA](https://keda.sh/) scaling on Kafka consumer lag — CPU is a poor proxy for a Kafka consumer; lag-based scaling reacts directly to backpressure on the topic

### Deploy

```bash
kubectl apply -f k8s/
```

Check consumer logs:
```bash
kubectl logs -l app=feature-flag-consumer
```

Check autoscaler status:
```bash
kubectl get hpa
```

---

## 🎚️ Gradual Rollout (Phase 4)

Each feature flag has a `rolloutPercentage` field (0–100, default 100) that controls what fraction of traffic receives the flag when it is enabled.

### How it works

`isEnabled(flagName, clientId?)` uses a deterministic djb2 hash of the `clientId` string to assign the caller to a stable percentage bucket (0–99). If the bucket falls below `rolloutPercentage`, the flag is considered on for that caller. The same `clientId` always maps to the same bucket — a user never oscillates between enabled and disabled across requests.

If no `clientId` is provided, the method falls back to the raw `enabled` boolean, preserving compatibility with callers that don't supply one.

### UI

When a flag is enabled, a percentage slider (0–100) appears below the toggle switch. Changes are debounced 500ms before the mutation fires, so rapid dragging does not produce a request per pixel. The current percentage is displayed numerically alongside the slider.

### Real-world usage

- **Canary releases** — expose a new feature to 5% of users before widening the rollout
- **Staged ramp-ups** — increase from 10% → 25% → 50% → 100% over time while monitoring error rates
- **Instant rollback** — slide to 0% to disable for all traffic without toggling the flag off entirely, preserving the intent to re-enable later
- **Dark launches** — keep a flag enabled at 0% to exercise backend code paths without exposing anything to users

Percentage changes are captured in the audit log with the new value appended to the source field (e.g., `dashboard (rollout: 75%)`).

---

## ✨ Core Concepts

### Tiered Risk Classification

Each feature flag is classified by blast radius and governance risk, not by implementation complexity.

| Tier          | Meaning                                    |
| ------------- | ------------------------------------------ |
| **SAFE**      | Cosmetic or low-risk behavior              |
| **SENSITIVE** | Business or operational impact             |
| **CRITICAL**  | Governance, compliance, or audit integrity |

Tier metadata is surfaced directly in the UI to guide operator decision-making.

### Role-Based Access (Demo-Oriented)

The console supports two operational roles:

**Admin**

- Can toggle SAFE, SENSITIVE, and CRITICAL flags

**Developer**

- Can toggle SAFE and SENSITIVE flags only

Authentication is intentionally mocked (via a role selector) to keep the focus on authorization and policy enforcement, which is the core system behavior being demonstrated.

---

## 🚩 Implemented Feature Flags

The system includes a small but representative set of flags, each chosen to demonstrate a real production use case.

### `dark_mode` — SAFE

**Purpose:** Controls UI theme styling for the console.

**Why it exists:**  
Cosmetic flags are often used to validate flag plumbing and UI behavior with zero risk.

**Real-world usage:**

- UI theming
- Accessibility experiments
- Visual rollouts

---

### `discounted_checkout` — SENSITIVE

**Purpose:** Enables discounted pricing logic in the checkout flow.

**Why it exists:**  
Demonstrates revenue-impacting feature control that must be handled carefully but can be safely toggled by trusted developers.

**Real-world usage:**

- Promotions
- Sales events
- Pricing experiments
- A/B testing of checkout logic

**Observable behavior:**

- Checkout totals change immediately when toggled
- Rollback is instant and does not require redeployment

---

### `experimental_cache` — SENSITIVE

**Purpose:** Enables in-memory caching of feature configuration on the backend.

**Why it exists:**  
Illustrates performance-oriented infrastructure flags that trade latency improvements for controlled operational risk.

**Real-world usage:**

- Caching layers
- Batching logic
- Performance tuning
- Gradual rollout of infra optimizations

**Observable behavior:**

- When enabled, backend logs show cached config reads
- When disabled, config is fetched from the database on every request
- Effects are observable via backend logs, not UI changes

---

### `audit_log_visibility` — CRITICAL

**Purpose:** Controls whether the Audit Log UI is accessible.

**Why it exists:**  
Audit visibility is governance-critical. Allowing unrestricted control would undermine accountability and compliance.

**Real-world usage:**

- Compliance tooling
- Incident investigation
- Change accountability
- Security review workflows

**Important:**  
This flag is intentionally restricted to Admins only to preserve audit integrity.

---

## 🧪 How to Test the System

The console is designed to be explored interactively.

### 1️⃣ Test Role-Based Permissions

1. Open the application
2. Switch between **Admin** and **Developer** roles using the role selector
3. Observe:
   - Developers can toggle SAFE and SENSITIVE flags
   - CRITICAL flags are disabled with clear messaging

This demonstrates tier-based authorization without full authentication complexity.

### 2️⃣ Test Revenue-Impacting Behavior

**Flag:** `discounted_checkout`

1. Navigate to **Consumer Preview**
2. Toggle the flag ON and OFF
3. Observe:
   - Pricing and totals change immediately
   - Rollback restores original behavior instantly

This mirrors how pricing and promotion flags are used in production systems.

### 3️⃣ Test Performance-Oriented Flags

**Flag:** `experimental_cache`

1. Enable the flag
2. Trigger multiple backend requests that read feature configuration
3. Observe backend logs:
   - Initial database fetch
   - Subsequent cache hits while the flag is enabled

This demonstrates infrastructure-level flags whose effects are validated through observability rather than UI changes.

### 4️⃣ Test Safe Rollback

For any flag:

1. Enable the flag
2. Observe the behavior change
3. Disable the flag
4. Observe immediate rollback

All feature behavior is evaluated at runtime, without redeploying code.

---

## 🛠️ Tech Stack

**Frontend**

- React
- TypeScript
- Vite
- Apollo Client
- Tailwind CSS

**Backend**

- NestJS
- GraphQL
- REST APIs
- Prisma
- KafkaJS (Kafka producer)
- Anthropic Claude API

**Event Streaming**

- Apache Kafka + Zookeeper (Docker Compose)
- Go 1.22 consumer service (`log/slog`, `segmentio/kafka-go`)

**Infrastructure**

- Neon (PostgreSQL)
- Render (Backend hosting)
- Vercel (Frontend hosting)
- Docker (local Kafka + Go consumer)
- Kubernetes (Go consumer deployment manifests)

---

## 🔐 Why This Project Matters

This project intentionally emphasizes how internal platforms behave under real operational constraints, not just feature completeness.

It demonstrates:

- Risk-aware feature management
- Separation of development and governance concerns
- Auditability as a first-class concept
- Authorization without over-engineered authentication
- Operator-focused UI and system transparency

---

## 🌐 Live Demo

- **Frontend:** [https://feature-flag-console.vercel.app](https://feature-flag-console.vercel.app)
- **Backend:** [https://featureflagdashboard.onrender.com](https://featureflagdashboard.onrender.com)

**Tip:** Use the role selector to explore how permissions, audit visibility, and feature control change between Admin and Developer contexts.

---

## 📌 Future Enhancements

- Backend-enforced authorization (403s on restricted actions)
- Environment-specific flags (dev / staging / prod)
- Webhooks for flag change notifications
- Advanced audit filtering and search

---

## 👤 Author

Built by **Diya Wadhwani**

This project is intended as a portfolio-grade demonstration of platform engineering principles, backend system design, and operator-focused frontend development.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
