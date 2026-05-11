package com.foodordering.payment.service.strategy;

import com.foodordering.payment.dto.OrderDTO;
import com.foodordering.payment.dto.PaymentRequest;
import com.foodordering.payment.entity.Payment;
import com.foodordering.payment.mapper.PaymentMapper;
import com.foodordering.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ManualPaymentStrategy implements PaymentStrategy {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    @Override
    public boolean supports(Payment.PaymentMethod method) {
        return method == Payment.PaymentMethod.CASH_ON_DELIVERY ||
               method == Payment.PaymentMethod.BANK_TRANSFER;
    }

    @Override
    public Object process(PaymentRequest request, OrderDTO order) {
        log.info("Processing Manual payment strategy for order: {}", request.getOrderId());

        Payment payment = paymentMapper.toEntity(request);
        payment.setPaymentId(generatePaymentId());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setTransactionId("MANUAL-" + payment.getPaymentId());

        Payment savedPayment = paymentRepository.save(payment);
        
        log.info("Manual payment recorded - ID: {}, Method: {}", 
                savedPayment.getPaymentId(), savedPayment.getPaymentMethod());

        return paymentMapper.toResponse(savedPayment);
    }

    private String generatePaymentId() {
        return "PAY-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
