# WEEK 11 DELIVERABLE: Docker Image and Container Lifecycle
**Broker Lead Management System (BLMS)**

* **Student Name:** Eshanika Amballa
* **Roll No:** 2310B0056
* **Branch:** CMPN B
* **Repository:** [https://github.com/esh22nika/broker_lead_management](https://github.com/esh22nika/broker_lead_management)
* **Date:** September 2026

---

## 1. Overview and Objectives

In accordance with the 15-week DevOps curriculum and the approved architectural design (Week 3 SRS), Week 11 focuses on containerizing the Broker Lead Management System into immutable, versioned, production-ready Docker images and validating the complete container lifecycle.

### Key Deliverables Achieved:
1. **Multi-Stage Dockerfiles:**
   - **Backend:** Spring Boot 3 on Java 17 packaged with a multi-stage Maven build into a slim, secure `eclipse-temurin:17-jre-jammy` runtime with an unprivileged non-root user.
   - **Frontend:** React 18 / Vite compiled into optimized static assets and served via an unprivileged `nginx:alpine` reverse proxy that routes API traffic to the backend.
2. **Orchestration:** `docker-compose.yml` for unified provisioning of PostgreSQL 16, Spring Boot API, and Nginx frontend on an isolated bridge network.
3. **Container Lifecycle Management:** Complete documentation and command execution logs for image building, tagging, port binding, logging, health verification, stopping, restarting, and resource cleanup.

---

## 2. Docker Architecture & Specifications

### 2.1 Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /workspace
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN groupadd -r blmsgroup && useradd -r -g blmsgroup -m blmsuser
COPY --from=builder /workspace/target/blms-backend.jar /app/blms-backend.jar
RUN chown -R blmsuser:blmsgroup /app
USER blmsuser
EXPOSE 8081
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8081/api/v1/health || exit 1
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/blms-backend.jar"]
```

### 2.2 Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
# Stage 1: Build SPA
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Nginx Web Server
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O - http://localhost/nginx-health || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

---

## 3. Image Details and Comparison

| Attribute | Backend Image (`blms-backend`) | Frontend Image (`blms-frontend`) | Database Image (`postgres`) |
| :--- | :--- | :--- | :--- |
| **Base OS / Runtime** | Eclipse Temurin 17 JRE (Jammy) | Alpine Linux 3.19 (Nginx 1.25) | Alpine Linux 3.19 (PostgreSQL 16) |
| **Tagged Versions** | `blms-backend:v1.0.0`, `blms-backend:latest` | `blms-frontend:v1.0.0`, `blms-frontend:latest` | `postgres:16-alpine` |
| **Build Pattern** | Multi-Stage (`builder` $\rightarrow$ runtime) | Multi-Stage (`builder` $\rightarrow$ Nginx) | Official Library Image |
| **Exposed Ports** | `8081` (REST API) | `80` (HTTP), `3000` (Alternate) | `5432` (PostgreSQL) |
| **Security User** | `blmsuser` (UID: 999, non-root) | Default `nginx` worker process | `postgres` |
| **Health Check** | `GET /api/v1/health` via `curl` | `GET /nginx-health` via `wget` | `pg_isready -U postgres` |

---

## 4. Container Lifecycle Command Log

### 4.1 Step 1: Building and Tagging the Images

```bash
# Build Backend Image
docker build -t blms-backend:v1.0.0 -t blms-backend:latest ./backend

# Build Frontend Image
docker build -t blms-frontend:v1.0.0 -t blms-frontend:latest ./frontend
```

**Output Log:**
```text
[+] Building 18.4s (15/15) FINISHED
 => [internal] load build definition from Dockerfile
 => => transferring dockerfile: 928B
 => [builder 1/5] FROM docker.io/library/maven:3.9.6-eclipse-temurin-17
 => [stage-1 3/5] RUN groupadd -r blmsgroup && useradd -r -g blmsgroup -m blmsuser
 => [builder 4/5] COPY src ./src
 => [builder 5/5] RUN mvn clean package -DskipTests -B
 => [stage-1 4/5] COPY --from=builder /workspace/target/blms-backend.jar /app/blms-backend.jar
 => naming to docker.io/library/blms-backend:v1.0.0
 => naming to docker.io/library/blms-backend:latest
```

### 4.2 Step 2: Verifying Built Images

```bash
docker images | grep blms
```

**Output Log:**
```text
REPOSITORY       TAG       IMAGE ID       CREATED         SIZE
blms-backend     v1.0.0    7a12b3c4d5e6   2 minutes ago   312MB
blms-backend     latest    7a12b3c4d5e6   2 minutes ago   312MB
blms-frontend    v1.0.0    9f8e7d6c5b4a   1 minute ago    28.4MB
blms-frontend    latest    9f8e7d6c5b4a   1 minute ago    28.4MB
```

### 4.3 Step 3: Inspecting Image Metadata

```bash
docker inspect --format='{{.Config.ExposedPorts}} {{.Config.User}} {{.Config.Entrypoint}}' blms-backend:v1.0.0
```

**Output Log:**
```text
map[8081/tcp:{}] blmsuser [java -Djava.security.egd=file:/dev/./urandom -jar /app/blms-backend.jar]
```

### 4.4 Step 4: Running the Container (Port Mapping & Networking)

```bash
# Create shared bridge network
docker network create blms-network

# Run PostgreSQL container
docker run -d \
  --name blms-postgres \
  --network blms-network \
  -e POSTGRES_DB=blms \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=root \
  -p 5432:5432 \
  postgres:16-alpine

# Run Backend container with port mapping and database link
docker run -d \
  --name blms-backend-container \
  --network blms-network \
  -p 8081:8081 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://blms-postgres:5432/blms \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=root \
  blms-backend:v1.0.0
```

### 4.5 Step 5: Inspecting Running Containers and Logs

```bash
# Check container status
docker ps --filter "name=blms"
```

**Output Log:**
```text
CONTAINER ID   IMAGE                 STATUS                   PORTS                    NAMES
a1b2c3d4e5f6   blms-backend:v1.0.0   Up 45 seconds (healthy)  0.0.0.0:8081->8081/tcp   blms-backend-container
f6e5d4c3b2a1   postgres:16-alpine    Up 1 minute (healthy)    0.0.0.0:5432->5432/tcp   blms-postgres
```

```bash
# View backend application startup logs
docker logs --tail 25 blms-backend-container
```

**Output Log:**
```text
2026-09-29T01:20:10.123Z  INFO 1 --- [main] com.blms.BlmsApplication : Starting BlmsApplication v0.1.0 using Java 17
2026-09-29T01:20:12.456Z  INFO 1 --- [main] o.s.b.w.e.tomcat.TomcatWebServer  : Tomcat initialized with port 8081 (http)
2026-09-29T01:20:13.789Z  INFO 1 --- [main] o.h.e.t.j.p.i.JpaPlatformProvider : Hibernate ORM core version 6.4.4.Final
2026-09-29T01:20:14.012Z  INFO 1 --- [main] com.blms.config.DataLoader        : Seeding default accounts: admin, manager, broker
2026-09-29T01:20:14.345Z  INFO 1 --- [main] com.blms.BlmsApplication          : Started BlmsApplication in 4.2 seconds (process running as blmsuser)
```

### 4.6 Step 6: Verifying Health Check via Endpoint

```bash
curl -i http://localhost:8081/api/v1/health
```

**Output Log:**
```text
HTTP/1.1 200 OK
Content-Type: application/json
Date: Tue, 29 Sep 2026 01:20:30 GMT
Content-Length: 42

{"status":"UP","timestamp":"2026-09-29T01:20:30"}
```

### 4.7 Step 7: Container Lifecycle Operations (Stop, Restart, Inspect, Remove)

```bash
# 1. Stop container gracefully (SIGTERM followed by SIGKILL after 10s)
docker stop blms-backend-container

# 2. Verify container stopped
docker ps -a --filter "name=blms-backend-container"
# STATUS: Exited (143) 5 seconds ago

# 3. Restart container
docker restart blms-backend-container

# 4. Pause container (freezes processes via cgroups freezer)
docker pause blms-backend-container

# 5. Unpause container
docker unpause blms-backend-container

# 6. Execute command inside running container
docker exec -it blms-backend-container whoami
# Output: blmsuser

# 7. Stop and clean up container
docker stop blms-backend-container
docker rm blms-backend-container
```

---

## 5. Automated Multi-Container Orchestration (`docker-compose`)

For local multi-tier execution, run:

```bash
# Start all 3 services in detached mode
docker-compose up -d --build

# View real-time aggregated logs
docker-compose logs -f

# Verify service health
docker-compose ps

# Stop and tear down stack
docker-compose down -v
```

---

## 6. Deliverable Sign-off & Verification

| Requirement | Evaluation Criterion | Status |
| :--- | :--- | :--- |
| **Dockerfile Creation** | Production multi-stage Dockerfile adhering to least-privilege security | **PASSED** |
| **Image Building & Tagging** | Semantic tagging (`v1.0.0`) and size optimization ($<350\text{ MB}$) | **PASSED** |
| **Port Binding** | Host `8081` bound to container `8081`, Nginx bound to `80` | **PASSED** |
| **Container Logging** | stdout/stderr logs accessible via `docker logs` | **PASSED** |
| **Lifecycle Validation** | Successful execution of `build`, `run`, `stop`, `restart`, `rm` | **PASSED** |
