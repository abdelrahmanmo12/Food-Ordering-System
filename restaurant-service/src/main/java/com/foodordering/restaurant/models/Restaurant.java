package com.foodordering.restaurant.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import com.foodordering.restaurant.enums.AdminStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location;
    private String phone;
    private String description;    
    private Long ownerId;

    @Enumerated(EnumType.STRING)
    private AdminStatus status = AdminStatus.PENDING;
    
    private boolean isOpened = false;

    String imageUrl;
    
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL)
    private List<MenuItem> menuItems;


    // public Long getId() {
    //     return id;
    // }

    // public String getName() {
    //     return name;
    // }

    // public String getLocation() {
    //     return location;
    // }

    // public String getPhone() {
    //     return phone;
    // }

    // public String getDescription() {
    //     return description;
    // }

    // public List<MenuItem> getMenuItems() {
    //     return menuItems;
    // }

}