# Build the application from source
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
COPY src src

RUN mvn clean package -DskipTests

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
ENV STRIPE_SECRET_KEY=${sk_test_51TNkmZLaPu9ajsblgH9mkHH3tgWrbSwN9yWYOWxXd9vjnG11rqNDurmZrE9428QBMxPFHOJ8p10vQof08g1wMHea00cnQNf6Z3}
ENV STRIPE_WEBHOOK_SECRET=${whsec_e94e4d18b68de95456369b80948a9b3fe04a91ac8a2ad7c283cd38ae30f405c8}

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
