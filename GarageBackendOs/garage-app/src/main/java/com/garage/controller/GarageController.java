package com.garage.controller;

import com.garage.entity.*;
import com.garage.service.GarageService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/garage")
public class GarageController {

    private final GarageService service;

    public GarageController(GarageService service) {
        this.service = service;
    }

    @PostMapping("/customer")
    public Customer addCustomer(@RequestBody Customer customer) {
        System.out.println(customer);
        return service.addCustomer(customer);
    }

    // Get Customers
    @GetMapping("/customers")
    public List<Customer> getCustomers() {
        return service.getAllCustomers();
    }

    // Add Service
    @PostMapping("/service")
    public GarageServiceEntity addService(@RequestBody GarageServiceEntity serviceEntity) {
        return service.addService(serviceEntity);
    }

    // Get Services
    @GetMapping("/services")
    public List<GarageServiceEntity> getServices() {
        return service.getAllServices();
    }

    // Create Invoice
    @PostMapping("/invoice")
    public Invoice createInvoice(@RequestParam Long customerId,
                                 @RequestBody List<Long> serviceIds) {
        return service.createInvoice(customerId, serviceIds);
    }

}