package com.garage.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String carNumber;

    private LocalDate serviceDate;
    private LocalDate nextServiceDate;

    @ManyToOne
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}