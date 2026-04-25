package com.foodordering.restaurant.models;

import jakarta.persistence.*;
import lombok.Setter;

import java.util.List;

@Entity
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
    private boolean pending = true;
    
    private Long owner_id;
    



    public Long getOwner_id() {
        return owner_id;
    }

    public void setOwner_id(Long owner_id) {
        this.owner_id = owner_id;
    }

    @Setter
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL)
    private List<MenuItem> menuItems;


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

}