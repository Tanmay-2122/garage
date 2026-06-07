package com.garage.controller;

import com.garage.entity.GarageServiceEntity;
import com.garage.entity.Invoice;
import com.garage.entity.User;
import com.garage.repository.GarageServiceRepository;
import com.garage.repository.InvoiceRepository;
import com.garage.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/invoice")
public class InvoiceController {

    @Autowired
    private InvoiceRepository repo;

    @Autowired
    private GarageServiceRepository serviceRepo;
    @Autowired
    private UserRepository userRepo;

    @PostMapping
    public Invoice create(
            @RequestBody Invoice invoice,
            Authentication auth
    ) {

        String username = auth.getName();

        User user = userRepo.findByUsername(username)
                .orElseThrow();

        invoice.setUser(user);

        if (invoice.getServices() == null || invoice.getServices().isEmpty()) {
            invoice.setTotalAmount(0.0);
            return repo.save(invoice);
        }

        List<Long> ids = invoice.getServices()
                .stream()
                .map(GarageServiceEntity::getId)
                .toList();

        List<GarageServiceEntity> services =
                serviceRepo.findAllById(ids);

        double total = services.stream()
                .mapToDouble(GarageServiceEntity::getPrice)
                .sum();

        invoice.setServices(services);
        invoice.setTotalAmount(total);

        return repo.save(invoice);
    }
}