# Real-Time Collaboration Platform

## Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- Socket.IO Client
- React Hook Form
- Zod
- Framer Motion

### Backend
- NestJS
- MongoDB
- Mongoose
- Redis
- Socket.IO
- JWT + Auth0
- BullMQ
- Swagger
- Class Validator

### DevOps
- Turborepo
- Docker
- GitHub Actions
- ECS (Later)
- Vercel (Frontend Initially)
- Nginx

---

# Monorepo Structure

```txt
collab-platform/
│
├── apps/
│   ├── web/                         # Next.js Frontend
│   ├── api/                         # NestJS Backend
│   └── docs/                        # Documentation site (optional later)
│
├── packages/
│   ├── ui/                          # Shared UI components
│   ├── types/                       # Shared TypeScript types
│   ├── eslint-config/
│   ├── tsconfig/
│   ├── socket-events/
│   └── utils/
│
├── docker/
│   ├── nginx/
│   ├── mongodb/
│   └── redis/
│
├── scripts/
│
├── .github/
│   └── workflows/
│
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

# Frontend Structure (Next.js)

```txt
apps/web/src/
│
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── board/
│   ├── chat/
│   └── shared/
│
├── features/
│   ├── auth/
│   ├── workspace/
│   ├── projects/
│   ├── tasks/
│   ├── comments/
│   ├── notifications/
│   ├── sockets/
│   └── analytics/
│
├── hooks/
├── lib/
│   ├── api/
│   ├── socket/
│   ├── auth/
│   ├── query/
│   └── utils/
│
├── providers/
├── store/
│   ├── auth.store.ts
│   ├── workspace.store.ts
│   ├── task.store.ts
│   └── socket.store.ts
│
├── styles/
├── types/
└── constants/
```

---

# Backend Structure (NestJS)

```txt
apps/api/src/
│
├── common/
│   ├── decorators/
│   ├── dto/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── middleware/
│   ├── pipes/
│   ├── utils/
│   ├── constants/
│   └── interfaces/
│
├── config/
│
├── database/
│   ├── schemas/
│   ├── migrations/
│   └── seeders/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── workspace/
│   ├── projects/
│   ├── tasks/
│   ├── comments/
│   ├── notifications/
│   ├── activity/
│   ├── sockets/
│   ├── analytics/
│   ├── uploads/
│   └── ai/
│
├── jobs/
│   ├── queues/
│   ├── processors/
│   └── schedulers/
│
├── redis/
├── socket/
├── app.module.ts
└── main.ts
```

---

# Initial Database Collections

## users
- name
- email
- avatar
- role
- authProvider
- lastSeen
- createdAt

## workspaces
- name
- slug
- ownerId
- members
- settings

## projects
- workspaceId
- name
- description
- statuses
- members

## tasks
- projectId
- title
- description
- priority
- status
- assignee
- dueDate
- labels
- activity

## comments
- taskId
- userId
- message
- mentions

## notifications
- userId
- type
- payload
- isRead

## activityLogs
- actorId
- entityType
- entityId
- action
- metadata

---

# Zustand Store Strategy

## Keep Zustand Small

Use Zustand ONLY for:
- auth state
- UI state
- modal state
- websocket connection state
- optimistic updates
- board drag state

DO NOT store server state in Zustand.

Use TanStack Query for:
- API data
- caching
- invalidation
- pagination
- mutations
- optimistic updates

---

# TanStack Query Best Practices

## Query Keys

```ts
['workspace', workspaceId]
['project', projectId]
['tasks', projectId]
['task', taskId]
```

## Folder Structure

```txt
features/tasks/api/
├── get-tasks.ts
├── create-task.ts
├── update-task.ts
└── delete-task.ts
```

## Mutation Pattern

```ts
useMutation({
  mutationFn,
  onMutate,
  onSuccess,
  onError,
  onSettled,
})
```

---

# Authentication Architecture

## Auth0 Flow

Frontend:
- Auth0 login
- obtain access token
- send token to NestJS

Backend:
- validate JWT
- attach user context
- RBAC guards

Roles:
- owner
- admin
- member
- guest

---

# Realtime Architecture

## Socket Rooms

```txt
workspace:{workspaceId}
project:{projectId}
task:{taskId}
```

## Events

### Client → Server
- task:create
- task:update
- comment:create
- typing:start
- typing:stop

### Server → Client
- task:created
- task:updated
- comment:created
- user:online
- notification:new

---

# Redis Usage

## Use Redis For
- websocket scaling
- caching
- online users
- rate limiting
- BullMQ
- presence system

---

# Feature Phases

# PHASE 1 — MVP FOUNDATION

## Goal
Build deployable SaaS foundation.

## Features
- Monorepo setup
- Auth0 authentication
- Workspace CRUD
- Project CRUD
- Task CRUD
- Dashboard layout
- Role-based access
- MongoDB schemas
- Shared UI components
- TanStack Query setup
- Zustand setup

## Deliverable
A usable collaboration SaaS.

---

# PHASE 2 — REALTIME EXPERIENCE

## Goal
Make application feel alive.

## Features
- Socket.IO integration
- Realtime task updates
- Online users
- Presence tracking
- Typing indicators
- Realtime comments
- Activity feed
- Notification system
- Optimistic updates

## Deliverable
Realtime collaborative workspace.

---

# PHASE 3 — PRODUCTION FEATURES

## Goal
Show strong engineering depth.

## Features
- Redis caching
- BullMQ queues
- Email notifications
- File uploads
- Audit logs
- Rate limiting
- API versioning
- Error handling
- Logging system
- Feature flags
- Pagination
- Search and filters

## Deliverable
Production-grade architecture.

---

# PHASE 4 — AI + SCALING

## Goal
Modern engineering wow factor.

## Features
- AI task summaries
- AI sprint planning
- AI task generation
- AI smart labels
- Analytics dashboard
- Team productivity metrics
- Webhook system
- Background jobs
- Advanced caching

## Deliverable
AI-enhanced SaaS platform.

---

# PHASE 5 — DEPLOYMENT + RESUME POLISH

## Goal
Make project resume-ready.

## Features
- Dockerization
- CI/CD pipeline
- ECS deployment
- Nginx reverse proxy
- CloudWatch logging
- Production environment configs
- README documentation
- Architecture diagrams
- Screenshots
- Demo video

## Deliverable
Portfolio-grade flagship project.

---

# NestJS Best Practices

## Architecture
- Keep modules isolated
- Use DTO validation everywhere
- Separate service and repository logic
- Use guards for RBAC
- Use interceptors for response formatting
- Keep controllers thin
- Use config module
- Centralized exception handling

## Validation
- class-validator
- class-transformer

## Security
- Helmet
- CORS
- Rate limiting
- JWT validation
- Input sanitization

## Performance
- Redis caching
- Pagination
- Lean Mongo queries
- Queue heavy tasks

---

# Next.js Best Practices

## Architecture
- Feature-first structure
- Server components where possible
- Client components only when needed
- Keep API layer separated
- Shared UI package

## State Management
- TanStack Query for server state
- Zustand for UI state only

## Performance
- Dynamic imports
- Lazy loading
- Optimistic updates
- Memoization where needed

## UI Strategy
- shadcn/ui base components
- Reusable design system
- Consistent spacing
- Keyboard shortcuts later

---

# Recommended Initial Pages

## Public
- Landing page
- Login
- Signup

## Dashboard
- Overview
- Workspace settings
- Project board
- Task details
- Notifications
- User profile

---

# Resume-Optimized Features

Prioritize these because recruiters love them:

- WebSockets
- Realtime synchronization
- RBAC
- Redis
- Queues
- Optimistic UI
- Activity feed
- AI integration
- Docker
- CI/CD
- Deployment
- Scalable architecture

---

# Final Goal

You are NOT building:
- a tutorial clone
- a basic CRUD app
- a perfect startup

You ARE building:
- a production-style SaaS platform
- a strong architecture portfolio piece
- a resume flagship project
- a system you can confidently explain in interviews

