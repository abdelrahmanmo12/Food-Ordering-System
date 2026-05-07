package com.foodordering.restaurant.services;

import com.foodordering.restaurant.aspect.Interfaces.CheckOwnerAndAdmin;
import com.foodordering.restaurant.aspect.Interfaces.OnlySpecificOwner;
import com.foodordering.restaurant.dtos.UserDTO;
import com.foodordering.restaurant.models.Offer;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.repository.OfferRepository;
import com.foodordering.restaurant.repository.RestaurantRepository;
import com.foodordering.restaurant.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class OfferService {

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @OnlySpecificOwner
    public Offer createOffer(Long restaurantId, UserDTO owner, Offer offer) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        if (offer.getStartDate() == null) {
            offer.setStartDate(Instant.now());
        }
        if (offer.getEndDate() == null) {
            offer.setEndDate(offer.getStartDate().plus(30, ChronoUnit.DAYS));
        }

        offer.setRestaurant(restaurant);
        return offerRepository.save(offer);
    }

    public List<Offer> getAllActiveOffers() {
        Instant now = Instant.now();
        return offerRepository.findByStartDateBeforeAndEndDateAfter(now, now);
    }

    @OnlySpecificOwner
    public Offer updateOffer(Long id, UserDTO owner, Offer updatedOffer) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        if (updatedOffer.getTitle() != null && !updatedOffer.getTitle().isEmpty()) {
            offer.setTitle(updatedOffer.getTitle());
        }
        if (updatedOffer.getDescription() != null && !updatedOffer.getDescription().isEmpty()) {
            offer.setDescription(updatedOffer.getDescription());
        }
        if (updatedOffer.getDiscountPercentage() != null) {
            offer.setDiscountPercentage(updatedOffer.getDiscountPercentage());
        }
        if (updatedOffer.getStartDate() != null) {
            offer.setStartDate(updatedOffer.getStartDate());
        }
        if (updatedOffer.getEndDate() != null) {
            offer.setEndDate(updatedOffer.getEndDate());
        }

        return offerRepository.save(offer);
    }

    @CheckOwnerAndAdmin
    public void deleteOffer(Long id, UserDTO owner) {
        offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        offerRepository.deleteById(id);
    }

    public List<Offer> getOffersByRestaurant(Long restaurantId) {
        return offerRepository.findByRestaurantId(restaurantId);
    }

    public Offer getOfferById(Long id) {
        return offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));
    }
}
