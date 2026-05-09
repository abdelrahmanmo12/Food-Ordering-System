package com.foodordering.delivery.controller;

import com.foodordering.delivery.dto.DeliveryRequest;
import com.foodordering.delivery.dto.DeliveryResponse;
import com.foodordering.delivery.entity.Delivery;
import com.foodordering.delivery.service.DeliveryAccessService;
import com.foodordering.delivery.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
@Slf4j
public class DeliveryController {

    private final DeliveryService deliveryService;
    private final DeliveryAccessService deliveryAccessService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<DeliveryResponse> assignDelivery(@Valid @RequestBody DeliveryRequest request, Authentication authentication) {
        log.info("Assigning delivery for order: {}", request.getOrderId());
        deliveryAccessService.assertCanManageDeliveries(authentication);
        DeliveryResponse response = deliveryService.assignDelivery(request);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/{deliveryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'DELIVERY', 'USER')")
    public ResponseEntity<DeliveryResponse> getDelivery(@PathVariable Long deliveryId, Authentication authentication) {
        log.info("Fetching delivery: {}", deliveryId);
        DeliveryResponse response = deliveryService.getDeliveryById(deliveryId);
        deliveryAccessService.assertCanAccessDelivery(response, authentication);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/delivery-person/{deliveryPersonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DELIVERY')")
    public ResponseEntity<List<DeliveryResponse>> getDeliveriesByDeliveryPerson(
            @PathVariable Long deliveryPersonId, Authentication authentication) {
        log.info("Fetching deliveries for delivery person: {}", deliveryPersonId);
        deliveryAccessService.assertCanAccessUserDeliveries(deliveryPersonId, authentication);
        List<DeliveryResponse> deliveries = deliveryService.getDeliveriesByDeliveryPerson(deliveryPersonId);
        return ResponseEntity.ok(deliveries);
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<DeliveryResponse>> getDeliveriesByCustomer(
            @PathVariable String customerId, Authentication authentication) {
        log.info("Fetching deliveries for customer: {}", customerId);
        deliveryAccessService.assertCanAccessUserDeliveries(customerId, authentication);
        List<DeliveryResponse> deliveries = deliveryService.getDeliveriesByCustomer(customerId);
        return ResponseEntity.ok(deliveries);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<List<DeliveryResponse>> getDeliveriesByStatus(
            @PathVariable Delivery.DeliveryStatus status, Authentication authentication) {
        log.info("Fetching deliveries with status: {}", status);
        deliveryAccessService.assertCanManageDeliveries(authentication);
        List<DeliveryResponse> deliveries = deliveryService.getDeliveriesByStatus(status);
        return ResponseEntity.ok(deliveries);
    }

    @PatchMapping("/{deliveryId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DELIVERY')")
    public ResponseEntity<DeliveryResponse> updateDeliveryStatus(
            @PathVariable Long deliveryId,
            @RequestBody DeliveryStatusUpdateRequest request, Authentication authentication) {
        log.info("Updating delivery status - DeliveryId: {}, NewStatus: {}", 
                deliveryId, request.getStatus());
        
        deliveryAccessService.assertCanUpdateDeliveryStatus(authentication);
        DeliveryResponse response = deliveryService.updateDeliveryStatus(deliveryId, request.getStatus());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{deliveryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<String> cancelDelivery(
            @PathVariable Long deliveryId,
            @RequestParam(required = false) String reason, Authentication authentication) {
        log.info("Cancelling delivery - DeliveryId: {}, Reason: {}", deliveryId, reason);
        deliveryAccessService.assertCanManageDeliveries(authentication);
        deliveryService.cancelDelivery(deliveryId, reason != null ? reason : "No reason provided");
        return ResponseEntity.ok("Delivery cancelled successfully");
    }

    // DTO for status update requests
    public static class DeliveryStatusUpdateRequest {
        private Delivery.DeliveryStatus status;

        public DeliveryStatusUpdateRequest() {}

        public DeliveryStatusUpdateRequest(Delivery.DeliveryStatus status) {
            this.status = status;
        }

        public Delivery.DeliveryStatus getStatus() {
            return status;
        }

        public void setStatus(Delivery.DeliveryStatus status) {
            this.status = status;
        }
    }
}
