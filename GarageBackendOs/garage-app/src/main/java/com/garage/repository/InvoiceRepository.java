package com.garage.repository;

import com.garage.entity.Invoice;
import com.garage.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceRepository
        extends JpaRepository<Invoice, Long> {

    List<Invoice> findByUser(User user);

    long countByUser(User user);
}