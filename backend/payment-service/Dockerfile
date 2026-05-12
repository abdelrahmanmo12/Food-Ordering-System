# Build the application from source
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
COPY src src

RUN mvn clean package -Dmaven.test.skip=true

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/payment-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8084

ENV SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/payment_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=root
ENV EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://discovery-server:8761/eureka/
ENV SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI=http://auth-service:8081/.well-known/jwks.json
ENV SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI=http://auth-service:8081
ENV STRIPE_SECRET_KEY=sk_test_51TNkmnPturEXMFMXZddkaw1wlXIQkIM4WVZ6N8gBddU1PuFOWSXV5Uf68ktWC5I1eT23o4h9JsLcItiihGO5aAPz00ewuehlUJ
ENV STRIPE_WEBHOOK_SECRET=whsec_8d770e365cf43b976c44885b510e21494284155ca107d611983ec93f2f8a295b
# Kafka Configuration
ENV SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:9092
ENV SPRING_KAFKA_CONSUMER_GROUP_ID=payment-group
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
