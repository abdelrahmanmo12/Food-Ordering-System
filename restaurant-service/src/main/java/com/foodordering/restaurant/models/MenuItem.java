package com.foodordering.restaurant.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Setter;


@Table(
    uniqueConstraints = @UniqueConstraint(columnNames = {"name", "restaurant_id"})
)
@Entity
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    private String name;
    @Setter
    private String description;
    @Setter
    private double price;
    @Setter
    private String category;
    @Setter
    private boolean available = true;
    @Setter
    private double discount;    

    @Setter
    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    @JsonIgnore
    private Restaurant restaurant;

    // ===== GETTERS & SETTERS =====

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public double getPrice() {
        return price;
    }

    public String getCategory() {
        return category;
    }

    public boolean isAvailable() {
        return available;
    }

    public double getDiscount() {
        return discount;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

}