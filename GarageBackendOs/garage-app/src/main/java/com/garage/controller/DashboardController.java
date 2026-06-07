package com.garage.controller;

import com.garage.entity.User;
import com.garage.repository.CarRepository;
import com.garage.repository.CustomerRepository;
import com.garage.repository.InvoiceRepository;
import com.garage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final CustomerRepository customerRepo;
    private final CarRepository carRepo;
    private final InvoiceRepository invoiceRepo;
    private final UserRepository userRepo;

    @GetMapping("/stats")
    public Map<String, Object> getStats(Authentication auth) {

        User user = userRepo.findByUsername(auth.getName())
                .orElseThrow();

        Map<String, Object> stats = new HashMap<>();

        stats.put("customers",
                customerRepo.countByUser(user));

        stats.put("cars",
                carRepo.countByUser(user));

        stats.put("invoices",
                invoiceRepo.countByUser(user));

        return stats;
    }
}