# ADR-0001: Client-Only Application Architecture

- **Status:** Accepted
- **Date:** 2026-07-11
- **Feature:** 001-cv-generator
- **Context:** A shopkeeper creates CVs for walk-in customers on a phone. Customer
  data is sensitive and one-off; the constitution mandates zero backend, zero
  persistence, mobile-first speed, and a fixed Next.js/TypeScript/Tailwind stack on
  Vercel's free tier. The app has exactly one concurrent user editing exactly one
  document, and a page refresh must be a clean slate for the next customer.

## Decision

An integrated client-only architecture with no escape hatches to server or storage:

- **Build/deploy**: Next.js 15+ (App Router) with `output: 'export'` — pure static
  files on Vercel free tier; no API routes, server actions, or request-time
  rendering. All interactive code behind a single `"use client"` boundary.
- **Dependencies**: none at runtime beyond Next.js, React, Tailwind. No UI kit, form
  library, state library, or PDF library; icons as inline SVG.
  > **Narrowed by [ADR-0003](./0003-client-side-pdf-generation.md) (2026-07-13):** the
  > "no PDF library / zero runtime deps" clause now admits a single, bounded exception —
  > `html-to-image` + `jspdf`, dynamically imported for **on-device** PDF export only.
  > All other clauses of this ADR (zero backend, zero persistence, nothing transmitted)
  > remain in force.
- **State**: one `CVDocument` object as the single source of truth, managed by a pure
  `useReducer` function exposed through one React Context (`CVProvider`). Section
  display order is the `sections` array order itself (no order field to drift).
- **Navigation**: a single route (`/`) with an in-memory `screen` enum
  (`gallery | form | preview`). No URL navigation between screens.
- **Data-loss guard**: `beforeunload` warning armed only while `hasAnyData(cv)` is
  true; nothing is ever persisted (`RESET` or refresh restores factory defaults).
- **Photo**: file input → canvas downscale (≤600px, JPEG q0.85) → base64 data URL in
  state; never transmitted.

## Consequences

### Positive

- Strongest possible privacy guarantee: customer data structurally cannot be stored
  or transmitted — the constitution's core promise is enforced by architecture, not
  policy.
- Zero hosting cost, zero server ops; deploy is a static upload.
- Pure reducer + pure emptiness predicates are the only logic that matters and are
  trivially unit-testable without DOM or infra.
- Single-route design makes state survival across screens a non-issue and keeps the
  Android back-gesture under the one controlled exit point (leave-site warning).
- Zero dependencies means no supply-chain surface, no version churn, and an app a
  future maintainer can read top to bottom.

### Negative

- No draft recovery: an accepted leave-site warning or crash loses the CV; the only
  mitigation is the warning itself (deliberate constitutional tradeoff).
- Context re-renders all consumers per keystroke; acceptable at this scale, but if
  typing ever lags the fix is per-section memoization, not a state library.
- No URLs means no deep-linking or browser-history navigation between screens —
  irrelevant for a single-operator tool but a hard constraint if requirements grow.
- `output: 'export'` forgoes `next/image` optimization (plain `<img>` used for the
  data-URL photo) and all future server-side options without amending this ADR and
  the constitution.

## Alternatives Considered

- **Alternative A — Hybrid Next.js (default output) + localStorage drafts**:
  rejected. Server surface invites constitution violations; localStorage would
  persist customer data on a shared shop phone (privacy regression) and violates
  Principle II outright.
- **Alternative B — Zustand/Jotai + React Hook Form + multi-route App Router**:
  rejected. Three dependencies and three mental models to solve problems this app
  does not have (one object, one user, one document); multi-route unmount/back-swipe
  behavior would fight the data-loss guard.
- **Alternative C — Vite + React SPA**: rejected. Functionally adequate, but the
  constitution fixes the stack to Next.js; deviation is a constitutional amendment
  with no offsetting benefit here.

## References

- Feature Spec: [specs/001-cv-generator/spec.md](../../specs/001-cv-generator/spec.md)
- Implementation Plan: [specs/001-cv-generator/plan.md](../../specs/001-cv-generator/plan.md) (Key Decisions 1, 2, 7)
- Research: [specs/001-cv-generator/research.md](../../specs/001-cv-generator/research.md) (R1–R3, R7, R8)
- Related ADRs: [ADR-0002](./0002-a4-print-output-strategy.md) (print strategy builds on this architecture)
- Evaluator Evidence: [history/prompts/001-cv-generator/0004-plan-cv-generator-implementation.plan.prompt.md](../prompts/001-cv-generator/0004-plan-cv-generator-implementation.plan.prompt.md)
