# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FreshMarket (branded as Horto Píncaro) is a Portuguese fresh-produce e-commerce platform. It is a monorepo with a .NET 9 backend and a React/Vite frontend.

## Development Commands

### Backend

```bash
# Start API with hot reload (from repo root or src/FreshMarket.Web)
dotnet watch run --project src/FreshMarket.Web

# Build solution
dotnet build

# Run all tests
dotnet test

# Run a single test class
dotnet test --filter "FullyQualifiedName~ClassName"

# EF Core migrations (run from src/FreshMarket.Web)
dotnet ef migrations add <MigrationName> --project ../FreshMarket.Infrastructure
dotnet ef database update
```

### Frontend

```bash
cd freshmarket-web
npm run dev       # Vite dev server on :5173
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Local Startup (all services)

```powershell
# Starts Redis Docker container + backend + frontend in separate windows
./start.ps1
```

**Infrastructure required locally:** PostgreSQL, Redis (Docker via `start.ps1`), optional SMTP.

## Architecture

### Backend – Clean Architecture

```
src/
  FreshMarket.Domain/          # Entities, enums, DomainException, BaseEntity (soft delete)
  FreshMarket.Application/     # MediatR handlers, FluentValidation, Mapster DTOs, service interfaces
  FreshMarket.Infrastructure/  # EF Core + Npgsql, Redis, JWT TokenService, payment providers, email
  FreshMarket.Web/             # ASP.NET 9 – endpoints, middleware, Program.cs
tests/
  FreshMarket.Tests/           # xUnit, NSubstitute, FluentAssertions, SQLite
```

**Dependency direction:** Domain ← Application ← Infrastructure ← Web

**Request flow:** HTTP → Endpoint group → MediatR → Command/Query handler → Domain / Infrastructure

**Endpoint auto-routing:** All classes deriving from `EndpointGroupBase` are discovered automatically. They map to `/api/{ClassName}` (or `/api/admin/{ClassName}` for classes under `Endpoints/Admin/`). Use the `IEndpointRouteBuilderExtensions` helpers (`MapGet`, `MapPost`, etc.) inside each class.

**Auth:** JWT Bearer tokens. Roles: `Customer`, `Admin`, `SuperAdmin`. Authorization policies are `CustomerPolicy`, `AdminPolicy`, `SuperAdminPolicy` defined in `Program.cs`. Auth endpoints are rate-limited (10 req/min fixed window).

**Payment providers:** `IPaymentProvider` / `IPaymentProviderFactory` factory pattern in Infrastructure. Three providers: `StripePaymentProvider`, `MbWayPaymentProvider`, `CashPaymentProvider`. Webhook handling in `Endpoints/Webhooks.cs`.

**Soft deletes:** `BaseEntity` has `DeletedAt`. Global EF query filter excludes soft-deleted records.

**Background jobs:** `OrderCleanupJob` (IHostedService) cleans expired unpaid orders.

### Frontend – Feature-based React SPA

```
freshmarket-web/src/
  api/client.ts        # Axios instance; auto-attaches Bearer token, handles 401 + token refresh
  features/            # auth, cart, admin, notifications, payments, theme (each has context + hook)
  pages/               # Route-level page components
  routes/              # AppRouter.tsx, AdminRoute.tsx (route guards)
  components/          # Shared UI components and layout
  lib/                 # endpoints.ts (API URL constants), dates.ts, color.ts, labels.ts
  i18n/locales/        # en.json and pt.json (i18next)
  types/               # Shared TypeScript types
```

**State:** React Context API for auth, cart, theme, notifications. `localStorage` holds `accessToken`, `refreshToken`, and `user`.

**Token refresh:** `api/client.ts` response interceptor handles 401s – queues in-flight requests, refreshes the token, then retries. On refresh failure it clears storage and navigates to `/auth`.

**API base URL:** `VITE_API_URL` env var (falls back to `http://localhost:5045`).

**Styling:** Tailwind CSS v4 with a custom emerald palette (primary: `#047857`). Font: Plus Jakarta Sans.

## Configuration

**Backend** – `appsettings.Development.json` is git-tracked with dev credentials (Postgres, Redis, Stripe test keys). Production secrets are injected via environment variables (Railway).

**Frontend** – Copy `.env.example` to `.env` and set `VITE_API_URL`.

**Secrets/env vars needed:** `ConnectionStrings__DefaultConnection`, `Jwt__Secret`, `Stripe__SecretKey`, `Stripe__WebhookSecret`, `MbWay__Key`, `Redis__ConnectionString`, `Email__Smtp__*`.

## Key Conventions

- Application layer uses **MediatR** for all commands/queries. Add new features as `Commands/` or `Queries/` folders under `src/FreshMarket.Application/{Feature}/`.
- **FluentValidation** validators live alongside their command/query classes.
- **Mapster** config is in `Application/Common/Mapping/`.
- Frontend API calls go through `src/lib/endpoints.ts` constants – don't hardcode paths.
- Admin-only frontend routes are wrapped in `<AdminRoute>`.
- i18n strings live in `src/i18n/locales/en.json` and `pt.json`; add keys to both when adding UI text.
