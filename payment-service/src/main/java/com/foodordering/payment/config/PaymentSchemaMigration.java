package com.foodordering.payment.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentSchemaMigration {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void migratePaymentMethodColumn() {
        if (!paymentsTableExists()) {
            return;
        }

        sanitizePaymentData();
    }

    public void sanitizePaymentData() {
        try {
            dropLegacyCheckConstraints();
            jdbcTemplate.execute("ALTER TABLE payments MODIFY payment_method VARCHAR(50) NOT NULL");
            jdbcTemplate.execute("ALTER TABLE payments MODIFY status VARCHAR(50) NOT NULL");
            jdbcTemplate.update("UPDATE payments SET payment_method = 'CREDIT_CARD' WHERE payment_method = '0'");
            jdbcTemplate.update("UPDATE payments SET payment_method = 'DEBIT_CARD' WHERE payment_method = '1'");
            jdbcTemplate.update("UPDATE payments SET payment_method = 'PAYPAL' WHERE payment_method = '2'");
            jdbcTemplate.update("UPDATE payments SET payment_method = 'CASH_ON_DELIVERY' WHERE payment_method = '3'");
            jdbcTemplate.update("UPDATE payments SET payment_method = 'BANK_TRANSFER' WHERE payment_method = '4'");
            jdbcTemplate.update("""
                    UPDATE payments
                    SET payment_method = 'CASH_ON_DELIVERY'
                    WHERE payment_method IS NULL
                       OR TRIM(payment_method) = ''
                       OR payment_method NOT IN (
                           'CREDIT_CARD',
                           'DEBIT_CARD',
                           'DIGITAL_WALLET',
                           'PAYPAL',
                           'CASH_ON_DELIVERY',
                           'BANK_TRANSFER'
                       )
                    """);
            jdbcTemplate.update("""
                    UPDATE payments
                    SET status = 'PENDING'
                    WHERE status IS NULL
                       OR TRIM(status) = ''
                       OR status NOT IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED')
                    """);
            log.info("Payment method schema migration completed");
        } catch (Exception e) {
            log.warn("Payment method schema migration skipped: {}", e.getMessage());
        }
    }

    private void dropLegacyCheckConstraints() {
        List<String> constraintNames = jdbcTemplate.queryForList("""
                SELECT constraint_name
                FROM information_schema.table_constraints
                WHERE table_schema = DATABASE()
                  AND table_name = 'payments'
                  AND constraint_type = 'CHECK'
                """, String.class);

        for (String constraintName : constraintNames) {
            try {
                jdbcTemplate.execute("ALTER TABLE payments DROP CHECK " + constraintName);
                log.info("Dropped legacy payments check constraint: {}", constraintName);
            } catch (Exception e) {
                log.debug("Could not drop payments check constraint {}: {}", constraintName, e.getMessage());
            }
        }
    }

    private boolean paymentsTableExists() {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'payments'",
                Integer.class
        );
        return count != null && count > 0;
    }
}
