package com.garage.service;

import com.garage.entity.Car;
import com.garage.repository.CarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import com.garage.repository.CarRepository;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private final CarRepository carRepository;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 9 * * ?")
    public void checkAndSend() {

        List<Car> cars = carRepository.findAll();

        for (Car car : cars) {

            if (car.getNextServiceDate() != null &&
                    !car.getNextServiceDate().isAfter(LocalDate.now())) {

                emailService.sendReminder(
                        car.getCustomer().getEmail(),
                        car.getCarNumber()
                );
            }
        }
    }
}
