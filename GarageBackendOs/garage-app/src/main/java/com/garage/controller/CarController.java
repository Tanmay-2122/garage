package com.garage.controller;

import com.garage.entity.User;
import com.garage.repository.UserRepository;
import com.garage.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.garage.entity.Car;
import com.garage.service.CarService;
import com.garage.repository.CarRepository;

import java.util.List;

@RestController
@RequestMapping("/cars")
@RequiredArgsConstructor
public class CarController {
    private final UserRepository userRepository;
    private final CarService carService;
    private final CarRepository carRepository;
    private final EmailService emailService;

    @PostMapping
    public Car addCar(
            @RequestBody Car car,
            Authentication auth
    ) {

        String username = auth.getName();

        User user = userRepository
                .findByUsername(username)
                .orElseThrow();

        car.setUser(user);

        return carRepository.save(car);
    }


    @GetMapping
    public List<Car> getAllCars(
            Authentication auth
    ) {

        String username = auth.getName();

        User user = userRepository
                .findByUsername(username)
                .orElseThrow();

        return carRepository.findByUser(user);
    }

    @PostMapping("/complete/{id}")
    public String completeService(@PathVariable Long id) {

        Car car = carRepository.findById(id).orElseThrow();

        carService.completeService(car);

        return "Service Completed";
    }


    @GetMapping("/test-mail/{id}")
    public String testMail(@PathVariable Long id) {

        Car car = carRepository.findById(id).orElseThrow();

        emailService.sendReminder(
                car.getCustomer().getEmail(),   // dynamic email
                car.getCarNumber()              // dynamic car number
        );

        return "Email Sent";
    }
    @GetMapping("/search")
    public List<Car> search(
            @RequestParam String carNumber) {

        return carRepository
                .findByCarNumberContainingIgnoreCase(
                        carNumber);
    }
    @PutMapping("/{id}")
    public Car update(
            @PathVariable Long id,
            @RequestBody Car updated) {

        Car car =
                carRepository.findById(id).orElseThrow();

        car.setCarNumber(updated.getCarNumber());

        return carRepository.save(car);
    }
    @DeleteMapping("/{id}")
    public String delete(
            @PathVariable Long id) {

        carRepository.deleteById(id);

        return "Car Deleted";
    }
}