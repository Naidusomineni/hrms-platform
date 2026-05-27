# ── Stage 1: Build ────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B -q
COPY src ./src
RUN mvn clean package -DskipTests -B -q

# ── Stage 2: Runtime ──────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S hrms && adduser -S hrms -G hrms
RUN mkdir -p /app/uploads /app/logs && chown -R hrms:hrms /app
COPY --from=builder /app/target/*.jar app.jar
RUN chown hrms:hrms app.jar
USER hrms
EXPOSE 8080
ENTRYPOINT ["java",\
  "-XX:+UseContainerSupport",\
  "-XX:MaxRAMPercentage=75.0",\
  "-XX:+UseG1GC",\
  "-Djava.security.egd=file:/dev/./urandom",\
  "-jar","app.jar"]
