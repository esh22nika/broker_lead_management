# BLMS VIVA PREPARATION & EXAMINATION GUIDE
**Broker Lead Management System — Complete DevOps Walkthrough**

* **Student:** Eshanika Amballa (Roll: 2310B0056 | Branch: CMPN B)
* **Project Repository:** [https://github.com/esh22nika/broker_lead_management](https://github.com/esh22nika/broker_lead_management)

---

## Top 25 Viva Questions & High-Scoring Model Answers

### SECTION 1: Git & Branching Strategy

#### Q1: What branching strategy did you follow in your project?
**Answer:**
We followed standard **GitFlow**:
* `main`: Production-ready, stable releases (tagged with release versions e.g., `v1.0.0`, `v1.5.0`). Protected by branch rules.
* `develop`: Integration branch where all completed features converge.
* `feature/*`: Short-lived branches created off `develop` for individual stories (e.g. `feature/create-lead`, `feature/ansible-reliability`). Merged back via Pull Requests.
* `release/*`: Release candidate branches used for final tagging and release preparation.

#### Q2: How did you demonstrate merge conflict creation and resolution?
**Answer:**
In Week 6, we deliberately created two parallel branches (`feature/login-page` and `feature/lead-detail-edit`) that both modified the core structure of `App.jsx` and `index.css`. When the second branch was merged into `develop`, Git paused with conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`). We resolved the conflict by combining both feature blocks (retaining the auth gate while embedding the edit/delete handlers), tested the app, and committed the resolution with commit `817ab2f`.

#### Q3: What is the difference between `git merge` and `git rebase`? Why did you use merge PRs?
**Answer:**
`git merge` creates a merge commit preserving the complete historical timeline and branch topology, whereas `git rebase` rewrites commit history onto the tip of another branch linearly. We chose Merge Pull Requests on GitHub because preserving the branch graphs, review discussions, and PR evidence is required for audit trails and team visibility.

---

### SECTION 2: Jenkins & CI/CD Pipeline

#### Q4: What is the difference between Declarative and Scripted Pipelines in Jenkins?
**Answer:**
We used **Declarative Pipeline** syntax (`pipeline { agent any ... }`). Declarative pipelines offer strict structural validation, cleaner syntax, easier error handling, and built-in blocks (`stages`, `steps`, `post`, `tools`, `environment`), whereas Scripted pipelines are free-form Groovy with higher complexity and less built-in structure.

#### Q5: What does your `Jenkinsfile` automate across its stages?
**Answer:**
Our pipeline contains 9 automated stages:
1. `Checkout`: Pulls the latest commit from GitHub SCM.
2. `Build Backend`: Compiles Java 17 / Spring Boot using Maven (`mvn clean compile`).
3. `Unit Tests`: Executes 20 JUnit & Mockito tests; Surefire XML reports published to JUnit trend graphs.
4. `Package`: Packages the Spring Boot JAR (`target/blms-backend.jar`) and archives the artifact.
5. `Build Frontend`: Installs npm dependencies and builds Vite static distribution (`dist/`).
6. `Selenium Tests`: Executes headless Chrome WebDriver suite with a non-blocking `catchError` block.
7. `Docker Build & Tag`: Builds and tags Docker images dynamically using `${BUILD_NUMBER}` (`v1.2.0-${BUILD_NUMBER}`).
8. `Publish to Registry`: Pushes versioned images to Docker Hub.
9. `Continuous Deployment`: Recreates the multi-container stack with `docker compose` and validates `/api/v1/health`.

#### Q6: Why did you wrap the Selenium stage in `catchError`?
**Answer:**
In CI environments, UI tests that depend on browser drivers might fail due to display server differences even if backend compilation and unit tests pass. Wrapping the stage in `catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE')` ensures that UI warnings mark the stage **Yellow (Unstable)** for investigation without crashing the entire build or blocking deployment when unit tests are 100% green.

---

### SECTION 3: Selenium Automated Testing

#### Q7: How did you configure Selenium to run headlessly in CI?
**Answer:**
In `SeleniumTestBase.java`, we configured `ChromeOptions` with `--headless=new`, `--disable-gpu`, `--no-sandbox`, and `--window-size=1920,1080`. This instructs Chrome to render the DOM and execute JavaScript completely in memory without opening a physical GUI window.

#### Q8: What is the difference between Implicit Wait and Explicit Wait in Selenium?
**Answer:**
* **Implicit Wait** applies globally across the entire test session, making WebDriver poll for a set duration for every element before throwing an exception.
* **Explicit Wait** (`WebDriverWait` with `ExpectedConditions`) pauses only until a specific element condition occurs (e.g. `visibilityOfElementLocated`, `elementToBeClickable`). We used **Explicit Wait** (10-second timeout) because it avoids unnecessary delays and prevents flaky tests on dynamic React DOM renders.

#### Q9: What critical user journeys does your Selenium test suite cover?
**Answer:**
15 automated test cases across 5 test classes:
1. `LoginPageTest`: Correct page title, inputs present, valid authentication redirect, invalid credential rejection.
2. `CreateLeadTest`: Form rendering, successful lead creation, verification that new lead defaults to `NEW` status.
3. `LeadSearchTest`: Search bar presence, real-time name and keyword filtering.
4. `StatusWorkflowTest`: Status selector presence, advancing lead to `CONTACTED`, status persistence on refresh.
5. `DashboardTest`: Verification of dashboard KPI card visibility and status count updates.

---

### SECTION 4: Docker & Containerization

#### Q10: Why did you use multi-stage Docker builds?
**Answer:**
Multi-stage builds separate the **build environment** from the **runtime environment**:
* In `backend/Dockerfile`, Stage 1 uses a heavy Maven image (`maven:3.9.6-eclipse-temurin-17`) to compile the code. Stage 2 copies only the compiled JAR into a slim `eclipse-temurin:17-jre-jammy` runtime.
* In `frontend/Dockerfile`, Stage 1 uses Node 20 to run `npm run build`, and Stage 2 copies the static `dist/` folder into an ultralight `nginx:alpine` image.
* **Benefits:** Drastically reduced image sizes ($<30\text{ MB}$ for frontend, $<312\text{ MB}$ for backend), eliminated development dependencies, and improved security.

#### Q11: Why is running containers as a non-root user important?
**Answer:**
By default, Docker containers run as `root` (UID 0). If an attacker exploits a vulnerability in the application to break out of the container, they would gain root access to the host operating system. In our `backend/Dockerfile`, we create an unprivileged user:
```dockerfile
RUN groupadd -r blmsgroup && useradd -r -g blmsgroup -m blmsuser
USER blmsuser
```
This enforces the principle of least privilege.

#### Q12: What role does Nginx play in your Docker architecture?
**Answer:**
Nginx serves two purposes:
1. **Static Web Server:** Serves the compiled React Single Page Application (HTML, CSS, JS) with client-side SPA routing (`try_files $uri $uri/ /index.html`).
2. **Reverse Proxy:** Intercepts all `/api/*` traffic and proxies it internally to `http://backend:8081`, eliminating Cross-Origin Resource Sharing (CORS) issues and securing backend API ports.

---

### SECTION 5: Ansible & Infrastructure as Code (IaC)

#### Q13: What is Idempotency in Ansible and how did you prove it?
**Answer:**
Idempotency means that executing the same playbook multiple times produces the exact same end state without making unnecessary changes on subsequent runs. We proved this in Week 14 by running `ansible-playbook -i inventory.ini playbook.yml` twice:
* **Run 1:** Packages installed, user created, folders created $\rightarrow$ `changed=8`, `ok=4`.
* **Run 2:** All prerequisites already present $\rightarrow$ **`changed=0`, `ok=12`**.

#### Q14: Why did you select Ansible over Puppet?
**Answer:**
* **Agentless Architecture:** Ansible operates over standard OpenSSH and Python, eliminating the need to install and maintain persistent background agent daemons on managed nodes (unlike Puppet Agent/Master).
* **Declarative YAML:** Playbooks are written in simple YAML rather than proprietary Ruby DSL.
* **Push vs. Pull:** Ansible uses a push model, allowing immediate execution from the control node without waiting for node poll intervals.

#### Q15: How did you implement automated rollback and recovery?
**Answer:**
In `ansible/rollback-playbook.yml`, if a new release fails health checks:
1. Ansible stops the unstable container services.
2. It executes `docker compose up -d --force-recreate` overriding the image tag with the previous known stable version (`v1.2.0`).
3. An automated `uri` task polls `/api/v1/health` with retries until HTTP 200 OK is confirmed, guaranteeing zero downtime.

---

### SECTION 6: Business Domain & Architecture

#### Q16: What is the business difference between a Broker and a Manager in BLMS?
**Answer:**
* **Broker (Property Consultant):** Field sales consultant who captures leads and qualifies buyer requirements. They can progress leads only through operational stages: **`NEW` $\rightarrow$ `CONTACTED` $\rightarrow$ `QUALIFIED`**. They cannot delete leads or mark them Converted/Lost.
* **Branch / Sales Manager:** Supervisory role. Only Managers have the authority to officially mark a deal as **`CONVERTED`** (Deal Closed / Won) or **`LOST`** (Deal Terminated), delete fake/duplicate leads, and oversee team-wide pipeline conversion metrics.
* **Admin:** Manages user accounts, credentials, and role assignments.

#### Q17: What Indian real estate portals did you integrate into the lead sources?
**Answer:**
We localized the CRM for the Indian real estate market, incorporating major property acquisition channels: **MagicBricks**, **99acres**, **Housing.com**, **Site Visit / Walk-in**, **Client Referral**, **Builder Tie-up**, **Direct Call**, and **Website Inquiry**.
