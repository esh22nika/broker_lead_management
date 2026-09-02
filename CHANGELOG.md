# Changelog

All notable changes to BLMS are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2026-09-02 — MVP Release

### Added
- **Login page** with light-themed UI matching the application design system (feature/login-page)
- **Auth gate** — application is protected behind login; session persists via localStorage
- **User header** with logged-in user badge and logout button
- **Edit lead modal** — all fields (name, phone, email, source, notes) editable after creation (feature/lead-detail-edit)
- **Delete lead** — leads can be removed with confirmation prompt
- **Role-based status workflow** — BROKER role limited to NEW/CONTACTED/QUALIFIED; MANAGER and ADMIN can also set CONVERTED/LOST
- **Notes column** in leads table (previously stored but not displayed)
- **Created date column** in leads table
- **DELETE /api/v1/leads/{id}** backend endpoint
- `docs/BACKLOG.md` — full product backlog with completed and upcoming stories

### Changed
- App header redesigned with flex layout to accommodate user badge and logout
- Status select now filters options based on the authenticated user's role

### Fixed
- Dashboard no longer silently disappears when backend returns no data

---

## [0.3.0] — 2026-08-20 — Dashboard UI

### Added
- Dashboard summary card with stat tiles per status
- Colour-coded status badges across leads table and dashboard

---

## [0.2.0] — 2026-08-15 — MVP Core

### Added
- View all leads (GET /api/v1/leads)
- Update lead status (PUT /api/v1/leads/{id})
- Search leads by name/phone/email (GET /api/v1/leads/search)
- Dashboard summary API (GET /api/v1/dashboard/summary)
- Frontend leads table with inline status select
- Search bar component

---

## [0.1.0] — 2026-08-10 — Create Lead

### Added
- Create lead form (POST /api/v1/leads)
- Lead entity, repository, service, controller
- Spring Boot project skeleton
- React + Vite frontend skeleton
- GitHub repo with branch protection, PR template, issue templates
