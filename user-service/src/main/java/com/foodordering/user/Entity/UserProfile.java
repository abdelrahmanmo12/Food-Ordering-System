
package com.foodordering.user.Entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class UserProfile {
    @Id
    private Long id;

    private String fullName;
    private String type;

    private String phoneNumber;
    private String address;

    @ElementCollection
    @CollectionTable(name = "user_fav_restaurants", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "restaurant_id")
    private List<Long> favRestaurants = new ArrayList<>();

}