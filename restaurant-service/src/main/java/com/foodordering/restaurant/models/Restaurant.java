package com.foodordering.restaurant.models;

import jakarta.persistence.*;
<<<<<<< HEAD
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import com.foodordering.restaurant.enums.AdminStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
=======
import lombok.Setter;

import java.util.List;

>>>>>>> origin/Order_service
@Entity
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

<<<<<<< HEAD
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
=======
    @Setter
    private String name;
    @Setter
    private String location;
    @Setter
    private String phone;
    @Setter
    private String description;

    @Setter
    private boolean active = true;

    @Setter
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL)
    private List<MenuItem> menuItems;

    // ===== GETTERS & SETTERS =====

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getLocation() {
        return location;
    }

    public String getPhone() {
        return phone;
    }

    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return active;
    }

    public List<MenuItem> getMenuItems() {
        return menuItems;
    }
>>>>>>> origin/Order_service

}