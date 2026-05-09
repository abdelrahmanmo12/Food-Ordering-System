package com.foodordering.delivery.service;

import com.foodordering.delivery.clients.OrderServiceClient;
import com.foodordering.delivery.clients.UserServiceClient;
import com.foodordering.delivery.clients.PaymentServiceClient;
import com.foodordering.delivery.dto.DeliveryRequest;
import com.foodordering.delivery.dto.DeliveryResponse;
import com.foodordering.delivery.dto.OrderDTO;
import com.foodordering.delivery.dto.OrderStatusUpdateRequest;
import com.foodordering.delivery.dto.UserDTO;
import com.foodordering.delivery.entity.Delivery;
import com.foodordering.delivery.exception.DeliveryNotFoundException;
import com.foodordering.delivery.exception.InvalidDeliveryStatusException;
import com.foodordering.delivery.exception.OrderAlreadyAssignedException;
import com.foodordering.delivery.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final OrderServiceClient orderServiceClient;
    private final UserServiceClient userServiceClient;
    private final PaymentServiceClient paymentServiceClient;

    @Transactional
    public DeliveryResponse assignDelivery(DeliveryRequest request) {
        log.info("Assigning delivery for order: {}", request.getOrderId());

        // Check if delivery already exists for this order
        if (deliveryRepository.existsByOrderId(request.getOrderId())) {
            throw new OrderAlreadyAssignedException("Delivery already assigned for order: " + request.getOrderId());
        }

        // Validate order exists and is in correct status
        OrderDTO order = orderServiceClient.getOrder(request.getOrderId());
        if (order == null) {
            throw new DeliveryNotFoundException("Order not found: " + request.getOrderId());
        }

        // Validate delivery person exists and is available
        UserDTO deliveryPerson = userServiceClient.getUserById(request.getDeliveryPersonId());
        if (deliveryPerson == null) {
            throw new DeliveryNotFoundException("Delivery person not found: " + request.getDeliveryPersonId());
        }

        // Verify payment exists for this order before assigning delivery
        Object paymentResponse = paymentServiceClient.getPaymentsByOrderId(request.getOrderId());
        if (paymentResponse == null) {
            throw new DeliveryNotFoundException("No payment found for order: " + request.getOrderId());
        }

        // Create delivery
        Delivery delivery = Delivery.builder()
                .orderId(request.getOrderId())
                .deliveryPersonId(request.getDeliveryPersonId())
                .customerId(order.getUserId())
                .pickupAddress(request.getPickupAddress())
                .deliveryAddress(request.getDeliveryAddress())
                .specialInstructions(request.getSpecialInstructions())
                .estimatedDeliveryTime(request.getEstimatedDeliveryTime())
                .status(Delivery.DeliveryStatus.ASSIGNED)
                .build();

        Delivery savedDelivery = deliveryRepository.save(delivery);
        log.info("Delivery assigned successfully - DeliveryId: {}, OrderId: {}", 
                savedDelivery.getId(), savedDelivery.getOrderId());

        return mapToDeliveryResponse(savedDelivery);
    }

    @Transactional
    public DeliveryResponse updateDeliveryStatus(Long deliveryId, Delivery.DeliveryStatus newStatus) {
        log.info("Updating delivery status - DeliveryId: {}, NewStatus: {}", deliveryId, newStatus);

        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new DeliveryNotFoundException("Delivery not found: " + deliveryId));

        // Validate status transition
        validateStatusTransition(delivery.getStatus(), newStatus);

        delivery.setStatus(newStatus);
        
        // Set actual delivery time when delivered
        if (newStatus == Delivery.DeliveryStatus.DELIVERED) {
            delivery.setActualDeliveryTime(LocalDateTime.now());
            // Update order status to delivered
            orderServiceClient.updateOrderStatus(delivery.getOrderId(), new OrderStatusUpdateRequest("DELIVERED"));
        }

        Delivery savedDelivery = deliveryRepository.save(delivery);
        log.info("Delivery status updated successfully - DeliveryId: {}, Status: {}", 
                savedDelivery.getId(), savedDelivery.getStatus());

        return mapToDeliveryResponse(savedDelivery);
    }

    public DeliveryResponse getDeliveryById(Long deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new DeliveryNotFoundException("Delivery not found: " + deliveryId));
        return mapToDeliveryResponse(delivery);
    }

    public List<DeliveryResponse> getDeliveriesByDeliveryPerson(Long deliveryPersonId) {
        List<Delivery> deliveries = deliveryRepository.findByDeliveryPersonId(deliveryPersonId);
        return deliveries.stream()
                .map(this::mapToDeliveryResponse)
                .collect(Collectors.toList());
    }

    public List<DeliveryResponse> getDeliveriesByCustomer(String customerId) {
        List<Delivery> deliveries = deliveryRepository.findByCustomerId(customerId);
        return deliveries.stream()
                .map(this::mapToDeliveryResponse)
                .collect(Collectors.toList());
    }

    public List<DeliveryResponse> getDeliveriesByStatus(Delivery.DeliveryStatus status) {
        List<Delivery> deliveries = deliveryRepository.findByStatus(status);
        return deliveries.stream()
                .map(this::mapToDeliveryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelDelivery(Long deliveryId, String reason) {
        log.info("Cancelling delivery - DeliveryId: {}, Reason: {}", deliveryId, reason);

        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new DeliveryNotFoundException("Delivery not found: " + deliveryId));

        // Can only cancel assigned or picked up deliveries
        if (delivery.getStatus() != Delivery.DeliveryStatus.ASSIGNED && 
            delivery.getStatus() != Delivery.DeliveryStatus.PICKED_UP) {
            throw new InvalidDeliveryStatusException(
                    "Cannot cancel delivery in status: " + delivery.getStatus());
        }

        delivery.setStatus(Delivery.DeliveryStatus.CANCELLED);
        deliveryRepository.save(delivery);

        // Update order status back to confirmed or preparing
        orderServiceClient.updateOrderStatus(delivery.getOrderId(), new OrderStatusUpdateRequest("CONFIRMED"));
        
        log.info("Delivery cancelled successfully - DeliveryId: {}", deliveryId);
    }

    private void validateStatusTransition(Delivery.DeliveryStatus currentStatus, Delivery.DeliveryStatus newStatus) {
        switch (currentStatus) {
            case ASSIGNED:
                if (newStatus != Delivery.DeliveryStatus.PICKED_UP && 
                    newStatus != Delivery.DeliveryStatus.CANCELLED) {
                    throw new InvalidDeliveryStatusException(
                            "Invalid status transition from ASSIGNED to " + newStatus);
                }
                break;
            case PICKED_UP:
                if (newStatus != Delivery.DeliveryStatus.IN_TRANSIT && 
                    newStatus != Delivery.DeliveryStatus.CANCELLED) {
                    throw new InvalidDeliveryStatusException(
                            "Invalid status transition from PICKED_UP to " + newStatus);
                }
                break;
            case IN_TRANSIT:
                if (newStatus != Delivery.DeliveryStatus.DELIVERED) {
                    throw new InvalidDeliveryStatusException(
                            "Invalid status transition from IN_TRANSIT to " + newStatus);
                }
                break;
            case DELIVERED:
            case CANCELLED:
                throw new InvalidDeliveryStatusException(
                        "Cannot change status from " + currentStatus);
        }
    }

    private DeliveryResponse mapToDeliveryResponse(Delivery delivery) {
        return DeliveryResponse.builder()
                .id(delivery.getId())
                .orderId(delivery.getOrderId())
                .deliveryPersonId(delivery.getDeliveryPersonId())
                .customerId(delivery.getCustomerId())
                .status(delivery.getStatus())
                .pickupAddress(delivery.getPickupAddress())
                .deliveryAddress(delivery.getDeliveryAddress())
                .specialInstructions(delivery.getSpecialInstructions())
                .estimatedDeliveryTime(delivery.getEstimatedDeliveryTime())
                .actualDeliveryTime(delivery.getActualDeliveryTime())
                .createdAt(delivery.getCreatedAt())
                .updatedAt(delivery.getUpdatedAt())
                .build();
    }
}
