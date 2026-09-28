# ==========================================
# Stage 1: Build JAR using Maven
# ==========================================
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /workspace

# Cache dependency layer first
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production package
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==========================================
# Stage 2: Minimal, secure runtime image
# ==========================================
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create a non-root application user for container security
RUN groupadd -r blmsgroup && useradd -r -g blmsgroup -m blmsuser

# Copy built artifact from builder stage
COPY --from=builder /workspace/target/blms-backend.jar /app/blms-backend.jar

# Change ownership
RUN chown -R blmsuser:blmsgroup /app

USER blmsuser

# Default application port
EXPOSE 8081

# Container health check using Spring Boot health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8081/api/v1/health || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/blms-backend.jar"]
