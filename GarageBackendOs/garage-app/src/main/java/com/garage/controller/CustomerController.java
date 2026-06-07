package com.garage.controller;

import com.garage.entity.Customer;
import com.garage.entity.User;
import com.garage.repository.CustomerRepository;
import com.garage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerRepository repo;
    private final UserRepository userRepo;

    @PostMapping
    public Customer add(@RequestBody Customer c) {

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepo.findByUsername(username)
                .orElseThrow();

        c.setUser(user);
        return repo.save(c);
    }
    @GetMapping
    public List<Customer> getAll() {

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepo.findByUsername(username)
                .orElseThrow();

        return repo.findByUser(user);
    }
    @GetMapping("/search")
    public List<Customer> search(
            @RequestParam String name) {

        return repo.findByNameContainingIgnoreCase(name);
    }
    @PutMapping("/{id}")
    public Customer update(
            @PathVariable Long id,
            @RequestBody Customer updated) {

        Customer customer =
                repo.findById(id).orElseThrow();

        customer.setName(updated.getName());
        customer.setEmail(updated.getEmail());
        customer.setPhone(updated.getPhone());

        return repo.save(customer);
    }
    @DeleteMapping("/{id}")
    public String delete(
            @PathVariable Long id) {

        repo.deleteById(id);

        return "Customer Deleted";
    }
}