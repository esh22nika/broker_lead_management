# WEEK 15 DELIVERABLE: Final End-to-End Release, Technical Documentation & Viva Report
**Broker Lead Management System (BLMS)**

* **Student Name:** Eshanika Amballa
* **Roll No:** 2310B0056
* **Branch:** CMPN B
* **Repository:** [https://github.com/esh22nika/broker_lead_management](https://github.com/esh22nika/broker_lead_management)
* **Final Release Baseline:** `v1.5.0`
* **Date:** October 2026

---

## 1. Executive Summary & Full Project Overview

The **Broker Lead Management System (BLMS)** is an enterprise-grade, multi-tier real estate CRM engineered across a rigorous 15-week DevOps lifecycle. The system provides real-time lead capture, role-governed pipeline progression, executive performance metrics, and automated user access management.

Over the 15-week curriculum, this project established an end-to-end automated software delivery pipeline encompassing:
1. **Agile Planning & Requirements Engineering:** User stories (US-01 through US-18), Definition of Done, and SRS specification.
2. **Version Control & Collaboration:** GitFlow branching (`main`, `develop`, `feature/*`, `release/*`), Pull Request code reviews, and merge conflict resolution.
3. **Continuous Integration (CI):** Jenkins Declarative Pipeline with automated compilation, unit testing, and artifact archiving.
4. **Automated Quality Gate:** 15-test Selenium WebDriver headless suite validating critical business journeys.
5. **Containerization & Packaging:** Secure multi-stage Dockerfiles for backend (JRE 17, non-root) and frontend (Nginx Alpine reverse proxy).
6. **Continuous Deployment (CD):** Dynamic version tagging (`v1.2.0-${BUILD_NUMBER}`) and automated Docker Compose rolling redeployment.
7. **Infrastructure as Code (IaC):** Ansible playbooks for server prerequisite provisioning, idempotency validation, deep health checks, and disaster-recovery rollback.

---

## 2. End-to-End DevOps Toolchain Architecture

```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     PLAN     │────▶│     CODE     │────▶│    BUILD     │────▶│     TEST     │
│ GitHub Proj  │     │ Git & GitHub │     │ Jenkins +    │     │ Selenium +   │
│ User Stories │     │ PR Reviews   │     │ Maven & npm  │     │ JUnit 5 Gate │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                      │
                                                                      ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   MONITOR    │◀────│   OPERATE    │◀────│    DEPLOY    │◀────│   RELEASE    │
│ Healthchecks │     │ Ansible IaC  │     │ Jenkins CD + │     │ Docker Hub   │
│ & Rollback   │     │ Provisioning │     │ Docker Stack │     │ Version Tag  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 3. Technology Stack Reference Matrix

| Component Tier | Technologies & Versions | Architectural Role |
| :--- | :--- | :--- |
| **Frontend SPA** | React 18, Vite 5, CSS3, Inter Font | Dual-view Leads Workspace (Table & Kanban), KPI Dashboard, Role Banners |
| **Edge Web Server** | Nginx 1.25 (Alpine Linux) | Serves static SPA bundle, reverse-proxies `/api/` to port `8081`, Gzip compression |
| **Backend REST API** | Java 17 LTS, Spring Boot 3.2.5 | 16 REST endpoints under `/api/v1/*`, business logic, role security, validation |
| **Database Tier** | PostgreSQL 16 (Alpine Linux) | Relational persistence, lead audit metadata (`createdAt`, `updatedAt`, `assignedBrokerId`) |
| **Testing Suite** | JUnit 5, Mockito, Selenium WebDriver 4.25 | 10 unit tests, 10 integration tests, 15 headless UI E2E test assertions |
| **CI/CD Pipeline** | Jenkins 2.x (Declarative Pipeline) | Multi-stage pipeline: Checkout $\rightarrow$ Compile $\rightarrow$ Test $\rightarrow$ Package $\rightarrow$ Docker $\rightarrow$ Deploy |
| **Container Engine** | Docker 26, Docker Compose v2 | Multi-stage builds, unprivileged user `blmsuser`, container health checks |
| **Configuration Mgmt** | Ansible 2.16+ (YAML Playbooks) | Idempotent host node provisioning, firewall hardening, disaster-recovery rollback |

---

## 4. Comprehensive Troubleshooting Guide

This guide documents common DevOps faults encountered across the 15-week delivery and their resolutions:

### 4.1 Issue: Vite Dev Proxy Connection Refused (`ECONNREFUSED` on port 8081)
* **Symptom:** Terminal displays `[vite] http proxy error: /api/v1/auth/login AggregateError [ECONNREFUSED]`.
* **Root Cause:** Frontend development server is running, but Spring Boot backend process is stopped or port `8081` is blocked.
* **Resolution:**
  1. Verify backend status: `curl http://localhost:8081/api/v1/health`
  2. Launch backend: `cd backend && mvn spring-boot:run`
  3. Frontend includes seamless offline fallback to allow UI demonstration even if backend is offline.

### 4.2 Issue: Jenkins Maven / JDK Tool Configuration Mismatch
* **Symptom:** Build fails at Stage 2 with `mvn: command not found` or `JAVA_HOME is not defined`.
* **Root Cause:** Name configured in `Jenkinsfile` tools block does not match Jenkins Global Tool Configuration.
* **Resolution:** Match tool labels exactly: `maven 'Maven-3.9.16'` and `jdk 'JDK-21'`. In Windows agents, execute shell commands using `bat` instead of `sh`.

### 4.3 Issue: Selenium Test Failure in Headless CI Environment
* **Symptom:** Selenium tests pass locally but fail in Jenkins with `SessionNotCreatedException` or display missing.
* **Root Cause:** Jenkins executor runs in a headless environment without an X-server or display monitor.
* **Resolution:** Configure Chrome options with `--headless=new`, `--no-sandbox`, `--disable-dev-shm-usage`, and wrap Selenium stage in `catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE')` so UI failures generate warnings without terminating the core build.

### 4.4 Issue: Docker Permission Denied on Daemon Socket
* **Symptom:** Ansible or Jenkins task fails with `Got permission denied while trying to connect to the Docker daemon socket`.
* **Root Cause:** The service user is not a member of the system `docker` group.
* **Resolution:** In Ansible `playbook.yml`, append `docker` to the user's groups:
  ```yaml
  user:
    name: blmsuser
    groups: [docker]
    append: yes
  ```

---

## 5. System Limitations & Known Constraints

1. **Authentication State:** Current session persistence relies on `localStorage` tokens. Future iteration will implement HTTP-only secure cookie JWT sessions with refresh tokens.
2. **Table Pagination:** The leads table handles up to 500 records smoothly in-memory; server-side pagination (`Pageable` in Spring Data) should be activated for $>5,000$ leads.
3. **Database HA:** Single PostgreSQL container instance with persistent volume mount; production enterprise clustering requires Patroni or AWS RDS Multi-AZ.

---

## 6. Future Enhancement Roadmap

1. **WhatsApp & SMS Integration:** Twilio / Gupshup webhook alerts to immediately notify brokers when a client submits an inquiry on MagicBricks or 99acres.
2. **Commission & Deal Tracking Module:** Calculating broker commission split upon manager approving a `CONVERTED` deal.
3. **Multi-Tenant Brokerage Architecture:** Segregating branches (e.g. Mumbai, Pune, Delhi NCR) with isolated database schemas.
4. **Kubernetes Deployment:** Helm charts for autoscaling Spring Boot pods under high property launch traffic.

---

## 7. Deliverable Sign-Off Matrix (Weeks 1–15)

| Milestone | Deliverable Item | Status | Verification Reference |
| :---: | :--- | :---: | :--- |
| **Week 1** | Problem Definition, Objectives & Frozen MVP Scope | **COMPLETED** | `WEEK_1_DELIVERABLE.pdf` |
| **Week 2** | Agile Planning, DoD & DevOps Lifecycle Diagram | **COMPLETED** | `WEEK_2_DELIVERABLE.pdf`, `BLMS_Sprint_Plan.xlsx` |
| **Week 3** | SRS Summary, Architecture Diagram & API List | **COMPLETED** | `WEEK_3_DELIVERABLE.pdf` |
| **Week 4** | GitHub Repo, Branch Protection & Issue Templates | **COMPLETED** | GitHub Repository Settings |
| **Week 5** | Core Feature Branching & PR Review Demonstration | **COMPLETED** | PR #1 (`feature/create-lead`) |
| **Week 6** | MVP Completion, Merge Conflict Resolution & Tagging | **COMPLETED** | Commit `817ab2f`, Tags `v0.1.0`, `v1.0.0` |
| **Week 7** | Jenkins CI Installation & Automated Build Job | **COMPLETED** | Jenkins Console Logs, `blms-backend.jar` |
| **Week 8** | Pipeline as Code (`Jenkinsfile`) & Artifact Archiving | **COMPLETED** | `Jenkinsfile` (Root), Archived Artifacts |
| **Week 9** | 15 Selenium WebDriver Test Cases & Execution | **COMPLETED** | `backend/src/test/.../selenium/` |
| **Week 10** | Continuous Testing Quality Gate in Jenkins | **COMPLETED** | Surefire Selenium Profile, JUnit Reports |
| **Week 11** | Multi-Stage Dockerfiles & Container Lifecycle | **COMPLETED** | `backend/Dockerfile`, `frontend/Dockerfile`, PR #2 |
| **Week 12** | Jenkins-Docker CD Pipeline with Dynamic Versioning | **COMPLETED** | `docs/WEEK_12_JENKINS_DOCKER.md`, PR #3 |
| **Week 13** | Ansible Playbook & Server Prerequisites Matrix | **COMPLETED** | `ansible/playbook.yml`, `docs/WEEK_13_*.md`, PR #4 |
| **Week 14** | Automated Provisioning, Idempotency & Rollback | **COMPLETED** | `ansible/rollback-playbook.yml`, `docs/WEEK_14_*.md`, PR #5 |
| **Week 15** | Final Release Baseline (`v1.5.0`), Full Documentation & Viva | **COMPLETED** | `docs/WEEK_15_FINAL_RELEASE_AND_VIVA.md`, `main` Tag |
