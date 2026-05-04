package com.foodordering.restaurant.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
<<<<<<< HEAD
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Table(
    uniqueConstraints = @UniqueConstraint(columnNames = {"name", "restaurant_id"})
)
@Data
@AllArgsConstructor
@NoArgsConstructor
=======
import lombok.Setter;

>>>>>>> origin/Order_service
@Entity
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
<<<<<<< HEAD
    private Long id;

    private String name;
    private String description;
    private Double price;
    private String category;
    private Boolean available = true;
    private Double discount;     

    @Column(name = "image_url") 
    private String imageUrl;


=======
    @Column(name = "item_id")
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
    private int stock;  // number of items available


    @Setter
>>>>>>> origin/Order_service
    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    @JsonIgnore
    private Restaurant restaurant;

<<<<<<< HEAD
=======
    // ===== GETTERS & SETTERS =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
>>>>>>> origin/Order_service

}