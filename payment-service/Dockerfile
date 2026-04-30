# Build the application from source
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/payment-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8084

ENV SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/payment_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=root
ENV EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://discovery-server:8761/eureka/

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
