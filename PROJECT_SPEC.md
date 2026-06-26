# OrderLink - Project Specification

## Vision

OrderLink is a lightweight web application for organizing office food
orders through a shareable public link.

## Goals

-   No account required for participants.
-   Create/share an order in under 30 seconds.
-   Mobile-first.
-   Persist data in PostgreSQL.
-   Public order links expire after 24 hours.

# Tech Stack

-   Next.js 15 (App Router)
-   React + TypeScript
-   TailwindCSS
-   shadcn/ui
-   Prisma ORM
-   PostgreSQL
-   Auth.js (admins only)
-   Zod
-   React Hook Form
-   TanStack Query

# Repository

``` text
apps/
web/
  app/
  components/
  lib/
  prisma/
  public/
```

# Roles

## Admin

-   Login
-   CRUD orders
-   Mark payments
-   Close/archive orders

## Participant

-   Open public link
-   Add/edit own items (10 min window)
-   View totals

# Business Rules

1.  Public links use nanoid(12).
2.  Links expire after 24h.
3.  Expired orders become read-only.
4.  Orders are soft-deleted.
5.  One participant can have many items.
6.  Totals are calculated server-side.

# Database

## users

-   id
-   email
-   name
-   password_hash
-   created_at
-   updated_at

## orders

-   id
-   public_id
-   restaurant
-   payer_name
-   currency
-   comments
-   deadline_at
-   expires_at
-   status
-   delivery_fee
-   tip
-   created_by
-   created_at
-   updated_at

## participants

-   id
-   order_id
-   display_name
-   payment_status
-   joined_at
-   updated_at

## participant_items

-   id
-   participant_id
-   product
-   quantity
-   unit_price
-   notes
-   created_at
-   updated_at

## restaurants

-   id
-   name
-   created_by
-   last_used

## audit_logs

-   id
-   order_id
-   user_id
-   action
-   payload
-   created_at

# Order Lifecycle

Draft -\> Open -\> Closed -\> Archived Draft -\> Cancelled

# API

## Auth

POST /api/auth/login POST /api/auth/logout

## Orders

GET /api/orders POST /api/orders GET /api/orders/:id PATCH
/api/orders/:id DELETE /api/orders/:id

## Public

GET /api/public/:token POST /api/public/:token/participant PATCH
/api/public/:token/item/:id DELETE /api/public/:token/item/:id

# UI

## Dashboard

-   Active orders
-   Today's orders
-   Recent restaurants
-   Statistics

## Create Order

Fields: - Restaurant - Deadline - Payer - Currency - Comments

Generate public URL immediately.

## Public Page

Header: - Restaurant - Countdown - Payer - Total

Participants list.

Floating button: Add Order.

## Add Participant

-   Name
-   Multiple items
-   Notes

## Item

-   Product
-   Qty
-   Unit Price
-   Notes

# Realtime

Initial version may poll every 5 seconds. Abstract updates behind
service for future WebSockets.

# Security

-   CSRF protection
-   Rate limit public endpoints
-   Validate all input with Zod
-   Soft deletes
-   UUID internal IDs
-   nanoid public IDs

# Environment

DATABASE_URL= AUTH_SECRET= NEXTAUTH_URL=

# Prisma

-   Initial migration
-   Seed with admin user

# Deployment

-   Node LTS
-   PostgreSQL
-   Reverse proxy (Nginx/Caddy)
-   PM2 or systemd

# Future

-   OCR menu import
-   PWA
-   QR codes
-   Payment integrations
-   CSV/PDF export
-   Multiple office groups

# Development Roadmap

## Phase 1

-   Bootstrap project
-   Prisma
-   Auth
-   Dashboard

## Phase 2

-   Order CRUD
-   Public links
-   Participants

## Phase 3

-   Payments
-   Totals
-   Expiration

## Phase 4

-   Audit
-   Statistics
-   Export

# Acceptance Criteria

-   Admin creates order in \<30 seconds.
-   Public link works without login.
-   Multiple participants can add items.
-   Totals always correct.
-   Expired links are read-only.
-   Responsive on mobile.
