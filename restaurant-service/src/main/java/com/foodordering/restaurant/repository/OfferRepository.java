package com.foodordering.restaurant.repository;

import com.foodordering.restaurant.models.Offer;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByStartDateBeforeAndEndDateAfter(LocalDateTime now1, LocalDateTime now2);
}
