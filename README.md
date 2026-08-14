# Learnova

A full-stack **Learning Management System (LMS)** where students can browse and enroll in courses, instructors can create and manage their own content, and admins can oversee the whole platform. It ships with a RAG-powered AI chatbot, payments via Stripe, role-based dashboards, certificates, and a CI/CD pipeline that auto-deploys to AWS EC2.

## ✨ Features

- **Multi-role auth** — STUDENT, INSTRUCTOR, ADMIN, SUPER_ADMIN with email + password, Google OAuth, email OTP verification, forced password change, and silent token refresh via httpOnly cookies.
- **Course catalog** — browse by category, search, filter, cached listing pages.
- **Instructor flows** — create/edit courses, upload lesson videos (Cloudinary), build assignments and quizzes with question management.
- **Student learning** — enroll, watch lessons, submit assignments, take quizzes, get certificates.
- **Payments** — Stripe checkout for paid courses, webhook handling.
- **RAG chatbot** — ask questions about the platform/content; answers generated from an indexed corpus using embeddings (`@xenova/transformers`) + an LLM via OpenRouter, with Upstash Redis for storage.
- **Discussions & reviews** — per-course discussion threads and ratings.
- **Notifications** — inbox with a "view all" page.
- **Admin dashboard** — manage users, roles, status, courses, and discussions.
- **SEO** — metadata, Open Graph, sitemap, robots.txt.
- **CI/CD** — push to `main` triggers lint/build/test, builds Docker images, and deploys to EC2.

## 🛠 Tech Stack

### Frontend — `client/`
- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** + **shadcn/ui** (base-ui/Radix primitives)
- **TanStack Query** (server state), **TanStack Form** + **Zod** (forms), **TanStack Table** (data tables)
- **motion** (animations), **recharts** (charts), **sonner** (toasts), **lucide-react** (icons)
- **Axios** with a custom typed `httpClient` wrapper
- Testing: **Vitest** + **Testing Library**

### Backend — `server/`
- **Express 5** + **TypeScript** (ESM), **tsx** dev runtime
- **Prisma 7** with `@prisma/adapter-pg` (split schema across 17 files)
- **BetterAuth** (sessions, Google OAuth, email OTP)
- **Stripe** payments, **Cloudinary** file uploads, **Nodemailer** + EJS email templates
- **node-cron** scheduled jobs, **sanitize-html**, **pdfkit** (certificates)
- **RAG**: `@xenova/transformers` (embeddings) + OpenRouter LLM + Upstash Redis
- Testing: **Vitest**

### Infra
- **PostgreSQL 16**, **Docker + Docker Compose**, **Nginx**
- **GitHub Actions** (`.github/workflows/cicd.yml`) → Docker Hub → **AWS EC2**

## 📦 Getting Started

### Prerequisites
- [Bun](https://bun.sh) ≥ 1.x (client) and [pnpm](https://pnpm.io) ≥ 11 (server)
- Node.js ≥ 22
- PostgreSQL 16 (local or via Docker)
- Cloudinary, Stripe, SMTP (Gmail), Upstash Redis + OpenRouter keys (for RAG), Google OAuth client

### 1. Clone & install

```bash
git clone https://github.com/Tanvir-Bhuiyan00/Learnova.git
cd Learnova

cd client && bun install
cd ../server && pnpm install
```

### 2. Configure environment

```bash
cp client/.env.example client/.env.local
cp server/.env.example server/.env
```

Set the required values in both files (see [Environment Variables](#-environment-variables)).

### 3. Set up the database

```bash
cd server
pnpm generate
pnpm migrate dev
```

### 4. Run

```bash
# terminal 1 — server (port 5000)
cd server && pnpm dev

# terminal 2 — client (port 3000)
cd client && bun dev
```

Open http://localhost:3000.

## 🔐 Environment Variables

### Client (`client/.env.local`)
| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL, e.g. `http://localhost:5000/api/v1` |
| `JWT_ACCESS_SECRET` | Secret used to verify access tokens server-side |

### Server (`server/.env`)
See `server/.env.example` for the full annotated template. Key variables:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default `5000`) |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` | BetterAuth secret + public URL |
| `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` | JWT signing secrets + expiry |
| `EMAIL_SENDER_SMTP_*` | SMTP credentials for OTP / password-reset emails |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | Google OAuth |
| `FRONTEND_URL` | Allowed CORS origin |
| `CLOUDINARY_*` | Image/PDF uploads |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Payments |
| `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` | Bootstrap super admin |
| `REDIS_URL` / `OPENROUTER_API_KEY` / `OPENROUTER_LLM_MODEL` | RAG chatbot |

## 🗂 Project Structure

```
Learnova/
├── client/                  # Next.js 16 frontend (port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (commonLayout)/      # Public pages: home, courses, categories, about, FAQ, terms, privacy, instructors
│   │   │   ├── (dashboardLayout)/   # Role dashboards: student, instructor, admin
│   │   │   └── api/                 # Server-side actions (auth proxy, etc.)
│   │   ├── components/              # shadcn/ui + feature components
│   │   ├── services/                # One service per domain (uses httpClient)
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── zod/                     # Runtime validation schemas
│   │   └── lib/                     # httpClient, authUtils, utils
│   └── Dockerfile.prod
├── server/                  # Express 5 API (port 5000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── config/              # env validation
│   │   │   ├── middleware/          # checkAuth, validateRequest, error handling
│   │   │   ├── module/<domain>/     # route → controller → service (+ interface, validation)
│   │   │   └── templates/           # EJS email templates
│   │   ├── scripts/                 # seed-courses, index-rag, backfill-course-stats
│   │   └── server.ts
│   ├── prisma/schema/               # Split Prisma schema (17 files)
│   └── Dockerfile.prod
├── nginx/                  # Nginx site config (reverse proxy)
├── script/                 # Helper scripts (e.g. set-github-secrets.sh)
├── .github/workflows/cicd.yml
└── docker-compose.prod.yaml
```

## ✅ Development Commands

### Client (`client/`)
```bash
bun dev            # dev server on :3000
bun run build      # production build
bun run lint       # ESLint
bun run test:run   # Vitest (watch: bun run test)
```

### Server (`server/`)
```bash
pnpm dev           # hot-reload dev server on :5000
pnpm build         # prisma generate && tsc
pnpm lint          # ESLint
pnpm verify        # lint + typecheck + tests
pnpm migrate       # prisma migrate dev
pnpm studio        # prisma studio
pnpm seed:courses  # seed demo courses
pnpm index:rag     # rebuild RAG index
```

## 🚀 Deployment

CI/CD is configured via GitHub Actions: quality checks → build & push Docker images to Docker Hub → SSH deploy to an AWS EC2 instance running Docker Compose + Nginx.

See **[README.DEPLOYMENT.md](README.DEPLOYMENT.md)** for the full pipeline, EC2 setup, required GitHub secrets, and domain/HTTPS instructions.

## 📄 License

ISC
