package com.garage.repository;

import com.garage.entity.GarageServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GarageServiceRepository extends JpaRepository<GarageServiceEntity, Long> {
}