# Feature Flag Dashboard

A full-stack feature flag management platform with real consumer applications, enabling runtime control of application behavior without redeploying code.

Built to demonstrate how modern systems safely roll out features, perform instant rollbacks, and decouple deployment from release.

## 🚀 Overview

Feature flags (also known as feature toggles) are a common production pattern used by large engineering teams to:

- Gradually roll out new functionality
- Instantly disable features during incidents
- Experiment safely without impacting all users
- Separate feature release from code deployment

This project implements a centralized feature flag service with:

- A GraphQL API for querying and updating flags
- A web-based dashboard for real-time visibility and control
- A database-backed model to replace hardcoded configuration

## 🧩 Architecture

```
FeatureFlagDashboard/
├── feature-flag-backend/
│   ├── src/
│   │   ├── feature/        # GraphQL resolvers & domain logic
│   │   ├── prisma/         # Prisma module & service
│   │   └── app.module.ts
│   ├── prisma/
│   │   ├── schema.prisma   # FeatureFlag data model
│   │   ├── migrations/
│   │   └── seed.ts
│   └── generated/          # Prisma client
│
├── feature-flag-frontend/
│   ├── components/
│   ├── pages/
│   └── FeatureFlagsTable.tsx
```

## 🛠️ Tech Stack

### Backend

- **NestJS** — API framework
- **GraphQL** — schema-driven API
- **Prisma** — ORM and database client
- **PostgreSQL** — persistent storage

### Frontend

- **React + TypeScript**
- **Apollo Client** — GraphQL data layer
- **Tailwind CSS** — UI styling
- **shadcn/ui** — accessible UI components

## 📦 Data Model

```prisma
model FeatureFlag {
  id        String   @id @default(uuid())
  name      String   @unique
  enabled   Boolean
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Each feature flag is uniquely identified by name and can be toggled on or off at runtime.

## 🔌 API (GraphQL)

### Query all feature flags

```graphql
query GetFeatureFlags {
  featureFlags {
    id
    name
    enabled
    createdAt
    updatedAt
  }
}
```

### Toggle a feature flag

```graphql
mutation ToggleFeatureFlag($id: ID!) {
  toggleFeatureFlag(id: $id) {
    id
    enabled
  }
}
```

## 🖥️ Dashboard Features

- View all feature flags and their current state
- Toggle flags on/off in real time
- Immediate UI updates via GraphQL mutations
- Database-backed state (no hardcoded flags)

## 🧑‍🧑‍🧒‍🧒 Feature Flag Consumers

This project includes real consumer implementations to demonstrate how feature flags affect application behavior in practice.

### 🛒 Checkout Experience (Backend + Frontend)

- Flag: `new_checkout_flow`
- Behavior:
  - OFF → Legacy checkout with itemized pricing and shipping
  - ON → New checkout with holiday discounts and free shipping
- Impact: The same endpoint returns different business logic responses at runtime based on the flag state
  This simulates a production rollout of a new checkout system without redeploying backend or frontend code.

### 🛒 Dark Mode Configuration

- Flag: `dark_mode_v2`
- Behavior:
  - Controls whether the application renders in light or dark mode
  - Applied globally via CSS variables and runtime configuration
- Impact: - Flag: `new_checkout_flow`
- Behavior:
  - OFF → Legacy checkout with itemized pricing and shipping
  - ON → New checkout with holiday discounts and free shipping
- Impact: UI theme changes immediately based on centralized backend state

## 🧠 How This Is Used in Practice

In a real application, a service or frontend would:

1. Query feature flags at runtime
2. Conditionally enable or disable code paths
3. React immediately to changes without redeploying

**Example (conceptual):**

```javascript
if (featureService.isEnabled("FLAG_NAME")) {
  return newCheckout();
}
return legacyCheckout();
```

This platform acts as the source of truth for those decisions.

## 🌱 Why This Project Exists

This project was built to demonstrate:

- Designing a platform-style backend service
- Decoupling feature release from deployment
- Replacing static configuration with runtime controls
- Integrating feature flags into real application flows

It intentionally avoids overengineering (auth, targeting, rollouts) to keep the core concept clear, realistic and extensible.

## 🔮 Future Enhancements

Potential extensions include:

- Environment-specific flags (dev / staging / prod)
- Percentage-based rollouts
- User or cohort targeting
- Audit logs (who changed what, when)
- SDK-style consumers for external services
- Backend performance flags (caching, analytics, etc.)

## 🧪 Getting Started (Local)

### Backend

```bash
cd feature-flag-backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### Frontend

```bash
cd feature-flag-frontend
npm install
npm run dev
```

## ✅ Status

✔ GraphQL API  
✔ Database persistence  
✔ Real-time dashboard  
✔ Runtime feature toggling

---

**License:** This project is licensed under the MIT License.
