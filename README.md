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
- Deployed on Render

**Database**

- PostgreSQL (Neon – serverless)
- Persistent storage for feature flags and audit events

```
┌────────────┐      GraphQL / REST      ┌──────────────┐
│  Frontend  │  ───────────────────▶    │   Backend    │
│  (Vercel)  │                          │  (NestJS)    │
└────────────┘                          └──────┬───────┘
                                                │
                                                │ Prisma
                                                ▼
                                         ┌──────────────┐
                                         │ PostgreSQL   │
                                         │   (Neon)     │
                                         └──────────────┘
```

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

**Infrastructure**

- Neon (PostgreSQL)
- Render (Backend hosting)
- Vercel (Frontend hosting)

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
- Percentage-based rollouts
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
