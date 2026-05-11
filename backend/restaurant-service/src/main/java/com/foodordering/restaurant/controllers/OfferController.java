package com.foodordering.restaurant.controllers;

import com.foodordering.restaurant.config.UserContext;
import com.foodordering.restaurant.dtos.UserDTO;
import com.foodordering.restaurant.models.Offer;
import com.foodordering.restaurant.services.OfferService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/offers")
public class OfferController {

    @Autowired
    private OfferService offerService;

    @PostMapping("/restaurant/{restaurantId}")
    public ResponseEntity<Offer> createOffer(@PathVariable @Valid Long restaurantId,
            @RequestBody Offer offer) {
        UserDTO owner = UserContext.getUser();
        return ResponseEntity.status(201).body(offerService.createOffer(restaurantId, owner, offer));
    }

    @GetMapping("/active")
    public ResponseEntity<List<Offer>> getActiveOffers() {
        return ResponseEntity.ok(offerService.getAllActiveOffers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Offer> updateOffer(@PathVariable Long id, @RequestBody Offer offer) {
        UserDTO owner = UserContext.getUser();
        Offer updatedOffer = offerService.updateOffer(id, owner, offer);
        return ResponseEntity.ok(updatedOffer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOffer(@PathVariable Long id) {
        UserDTO owner = UserContext.getUser();
        offerService.deleteOffer(id, owner);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Offer>> getOffersByRestaurant(@PathVariable Long restaurantId) {
        List<Offer> offers = offerService.getOffersByRestaurant(restaurantId);
        return ResponseEntity.ok(offers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Offer> getOfferById(@PathVariable Long id) {
        Offer offer = offerService.getOfferById(id);
        return ResponseEntity.ok(offer);
    }
}
