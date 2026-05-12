package com.foodordering.order.service.messaging;

import com.foodordering.order.entity.Order;
import com.foodordering.order.entity.OrderStatus; // ✅ الـ Enum المطلوب
import com.foodordering.order.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentConsumer {

    private final OrderRepository orderRepository;

    // استماع للـ Topic الخاص بأحداث الدفع
    @KafkaListener(topics = "payment-events-topic", groupId = "order-service-group")
    public void consumePaymentEvent(Map<String, Object> eventData) {
        log.info("Received payment event from Kafka: {}", eventData);

        try {
            // استخراج البيانات من الرسالة (JSON -> Map)
            String orderId = (String) eventData.get("orderId");
            String status = (String) eventData.get("status");
            String action = (String) eventData.get("action");

            log.info("Processing {} for Order ID: {} with Payment Status: {}", action, orderId, status);

            // البحث عن الأوردر وتحديث حالته في MongoDB
            orderRepository.findById(orderId).ifPresentOrElse(order -> {
                updateOrderStatus(order, status);
                orderRepository.save(order);
                log.info("Order {} successfully updated to {}", orderId, order.getStatus());
            }, () -> log.error("Order not found with ID: {}", orderId));

        } catch (Exception e) {
            log.error("Error processing Kafka message: {}", e.getMessage());
        }
    }

    private void updateOrderStatus(Order order, String paymentStatus) {
        // تحويل الـ String القادم من Kafka إلى الـ Enum الخاص بالـ Order
        switch (paymentStatus) {
            case "COMPLETED":
                order.setStatus(OrderStatus.CONFIRMED); // ✅ استخدام الـ Enum مباشرة
                break;
            case "FAILED":
            case "CANCELLED":
                order.setStatus(OrderStatus.CANCELLED); // ✅ استخدام الـ Enum مباشرة
                break;
            case "REFUNDED":
                order.setStatus(OrderStatus.REFUNDED); // ✅ استخدام الـ Enum مباشرة
                break;
            default:
                log.warn("Unknown payment status received: {}. No status change made.", paymentStatus);
        }
    }

    // ميثود للتأكد من أن الـ Consumer بدأ العمل فور تشغيل التطبيق
    @EventListener(ApplicationReadyEvent.class)
    public void checkKafka() {
        log.info(">>>> Kafka Consumer is READY and Listening on topic: payment-events-topic...");
    }
}