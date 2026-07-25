# LIT Distribution Platform

Private internal distribution system for managing ordering between company stores,
warehouses, delivery drivers, and headquarters.

## Status

Pre-implementation. This repository currently contains planning documentation only.
See [`documentation/architecture/walking-skeleton.md`](documentation/architecture/walking-skeleton.md)
for the build plan.

## Intended architecture

| Component | Stack |
| --- | --- |
| Mobile (Android first) | Flutter, Dart, Riverpod, GoRouter, Dio, Drift |
| Headquarters dashboard | Next.js, TypeScript, Tailwind, shadcn/ui |
| API | Fastify, TypeScript, Node.js LTS, Zod |
| Database | PostgreSQL + Drizzle ORM |
| Queue / cache | Redis, BullMQ |
| Point of sale sync | Clover APIs and webhooks |

## Planned repository layout

```
apps/
  mobile/          Flutter application
  admin/           Next.js headquarters dashboard
  api/             Fastify backend
packages/
  database/        Drizzle schema, migrations, seed
  api-contracts/   Zod schemas shared across TypeScript apps
infrastructure/
  docker/          Local Postgres + Redis
documentation/
```

## Core principle

Inventory is tracked through an **immutable movement ledger**, never a single editable
quantity field. For any quantity change the system must be able to answer: what
changed, who changed it, why, which order caused it, which location was affected, and
the balance before and after.

## Local toolchain

Flutter 3.44.6 · Dart 3.12.2 · Android SDK 36 · Node 24.16 · pnpm 11.7 · Docker 29 · Java 25
