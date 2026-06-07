package com.garage.service;

import com.garage.entity.*;
import com.garage.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GarageService {

    private final CustomerRepository customerRepo;
    private final GarageServiceRepository serviceRepo;
    private final InvoiceRepository invoiceRepo;

    public GarageService(CustomerRepository customerRepo,
                         GarageServiceRepository serviceRepo,
                         InvoiceRepository invoiceRepo) {
        this.customerRepo = customerRepo;
        this.serviceRepo = serviceRepo;
        this.invoiceRepo = invoiceRepo;
    }

    // Add Customer
    public Customer addCustomer(Customer customer) {
        return customerRepo.save(customer);
    }

    // Get Customers
    public List<Customer> getAllCustomers() {
        return customerRepo.findAll();
    }

    // Add Service
    public GarageServiceEntity addService(GarageServiceEntity serviceEntity) {
        return serviceRepo.save(serviceEntity);
    }

    // Get Services
    public List<GarageServiceEntity> getAllServices() {
        return serviceRepo.findAll();
    }

    // Create Invoice
    public Invoice createInvoice(Long customerId, List<Long> serviceIds) {
        Customer customer = customerRepo.findById(customerId).orElseThrow();
        List<GarageServiceEntity> services = serviceRepo.findAllById(serviceIds);

        double total = services.stream()
                .mapToDouble(GarageServiceEntity::getPrice)
                .sum();

        Invoice invoice = new Invoice();
        invoice.setCustomer(customer);
        invoice.setServices(services);
        invoice.setTotalAmount(total);

        return invoiceRepo.save(invoice);
    }
}