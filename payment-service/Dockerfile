# Use OpenJDK 17 as base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Build the application
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Copy the built JAR file
COPY target/payment-service-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8084
EXPOSE 8084

# Set environment variables
ENV SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/payment_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=root
ENV EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://discovery-server:8761/eureka/

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
