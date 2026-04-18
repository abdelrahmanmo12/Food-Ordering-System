package com.foodordering.order.services;

import com.foodordering.order.abstracts.OrderService;
import com.foodordering.order.clients.RestaurantClient;
import com.foodordering.order.DTOs.*;
import com.foodordering.order.entity.Cart;
import com.foodordering.order.entity.Order;
import com.foodordering.order.entity.*;
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

        double total = 0;

        List<OrderItem> items = new ArrayList<>();

        for (var i : request.getItems()) {

            var menu = restaurantClient.getItem(restaurant.getId(), i.getItemName());

            double price = menu.getPrice();
            total += price * i.getQuantity();

            items.add(OrderItem.builder()
                    .name(menu.getName())
                    .price(price)
                    .quantity(i.getQuantity())
                    .build());
        }

        Order order = Order.builder()
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

        cartRepo.deleteByPhone(request.getPhone()); // clear cart

        return map(order);
    }

    @Override
    public List<OrderResponse> getOrders(String phone) {
        return orderRepo.findByPhone(phone).stream().map(this::map).toList();
    }

    @Override
    public void cancelOrder(String id) {

        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));

        order.setStatus(OrderStatus.CANCELLED);

        orderRepo.save(order);
    }

    // ================= CART =================

    @Override
    public CartResponse addToCart(String phone, String itemName, int quantity, String restaurantName) {

        var restaurant = restaurantClient.getByName(restaurantName);
        var menu = restaurantClient.getItem(restaurant.getId(), itemName);

        Cart cart = cartRepo.findByPhone(phone)
                .orElse(Cart.builder().phone(phone).items(new ArrayList<>()).build());

        cart.getItems().add(
                OrderItem.builder()
                        .name(menu.getName())
                        .price(menu.getPrice())
                        .quantity(quantity)
                        .build()
        );

        cartRepo.save(cart);

        return mapCart(cart);
    }

    @Override
    public CartResponse getCart(String phone) {
        return mapCart(cartRepo.findByPhone(phone).orElseThrow());
    }

    private CartResponse mapCart(Cart cart) {
        return null;
    }

    @Override
    public void clearCart(String phone) {
        cartRepo.deleteByPhone(phone);
    }

    // ================= MAPPERS =================

    private OrderResponse map(com.foodordering.order.entity.Order order) {
        return OrderResponse.builder()
                .orderId(order.getId())
                .restaurantName(order.getRestaurantName())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .build();
    }


}