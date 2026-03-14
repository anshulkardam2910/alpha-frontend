# Alpha — AI for GTM Teams

## 🌐 Overview
 
Modern revenue teams juggle dozens of tools (CRM, email sequencer, ads manager, dialers, analytics, etc.) and rely on manual orchestration for GTM campaigns. Alpha replaces this fragmented stack with a unified, agentic platform that plans, executes, and iterates on GTM campaigns—so every prospect touch happens at the right time, on the right channel, with the right context.
 
| Environment | URL | Branch |
|---|---|---|
| 🟢 Production | https://alpha-frontend-prod.vercel.app | `main` |
| 🟡 Staging | https://alpha-frontend-preview.vercel.app/ | `staging` |


## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

## 🚀 Getting Started
 
Get up and running in under 5 minutes.
 
### Prerequisites
 
| Tool | Version | Install |
|---|---|---|
| Node.js | `>= 24` | [nodejs.org](https://nodejs.org/) or `nvm use` |
| pnpm | `>= 10.x` | `npm i -g pnpm` |
| Git | `>= 2.x` | [git-scm.com](https://git-scm.com/) |
 
 
### Step 1 — Clone
 
```bash
git clone https://github.com/alphaframepvtltd/Web-Application.git
cd Web-Application
```
 
### Step 2 — Install dependencies
 
```bash
pnpm install
```
 
### Step 3 — Set up environment variables
 
```bash
cp .env.example .env.local
```
 
Open `.env.local` and fill in the required values. See the [Environment Variables](#-environment-variables) section for a full reference.
 
### Step 4 — Start the dev server
 
```bash
pnpm dev
```
## Tech Stack
 
| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | RSC, streaming, edge support |
| Language | TypeScript | End-to-end type safety |
| Styling | Tailwind CSS | Fast, consistent, zero runtime |
| Data Fetching | TanStack Query v5 | Caching, optimistic updates |
| Forms | React Hook Form + Zod | Performant, schema-validated |
| Error Tracking | Sentry | Production error monitoring |
| CI/CD | GitHub Actions + Vercel | Preview deploys on every PR |
## 📁 Project Structure
 
We use a **feature-based structure** inside the Next.js App Router. Code is co-located with what it belongs to.
 
```
frontend/
├── public/                        # Static assets (favicons, OG images, fonts)

├── src/
│
│   ├── app/                       # Next.js App Router
│   │   ├── (marketing)/           # Public marketing pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── pricing/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (auth)/                # Authentication routes
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── dashboard/             # Main authenticated application
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │
│   │   └── layout.tsx             # Root layout (providers, fonts, global UI)
│
│
│   ├── modules/                   # Feature-based architecture
│   │
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── server/
│   │   │   ├── actions.ts
│   │   │   ├── schema.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── users/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── server/
│   │   │   ├── actions.ts
│   │   │   ├── schema.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── billing/
│   │   │   ├── components/
│   │   │   ├── server/
│   │   │   ├── stripe.ts
│   │   │   └── types.ts
│
│
│   ├── components/                # Shared reusable UI components
│   │   ├── ui/                    # Design system primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── modal.tsx
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── navbar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── footer.tsx
│   │   │
│   │   └── common/                # Shared utility components
│   │       ├── loader.tsx
│   │       ├── empty-state.tsx
│   │       └── error-boundary.tsx
│
│
│   ├── services/                  # API service layer
│   │   ├── api-client.ts
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── feedback.service.ts
│   │   └── billing.service.ts
│
│
│   ├── lib/                       # Core utilities and infrastructure
│   │   ├── db.ts
│   │   ├── env.ts
│   │   ├── fetcher.ts
│   │   └── logger.ts
│
│
│   ├── hooks/                     # Global reusable hooks
│   │   ├── use-auth.ts
│   │   ├── use-debounce.ts
│   │   └── use-media-query.ts
│
│
│   ├── store/                     # Global state (Zustand)
│   │   ├── auth-store.ts
│   │   └── ui-store.ts
│
│
│   ├── config/                    # App configuration
│   │   ├── site.ts
│   │   ├── routes.ts
│   │   └── constants.ts
│
│
│   ├── types/                     # Global TypeScript types
│   │   ├── api.ts
│   │   ├── user.ts
│   │   └── common.ts
│
│
│   ├── proxy.ts
│   └── instrumentation.ts
│
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`NEXT_PUBLIC_API_BASE_URL`

`NEXT_PUBLIC_APP_URL`

## 🚀 Deployment
 
Vercel is currently used for frontend deployments.

Because this repository lives inside a private organization and direct Vercel integration would require a Vercel Pro plan, deployments are handled through a mirror repository.

A GitHub Action automatically mirrors this repository to a separate repo that Vercel is connected to.

Mirror repository:
https://github.com/anshulkardam2910/alpha-frontend

Workflow reference:
`/.github/workflows/mirror.yml`
 
**Deploy flow:**

Push to main or dev
        │
        ▼
GitHub Action runs
        │
        ▼
Repository mirrored to:
anshulkardam2910/alpha-frontend
        │
        ▼
Vercel automatically builds and deploys

### Environment Behavior

Push to main  →  Production deployment
Push to dev   →  Preview / staging deployment
