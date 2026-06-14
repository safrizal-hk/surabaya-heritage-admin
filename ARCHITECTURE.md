# Architecture — surabaya-heritage-admin

**Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · Radix UI · React Leaflet  
**Pattern:** App Router, Client Components, Context API + localStorage as temporary data store

---

## Overview

`surabaya-heritage-admin` is a **web-based admin dashboard** for managing the content of the Surabaya Heritage mobile application. It is written in Next.js (App Router) with TypeScript and Tailwind CSS.

> **Current State — Mock/Prototype Phase**  
> The dashboard currently runs **entirely on the client side** using a `React Context + localStorage` store seeded with mock data. No real API calls are made yet. The next major step is integrating with the `surabaya-heritage-backend` REST API.

```
Browser
  └─► Next.js App Router (SSR shell)
        └─► Client Components ("use client")
              └─► DBContext (localStorage mock store)
                    └─► [Planned] → surabaya-heritage-backend REST API
```

---

## Project Structure

```
surabaya-heritage-admin/
├── app/
│   ├── layout.tsx              # Root layout: font setup, DBProvider, ToastProvider
│   ├── globals.css             # Global CSS tokens & base styles (Tailwind v4)
│   ├── page.tsx                # Root redirect (→ /login or /dashboard)
│   ├── login/
│   │   └── page.tsx            # Login page (email + password form)
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard shell: sidebar, topbar, breadcrumbs, auth guard
│   │   ├── page.tsx            # Dashboard overview (stats cards, recent places, recent reviews)
│   │   ├── places/
│   │   │   ├── page.tsx        # Place list (table, search, filter by category, sort, pagination)
│   │   │   ├── create/page.tsx # Create place form (with map picker)
│   │   │   └── [id]/
│   │   │       └── edit/page.tsx  # Edit place form + photo management
│   │   ├── categories/
│   │   │   └── page.tsx        # Category list + inline create/edit/delete
│   │   ├── reviews/
│   │   │   └── page.tsx        # Review list (table, search, rating filter)
│   │   └── users/
│   │       ├── page.tsx        # User list (table, search, role filter)
│   │       ├── create/page.tsx # Create user form
│   │       └── [id]/
│   │           └── edit/page.tsx  # Edit user form + avatar management
├── components/
│   ├── MapPicker.tsx           # Dynamic-import wrapper (disables SSR for Leaflet)
│   ├── MapPickerContent.tsx    # Leaflet map with click-to-pick-coordinate UX
│   └── ui/                     # shadcn-style primitive components
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── textarea.tsx
│       └── toast.tsx
├── lib/
│   ├── context.tsx             # DBContext: global state, CRUD operations, auth logic
│   └── utils.ts                # cn() utility (clsx + tailwind-merge)
├── public/                     # Static assets
├── next.config.ts
├── tsconfig.json
├── tailwind.config / postcss.config.mjs
└── ARCHITECTURE.md
```

---

## Routing (Next.js App Router)

| Route | Component | Access |
|-------|-----------|--------|
| `/` | `app/page.tsx` | Public — redirects to `/login` |
| `/login` | `app/login/page.tsx` | Public |
| `/dashboard` | `app/dashboard/page.tsx` | 🔒 Admin only |
| `/dashboard/places` | `app/dashboard/places/page.tsx` | 🔒 Admin only |
| `/dashboard/places/create` | `app/dashboard/places/create/page.tsx` | 🔒 Admin only |
| `/dashboard/places/[id]/edit` | `app/dashboard/places/[id]/edit/page.tsx` | 🔒 Admin only |
| `/dashboard/categories` | `app/dashboard/categories/page.tsx` | 🔒 Admin only |
| `/dashboard/reviews` | `app/dashboard/reviews` (inside `app/reviews/`) | 🔒 Admin only |
| `/dashboard/users` | `app/dashboard/users/page.tsx` | 🔒 Admin only |
| `/dashboard/users/create` | `app/dashboard/users/create/page.tsx` | 🔒 Admin only |
| `/dashboard/users/[id]/edit` | `app/dashboard/users/[id]/edit/page.tsx` | 🔒 Admin only |

**Auth Guard**: `app/dashboard/layout.tsx` checks `isAuthenticated` from `DBContext` on every render. If `false`, it immediately redirects to `/login` via `router.replace`.

---

## State Management — `lib/context.tsx`

All data lives in a single React Context (`DBContext`) backed by **`localStorage`** (as a temporary stand-in for the real API).

### Data Entities

| Entity | localStorage key | Description |
|--------|-----------------|-------------|
| `categories` | `sh_categories` | Heritage place categories |
| `places` | `sh_places` | Heritage place records |
| `placePhotos` | `sh_photos` | Photos linked to places |
| `reviews` | `sh_reviews` | User reviews |
| `users` | `sh_users` | User accounts (admin + user roles) |
| `bookmarks` | `sh_bookmarks` | User bookmarks |
| `currentUser` | `sh_current_user` | Authenticated admin session |

### Available Context Operations

```
Auth:
  login(email, password)         → { success, error? }
  logout()                       → void
  updateProfile(name, email, password?, avatarUrl?) → { success, error? }

Categories:
  createCategory(name, icon)     → Category
  updateCategory(id, name, icon) → Category | null
  deleteCategory(id)             → { success, error? }   ← blocks if places use category

Places:
  createPlace(placeData)         → Place
  updatePlace(id, placeData)     → Place | null
  deletePlace(id)                → boolean  ← cascades photos, reviews, bookmarks

Photos:
  addPhoto(placeId, url, caption, isPrimary) → PlacePhoto
  deletePhoto(photoId)           → boolean
  setPrimaryPhoto(placeId, photoId) → boolean

Reviews:
  createReview(placeId, userId, rating, comment) → Review  ← recalculates avg_rating
  updateReview(reviewId, rating, comment)        → Review | null
  deleteReview(reviewId)                         → boolean

Users:
  createUser(userData)           → { success, user?, error? }
  updateUser(id, userData)       → { success, user?, error? }
  deleteUser(id)                 → { success, error? }  ← cascades reviews, bookmarks
```

### Cascade Rules (in-memory)

| Operation | Cascade Effect |
|-----------|---------------|
| Delete Place | Removes associated `placePhotos`, `reviews`, `bookmarks` |
| Delete User | Removes associated `reviews`, `bookmarks`; recalculates `avg_rating` for affected places |
| Delete Category | **Blocked** if any place references it |
| Create/Update/Delete Review | Recalculates `avg_rating` & `review_count` on the parent `Place` |

---

## Component Architecture

### Layout Hierarchy

```
app/layout.tsx  (RootLayout)
  └─ DBProvider (context.tsx)
       └─ ToastProvider (components/ui/toast.tsx)
            ├─ app/login/page.tsx
            └─ app/dashboard/layout.tsx  (DashboardLayout)
                 ├─ Sidebar (nav links)
                 ├─ Topbar (breadcrumbs, profile dropdown, logout)
                 └─ <main> {children}
                       ├─ dashboard/page.tsx
                       ├─ dashboard/places/page.tsx
                       └─ ...
```

### UI Components (`components/ui/`)

Primitive, headless-style components built on **Radix UI** primitives, styled with Tailwind. Closely following the [shadcn/ui](https://ui.shadcn.com) pattern.

| Component | Radix Primitive | Usage |
|-----------|----------------|-------|
| `Avatar` | `@radix-ui/react-avatar` | User profile images |
| `Button` | `@radix-ui/react-slot` | All action buttons (with `variant` + `size` CVA) |
| `Dialog` | `@radix-ui/react-dialog` | Modal dialogs (confirm delete, create/edit forms) |
| `Select` | `@radix-ui/react-select` | Dropdown selects (category filter, role filter) |
| `Toast` | `@radix-ui/react-toast` | Success/error notification system |
| `Badge` | — | Status labels (role, active/inactive) |
| `Card` | — | Dashboard stat cards and content wrappers |
| `Input` | — | Text inputs |
<!-- | `Textarea` | — | Multi-line text inputs | -->

### Map Components (`components/MapPicker*`)

Leaflet (via `react-leaflet`) requires a browser DOM and cannot run in SSR. The solution is a two-file pattern:

- **`MapPicker.tsx`**: Uses `next/dynamic` with `ssr: false` to lazy-load the actual map at runtime.
- **`MapPickerContent.tsx`**: The real Leaflet component — renders an interactive `MapContainer`, listens for click events, and calls back with `{ lat, lng }` to populate form fields.

---

## Authentication Flow

```
1. User visits /dashboard/* → DashboardLayout checks isAuthenticated
2. If false → router.replace("/login")
3. Login page: admin enters email + password
4. DBContext.login() searches mock users array for matching email+password
   and verifies role === "admin"
5. On success: sets currentUser in state + localStorage("sh_current_user")
6. Dashboard is now accessible
7. Logout: clears currentUser from state + localStorage
```

> **⚠️ Current Limitation**: Passwords are stored as plain-text in the mock data and compared directly. This is for prototype purposes only. When integrating with the real backend, login will call `POST /api/auth/login` and store the returned JWT.

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.2.7 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| UI Primitives | Radix UI | various |
| Icons | lucide-react | ^1.17 |
| Table | @tanstack/react-table | ^8 |
| Maps | react-leaflet + leaflet | ^5 / ^1.9 |
| Class utilities | clsx + tailwind-merge | — |
| Fonts | Geist Sans + Geist Mono (next/font) | — |

---

## Planned: Backend Integration

The current `localStorage` context is a **temporary prototype**. The migration to the real Express backend (`surabaya-heritage-backend`) requires the following changes:

### What changes in `lib/context.tsx`

Replace every `localStorage` read/write with `fetch()` calls to the backend REST API:

| Current (mock) | Target (real API) |
|---------------|-------------------|
| `users.find(u => u.email === email)` | `POST /api/auth/login` → get JWT |
| `categories.map(...)` | `GET /api/categories` |
| `places.filter(...)` | `GET /api/places?search=&category=` |
| `reviews.filter(r => r.place_id === id)` | `GET /api/reviews?place_id=` |
| In-memory CRUD + `localStorage.setItem(...)` | `POST/PUT/DELETE /api/*` with `Authorization: Bearer <token>` header |

### New Admin-Specific Endpoints Needed in Backend

The current backend only exposes public read + user-authenticated write routes. A full admin namespace needs to be added:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/admin/places` | Create place |
| `PUT /api/admin/places/:id` | Update place |
| `DELETE /api/admin/places/:id` | Delete place |
| `POST /api/admin/places/:id/photos` | Upload place photo |
| `PUT /api/admin/categories/:id` | Update category |
| `POST /api/admin/categories` | Create category |
| `DELETE /api/admin/categories/:id` | Delete category |
| `DELETE /api/admin/reviews/:id` | Admin delete any review |
| `GET /api/admin/users` | List all users |
| `POST /api/admin/users` | Create user |
| `PUT /api/admin/users/:id` | Update user |
| `DELETE /api/admin/users/:id` | Delete user |
| `GET /api/admin/dashboard/stats` | Aggregate stats (counts) |

All admin endpoints must be protected by the `authMiddleware` **plus** a new `adminOnly` middleware checking `req.user.role === 'admin'`.

> **Note:** The PRD originally mentioned Drizzle ORM — this has been dropped in favor of using the **Supabase JS client directly** (matching what the backend already does). No ORM migration is needed.

---

## Known Limitations & Improvement Areas

- **No real persistence** — all data is in `localStorage`. A page clear or different browser loses data entirely.
- **Plain-text password comparison** in mock login — must not ship to production.
- **No server-side route protection** — auth guard runs client-side only. Add middleware or Next.js `middleware.ts` for server-enforced redirect.
- **No form validation library** — forms use manual validation. Add `react-hook-form` + `zod` as planned in the PRD.
- **Photos are URL strings only** — the photo management in the prototype accepts URL strings. Real photo upload will use `POST /api/upload/review-photo` (and a new admin upload endpoint).
- **TanStack Table is installed but usage may be partial** — audit table implementations to fully leverage column definitions, sorting state, and filtering state from the library rather than manual array operations.
