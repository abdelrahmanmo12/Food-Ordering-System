package com.foodordering.payment.service;

import com.foodordering.payment.dto.PaymentRequest;
import com.foodordering.payment.dto.PaymentResponse;
import com.foodordering.payment.dto.RefundRequest;
import com.foodordering.payment.entity.Payment;
import com.foodordering.payment.exception.PaymentProcessingException;
import com.foodordering.payment.mapper.PaymentMapper;
import com.foodordering.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private StripeService stripeService;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(paymentRepository, new PaymentMapper(), stripeService);
    }

    @Test
    void createPaymentRecordsCashOnDeliveryWithoutStripe() throws Exception {
        PaymentRequest request = new PaymentRequest(10L, 20L, BigDecimal.valueOf(150),
                Payment.PaymentMethod.CASH_ON_DELIVERY, "Pay on delivery");

        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Object response = paymentService.createPayment(request);

        PaymentResponse paymentResponse = assertInstanceOf(PaymentResponse.class, response);
        assertEquals(Payment.PaymentStatus.PENDING, paymentResponse.getStatus());
        assertEquals(Payment.PaymentMethod.CASH_ON_DELIVERY, paymentResponse.getPaymentMethod());
        verify(stripeService, never()).createPaymentIntent(any(Long.class), any(), any(), any(), any());
    }

    @Test
    void createPaymentIntentRejectsOfflinePaymentMethod() {
        PaymentRequest request = new PaymentRequest(10L, 20L, BigDecimal.valueOf(150),
                Payment.PaymentMethod.CASH_ON_DELIVERY, "Pay on delivery");

        assertThrows(PaymentProcessingException.class, () -> paymentService.createPaymentIntent(request));
    }

    @Test
    void processRefundRejectsAmountGreaterThanOriginalPayment() {
        Payment payment = new Payment();
        payment.setPaymentId("PAY-1");
        payment.setAmount(BigDecimal.valueOf(100));
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setPaymentMethod(Payment.PaymentMethod.CREDIT_CARD);

        when(paymentRepository.findByPaymentId("PAY-1")).thenReturn(Optional.of(payment));

        RefundRequest request = new RefundRequest("PAY-1", 101.0, "Too much");

        assertThrows(PaymentProcessingException.class, () -> paymentService.processRefund(request));
    }

    @Test
    void cancelPaymentRejectsNonPendingPayment() {
        Payment payment = new Payment();
        payment.setPaymentId("PAY-2");
        payment.setAmount(BigDecimal.valueOf(100));
        payment.setStatus(Payment.PaymentStatus.FAILED);
        payment.setPaymentMethod(Payment.PaymentMethod.CASH_ON_DELIVERY);

        when(paymentRepository.findByPaymentId("PAY-2")).thenReturn(Optional.of(payment));

        assertThrows(PaymentProcessingException.class, () -> paymentService.cancelPayment("PAY-2"));
        verify(paymentRepository, never()).save(any(Payment.class));
    }
}
