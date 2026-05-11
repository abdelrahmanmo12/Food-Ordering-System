# Build the application from source
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
COPY src src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/delivery-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8087

ENV SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/delivery_db?createDatabaseIfNotExist=true
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=root
ENV EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://discovery-server:8761/eureka/
ENV SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI=http://auth-service:8081/.well-known/jwks.json

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
