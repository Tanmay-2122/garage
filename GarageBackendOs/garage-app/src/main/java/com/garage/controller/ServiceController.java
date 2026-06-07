package com.garage.controller;

import com.garage.entity.GarageServiceEntity;
import com.garage.repository.GarageServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
public class ServiceController {

    private final GarageServiceRepository repo;

    @PostMapping
    public GarageServiceEntity add(@RequestBody GarageServiceEntity s) {
        return repo.save(s);
    }

    @GetMapping
    public List<GarageServiceEntity> getAll() {
        return repo.findAll();
    }
}