# WEEK 13 DELIVERABLE: Configuration Management Script
**Broker Lead Management System (BLMS)**

* **Student Name:** Eshanika Amballa
* **Roll No:** 2310B0056
* **Branch:** CMPN B
* **Repository:** [https://github.com/esh22nika/broker_lead_management](https://github.com/esh22nika/broker_lead_management)
* **Date:** October 2026

---

## 1. Executive Summary & Objective

In accordance with the 15-week DevOps curriculum, **Week 13** focuses on Infrastructure as Code (IaC) and automated configuration management. Using **Ansible**, all server prerequisites required to run the multi-tier Broker Lead Management System (BLMS) have been codified into an inventory and declarative YAML playbook (`ansible/playbook.yml`).

### Tool Selection Justification:
* **Tool Selected:** **Ansible**
* **Rationale over Puppet:**
  * **Agentless Architecture:** Operates over standard OpenSSH; requires no master-agent daemon or persistent background agent on target nodes.
  * **Human-Readable YAML Playbooks:** Seamlessly readable by both developers and operations teams without proprietary Ruby DSLs.
  * **Built-in Idempotency:** Modules (`apt`, `user`, `file`, `copy`, `ufw`, `systemd`) ensure that repeated executions make changes only when the target state diverges from desired configuration.

---

## 2. Server Prerequisites Specification Matrix

The table below catalogs all environmental prerequisites identified for the BLMS production host node:

| Category | Prerequisite Item | Specification & Configuration | Purpose in BLMS |
| :--- | :--- | :--- | :--- |
| **1. Packages** | `curl`, `git`, `jq`, `net-tools` | Standard system administration utilities | Health checks, telemetry & repo cloning |
| | `openjdk-17-jre-headless` | OpenJDK 17 LTS Runtime | Standalone Spring Boot JAR fallback execution |
| | `docker.io`, `docker-compose-v2` | Official container engine & compose plugin | Orchestrating containerized runtime stack |
| | `ufw` | Uncomplicated Firewall | Port-level traffic protection |
| **2. Users & Groups** | Group: `blmsgroup` | System group (GID $<1000$) | File ownership boundary |
| | User: `blmsuser` | System user, member of `blmsgroup` & `docker` | Least-privilege non-root execution |
| **3. Folders** | `/opt/blms` | Root application base path (`0755`) | Deployment root |
| | `/opt/blms/config` | Configuration directory (`0750`) | Holds `.env` & runtime property files |
| | `/opt/blms/data/postgres` | Database volume mount (`0750`) | Persistent PostgreSQL lead storage |
| | `/opt/blms/logs/backend` | Application log directory (`0750`) | Spring Boot rotation logs |
| | `/opt/blms/logs/nginx` | Web server log directory (`0750`) | HTTP access & reverse proxy logs |
| **4. Files** | `/opt/blms/config/.env` | Mode `0600`, owner `blmsuser:blmsgroup` | Database credentials & active profiles |
| | `/etc/logrotate.d/blms` | Mode `0644`, owner `root:root` | 14-day daily log rotation & compression |
| **5. Ports** | Port `22` (TCP) | UFW Allow | Secure Shell remote administration |
| | Port `80` (TCP) | UFW Allow | Public Nginx React frontend |
| | Port `8081` (TCP) | UFW Allow | Spring Boot REST API endpoint |
| | Port `5432` (TCP) | Local/Docker internal binding | PostgreSQL database connectivity |
| **6. Services** | `docker.service` | Enabled on boot, active/running | Container daemon lifecycle |

---

## 3. Configuration Management Assets

The Ansible configuration suite is organized in the `ansible/` root directory:

```text
ansible/
├── ansible.cfg       # Global configuration (inventory path, SSH tuning)
├── inventory.ini     # Server host groupings (production, staging, localhost)
└── playbook.yml      # Declarative multi-task provisioning playbook
```

---

## 4. First Execution Command Log

The playbook was executed against the target environment using `ansible-playbook`:

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
```

### Execution Terminal Transcript:
```text
PLAY [Provision and Configure BLMS Production Environment] ****************************************

TASK [Gathering Facts] ****************************************************************************
ok: [app-server-01]

TASK [Update apt package cache] *******************************************************************
changed: [app-server-01]

TASK [Install required server packages] ***********************************************************
changed: [app-server-01] => (item=['curl', 'git', 'ufw', 'net-tools', 'jq', 'ca-certificates', 'gnupg', 'lsb-release', 'openjdk-17-jre-headless', 'docker.io', 'docker-compose-v2'])

TASK [Create application service group] ***********************************************************
changed: [app-server-01]

TASK [Create non-root application service user] ***************************************************
changed: [app-server-01]

TASK [Create BLMS application folder structure] ***************************************************
changed: [app-server-01] => (item=/opt/blms)
changed: [app-server-01] => (item=/opt/blms/config)
changed: [app-server-01] => (item=/opt/blms/data)
changed: [app-server-01] => (item=/opt/blms/data/postgres)
changed: [app-server-01] => (item=/opt/blms/logs)
changed: [app-server-01] => (item=/opt/blms/logs/backend)
changed: [app-server-01] => (item=/opt/blms/logs/nginx)
changed: [app-server-01] => (item=/opt/blms/deploy)

TASK [Deploy application environment configuration] ***********************************************
changed: [app-server-01]

TASK [Configure logrotate for BLMS application logs] **********************************************
changed: [app-server-01]

TASK [Configure UFW firewall rules for application ports] *****************************************
changed: [app-server-01] => (item={'port': '22', 'proto': 'tcp', 'comment': 'SSH Access'})
changed: [app-server-01] => (item={'port': 80, 'proto': 'tcp', 'comment': 'BLMS Nginx Web Frontend'})
changed: [app-server-01] => (item={'port': 8081, 'proto': 'tcp', 'comment': 'BLMS Spring Boot REST API'})

TASK [Ensure Docker daemon service is enabled and running] ****************************************
ok: [app-server-01]

TASK [Verify Docker service is responsive] ********************************************************
ok: [app-server-01]

TASK [Display provisioning summary] ***************************************************************
ok: [app-server-01] => {
    "msg": [
        "BLMS server node provisioned successfully.",
        "App root: /opt/blms",
        "Service user: blmsuser:blmsgroup",
        "Listening ports: HTTP (80), API (8081), DB (5432)",
        "Docker status: Active and responsive"
    ]
}

PLAY RECAP ****************************************************************************************
app-server-01              : ok=12   changed=8    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

---

## 5. Verification & Acceptance Criteria

| Requirement | Verification Command | Expected Output | Status |
| :--- | :--- | :--- | :--- |
| **User & Group** | `id blmsuser` | `uid=998(blmsuser) gid=998(blmsgroup) groups=998(blmsgroup),999(docker)` | **PASSED** |
| **Folder Hierarchy** | `ls -ld /opt/blms /opt/blms/*` | Permissions `drwxr-xr-x` owned by `blmsuser:blmsgroup` | **PASSED** |
| **Firewall Open Ports** | `sudo ufw status verbose` | `22/tcp ALLOW`, `80/tcp ALLOW`, `8081/tcp ALLOW` | **PASSED** |
| **Docker Daemon** | `systemctl is-active docker` | `active` | **PASSED** |
| **Playbook Syntax** | `ansible-playbook --syntax-check` | `playbook: ansible/playbook.yml` with 0 errors | **PASSED** |
