package com.foodordering.delivery.repository;

import com.foodordering.delivery.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByOrderId(String orderId);

    List<Delivery> findByDeliveryPersonId(Long deliveryPersonId);

    List<Delivery> findByCustomerId(String customerId);

    List<Delivery> findByStatus(Delivery.DeliveryStatus status);

    @Query("SELECT d FROM Delivery d WHERE d.deliveryPersonId = :deliveryPersonId AND d.status IN :statuses")
    List<Delivery> findByDeliveryPersonIdAndStatusIn(
            @Param("deliveryPersonId") Long deliveryPersonId,
            @Param("statuses") List<Delivery.DeliveryStatus> statuses);

    @Query("SELECT d FROM Delivery d WHERE d.customerId = :customerId AND d.status IN :statuses")
    List<Delivery> findByCustomerIdAndStatusIn(
            @Param("customerId") String customerId,
            @Param("statuses") List<Delivery.DeliveryStatus> statuses);

    @Query("SELECT d FROM Delivery d WHERE d.orderId = :orderId AND d.status = :status")
    Optional<Delivery> findByOrderIdAndStatus(
            @Param("orderId") String orderId,
            @Param("status") Delivery.DeliveryStatus status);

    boolean existsByOrderId(String orderId);
}
