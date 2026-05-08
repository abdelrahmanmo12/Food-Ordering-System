# Payment Service Fix: Switch to H2 In-Memory DB (No External MySQL)

## Steps:
- [x] 1. Understand issue: Empty MySQL password causing startup failure.
- [x] 2. Update application.properties to use H2 instead of MySQL.
- [x] 3. Ensure H2 dependency in pom.xml (add if missing).
- [ ] 4. Restart application.
- [ ] 5. Verify startup and actuator/health.
- [ ] 6. Set Stripe env vars for full functionality.
- [ ] 7. Test payment endpoints if needed.

**Status:** Config updated! 

**Next:** 
1. Run `./mvnw clean compile` (downloads H2).
2. Run `./mvnw spring-boot:run` or IDE restart.
3. Check http://localhost:8084/actuator/health (should be UP).
4. H2 Console: http://localhost:8084/h2-console (JDBC URL: jdbc:h2:mem:paymentdb, user:sa, pass: leave empty).
5. For Stripe: set env vars or update properties.
