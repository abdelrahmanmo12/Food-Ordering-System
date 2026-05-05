package com.foodordering.restaurant.services;

import com.foodordering.restaurant.dtos.UserDTO;
import com.foodordering.restaurant.models.Offer;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.repository.OfferRepository;
import com.foodordering.restaurant.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OfferService {

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private RestaurantService restaurantService;

    private void validateAccess(Restaurant restaurant, UserDTO user, String action) {
        restaurantService.authorizeUser(user, action);
        if (!"ADMIN".equals(user.getRole())) {
            restaurantService.isTheSameOwner(restaurant, user);
        }
    }

    public Offer createOffer(Long restaurantId, Offer offer, UserDTO owner) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        validateAccess(restaurant, owner, "create an offer");

        offer.setRestaurant(restaurant);
        return offerRepository.save(offer);
    }

    public List<Offer> getAllActiveOffers() {
        LocalDateTime now = LocalDateTime.now();
        return offerRepository.findByStartDateBeforeAndEndDateAfter(now, now);
    }

    public Offer updateOffer(Long id, Offer updatedOffer, UserDTO owner) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        validateAccess(offer.getRestaurant(), owner, "update an offer");

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

    public void deleteOffer(Long id, UserDTO owner) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        validateAccess(offer.getRestaurant(), owner, "delete an offer");
        offerRepository.deleteById(id);
    }
}
