package com.foodordering.order.services;

import com.foodordering.order.abstracts.OrderService;
import com.foodordering.order.clients.RestaurantClient;
import com.foodordering.order.clients.UserClient;
import com.foodordering.order.DTOs.*;
import com.foodordering.order.entity.*;
import com.foodordering.order.exceptions.*;
import com.foodordering.order.messaging.events.NotificationEvent;
import com.foodordering.order.aspect.Interfaces.AdminOnly;
import com.foodordering.order.aspect.Interfaces.CheckOwnerAndAdmin;
import com.foodordering.order.aspect.Interfaces.OnlySpecificOwner;
import com.foodordering.order.repositories.OrderRepository;
import com.foodordering.order.repositories.CartRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate; // إضافة كافكا
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j; // تأكد من صحة هذا السطر

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepo;
    private final CartRepository cartRepo;
    private final RestaurantClient restaurantClient;
    private final UserClient userClient;
    // private final NotificationClient notificationClient; // Removed Feign client
    
    // إضافة الـ Template الخاص بكافكا لإرسال الأحداث
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // اسم التوبيك الموحد للأحداث
    private static final String ORDER_TOPIC = "order-events-topic";
    private static final String NOTIFICATION_TOPIC = "send-notification";

    @Override
    public OrderCreationResponse createOrder(OrderRequest request) {
        var restaurant = restaurantClient.getById(request.getRestaurantId());
        validateRestaurant(restaurant, String.valueOf(request.getRestaurantId()));

        UserProfileResponse userProfile = userClient.getUserById(request.getCustomerId());

        double total = 0;
        List<OrderItem> items = new ArrayList<>();

        for (var reqItem : request.getItems()) {
            var menuItem = restaurantClient.getItemById(reqItem.getItemId());
            if (menuItem == null)
                throw new RestaurantNotFoundException("Item not found: " + reqItem.getItemId());

            double price = menuItem.getPrice();
            total += price * reqItem.getQuantity();

            items.add(OrderItem.builder()
                    .name(menuItem.getName())
                    .price(price)
                    .quantity(reqItem.getQuantity())
                    .build());
        }

        String orderNumber = "ORD-" + (1000 + (int) (Math.random() * 9000));

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customerId(String.valueOf(request.getCustomerId()))
                .phone(userProfile.getPhoneNumber())
                .customerName(userProfile.getFullName())
                .address(userProfile.getAddress() != null ? userProfile.getAddress() : request.getAddress())
                .restaurantId(request.getRestaurantId())
                .restaurantName(restaurant.getName())
                .items(items)
                .totalPrice(total)
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        Order savedOrder = orderRepo.save(order);
        
        // إرسال الحدث لكافكا بعد الحفظ بنجاح
        sendKafkaEvent(savedOrder);

        sendNotificationSafe(Long.valueOf(order.getCustomerId()), order.getOrderNumber(), getStatusMessage(order.getStatus()));        
        notifyOwner(savedOrder, "New order #" + savedOrder.getOrderNumber() + " received! Waiting for payment.");
        
        return new OrderCreationResponse(order.getId(), "Order placed successfully");
    }

    @Override
    public OrderResponse checkout(Long customerId, CheckoutRequest request) {

        UserProfileResponse userProfile = userClient.getUserById(customerId);

        Cart cart = cartRepo.findByCustomerId(customerId)
                .orElseThrow(() -> new CartNotFoundException(String.valueOf(customerId)));

        if (cart.getItems() == null || cart.getItems().isEmpty())
            throw new CartNotFoundException(String.valueOf(customerId));

        var restaurant = restaurantClient.getByName(cart.getRestaurantName());
        validateRestaurant(restaurant, cart.getRestaurantName());

        double total = cart.getItems()
                .stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        String orderNumber = "ORD-" + (1000 + (int) (Math.random() * 9000));

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customerId(String.valueOf(customerId))
                .phone(userProfile.getPhoneNumber())
                .customerName(userProfile.getFullName())
                .address(userProfile.getAddress() != null ? userProfile.getAddress() : request.getAddress())
                .restaurantName(cart.getRestaurantName())
                .items(cart.getItems())
                .totalPrice(total)
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        Order savedOrder = orderRepo.save(order);
        cartRepo.deleteByCustomerId(customerId);

        // إرسال الحدث لكافكا
        sendKafkaEvent(savedOrder);

        sendNotificationSafe(Long.valueOf(order.getCustomerId()), order.getOrderNumber(), getStatusMessage(order.getStatus()));
        notifyOwner(savedOrder, "New order #" + savedOrder.getOrderNumber() + " received via checkout! Waiting for payment.");
        return map(order);
    }

    @Override
    @CheckOwnerAndAdmin
    public OrderResponse updateOrderStatus(String orderNumber, UserDTO user, OrderStatus status) {
        Order order = orderRepo.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException(orderNumber));

        if (order.getStatus() == OrderStatus.CANCELLED)
            throw new InvalidOrderStateException("Cannot update a cancelled order");
        if (order.getStatus() == OrderStatus.DELIVERED)
            throw new InvalidOrderStateException("Order already delivered — cannot update");

        order.setStatus(status);
        Order updatedOrder = orderRepo.save(order);
        
        // إرسال التحديث لكافكا ليتمكن نظام المطعم أو التوصيل من متابعة الحالة
        sendKafkaEvent(updatedOrder);
        
        sendNotificationSafe(Long.valueOf(order.getCustomerId()), order.getOrderNumber(), getStatusMessage(order.getStatus()));        
        return map(updatedOrder);
    }

    /**
     * دالة مساعدة لإرسال الحدث لكافكا بشكل آمن
     */
    private void sendKafkaEvent(Order order) {
        try {
            kafkaTemplate.send(ORDER_TOPIC, order);
            System.out.println(">>> Kafka Event Sent: Order #" + order.getOrderNumber() + " with status: " + order.getStatus());
        } catch (Exception e) {
            System.err.println("!!! Failed to send event to Kafka for Order #" + order.getOrderNumber());
            e.printStackTrace();
        }
    }

    // --- بقية الدوال كما هي بدون تغيير ---

    @Override
    public List<OrderResponse> getOrders(Long customerId) {
        String customerIdStr = String.valueOf(customerId);
        return orderRepo.findAll().stream()
                .filter(order -> customerIdStr.equals(order.getCustomerId()))
                .map(this::map)
                .toList();
    }

    @Override
    public void cancelOrder(String orderNumber) {
        Order order = orderRepo.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException(orderNumber));
        
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.OUT_FOR_DELIVERY)
            throw new InvalidOrderStateException("Cannot cancel an order that is out for delivery or delivered");
        if (order.getStatus() == OrderStatus.CANCELLED)
            throw new InvalidOrderStateException("Order is already cancelled");

        order.setStatus(OrderStatus.CANCELLED);
        orderRepo.save(order);
        
        sendKafkaEvent(order); // إرسال حدث الإلغاء
        sendNotificationSafe(Long.valueOf(order.getCustomerId()), order.getOrderNumber(), getStatusMessage(order.getStatus()));
    }

    @Override
    public CartResponse addToCart(Long customerId, List<com.foodordering.order.DTOs.CartItemRequest> items, String restaurantName) {
        var restaurant = restaurantClient.getByName(restaurantName);
        validateRestaurant(restaurant, restaurantName);

        Cart cart = cartRepo.findByCustomerId(customerId)
                .orElse(Cart.builder()
                        .customerId(customerId)
                        .restaurantName(restaurantName)
                        .items(new ArrayList<>())
                        .build());

        for (var reqItem : items) {
            var menu = restaurantClient.getItemByName(Long.valueOf(restaurant.getId()), reqItem.getItemName());
            if (menu == null) throw new RestaurantNotFoundException(reqItem.getItemName());

            Optional<OrderItem> existing = cart.getItems().stream()
                    .filter(i -> i.getName().equalsIgnoreCase(menu.getName()))
                    .findFirst();

            if (existing.isPresent()) {
                existing.get().setQuantity(existing.get().getQuantity() + reqItem.getQuantity());
            } else {
                cart.getItems().add(OrderItem.builder()
                        .name(menu.getName())
                        .price(menu.getPrice())
                        .quantity(reqItem.getQuantity())
                        .build());
            }
        }
        cartRepo.save(cart);
        return mapCart(cart);
    }

    @Override
    public CartResponse getCart(Long customerId) {
        return cartRepo.findByCustomerId(customerId)
                .map(this::mapCart)
                .orElse(CartResponse.builder()
                        .customerId(customerId)
                        .items(new ArrayList<>())
                        .totalPrice(0.0)
                        .message("Your cart is empty — start adding items!")
                        .build());
    }

    @Override
    public void clearCart(Long customerId) {
        cartRepo.deleteByCustomerId(customerId);
    }

    @Override
    public CartResponse removeFromCart(Long customerId, String itemName) {
        Cart cart = cartRepo.findByCustomerId(customerId)
                .orElseThrow(() -> new CartNotFoundException(String.valueOf(customerId)));
        boolean removed = cart.getItems().removeIf(item -> item.getName().equalsIgnoreCase(itemName));
        if (!removed) throw new RestaurantNotFoundException("Item not found in cart: " + itemName);
        cartRepo.save(cart);
        return mapCart(cart);
    }

    @Override
    @AdminOnly
    public List<OrderResponse> getAllOrders(UserDTO user) {
        return orderRepo.findAll().stream().map(this::map).toList();
    }

    @Override
    @AdminOnly
    public void deleteOrder(String orderNumber, UserDTO user) {
        Order order = orderRepo.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException(orderNumber));
        orderRepo.deleteById(order.getId());
    }

    @Override
    @OnlySpecificOwner
    public List<RestaurantOrderResponse> getOrdersByRestaurant(Long restaurantId, UserDTO user) {
        return orderRepo.findByRestaurantId(restaurantId).stream().map(this::mapToRestaurantOrder).toList();
    }

    @Override
    public OrderTrackingResponse trackOrder(String orderNumber) {
        Order order = orderRepo.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException(orderNumber));
        return OrderTrackingResponse.builder()
                .orderNumber(order.getOrderNumber())
                .restaurantName(order.getRestaurantName())
                .customerName(order.getCustomerName())
                .address(order.getAddress())
                .status(order.getStatus())
                .statusMessage(getStatusMessage(order.getStatus()))
                .createdAt(order.getCreatedAt().toString())
                .build();
    }

    private OrderResponse map(Order order) {
        return OrderResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .restaurantName(order.getRestaurantName())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .items(order.getItems())
                .build();
    }

    private CartResponse mapCart(Cart cart) {
        double total = cart.getItems().stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
        return CartResponse.builder()
                .customerId(cart.getCustomerId())
                .restaurantName(cart.getRestaurantName())
                .items(cart.getItems())
                .totalPrice(total)
                .message("Cart updated successfully")
                .build();
    }

    private RestaurantOrderResponse mapToRestaurantOrder(Order order) {
        return RestaurantOrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getCustomerName())
                .customerId(order.getCustomerId())
                .address(order.getAddress())
                .items(order.getItems())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .statusMessage(getStatusMessage(order.getStatus()))
                .createdAt(order.getCreatedAt().toString())
                .build();
    }

    private String getStatusMessage(OrderStatus status) {
        switch (status) {
            case PENDING: return "Order received! Waiting for payment confirmation.";
            case PAID: return "Payment confirmed! Waiting for restaurant to confirm your order.";
            case CONFIRMED: return "Order confirmed! Restaurant is preparing your order.";
            case PREPARING: return "Your order is being prepared by the restaurant.";
            case READY: return "Your order is ready for pickup/delivery!";
            case OUT_FOR_DELIVERY: return "Your order is on the way! Driver is heading to you.";
            case DELIVERED: return "Order delivered! Enjoy your meal.";
            case CANCELLED: return "Your order has been cancelled.";
            case REFUNDED: return "Your order has been refunded.";
            case CREATED: return "Order created! Preparing for checkout.";
            default: return "Order status updated to " + status;
        }
    }

    @Override
    public void updateOrderStatus(String orderId, OrderStatus status) {
        Order order = orderRepo.findById(orderId).orElseThrow(() -> new OrderNotFoundException(orderId));
        order.setStatus(status);
        orderRepo.save(order);
        sendKafkaEvent(order);
        
        // Notify customer
        sendNotificationSafe(Long.valueOf(order.getCustomerId()), order.getOrderNumber(), getStatusMessage(order.getStatus()));
    }

    @Override
    public OrderDTO getOrderForPayment(String orderId) {
        Order order = orderRepo.findById(orderId).orElseThrow(() -> new OrderNotFoundException(orderId));
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(item -> OrderItemDTO.builder().name(item.getName()).price(BigDecimal.valueOf(item.getPrice())).quantity(item.getQuantity()).build())
                .collect(Collectors.toList());
        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getCustomerId())
                .orderNumber(order.getOrderNumber())
                .totalAmount(BigDecimal.valueOf(order.getTotalPrice()))
                .status(convertToOrderDTOStatus(order.getStatus()))
                .createdAt(order.getCreatedAt())
                .items(itemDTOs)
                .build();
    }

   private OrderDTO.OrderStatus convertToOrderDTOStatus(OrderStatus orderStatus) {
    return switch (orderStatus) {
        case PENDING -> OrderDTO.OrderStatus.PENDING;
        case CONFIRMED -> OrderDTO.OrderStatus.CONFIRMED;
        case PREPARING -> OrderDTO.OrderStatus.PREPARING;
        case OUT_FOR_DELIVERY -> OrderDTO.OrderStatus.OUT_FOR_DELIVERY;
        case DELIVERED -> OrderDTO.OrderStatus.DELIVERED;
        case CANCELLED -> OrderDTO.OrderStatus.CANCELLED;
        case READY -> OrderDTO.OrderStatus.READY;
        case REFUNDED -> OrderDTO.OrderStatus.REFUNDED;
        case PAID -> OrderDTO.OrderStatus.PAID;
        case CREATED -> OrderDTO.OrderStatus.CREATED;
        default -> throw new IllegalArgumentException("Unknown order status: " + orderStatus);
    };
}

    private void validateRestaurant(RestaurantDTO restaurant, String identifier) {
        if (restaurant == null) throw new RestaurantNotFoundException(identifier);
        if (!restaurant.isOpened() || !"APPROVED".equals(restaurant.getStatus())) 
            throw new InvalidOrderStateException("Restaurant is currently closed or not active.");
    }

    private void sendNotificationSafe(Long userId, String orderNumber, String message) {
        try {
            NotificationEvent event = NotificationEvent.builder()
                    .userId(String.valueOf(userId))
                    .message(message)
                    .type("ORDER_UPDATE")
                    .build();
            kafkaTemplate.send(NOTIFICATION_TOPIC, event);
            log.info("Sent Kafka notification event for userId {} regarding order {}", userId, orderNumber);
        } catch (Exception e) {
            log.error("Failed to send Kafka notification for order {}", orderNumber, e);
        }
    }

    private void notifyOwner(Order order, String message) {
        try {
            // Get restaurant owner ID
            var restaurant = restaurantClient.getById(order.getRestaurantId());
            if (restaurant != null && restaurant.getOwnerId() != null) {
                sendNotificationSafe(restaurant.getOwnerId(), order.getOrderNumber(), message);
                log.info("Notified owner {} for order {}", restaurant.getOwnerId(), order.getOrderNumber());
            } else {
                log.warn("Could not find owner for restaurant {}", order.getRestaurantId());
            }
        } catch (Exception e) {
            log.error("Failed to notify owner for order {}", order.getOrderNumber(), e);
        }
    }

    @Override
    public void handlePostPayment(Order order) {
        // Send notification to customer
        sendNotificationSafe(Long.valueOf(order.getCustomerId()), order.getOrderNumber(), getStatusMessage(order.getStatus()));
        
        // Notify owner about payment
        if (order.getStatus() == OrderStatus.PAID) {
            notifyOwner(order, "Order #" + order.getOrderNumber() + " has been PAID! Please confirm it to start preparation.");
        }
    }
}