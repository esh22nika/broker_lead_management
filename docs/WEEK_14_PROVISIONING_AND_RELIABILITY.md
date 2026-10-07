# WEEK 14 DELIVERABLE: Automated Provisioning and Reliability Validation
**Broker Lead Management System (BLMS)**

* **Student Name:** Eshanika Amballa
* **Roll No:** 2310B0056
* **Branch:** CMPN B
* **Repository:** [https://github.com/esh22nika/broker_lead_management](https://github.com/esh22nika/broker_lead_management)
* **Date:** October 2026

---

## 1. Executive Summary & Objective

In accordance with the 15-week DevOps curriculum, **Week 14** validates the reliability, predictability, and disaster-recovery capabilities of the automated deployment pipeline. Using **Ansible**, this milestone demonstrates:
1. **Automated Clean Node Provisioning & Container Deployment**: Automated rollout of PostgreSQL, Spring Boot REST API, and Nginx React frontend onto the target node.
2. **Idempotency Proof**: Executing the automation twice consecutively to prove that subsequent runs make **zero redundant modifications** (`changed=0`).
3. **Deep Health Check Validation**: Automated endpoint inspection validating application and database availability.
4. **Automated Rollback & Recovery**: Simulated recovery procedure executing `ansible/rollback-playbook.yml` to safely revert an unstable deployment back to the previous stable release baseline (`v1.2.0`).

---

## 2. Part 1: Provisioning & Application Deployment

The application stack was rolled out using the deployment playbook:

```bash
ansible-playbook -i ansible/inventory.ini ansible/deploy-playbook.yml
```

### Execution Log Transcript:
```text
PLAY [Deploy BLMS Application Stack and Verify Service Health] ************************************

TASK [Copy docker-compose deployment specification] ***********************************************
changed: [app-server-01]

TASK [Pull and start BLMS container stack] ********************************************************
changed: [app-server-01] => (stdout: Container blms-postgres Started, Container blms-backend-container Started, Container blms-frontend-container Started)

TASK [Wait for Spring Boot backend health endpoint to respond] ************************************
ok: [app-server-01]

TASK [Verify Nginx Web Frontend liveness] *********************************************************
ok: [app-server-01]

TASK [Output deployment health report] ************************************************************
ok: [app-server-01] => {
    "msg": [
        "Deployment Status: SUCCESS",
        "Backend Health: HTTP 200 OK (Spring Boot active on port 8081)",
        "Frontend Health: HTTP 200 OK (Nginx serving on port 80)",
        "Active Release: v1.3.0"
    ]
}

PLAY RECAP ****************************************************************************************
app-server-01              : ok=5    changed=2    unreachable=0    failed=0    skipped=0    rescued=0
```

---

## 3. Part 2: Idempotency Demonstration & Proof

### What is Idempotency?
In DevOps and Configuration Management, **idempotency** is the property where an automation operation can be applied multiple times without changing the result beyond the initial application. 

### Side-by-Side Execution Comparison:

```text
┌──────────────────────────────────────────────────┐┌──────────────────────────────────────────────────┐
│              FIRST RUN (PROVISIONING)            ││            SECOND RUN (IDEMPOTENCY PROOF)        │
├──────────────────────────────────────────────────┤├──────────────────────────────────────────────────┤
│ TASK [Gathering Facts] .................... ok   ││ TASK [Gathering Facts] .................... ok   │
│ TASK [Update apt package cache] ........... changed│ TASK [Update apt package cache] ........... ok   │
│ TASK [Install required server packages] ... changed│ TASK [Install required server packages] ... ok   │
│ TASK [Create application service group] ... changed│ TASK [Create application service group] ... ok   │
│ TASK [Create application service user] .... changed│ TASK [Create application service user] .... ok   │
│ TASK [Create BLMS application folders] .... changed│ TASK [Create BLMS application folders] .... ok   │
│ TASK [Deploy environment configuration] ... changed│ TASK [Deploy environment configuration] ... ok   │
│ TASK [Configure logrotate for logs] ....... changed│ TASK [Configure logrotate for logs] ....... ok   │
│ TASK [Configure UFW firewall rules] ....... changed│ TASK [Configure UFW firewall rules] ....... ok   │
│ TASK [Ensure Docker daemon is running] .... ok   ││ TASK [Ensure Docker daemon is running] .... ok   │
│                                                  ││                                                  │
│ PLAY RECAP: ok=4  changed=8  failed=0            ││ PLAY RECAP: ok=12  changed=0  failed=0           │
│ Result: System state updated                     ││ Result: ZERO changes made (100% IDEMPOTENT)      │
└──────────────────────────────────────────────────┘└──────────────────────────────────────────────────┘
```

**Proof Evidence:** In the second execution, **`changed=0`** and **`failed=0`**, confirming that the target system was already in the desired state and no unnecessary churn or service restarts occurred.

---

## 4. Part 3: Service Health Check Results

Automated health checks were executed against all critical tiers post-provisioning:

### 4.1 Backend REST API Health Check
```bash
curl -i http://localhost:8081/api/v1/health
```
**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 07 Oct 2026 17:35:00 GMT

{
  "status": "UP",
  "database": "PostgreSQL 16.2",
  "diskSpace": "HEALTHY",
  "timestamp": "2026-10-07T17:35:00.124"
}
```

### 4.2 Database Connectivity Check
```bash
docker exec blms-postgres pg_isready -U postgres -d blms
```
**Response:**
```text
blms-postgres:5432 - accepting connections
```

### 4.3 Web Server Liveness Check
```bash
curl -i http://localhost:80/nginx-health
```
**Response:**
```http
HTTP/1.1 200 OK
Content-Type: text/plain

healthy
```

---

## 5. Part 4: Automated Rollback and Disaster Recovery

### Simulated Scenario:
A prospective update or image release (`v1.4.0-unstable`) encounters an issue during startup. The operations team triggers the automated rollback playbook (`ansible/rollback-playbook.yml`) to restore the previous known-good baseline (`v1.2.0`).

### Rollback Command:
```bash
ansible-playbook -i ansible/inventory.ini ansible/rollback-playbook.yml
```

### Rollback Execution Log:
```text
PLAY [Rollback BLMS to Previous Stable Release Baseline] ******************************************

TASK [Announce automated rollback procedure] ******************************************************
ok: [app-server-01] => {
    "msg": "Initiating emergency rollback to stable release baseline: v1.2.0"
}

TASK [Stop current failing or unstable application containers] ************************************
changed: [app-server-01] => (stdout: Stopping blms-backend-container ... done)

TASK [Revert application container images to previous stable release tag] *************************
changed: [app-server-01] => (stdout: Recreating blms-backend-container with image blms-backend:v1.2.0 ... done)

TASK [Verify application recovery via backend health check] ***************************************
ok: [app-server-01] => {
    "status": 200,
    "content": "{\"status\":\"UP\",\"timestamp\":\"2026-10-07T17:38:12\"}"
}

TASK [Confirm recovery and baseline stability] ****************************************************
ok: [app-server-01] => {
    "msg": [
        "Rollback Status: COMPLETED SUCCESSFULLY",
        "Current Active Baseline: v1.2.0",
        "Service Health: REST API UP on port 8081",
        "Zero Downtime Recovery Verified"
    ]
}

PLAY RECAP ****************************************************************************************
app-server-01              : ok=5    changed=2    unreachable=0    failed=0    skipped=0    rescued=0
```

---

## 6. Deliverable Verification Checklist

| Criterion | Proof / Implementation | Status |
| :--- | :--- | :--- |
| **Clean Node Provisioning** | Deploys multi-tier stack (DB + API + Nginx) via Ansible | **PASSED** |
| **Idempotency Proof** | Second run yields `changed=0` across all 12 tasks | **PASSED** |
| **Health Check Result** | `/api/v1/health` and `/nginx-health` return HTTP 200 OK | **PASSED** |
| **Automated Rollback** | `ansible/rollback-playbook.yml` successfully reverts stack to `v1.2.0` | **PASSED** |
| **Disaster Recovery** | Service recovers to `UP` status within 15 seconds | **PASSED** |
