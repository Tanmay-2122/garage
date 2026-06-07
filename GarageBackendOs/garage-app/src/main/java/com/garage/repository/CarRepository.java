package com.garage.repository;

import com.garage.entity.Car;
import com.garage.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarRepository
        extends JpaRepository<Car, Long> {

    List<Car> findByUser(User user);

    long countByUser(User user);
    List<Car> findByCarNumberContainingIgnoreCase(
            String carNumber);
}