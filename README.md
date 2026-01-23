# Feature Flag Console

A production-style **feature flag management console** that enables real-time control over application behavior without redeploying code. This system demonstrates how modern engineering teams safely roll out features, perform instant rollbacks, and maintain a full audit trail of configuration changes.

---

## 🚀 Overview

Feature flags (also known as feature toggles) are a foundational pattern in large-scale systems. This project implements a **centralized feature flag service** with a web-based dashboard, a GraphQL API, and a persistent audit log—mirroring how internal tooling is built at high-growth and enterprise engineering organizations.

The console supports:

- Runtime enable/disable of features
- Immediate rollback during incidents
- Separation of deployment from release
- Visibility into _who changed what, when, and why_

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
│  Frontend  │  ───────────────────▶   │   Backend    │
│  (Vercel)  │                          │  (NestJS)    │
└────────────┘                          └──────┬───────┘
                                                │
                                                │ Prisma
                                                ▼
                                         ┌──────────────┐
                                         │ PostgreSQL   │
                                         │   (Neon)    │
                                         └──────────────┘
```

---

## ✨ Core Features

### Feature Flag Management

- Create and update feature flags via GraphQL
- Toggle flags instantly without redeploying applications
- Designed for safe, incremental rollouts

### Audit Activity Feed

- Every feature toggle is recorded
- Captures old value, new value, source, and timestamp
- Enables traceability and post-incident analysis

### Click-to-Filter Audit UI

- Filter audit events by flag or source
- Optimized for operator workflows and debugging

### Example Consumer Flows

- Checkout and configuration routes demonstrate how real services consume flags
- Illustrates backend-driven feature behavior

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

## 📂 Repository Structure

```
FeatureFlagDashboard/
├── feature-flag-backend/   # NestJS backend
│   ├── prisma/
│   ├── src/
│   └── package.json
├── feature-flag-frontend/  # React + Vite frontend
│   ├── src/
│   └── package.json
└── README.md
```

---

## 🔐 Why This Project Matters

This project focuses on **engineering maturity**, not just UI or CRUD functionality. It highlights:

- Production-style separation of concerns
- Safe configuration management patterns
- Auditability and operational visibility
- Clean API boundaries between systems

The goal is to demonstrate how internal developer tooling is designed and implemented in real-world environments.

---

## 🌐 Live Demo

- **Frontend:** [https://feature-flag-console.vercel.app](https://feature-flag-console.vercel.app)
- **Backend:** [https://featureflagdashboard.onrender.com](https://featureflagdashboard.onrender.com)

---

## 📌 Future Enhancements

- Role-based access control (RBAC)
- Percentage-based rollouts
- Environment-specific flags (dev / staging / prod)
- Webhooks for flag change notifications
- Pagination and search for audit logs

---

## 👤 Author

Built by **Diya Wadhwani**

This project is intended as a portfolio-grade demonstration of backend architecture, frontend systems design, and production-oriented engineering practices.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
