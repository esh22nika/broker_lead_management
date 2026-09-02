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

---

## 🔜 Post-MVP Backlog (Week 7+)

| ID | Priority | Story | Target Week |
|----|----------|-------|-------------|
| US-10 | High | As a user, JWT-based authentication with real credential verification | Week 8 |
| US-11 | High | As ops, Jenkins CI job runs on every push to develop | Week 7 |
| US-12 | High | As ops, pipeline-as-code (Jenkinsfile) controls build + test + deploy | Week 8 |
| US-13 | Medium | As a user, Selenium end-to-end tests cover create, search, and status change | Week 9 |
| US-14 | Medium | As ops, Docker image built and run via Jenkins | Week 12 |
| US-15 | Medium | As ops, Ansible/Puppet script provisions and deploys the stack | Week 13 |
| US-16 | Low | As a manager, export leads to CSV | Post-MVP |
| US-17 | Low | As a broker, receive email notification when a lead is assigned | Post-MVP |
| US-18 | Low | As an admin, manage user accounts and roles | Post-MVP |
| US-19 | Low | Multi-branch (office) support | Post-MVP |

---

## Known Bugs / Tech Debt

| ID | Description | Severity |
|----|-------------|----------|
| BUG-01 | Login demo credentials stored in plain JS — replace with real JWT auth | High |
| BUG-02 | Role is hardcoded as MANAGER in App.jsx — should come from auth token | Medium |
| DEBT-01 | No input sanitisation on backend search query | Medium |
| DEBT-02 | No pagination on leads list — will degrade at >500 records | Low |
