# Backend System Requirements — Harmony Hub Admin Area

This document defines the full system requirements for building the backend that powers the **Harmony Hub** admin area frontend. Use it as the single source of truth for API design, data models, security, and non-functional requirements.

**Related docs:** [FEATURES_AND_FUNCTIONALITY.md](./FEATURES_AND_FUNCTIONALITY.md) (frontend features), [README_ENV.md](../README_ENV.md) (frontend API configuration).

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Architecture & Integration](#2-architecture--integration)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Functional Requirements](#4-functional-requirements)
5. [API Contract (Endpoints)](#5-api-contract-endpoints)
6. [Data Models](#6-data-models)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Security Requirements](#8-security-requirements)
9. [Deployment & Environment](#9-deployment--environment)
10. [Glossary & References](#10-glossary--references)

---

## 1. Purpose & Scope

### 1.1 Purpose

The backend must:

- Serve the existing **Harmony Hub** React/Vite frontend (admin area).
- Provide a **RESTful API** that matches the frontend’s `apiClient` usage (base URL, JSON, Bearer token).
- Persist and manage: **users**, **pages/templates**, **applications**, **payments**, **allocations**, **expenses**, **reports**, **dashboard stats**, and **activity**.
- Enforce **authentication** and **role-based permissions** on every protected endpoint.

### 1.2 Out of Scope (for this document)

- Public-facing form submission site (if separate from admin).
- Real-time collaboration or WebSockets (unless explicitly added later).
- Choice of programming language, framework, or database (requirements are contract-first).

---

## 2. Architecture & Integration

### 2.1 Client Integration

- **Base URL:** Configurable. Frontend uses `VITE_API_URL` (e.g. `https://api.yourdomain.com` or `http://localhost:3000/api`).
- **Protocol:** HTTPS in production; HTTP allowed in development.
- **Request format:** JSON (`Content-Type: application/json`).
- **Response format:** JSON for success and error payloads.
- **Auth:** `Authorization: Bearer <token>` on all protected requests.
- **Timeout:** Frontend default 30 seconds (`VITE_API_TIMEOUT`); backend should respond within a reasonable time or return appropriate status.

### 2.2 High-Level Components

The backend SHALL provide:

| Component            | Responsibility |
|----------------------|----------------|
| **Auth service**     | Login, logout, token issue/refresh, 2FA (send/verify code, enable/disable). |
| **User service**     | CRUD users, list with search; role and status. |
| **Page/Template service** | CRUD pages and templates; publish/unpublish; link templates; duplicate; view counts. |
| **Application service**   | CRUD applications; submit; status workflow; form data and applicant extraction. |
| **Payment service**      | CRUD payments; status updates; summaries by user/application. |
| **Allocation service**   | CRUD allocations; status workflow; link to applications. |
| **Expense service**     | Query expenses; summaries and chart data by user/date range. |
| **Dashboard service**   | Aggregated stats and recent activity. |
| **Reports service**     | Generate documents (e.g. approval sheet, status report, allocations report, bill/invoice, certificate). |

---

## 3. Authentication & Authorization

### 3.1 Authentication

- **Login:** Email + password. On success, return a **JWT** (or equivalent) and minimal user payload (id, email, name, role, permissions, twoFactorEnabled, etc.).
- **Token storage:** Client stores token (e.g. localStorage) and sends it as `Authorization: Bearer <token>`.
- **Session persistence:** Handled via token validity; optional refresh token strategy as needed.
- **Logout:** Client discards token; backend may blacklist token or rely on expiry.

### 3.2 Two-Factor Authentication (2FA)

- **Send code:** Request sends 6-digit code to user’s registered email; backend stores code with short TTL (e.g. 10 min).
- **Verify code:** Endpoint accepts email + code; validates and returns success/failure.
- **Enable 2FA:** After verification, set `twoFactorEnabled` for user; optionally return a secret for TOTP if needed later.
- **Disable 2FA:** Require re-verification (e.g. code or password), then set `twoFactorEnabled: false`.
- **Login with 2FA:** If user has 2FA enabled, after password check return a “requires_2fa” state and do not issue full token until 2FA step is completed.

### 3.3 Authorization (Roles & Permissions)

- **Roles:** At least **admin**, **user**. Optional extended roles: **viewer**, **editor**, **land_administrator** (see frontend features doc).
- **Permissions:** Backend SHALL enforce the same permission model the frontend uses:

| Resource     | Actions |
|-------------|---------|
| pages       | view, create, edit, delete, publish |
| users       | create, edit, delete |
| templates   | create, edit, delete |
| settings    | view, edit |
| applications| view, submit, edit |
| reports     | view, generate |
| payments    | view, manage |
| allocations | view, manage |

- **Enforcement:** Every protected endpoint SHALL check that the authenticated user’s role (or resolved permissions) allows the requested action; return **403 Forbidden** when not allowed.
- **Land Administrator:** If supported, may see/manage all pages regardless of owner.

---

## 4. Functional Requirements

### 4.1 Dashboard

- **Stats:** Return aggregated counts: totalTemplates, publishedPages, totalUsers, completionRate (or equivalent).
- **Recent activity:** Return a list of recent actions (e.g. template created, page published, user added) with id, action text, time, icon identifier.

### 4.2 Pages & Templates

- **List:** Return all pages/templates for the user (or all for land_admin); support filtering by status (published/draft) and search (title/slug).
- **Get by ID:** Return single page/template with full `elements` (form builder schema).
- **Create page:** Accept title, slug, description, status, category, etc.; create and return the page.
- **Create/save template:** Accept elements (FormElement[]), optional userId, optional title; create or update template; return saved entity.
- **Link templates:** Accept ordered templateIds and page metadata (title, slug, description, status, category); create a new page with combined elements; return page.
- **Update:** Update page or template (metadata and/or elements).
- **Publish:** Set status to published, set publishedAt.
- **Unpublish:** Set status to draft; clear or keep publishedAt for history.
- **Duplicate:** Create a copy of a page/template with new id and draft status.
- **Delete:** Soft or hard delete; ensure only allowed by permission.
- **View count:** Increment view count when a published page is viewed (if required by product).

### 4.3 Users

- **List:** Return users with search (name, email); include role, status, joinedAt, permissions (or derived from role).
- **Get by ID:** Return one user.
- **Create:** Accept name, email, role, optional status; create user (and optionally send invite); return user.
- **Update:** Update name, email, role, status, permissions (if overridable).
- **Delete:** Remove or deactivate user; enforce permission.

### 4.4 Applications

- **List:** Filter by userId, pageId, status.
- **Get by ID:** Return application with formData, applicant, status history if needed.
- **Create:** Accept type, title, description, applicant, formData, pageId, userId, etc.
- **Submit:** Create or update application and set status to submitted; set submittedAt.
- **Update status:** Accept status (e.g. under_review, approved, rejected) and optional rejectionReason; set reviewedAt/approvedAt/rejectedAt as appropriate.
- **Status history:** Return list of status changes (who, when, what).

### 4.5 Payments

- **List:** Filter by userId, applicationId; support status filter.
- **Get by ID:** Return single payment.
- **Create:** Accept amount, currency, status, paymentMethod, applicationId, userId, dueDate, description, feeType, etc.
- **Update status:** Set status (e.g. paid, failed, refunded); set paidAt when status is paid.
- **Summary:** Return totals by status (total, paid, pending, failed, refunded) for a user or globally.

### 4.6 Allocations

- **List:** Filter by userId, applicationId, status.
- **Get by ID:** Return single allocation.
- **Create:** Accept applicationId, userId, type, status, location, parcelNumber, size, details, etc.
- **Update status:** Set status (e.g. pending, allocated, completed, cancelled); set allocatedAt, completedAt, cancelledAt as appropriate.
- **Stats:** Return counts by status for a user or globally.

### 4.7 Expenses

- **List:** By userId; optional date range.
- **Chart data:** By userId and period (e.g. last N days) for charts.
- **Summary:** Totals and breakdown by type/status for a user and period.

### 4.8 User Dashboard & Progress

- **User dashboard stats:** Aggregated applications, allocations, payments, expenses, and progress metrics for a given user.
- **Progress metrics:** Counts for applications (submitted, approved, rejected, pending), payments (paid, pending, overdue), allocations (allocated, pending, completed).

### 4.9 Reports

- **Generate approval sheet:** Application (and optional allocation); return PDF or URL.
- **Generate status report:** Application; return PDF or URL.
- **Generate allocations report:** Application; return PDF or URL.
- **Generate bill/invoice:** Application; type bill or invoice; return PDF or URL.
- **Generate certificate:** Application (e.g. approved only); return PDF or URL.

Reports may be implemented as synchronous (return file/URL) or asynchronous (return job id, then poll for result); contract should be explicit.

### 4.10 Settings (Optional)

- **Profile:** Update name, email for current user.
- **Password:** Change password (current + new).
- **Notifications:** Save email/push notification preferences.
- **Account deletion:** Delete current user after confirmation (and optionally soft-delete).

---

## 5. API Contract (Endpoints)

Base path: `/api` or as configured (frontend uses `VITE_API_URL` pointing at base).

### 5.1 Auth

| Method | Endpoint            | Description                | Auth   |
|--------|---------------------|----------------------------|--------|
| POST   | /auth/login         | Email + password; return token + user | No  |
| POST   | /auth/logout        | Invalidate token (optional)           | Yes |
| POST   | /auth/refresh       | Refresh access token (optional)      | Yes |
| POST   | /auth/2fa/send      | Send 2FA code to email               | Yes |
| POST   | /auth/2fa/verify    | Verify 2FA code                      | Yes |
| POST   | /auth/2fa/enable   | Enable 2FA (after verify)            | Yes |
| POST   | /auth/2fa/disable  | Disable 2FA (after verify)           | Yes |

### 5.2 Dashboard

| Method | Endpoint             | Description           | Auth |
|--------|----------------------|-----------------------|------|
| GET    | /dashboard/stats     | totalTemplates, publishedPages, totalUsers, completionRate | Yes |
| GET    | /dashboard/activity  | Recent activity list  | Yes |

### 5.3 Pages / Templates

| Method | Endpoint                    | Description              | Auth |
|--------|-----------------------------|--------------------------|------|
| GET    | /pages                      | List pages/templates (query: status, search) | Yes |
| GET    | /pages/:id                  | Get one page/template    | Yes |
| POST   | /pages                      | Create page              | Yes |
| PUT    | /pages/:id                  | Update page/template     | Yes |
| PATCH  | /pages/:id                  | Partial update           | Yes |
| DELETE | /pages/:id                  | Delete                   | Yes |
| POST   | /pages/:id/publish          | Publish                  | Yes |
| POST   | /pages/:id/unpublish        | Unpublish                | Yes |
| POST   | /pages/:id/duplicate        | Duplicate                | Yes |
| POST   | /templates                  | Save template (elements)| Yes |
| POST   | /pages/link-templates       | Link templates → page   | Yes |

### 5.4 Users

| Method | Endpoint       | Description        | Auth |
|--------|----------------|--------------------|------|
| GET    | /users         | List (query: search)| Yes |
| GET    | /users/:id     | Get one            | Yes |
| POST   | /users         | Create             | Yes |
| PUT    | /users/:id     | Update             | Yes |
| DELETE | /users/:id     | Delete             | Yes |

### 5.5 Applications

| Method | Endpoint                  | Description        | Auth |
|--------|---------------------------|--------------------|------|
| GET    | /applications             | List (userId, pageId, status) | Yes |
| GET    | /applications/:id        | Get one            | Yes |
| POST   | /applications             | Create             | Yes |
| POST   | /applications/submit      | Submit (create/update + set submitted) | Yes |
| PATCH  | /applications/:id/status | Update status      | Yes |
| GET    | /applications/:id/history | Status history     | Yes |
| GET    | /applications/stats       | Stats (e.g. by status) | Yes |

### 5.6 Payments

| Method | Endpoint            | Description     | Auth |
|--------|---------------------|-----------------|------|
| GET    | /payments           | List (userId, applicationId) | Yes |
| GET    | /payments/:id       | Get one         | Yes |
| POST   | /payments           | Create          | Yes |
| PATCH  | /payments/:id/status| Update status  | Yes |
| GET    | /payments/summary   | Summary totals  | Yes |

### 5.7 Allocations

| Method | Endpoint               | Description | Auth |
|--------|------------------------|-------------|------|
| GET    | /allocations           | List        | Yes |
| GET    | /allocations/:id       | Get one     | Yes |
| POST   | /allocations           | Create      | Yes |
| PATCH  | /allocations/:id/status| Update status | Yes |
| GET    | /allocations/stats     | Stats       | Yes |

### 5.8 Expenses

| Method | Endpoint             | Description     | Auth |
|--------|----------------------|-----------------|------|
| GET    | /expenses            | List by user/date | Yes |
| GET    | /expenses/chart      | Chart data      | Yes |
| GET    | /expenses/summary    | Summary         | Yes |

### 5.9 User Dashboard & Progress

| Method | Endpoint                    | Description     | Auth |
|--------|-----------------------------|-----------------|------|
| GET    | /users/:id/dashboard-stats  | Aggregated stats | Yes |
| GET    | /users/:id/progress-metrics | Progress metrics | Yes |

### 5.10 Reports

| Method | Endpoint                              | Description     | Auth |
|--------|---------------------------------------|-----------------|------|
| POST   | /reports/approval-sheet               | Body: applicationId, allocationId? | Yes |
| POST   | /reports/status-report                | Body: applicationId | Yes |
| POST   | /reports/allocations-report           | Body: applicationId | Yes |
| POST   | /reports/bill-invoice                 | Body: applicationId, type (bill\|invoice) | Yes |
| POST   | /reports/certificate                  | Body: applicationId | Yes |

Return: PDF binary (with appropriate `Content-Disposition`) or JSON with URL to download.

### 5.11 Settings (Optional)

| Method | Endpoint             | Description     | Auth |
|--------|----------------------|-----------------|------|
| GET    | /me                  | Current user    | Yes |
| PATCH  | /me                  | Update profile  | Yes |
| POST   | /me/change-password  | Change password | Yes |
| DELETE | /me                  | Delete account  | Yes |

### 5.12 Error Responses

- **4xx/5xx:** JSON body with at least: `message` (string), optional `code`, optional `errors` (validation details).
- **401 Unauthorized:** Missing or invalid token.
- **403 Forbidden:** Valid token but insufficient permissions.
- **404 Not Found:** Resource does not exist or user has no access.
- **422 Unprocessable Entity:** Validation errors (e.g. invalid slug, duplicate email).

---

## 6. Data Models

These align with the frontend types. Backend persistence may add fields (e.g. createdAt, updatedAt, tenantId).

### 6.1 User

```ts
{
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer' | 'editor' | 'land_administrator';  // extend as needed
  permissions?: Permission;  // optional override; else derived from role
  twoFactorEnabled: boolean;
  status?: 'active' | 'inactive';
  joinedAt: string;  // ISO 8601
}
```

### 6.2 Permission (structure)

```ts
{
  pages: { view, create, edit, delete, publish };
  users: { create, edit, delete };
  templates: { create, edit, delete };
  settings: { view, edit };
  applications: { view, submit, edit };
  reports: { view, generate };
  payments: { view, manage };
  allocations: { view, manage };
}
```

### 6.3 Page / Template

```ts
{
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: 'published' | 'draft';
  templateId?: string;
  templateIds?: string[];   // for linked templates
  elements: FormElement[];   // builder schema
  isTemplate?: boolean;
  isNamed?: boolean;
  category?: string;
  views: number;
  publishedAt?: string;      // ISO 8601
  createdBy?: string;
  updatedAt: string;
}
```

### 6.4 FormElement (builder)

```ts
{
  id: string;
  type: WidgetType;  // TITLE, SUBTITLE, PARAGRAPH, INPUT, TEXTAREA, CHECKBOX, RADIO, SELECT, DATE, GRID, CONTAINER, SPACE, IMAGE, DIVIDER, etc.
  content: ElementContent;
  styles?: Record<string, string>;
}
```

### 6.5 Application

```ts
{
  id: string;
  userId: string;
  pageId?: string;
  type: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  title: string;
  description?: string;
  formData?: Record<string, any>;
  applicant?: object;
  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  priority?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 6.6 Payment

```ts
{
  id: string;
  userId: string;
  applicationId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: string;
  dueDate?: string;
  description?: string;
  feeType?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 6.7 Allocation

```ts
{
  id: string;
  applicationId: string;
  userId: string;
  type: string;
  status: 'pending' | 'allocated' | 'completed' | 'cancelled';
  location?: string;
  parcelNumber?: string;
  size?: string;
  allocatedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  details?: object;
  createdAt: string;
  updatedAt: string;
}
```

### 6.8 Expense (if stored separately)

```ts
{
  id: string;
  userId: string;
  type: string;
  amount: number;
  date: string;
  status: string;
  paymentId?: string;
  description?: string;
  createdAt: string;
}
```

### 6.9 Activity

```ts
{
  id: string;
  action: string;   // e.g. "Template \"X\" created"
  time: string;     // e.g. "2 hours ago" or ISO 8601
  icon: string;     // icon identifier for UI
}
```

---

## 7. Non-Functional Requirements

### 7.1 Performance

- **Response time:** Typical API calls (list, get by id) should respond within **&lt; 500 ms** (p95) under normal load.
- **Heavy operations:** Report generation and bulk operations may be asynchronous; document expected latency and polling if applicable.
- **Pagination:** List endpoints SHALL support pagination (e.g. `limit`, `offset` or `page`, `pageSize`) to avoid large payloads.

### 7.2 Availability

- **Target availability:** 99.5% or higher for production (excluding planned maintenance).
- **Graceful degradation:** Return clear errors and avoid exposing stack traces in production.

### 7.3 Scalability

- **Stateless:** Prefer stateless design so that horizontal scaling is possible.
- **Database:** Design for expected data volume (users, pages, applications); define indexing and query patterns for list/filter endpoints.

### 7.4 Observability

- **Logging:** Log request id, user id, endpoint, status code, and duration; do not log passwords or tokens.
- **Health:** Provide a health endpoint (e.g. `GET /health`) for load balancers and monitoring.

### 7.5 Maintainability

- **API versioning:** Consider URL prefix (e.g. `/api/v1`) or header for future breaking changes.
- **Documentation:** Provide OpenAPI/Swagger or equivalent describing all endpoints, request/response schemas, and auth.

---

## 8. Security Requirements

- **HTTPS:** Enforce TLS in production.
- **Secrets:** Store secrets (DB credentials, JWT secret, API keys) in environment or secret manager; never in code.
- **Passwords:** Hash with a strong algorithm (e.g. bcrypt/argon2); never store or log plain text.
- **Tokens:** Use short-lived access tokens; optional refresh tokens with rotation and revocation.
- **Input validation:** Validate and sanitize all inputs; reject invalid payloads with 400/422.
- **Authorization:** Enforce permission checks on every protected endpoint; do not rely on client-only checks.
- **CORS:** Restrict origins to the known frontend origin(s) in production.
- **Rate limiting:** Apply rate limiting on auth and public endpoints to mitigate abuse.

---

## 9. Deployment & Environment

### 9.1 Environment Variables (Backend)

Document and require at least:

- `API_BASE_URL` or `FRONTEND_URL` (for CORS and links).
- `DATABASE_URL` (or equivalent).
- `JWT_SECRET` (or equivalent).
- `SMTP_*` or email provider config (for 2FA and notifications).
- Optional: `LOG_LEVEL`, `PORT`, `NODE_ENV` (or equivalent).

### 9.2 Frontend Configuration

- Frontend sets `VITE_API_URL` to the backend base URL (e.g. `https://api.example.com` or `http://localhost:3000/api`).
- Frontend uses `VITE_API_TIMEOUT` (default 30000 ms).

---

## 10. Glossary & References

- **Harmony Hub:** The admin area product (document template builder, pages, users, applications, payments, allocations).
- **FormElement / WidgetType:** Building blocks of the visual template builder (text, inputs, layout, image, etc.).
- **Page:** A named, publishable entity (may be composed of one or more templates).
- **Template:** A draft building block (elements only) that can be linked into a page.

**References:**

- [FEATURES_AND_FUNCTIONALITY.md](./FEATURES_AND_FUNCTIONALITY.md) — frontend features and behaviour.
- [README_ENV.md](../README_ENV.md) — frontend env and API client usage.
- Frontend types: `src/types/auth.ts`, `src/lib/api.ts` (Page, User, etc.), `src/types/builder.ts` (FormElement).

---

**Document version:** 1.0  
**Last updated:** 2025  
**Status:** Ready for backend implementation.
