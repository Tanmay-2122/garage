package com.garage.repository;

import com.garage.entity.Customer;
import com.garage.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerRepository
        extends JpaRepository<Customer, Long> {

    List<Customer> findByUser(User user);

    long countByUser(User user);
    List<Customer> findByNameContainingIgnoreCase(String name);
}
