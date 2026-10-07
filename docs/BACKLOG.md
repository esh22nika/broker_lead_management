# BLMS Backlog

Updated: 2026-09-02

---

## ✅ Completed (v1.0.0 MVP)

| ID | Story | Branch | Released |
|----|-------|--------|---------|
| US-01 | As a broker, I can create a new lead with name, phone, email, source, and notes | feature/create-lead | v1.0.0 |
| US-02 | As a broker, I can view all leads in a table | feature/mvp-core | v1.0.0 |
| US-03 | As a broker, I can update a lead's status through the workflow | feature/mvp-core | v1.0.0 |
| US-04 | As a broker, I can search leads by name, phone, or email | feature/mvp-core | v1.0.0 |
| US-05 | As a manager, I can see a dashboard with lead counts by status | feature/dashboard-ui | v1.0.0 |
| US-06 | As a user, I must log in before accessing the system | feature/login-page | v1.0.0 |
| US-07 | As a broker, I can edit all fields of an existing lead | feature/lead-detail-edit | v1.0.0 |
| US-08 | As a manager, I can delete a lead record | feature/lead-detail-edit | v1.0.0 |
| US-09 | As a manager, I can set a lead to Converted or Lost; brokers cannot | feature/lead-detail-edit | v1.0.0 |
| US-10 | As a user, real BCrypt authentication and role-based access control | feature/auth-refinement | v1.1.0 |
| US-11 | As ops, Jenkins CI job runs automated build & JUnit test suites on every commit | feature/jenkins-ci | v1.1.0 |
| US-12 | As ops, declarative Jenkinsfile controls build, test, and artifact packaging | feature/jenkins-ci | v1.1.0 |
| US-13 | As QA, automated Selenium WebDriver test suite covers critical user journeys | feature/selenium-testing | v1.1.0 |
| US-14 | As ops, multi-stage Dockerfiles package backend and frontend into versioned containers | feature/docker-container-lifecycle | v1.1.0 |
| US-15 | As ops, Jenkins-Docker CD pipeline builds, tags, publishes images, and redeploys containers | feature/jenkins-docker-cd | v1.2.0 |
| US-16 | As ops, Ansible inventory and YAML playbook automate server prerequisite configuration | feature/ansible-config-management | v1.3.0 |
| US-17 | As ops, automated provisioning, idempotency validation, and rollback mechanism | feature/ansible-reliability | v1.4.0 |
| US-18 | As a manager, export leads to CSV for offline analysis and reporting | feature/final-release-v1.5.0 | v1.5.0 |

---

## 🔜 Post-MVP Future Backlog

| ID | Priority | Story | Target Release |
|----|----------|-------|----------------|
| US-19 | Low | As a broker, receive WhatsApp / SMS alerts when lead is assigned | v2.0.0 |
| US-20 | Low | Multi-branch office and multi-tenancy support | v2.0.0 |

---

## Known Bugs / Tech Debt

| ID | Description | Severity |
|----|-------------|----------|
| BUG-01 | Login demo credentials stored in plain JS — replace with real JWT auth | High |
| BUG-02 | Role is hardcoded as MANAGER in App.jsx — should come from auth token | Medium |
| DEBT-01 | No input sanitisation on backend search query | Medium |
| DEBT-02 | No pagination on leads list — will degrade at >500 records | Low |
