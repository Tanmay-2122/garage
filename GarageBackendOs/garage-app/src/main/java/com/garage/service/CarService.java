package com.garage.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.garage.entity.Car;
import com.garage.repository.CarRepository;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;

    public void completeService(Car car) {

        LocalDate today = LocalDate.now();

        car.setServiceDate(today);
        car.setNextServiceDate(today.plusMonths(3));

        carRepository.save(car);
    }
}