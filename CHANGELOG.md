# Changelog

All notable changes to BLMS are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.5.0] — 2026-10-07 — Final End-to-End Release & Complete DevOps Toolchain (Week 15)

### Added
- **Final Release Baseline Tag `v1.5.0`** integrated into `main` branch
- **Final Technical Documentation & Architecture Report** (`docs/WEEK_15_FINAL_RELEASE_AND_VIVA.md`) covering toolchain architecture, troubleshooting guide, limitations, and future roadmap
- **Comprehensive Viva Preparation & Examination Guide** (`docs/VIVA_PREPARATION_GUIDE.md`) with 25 model Q&A across Git, Jenkins, Selenium, Docker, Ansible, and system architecture
- **Export to CSV functionality** enabled for managers and brokers to download offline pipeline reports
- **Full 15-week DevOps Toolchain sign-off** from plan through code, build, test, release, deploy, operate, and monitor

---

## [1.4.0] — 2026-10-07 — Automated Provisioning & Reliability (Week 14)

### Added
- **Application Deployment Playbook** (`ansible/deploy-playbook.yml`) orchestrating multi-container stack and automated health check gates
- **Automated Rollback Playbook** (`ansible/rollback-playbook.yml`) executing disaster recovery and safe rollback to stable baseline (`v1.2.0`)
- **Idempotency Proof & Validation** demonstrating zero redundant modifications (`changed=0`) on consecutive runs
- **Reliability & Health Check Verification Documentation** (`docs/WEEK_14_PROVISIONING_AND_RELIABILITY.md`) covering deep health checks and recovery logs

---

## [1.3.0] — 2026-10-07 — Configuration Management with Ansible (Week 13)

### Added
- **Ansible Provisioning Playbook** (`ansible/playbook.yml`) codifying all target server prerequisites: packages, users, folders, files, ports, and services
- **Ansible Inventory Specification** (`ansible/inventory.ini`) targeting production, staging, and local environments
- **Ansible Configuration** (`ansible/ansible.cfg`) tuning SSH transport, privilege escalation, and output formatting
- **Server Prerequisites Matrix Documentation** (`docs/WEEK_13_CONFIGURATION_MANAGEMENT.md`) detailing the full environment specification and first execution log
- **Enterprise CRM UI Revamp & Indian Localization** across frontend with self-service registration, role-permission banners, and MagicBricks/99acres sources

---

## [1.2.0] — 2026-10-06 — Continuous Deployment with Docker (Week 12)

### Added
- **Automated Docker Image Build & Tagging Stage** in Jenkinsfile with dynamic build numbers (`v1.2.0-${BUILD_NUMBER}`)
- **Registry Publishing Stage** in Jenkinsfile to push versioned images to Docker Hub (`esh22nika/blms-backend`, `esh22nika/blms-frontend`)
- **Automated Continuous Deployment Stage** using Docker Compose with zero-touch container teardown and recreation
- **Automated Health Check Verification Gate** testing `GET /api/v1/health` post-deployment
- **Week 12 Deliverable Documentation** (`docs/WEEK_12_JENKINS_DOCKER.md`) with end-to-end pipeline architecture and execution logs

---

## [1.1.0] — 2026-09-29 — Containerization & CI/CD Testing (Weeks 7–11)

### Added
- **Multi-stage Dockerfiles** for backend (Java 17 JRE) and frontend (React/Nginx) (`backend/Dockerfile`, `frontend/Dockerfile`)
- **Docker Compose orchestration** (`docker-compose.yml`) for multi-container stack (Postgres 16, Spring Boot, Nginx)
- **Container lifecycle documentation** (`docs/WEEK_11_DOCKER.md`) with build, run, inspect, and cleanup logs
- **Real backend authentication** with BCrypt password hashing (`AuthController`, `User`, `UserRepository`)
- **Admin user management** CRUD endpoints (`UserController`) and UI panel (`UserManagement.jsx`)
- **Automated test suite**: 10 Unit tests, 10 Integration tests, 15 Selenium WebDriver test cases
- **Jenkins Declarative Pipeline** (`Jenkinsfile`) with unit tests, artifact archiving, and non-blocking Selenium test stage

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
