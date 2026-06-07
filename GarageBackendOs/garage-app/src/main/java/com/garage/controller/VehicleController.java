package com.garage.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    @GetMapping
    public String test() {
        return "Vehicle API Working";
    }
}