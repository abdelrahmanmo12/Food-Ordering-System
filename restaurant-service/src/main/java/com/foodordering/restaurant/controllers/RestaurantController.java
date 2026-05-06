package com.foodordering.restaurant.controllers;

import com.foodordering.restaurant.config.UserContext;
import com.foodordering.restaurant.dtos.RestaurantDTO;
import com.foodordering.restaurant.dtos.UserDTO;
import com.foodordering.restaurant.models.Offer;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.services.RestaurantService;
import com.foodordering.restaurant.services.OfferService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private OfferService offerService;

    @GetMapping
    public ResponseEntity<List<RestaurantDTO>> getPublicRestaurants() {
        List<RestaurantDTO> restaurants = restaurantService.getAllPublicRestaurants()
                .stream()
                .map(this::convertToDto)
                .toList();
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantDTO> getById(@PathVariable Long id) {
        Restaurant restaurant = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(convertToDto(restaurant));
    }

    @PostMapping
    public ResponseEntity<RestaurantDTO> add(@RequestBody Restaurant restaurant) {

        UserDTO owner = UserContext.getUser();
        if (owner == null) {
            return ResponseEntity.status(401).build();
        }

        Restaurant saved = restaurantService.addRestaurant(owner, restaurant);
        return new ResponseEntity<>(convertToDto(saved), org.springframework.http.HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantDTO> update(@PathVariable Long id, @RequestBody Restaurant restaurant) {
        System.out.println("=== CONTROLLER ===");
        System.out.println("THREAD: " + Thread.currentThread().getId());
        System.out.println("USER: " + UserContext.getUser());

        UserDTO owner = UserContext.getUser();
        if (owner == null) {
            return ResponseEntity.status(401).build();
        }

        Restaurant updated = restaurantService.updateRestaurant(id, owner, restaurant);
        return ResponseEntity.ok(convertToDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        UserDTO owner = UserContext.getUser();
        if (owner == null) {
            return ResponseEntity.status(401).build();
        }

        restaurantService.deleteRestaurant(id, owner);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<RestaurantDTO> toggleStatus(
            @PathVariable Long id) {

        UserDTO owner = UserContext.getUser();
        if (owner == null) {
            return ResponseEntity.status(401).build();
        }

        Restaurant updatedRestaurant = restaurantService.toggleOpeningStatus(id, owner);
        return ResponseEntity.ok(convertToDto(updatedRestaurant)); // Status 200
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<String> uploadRestaurantImage(@PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        UserDTO owner = UserContext.getUser();
        if (owner == null) {
            return ResponseEntity.status(401).build();
        }

        String url = restaurantService.uploadImage(id, owner, file);
        return ResponseEntity.ok(url);

    }

    @DeleteMapping("/{id}/image")
    public ResponseEntity<Void> deleteRestaurantImage(@PathVariable Long id) {
        UserDTO admin = UserContext.getUser();
        if (admin == null) {
            return ResponseEntity.status(401).build();
        }

        restaurantService.deleteImage(id, admin);
        return ResponseEntity.noContent().build();
    }

    private RestaurantDTO convertToDto(Restaurant restaurant) {
        RestaurantDTO dto = new RestaurantDTO();
        dto.setId(restaurant.getId());
        dto.setName(restaurant.getName());
        dto.setLocation(restaurant.getLocation());
        dto.setPhone(restaurant.getPhone());
        dto.setDescription(restaurant.getDescription());
        dto.setImageUrl(restaurant.getImageUrl());
        dto.setOpened(restaurant.isOpened());
        return dto;
    }

    @PostMapping("/{restaurantId}/offers")
    public ResponseEntity<Offer> createOffer(@PathVariable Long restaurantId, 
                                           @RequestBody Offer offer) {
        UserDTO owner = UserContext.getUser();
        return ResponseEntity.status(201).body(offerService.createOffer(restaurantId, owner, offer));
    }

    @GetMapping("/offers/active")
    public ResponseEntity<List<Offer>> getActiveOffers() {
        return ResponseEntity.ok(offerService.getAllActiveOffers());
    }

    @PutMapping("/offers/{id}")
    public ResponseEntity<Offer> updateOffer(@PathVariable Long id, @RequestBody Offer offer) {
        UserDTO owner = UserContext.getUser();
        Offer updatedOffer = offerService.updateOffer(id, owner, offer);
        return ResponseEntity.ok(updatedOffer);
    }

    @DeleteMapping("/offers/{id}")
    public ResponseEntity<Void> deleteOffer(@PathVariable Long id) {
        UserDTO owner = UserContext.getUser();
        offerService.deleteOffer(id, owner);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/internal/exists/{id}")
    public ResponseEntity<Boolean> exists(@PathVariable Long id) {

        boolean isFound = restaurantService.existsById(id); 
        return ResponseEntity.ok(isFound);
    }
}