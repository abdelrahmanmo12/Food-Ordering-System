package com.foodordering.order.services;

import com.foodordering.order.abstracts.OrderService;
import com.foodordering.order.clients.RestaurantClient;
import com.foodordering.order.clients.UserClient;
import com.foodordering.order.DTOs.*;
import com.foodordering.order.entity.*;
import com.foodordering.order.exceptions.*;
import com.foodordering.order.aspect.Interfaces.AdminOnly;
import com.foodordering.order.repositories.*;
import com.foodordering.order.aspect.Interfaces.CheckOwnerAndAdmin;
import com.foodordering.order.aspect.Interfaces.OnlySpecificOwner;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepo;
    private final CartRepository cartRepo;
    private final RestaurantClient restaurantClient;
    private final UserClient userClient;

    @Override
    public OrderCreationResponse createOrder(OrderRequest request) {
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
                .customerId(request.getCustomerId())
                .phone(userProfile.getPhoneNumber())
                .customerName(userProfile.getFullName())
                .address(userProfile.getAddress() != null ? userProfile.getAddress() : request.getAddress())
                .restaurantId(request.getRestaurantId())
                .items(items)
                .totalPrice(total)
                .status(OrderStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .build();

        orderRepo.save(order);
        return new OrderCreationResponse(order.getId(), "Order placed successfully");
    }

    @Override
    public OrderResponse checkout(Long customerId, CheckoutRequest request) {

        UserProfileResponse userProfile = userClient.getUserById(customerId);

        Cart cart = cartRepo.findByCustomerId(customerId) // ✅
                .orElseThrow(() -> new CartNotFoundException(String.valueOf(customerId)));

        if (cart.getItems() == null || cart.getItems().isEmpty())
            throw new CartNotFoundException(String.valueOf(customerId));

        double total = cart.getItems()
                .stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        String orderNumber = "ORD-" + (1000 + (int) (Math.random() * 9000));

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customerId(customerId) // ✅
                .phone(userProfile.getPhoneNumber())
                .customerName(userProfile.getFullName())
                .address(userProfile.getAddress() != null ? userProfile.getAddress() : request.getAddress())
                .restaurantName(cart.getRestaurantName())
                .items(cart.getItems())
                .totalPrice(total)
                .status(OrderStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .build();

        orderRepo.save(order);
        cartRepo.deleteByCustomerId(customerId); // ✅ clears cart after checkout

        return map(order);
    }

    @Override
    public List<OrderResponse> getOrders(Long customerId) {
        return orderRepo.findByCustomerId(customerId) // ✅
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public void cancelOrder(String orderNumber) {
        Order order = orderRepo.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException(orderNumber));

        if (order.getStatus() == OrderStatus.DELIVERED)
            throw new InvalidOrderStateException("Cannot cancel a delivered order");
        if (order.getStatus() == OrderStatus.CANCELLED)
            throw new InvalidOrderStateException("Order is already cancelled");

        order.setStatus(OrderStatus.CANCELLED);
        orderRepo.save(order);
    }

    @Override
    public CartResponse addToCart(Long customerId, List<com.foodordering.order.DTOs.CartItemRequest> items,
            String restaurantName) {

        var restaurant = restaurantClient.getByName(restaurantName);
        if (restaurant == null)
            throw new RestaurantNotFoundException(restaurantName);

        Cart cart = cartRepo.findByCustomerId(customerId) // ✅
                .orElse(Cart.builder()
                        .customerId(customerId) // ✅
                        .restaurantName(restaurantName)
                        .items(new ArrayList<>())
                        .build());

        for (var reqItem : items) {
            System.out.println("Restaurant ID = " + restaurant.getId());
            System.out.println("Restaurant Name = " + restaurant.getName());
            System.out.println("Searching item = " + reqItem.getItemName());
            var menu = restaurantClient.getItemByName(
                    Long.valueOf(restaurant.getId()),
                    reqItem.getItemName());
            if (menu == null)
                throw new RestaurantNotFoundException(reqItem.getItemName());

            Optional<OrderItem> existing = cart.getItems()
                    .stream()
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

    // @Override
    // public CartResponse addToCart(Long customerId, String itemName, int quantity, String restaurantName) {
    //     CartItemRequest item = new CartItemRequest();
    //     item.setItemName(itemName);
    //     item.setQuantity(quantity);
    //     return addToCart(customerId, List.of(item), restaurantName);
    // }

    // @Override
    // public CartResponse addToCart(Long customerId, String itemName, int quantity, Long restaurantId) {
    //     throw new UnsupportedOperationException("Use addToCart with restaurantName instead");
    // }

    @Override
    public CartResponse getCart(Long customerId) {
        return cartRepo.findByCustomerId(customerId) // ✅
                .map(this::mapCart)
                .orElse(CartResponse.builder()
                        .customerId(customerId) // ✅
                        .restaurantName(null)
                        .items(new ArrayList<>())
                        .totalPrice(0.0)
                        .message("Your cart is empty — start adding items!")
                        .build());
    }

    @Override
    public void clearCart(Long customerId) {
        cartRepo.deleteByCustomerId(customerId); // ✅
    }

    @Override
    public CartResponse removeFromCart(Long customerId, String itemName) {
        Cart cart = cartRepo.findByCustomerId(customerId) // ✅
                .orElseThrow(() -> new CartNotFoundException(String.valueOf(customerId)));

        boolean removed = cart.getItems()
                .removeIf(item -> item.getName().equalsIgnoreCase(itemName));

        if (!removed)
            throw new RestaurantNotFoundException("Item not found in cart: " + itemName);

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
    @CheckOwnerAndAdmin
    public OrderResponse updateOrderStatus(String orderNumber, UserDTO user, OrderStatus status) {
        Order order = orderRepo.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException(orderNumber));

        if (order.getStatus() == OrderStatus.CANCELLED)
            throw new InvalidOrderStateException("Cannot update a cancelled order");
        if (order.getStatus() == OrderStatus.DELIVERED)
            throw new InvalidOrderStateException("Order already delivered — cannot update");

        order.setStatus(status);
        orderRepo.save(order);
        return map(order);
    }

    @Override
    @OnlySpecificOwner
    public List<RestaurantOrderResponse> getOrdersByRestaurant(Long restaurantId, UserDTO user) {
        return orderRepo.findByRestaurantId(restaurantId)
                .stream()
                .map(this::mapToRestaurantOrder)
                .toList();
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

    // ===== Mappers =====

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
        double total = cart.getItems()
                .stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        return CartResponse.builder()
                .customerId(cart.getCustomerId()) // ✅
                .restaurantName(cart.getRestaurantName())
                .items(cart.getItems())
                .totalPrice(total)
                .message("Cart updated successfully")
                .build();
    }

    private RestaurantOrderResponse mapToRestaurantOrder(Order order) {
        return RestaurantOrderResponse.builder()
                .orderNumber(order.getOrderNumber())
                .customerName(order.getCustomerName())
                .customerId(String.valueOf(order.getCustomerId())) // ✅
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
            case CREATED:
                return "Order received! Waiting for restaurant to confirm.";
            case PREPARING:
                return "Your order is being prepared by the restaurant.";
            case OUT_FOR_DELIVERY:
                return "Your order is on the way! Driver is heading to you.";
            case DELIVERED:
                return "Order delivered! Enjoy your meal.";
            case CANCELLED:
                return "Your order has been cancelled.";
            default:
                return "Unknown status.";
        }
    }
}