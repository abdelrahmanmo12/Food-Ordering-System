<<<<<<< HEAD
// package com.foodordering.order.clients;

// import org.springframework.cloud.openfeign.FeignClient;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;

// @FeignClient(name = "restaurant-service", url = "http://localhost:8082")
// public interface RestaurantClient {

//     @GetMapping("/restaurants/{id}")
//     String getRestaurant(@PathVariable String id);
// }
=======
package com.foodordering.order.clients;

public @interface FeignClient {
    String name();

    String url();
}
>>>>>>> origin/Order_service
