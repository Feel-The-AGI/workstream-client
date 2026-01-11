# Workstream Client (Frontend)

A Turborepo monorepo containing all frontend applications for the Workstream platform - a demand-driven education-to-employment system for Ghana.

## What's Inside

This monorepo contains **4 Next.js apps** and **shared packages**:

### Apps

| App | Port | Purpose |
|-----|------|---------|
| **student** | 3001 | Student portal - browse programs, apply, track applications |
| **university** | 3002 | University admin - manage programs, review applicants |
| **employer** | 3003 | Employer admin - review candidates, approve hires |
| **admin** | 3004 | Platform admin - manage entire system |

### Packages

| Package | Purpose |
|---------|---------|
| **@workstream/ui** | Shared UI components (buttons, cards, forms) |
| **typescript-config** | Shared TypeScript configs |
| **eslint-config** | Shared ESLint configs |

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **Turbopack** | Fast bundler for development |
| **Turborepo** | Monorepo management |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Styling |
| **Clerk** | Authentication |
| **Uploadthing** | File uploads |
| **pnpm** | Package manager |

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Environment Variables

Create `.env.local` in each app that needs it (at minimum, `apps/student/.env.local`):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Backend API
NEXT_PUBLIC_API_URL="http://localhost:8000/api/v1"

# Uploadthing (for document uploads)
UPLOADTHING_TOKEN="..."
```

### 3. Run Development Server

```bash
# Run all apps
pnpm dev

# Or run specific apps
pnpm --filter @workstream/student dev     # Port 3001
pnpm --filter @workstream/university dev  # Port 3002
pnpm --filter @workstream/employer dev    # Port 3003
pnpm --filter @workstream/admin dev       # Port 3004
```

## Project Structure

```
workstream-client/
├── apps/
│   ├── student/          # Student portal
│   │   ├── src/app/      # Next.js App Router pages
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── dashboard/        # Student dashboard
│   │   │   ├── programs/         # Browse & apply to programs
│   │   │   ├── applications/     # Track applications
│   │   │   ├── documents/        # Upload documents
│   │   │   ├── profile/          # Edit profile
│   │   │   ├── messages/         # Messaging
│   │   │   └── payments/         # Payment callbacks
│   │   └── src/lib/
│   │       ├── api.ts            # Backend API client
│   │       └── uploadthing.ts    # File upload config
│   │
│   ├── university/       # University admin portal
│   │   └── src/app/
│   │       ├── page.tsx          # Dashboard
│   │       └── applications/     # Review applicants
│   │
│   ├── employer/         # Employer portal
│   │   └── src/app/
│   │       └── page.tsx          # Dashboard + candidates
│   │
│   └── admin/            # Platform admin
│       └── src/app/
│           └── page.tsx          # Dashboard + management
│
├── packages/
│   └── ui/               # Shared components
│       └── src/components/
│           ├── button.tsx
│           ├── card.tsx
│           ├── input.tsx
│           ├── select.tsx
│           └── ...
│
├── turbo.json            # Turborepo config
├── pnpm-workspace.yaml   # Workspace config
└── package.json          # Root package
```

## Key Features by Portal

### Student Portal (localhost:3001)
- **Landing Page** - Browse featured programs
- **Programs** - Search, filter, view details, apply
- **Dashboard** - Application status, quick actions
- **Profile** - Multi-step setup (personal info, education, grades)
- **Documents** - Upload transcripts, certificates, CV
- **Applications** - Track status with timeline view
- **Messages** - Communicate with admins

### University Portal (localhost:3002)
- **Dashboard** - Stats (programs, applications, pending review)
- **Programs** - Create, edit, publish training programs
- **Applications** - Review, shortlist, reject applicants
- **Candidate View** - See documents, motivation letters

### Employer Portal (localhost:3003)
- **Dashboard** - Stats (candidates, pending review, hired)
- **Candidates** - Review shortlisted candidates
- **Interviews** - Schedule and score interviews
- **Hiring** - Approve or reject final candidates

### Admin Portal (localhost:3004)
- **Dashboard** - Platform-wide stats
- **Users** - Manage all users, assign roles
- **Universities** - Add/edit partner universities
- **Employers** - Add/edit partner employers
- **Programs** - Oversee all programs
- **Applications** - View all applications

## Authentication Flow

1. User clicks "Sign In" → Clerk modal opens
2. After auth, Clerk syncs with backend (`/api/v1/auth/sync`)
3. Backend creates/updates user record
4. Frontend uses `getToken()` to get JWT for API calls

## API Integration

Each app has an `api.ts` file with typed API functions:

```typescript
// Example usage in a component
const { getToken } = useAuth();
const token = await getToken();
const { programs } = await api.programs.list();
const { application } = await api.applications.create(token, { programId });
```

## UI Conventions

- **Gold/Amber (#f59e0b)** - Primary brand color
- **Buttons** - Gold border only (not filled)
- **Cards** - White with shadow depth
- **Forms** - Multi-step patterns for complex flows

## Scripts

```bash
pnpm dev          # Run all apps in development
pnpm build        # Build all apps
pnpm lint         # Lint all apps
pnpm add <pkg> --filter @workstream/student  # Add dep to specific app
```

## Adding a New Shared Component

1. Create component in `packages/ui/src/components/`
2. Export from `packages/ui/src/index.ts`
3. Import in apps: `import { Button } from "@workstream/ui"`

## Environment Variables Reference

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | All apps | Clerk frontend auth |
| `CLERK_SECRET_KEY` | All apps | Clerk backend auth |
| `NEXT_PUBLIC_API_URL` | All apps | Backend API endpoint |
| `UPLOADTHING_TOKEN` | student | File upload service |

## Need Help?

- **Styling**: Check Tailwind classes, custom colors in globals.css
- **Auth issues**: Verify Clerk keys match between frontend & backend
- **API errors**: Check backend is running on port 8000
- **Types**: Run `pnpm install` to sync workspace packages
