package com.foodordering.order.services;

import com.foodordering.order.abstracts.OrderService;
import com.foodordering.order.clients.RestaurantClient;
import com.foodordering.order.DTOs.*;
import com.foodordering.order.entity.*;
import com.foodordering.order.exceptions.*;
import com.foodordering.order.repositories.*;

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

    // ================= ORDER =================

    @Override
    public OrderResponse createOrder(OrderRequest request) {

        var restaurant = restaurantClient.getByName(request.getRestaurantName());

        if (restaurant == null) {
            throw new RestaurantNotFoundException(request.getRestaurantName());
        }

        double total = 0;
        List<OrderItem> items = new ArrayList<>();

        for (var reqItem : request.getItems()) {

            var menuItem = restaurantClient.getItem(
                    Long.valueOf(restaurant.getId()),
                    reqItem.getItemName()
            );

            if (menuItem == null) {
                throw new RestaurantNotFoundException(reqItem.getItemName());
            }

            double price = menuItem.getPrice();
            total += price * reqItem.getQuantity();

            items.add(OrderItem.builder()
                    .name(menuItem.getName())
                    .price(price)
                    .quantity(reqItem.getQuantity())
                    .build());
        }

        String orderNumber = "ORD-" + (1000 + (int)(Math.random() * 9000));

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customerName(request.getCustomerName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .restaurantId(restaurant.getId())
                .restaurantName(restaurant.getName())
                .items(items)
                .totalPrice(total)
                .status(OrderStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .build();

        orderRepo.save(order);
        cartRepo.deleteByPhone(request.getPhone());

        return map(order);
    }

    // ================= CHECKOUT =================

    public OrderResponse checkout(String phone, CheckoutRequest request) {

        Cart cart = cartRepo.findByPhone(phone)
                .orElseThrow(() -> new CartNotFoundException(phone));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new CartNotFoundException(phone);
        }

        double total = cart.getItems()
                .stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        String orderNumber = "ORD-" + (1000 + (int)(Math.random() * 9000));

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customerName(request.getCustomerName())
                .phone(phone)
                .address(request.getAddress())
                .restaurantName(cart.getRestaurantName())
                .items(cart.getItems())
                .totalPrice(total)
                .status(OrderStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .build();

        orderRepo.save(order);
        cartRepo.deleteByPhone(phone);

        return map(order);
    }

    // ================= TRACK ORDER =================

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

    // ================= GET ORDERS =================

    @Override
    public List<OrderResponse> getOrders(String phone) {
        return orderRepo.findByPhone(phone)
                .stream()
                .map(this::map)
                .toList();
    }

    // ================= CANCEL =================

    @Override
    public void cancelOrder(String orderNumber) {

        Order order = orderRepo.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException(orderNumber));

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new InvalidOrderStateException("Cannot cancel a delivered order");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new InvalidOrderStateException("Order is already cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepo.save(order);
    }

    @Override
    public CartResponse addToCart(String phone, String itemName, int quantity, Long restaurantId) {
        return null;
    }

    // ================= CART =================

    @Override
    public CartResponse addToCart(String phone, List<CartItemRequest> items, String restaurantName) {

        var restaurant = restaurantClient.getByName(restaurantName);

        if (restaurant == null) {
            throw new RestaurantNotFoundException(restaurantName);
        }

        Cart cart = cartRepo.findByPhone(phone)
                .orElse(Cart.builder()
                        .phone(phone)
                        .restaurantName(restaurantName)
                        .items(new ArrayList<>())
                        .build());

        for (var reqItem : items) {

            var menu = restaurantClient.getItem(
                    Long.valueOf(restaurant.getId()),
                    reqItem.getItemName()
            );

            if (menu == null) {
                throw new RestaurantNotFoundException(reqItem.getItemName());
            }

            Optional<OrderItem> existing = cart.getItems()
                    .stream()
                    .filter(i -> i.getName().equalsIgnoreCase(menu.getName()))
                    .findFirst();

            if (existing.isPresent()) {
                existing.get().setQuantity(existing.get().getQuantity() + reqItem.getQuantity());
            } else {
                cart.getItems().add(
                        OrderItem.builder()
                                .name(menu.getName())
                                .price(menu.getPrice())
                                .quantity(reqItem.getQuantity())
                                .build()
                );
            }
        }

        cartRepo.save(cart);
        return mapCart(cart);
    }

    @Override
    public CartResponse getCart(String phone) {
        return cartRepo.findByPhone(phone)
                .map(this::mapCart)
                .orElse(CartResponse.builder()
                        .phone(phone)
                        .restaurantName(null)
                        .items(new ArrayList<>())
                        .totalPrice(0.0)
                        .message("Your cart is empty — start adding items!")
                        .build());
    }

    @Override
    public CartResponse addToCart(String phone, String itemName, int quantity, String restaurantName) {
        return null;
    }

    @Override
    public void clearCart(String phone) {
        cartRepo.deleteByPhone(phone);
    }

    // ================= ADMIN =================

    public List<OrderResponse> getAllOrders() {
        return orderRepo.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    public void deleteOrder(String orderNumber) {
        Order order = orderRepo.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException(orderNumber));
        orderRepo.deleteById(order.getId());
    }

    // ================= ADMIN + RESTAURANT OWNER =================

    public OrderResponse updateOrderStatus(String orderNumber, OrderStatus status) {

        Order order = orderRepo.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException(orderNumber));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new InvalidOrderStateException("Cannot update a cancelled order");
        }

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new InvalidOrderStateException("Order already delivered — cannot update");
        }

        order.setStatus(status);
        orderRepo.save(order);
        return map(order);
    }

    // ================= RESTAURANT OWNER =================

    public List<RestaurantOrderResponse> getOrdersByRestaurant(String restaurantName) {
        return orderRepo.findByRestaurantName(restaurantName)
                .stream()
                .map(this::mapToRestaurantOrder)
                .toList();
    }

    private RestaurantOrderResponse mapToRestaurantOrder(Order order) {
        return RestaurantOrderResponse.builder()
                .orderNumber(order.getOrderNumber())
                .customerName(order.getCustomerName())
                .phone(order.getPhone())
                .address(order.getAddress())
                .items(order.getItems())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .statusMessage(getStatusMessage(order.getStatus()))
                .createdAt(order.getCreatedAt().toString())
                .build();
    }

    // ================= MAPPERS =================

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
                .phone(cart.getPhone())
                .restaurantName(cart.getRestaurantName())
                .items(cart.getItems())
                .totalPrice(total)
                .message("Cart updated successfully")  // ← add this
                .build();
    }
}