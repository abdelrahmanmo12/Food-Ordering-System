package com.foodordering.notification.Repository;
import com.foodordering.notification.model.OrderStatusNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<OrderStatusNotification, Long> {
    List<OrderStatusNotification> findByUserIdAndIsReadFalse(Long userId);
}
