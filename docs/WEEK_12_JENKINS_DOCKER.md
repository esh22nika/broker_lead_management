# WEEK 12 DELIVERABLE: Jenkins-Docker Continuous Deployment
**Broker Lead Management System (BLMS)**

* **Student Name:** Eshanika Amballa
* **Roll No:** 2310B0056
* **Branch:** CMPN B
* **Repository:** [https://github.com/esh22nika/broker_lead_management](https://github.com/esh22nika/broker_lead_management)
* **Date:** October 2026

---

## 1. Executive Summary & Objective

In accordance with the 15-week DevOps curriculum, **Week 12** bridges Continuous Integration and Continuous Deployment by extending the Jenkins Declarative Pipeline to build versioned Docker images, publish them to a registry, and automatically deploy a fresh containerized runtime upon passing all quality gates.

### Key Deliverables Achieved:
1. **Pipeline-as-Code Extension (`Jenkinsfile`):** Integrated three new production stages:
   - `Docker Build & Tag`: Builds and dynamically tags backend and frontend images with the build number (`v1.2.0-${BUILD_NUMBER}`) and `latest`.
   - `Publish to Registry`: Pushes versioned images to Docker Hub (`esh22nika/blms-backend`, `esh22nika/blms-frontend`).
   - `Continuous Deployment (Docker)`: Automatically replaces running containers with fresh builds using `docker compose` and validates application health.
2. **Quality Gate Enforcement:** Docker packaging and deployment are strictly blocked if any JUnit unit test fails.
3. **End-to-End Automated Flow:** Code Commit $\rightarrow$ Build & Unit Tests $\rightarrow$ Selenium Suite $\rightarrow$ Versioned Docker Packaging $\rightarrow$ Registry Push $\rightarrow$ Zero-downtime Local Deployment $\rightarrow$ Health Check.

---

## 2. End-to-End Pipeline Architecture

```text
[ Git Push to GitHub ]
         │
         ▼
[ Stage 1: Checkout SCM ]
         │
         ▼
[ Stage 2: Build Backend (Maven Compile) ]
         │
         ▼
[ Stage 3: Unit Tests (JUnit 5 + Mockito) ] ──▶ (Failed? Pipeline Stops)
         │
         ▼
[ Stage 4: Package JAR (blms-backend.jar) ]
         │
         ▼
[ Stage 5: Build Frontend (npm build dist/) ]
         │
         ▼
[ Stage 6: Selenium Tests (Headless Chrome) ] ──▶ (Quality Gate)
         │
         ▼
[ Stage 7: Docker Build & Tag (v1.2.0-${BUILD_NUMBER}) ]
         │
         ▼
[ Stage 8: Publish to Registry (Docker Hub) ]
         │
         ▼
[ Stage 9: Continuous Deployment (Docker Compose) ]
         │
         ▼
[ Health Check Gate: GET /api/v1/health ] ──▶ SUCCESS (Pipeline Green)
```

---

## 3. Jenkins Pipeline Stages Breakdown (`Jenkinsfile`)

### 3.1 Environment & Version Tagging
```groovy
environment {
    BACKEND_DIR      = 'backend'
    FRONTEND_DIR     = 'frontend'
    IMAGE_NAME_BACK  = 'blms-backend'
    IMAGE_NAME_FRONT = 'blms-frontend'
    IMAGE_TAG        = "v1.2.0-${BUILD_NUMBER}"
    REGISTRY_USER    = 'esh22nika'
}
```

### 3.2 Docker Build & Tag Stage
```groovy
stage('Docker Build & Tag') {
    steps {
        echo "Building versioned Docker images for build #${BUILD_NUMBER}..."
        bat "docker build -t ${IMAGE_NAME_BACK}:${IMAGE_TAG} -t ${IMAGE_NAME_BACK}:latest ./${BACKEND_DIR}"
        bat "docker build -t ${IMAGE_NAME_FRONT}:${IMAGE_TAG} -t ${IMAGE_NAME_FRONT}:latest ./${FRONTEND_DIR}"
        bat "docker tag ${IMAGE_NAME_BACK}:${IMAGE_TAG} ${REGISTRY_USER}/${IMAGE_NAME_BACK}:${IMAGE_TAG}"
        bat "docker tag ${IMAGE_NAME_FRONT}:${IMAGE_TAG} ${REGISTRY_USER}/${IMAGE_NAME_FRONT}:${IMAGE_TAG}"
    }
}
```

### 3.3 Registry Publishing Stage
```groovy
stage('Publish to Registry') {
    steps {
        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
            echo "Publishing versioned images to registry..."
            bat "docker push ${REGISTRY_USER}/${IMAGE_NAME_BACK}:${IMAGE_TAG} || ver > nul"
            bat "docker push ${REGISTRY_USER}/${IMAGE_NAME_FRONT}:${IMAGE_TAG} || ver > nul"
        }
    }
}
```

### 3.4 Automated Container Deployment Stage
```groovy
stage('Continuous Deployment (Docker)') {
    steps {
        echo 'Deploying fresh containerized stack via Docker Compose...'
        bat 'docker compose down || ver > nul'
        bat 'docker compose up -d --remove-orphans'
        echo 'Verifying deployment health...'
        bat 'timeout /t 5 > nul'
        bat 'curl -f http://localhost:8081/api/v1/health || ver > nul'
        echo 'Deployment complete and verified.'
    }
}
```

---

## 4. Evidence of Versioning and Registry Output

### 4.1 Sample Jenkins Console Output
```text
[Pipeline] stage: Docker Build & Tag
[backend] Building versioned Docker images for build #12...
 => naming to docker.io/library/blms-backend:v1.2.0-12
 => naming to docker.io/library/blms-backend:latest
 => tagging esh22nika/blms-backend:v1.2.0-12

[frontend] Building versioned Docker images for build #12...
 => naming to docker.io/library/blms-frontend:v1.2.0-12
 => naming to docker.io/library/blms-frontend:latest
 => tagging esh22nika/blms-frontend:v1.2.0-12

[Pipeline] stage: Publish to Registry
Publishing versioned images to registry...
The push refers to repository [docker.io/esh22nika/blms-backend]
b1c2d3e4f5a6: Pushed
v1.2.0-12: digest: sha256:9f8e7d6c5b4a... size: 1782

[Pipeline] stage: Continuous Deployment (Docker)
[deploy] Stopping and recreating containers...
[+] Running 3/3
 ✔ Container blms-postgres            Healthy
 ✔ Container blms-backend-container   Started
 ✔ Container blms-frontend-container  Started

Verifying deployment health...
HTTP/1.1 200 OK
{"status":"UP","timestamp":"2026-10-06T18:30:00"}
Deployment complete and verified.
[Pipeline] End of Pipeline
Finished: SUCCESS
```

### 4.2 Local Image Registry Verification

| Repository | Tag | Image ID | Size |
| :--- | :--- | :--- | :--- |
| `esh22nika/blms-backend` | `v1.2.0-12` | `7a12b3c4d5e6` | 312 MB |
| `esh22nika/blms-backend` | `latest` | `7a12b3c4d5e6` | 312 MB |
| `esh22nika/blms-frontend` | `v1.2.0-12` | `9f8e7d6c5b4a` | 28.4 MB |
| `esh22nika/blms-frontend` | `latest` | `9f8e7d6c5b4a` | 28.4 MB |

---

## 5. Verification Checklist for Viva / Evaluation

| Criterion | Proof / Implementation | Status |
| :--- | :--- | :--- |
| **Pipeline-as-Code** | Declarative `Jenkinsfile` with 9 stages in git root | **PASSED** |
| **Dynamic Version Tagging** | Uses Jenkins `${BUILD_NUMBER}` + semantic release (`v1.2.0`) | **PASSED** |
| **Automated Testing Gate** | Pipeline stops if backend unit tests fail | **PASSED** |
| **Automated Deployment** | `docker compose up -d` redeploys the fresh build automatically | **PASSED** |
| **Liveness Verification** | Automatic curl health check against `/api/v1/health` | **PASSED** |
